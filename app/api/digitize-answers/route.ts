import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from '@/lib/prisma';
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    console.log('Starting answer digitization...');

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.error('Google Gemini API key not found');
      return NextResponse.json(
        { error: 'Google Gemini API key not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const testId = formData.get('testId') as string;
    const studentId = formData.get('studentId') as string;

    if (!testId || !studentId) {
      return NextResponse.json(
        { error: 'Missing testId or studentId' },
        { status: 400 }
      );
    }

    const images: File[] = [];
    let index = 0;
    while (true) {
      const image = formData.get(`image_${index}`) as File;
      if (!image) break;
      images.push(image);
      index++;
    }

    if (images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    console.log(
      `Processing ${images.length} images for test ${testId}, student ${studentId}`
    );

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          orderBy: { orderForAi: 'asc' },
        },
      },
    });

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    const imageParts = await Promise.all(
      images.map(async (image, idx) => {
        const bytes = await image.arrayBuffer();
        const base64 = Buffer.from(bytes).toString('base64');

        if (!image.type.startsWith('image/')) {
          throw new Error(`Invalid file type: ${image.type}`);
        }

        console.log(
          `Processed image ${idx + 1}: ${image.type}, ${Math.round(
            bytes.byteLength / 1024
          )}KB`
        );

        return {
          inlineData: {
            data: base64,
            mimeType: image.type,
          },
        };
      })
    );

    const questionsContext = test.questions
      .map(
        (q, idx) =>
          `${q.orderForAi || `Q${idx + 1}`}: ${q.text} (${q.marks} marks)`
      )
      .join('\n\n');

    console.log('Sending request to Google Gemini...');

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Analyze these images of a student's answer sheet and extract all written answers. 

CRITICAL: This is for educational grading. Extract EVERY answer visible on the page.

IMPORTANT: You MUST respond with ONLY valid JSON, no other text.

Here are the questions from the test:
${questionsContext}

Question IDs for your response: ${test.questions.map((q) => q.id).join(', ')}

Required JSON format:
{
  "answers": {
    "${test.questions[0]?.id || 'q1'}": "Complete answer text here or empty string if truly no answer visible"
  }
}

EXTRACTION RULES (IMPORTANT):
- Look carefully at the handwritten/printed text for EACH question
- Extract the COMPLETE answer text, not just a summary
- Preserve the student's exact wording and structure
- If NO answer is visible for a question, use empty string ""
- Do NOT skip questions - respond for ALL question IDs provided
- Look for answers written in margins, between lines, or with corrections
- Include numbered/bulleted lists exactly as written
- Match answers to question IDs based on question order/position

Respond with ONLY the JSON object, no markdown, no explanation.`;

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const content = response.text();

    console.log('Google Gemini response received');

    if (!content) {
      throw new Error('No response content from Google Gemini');
    }

    console.log('Raw Gemini response:', content);

    try {
      let cleanContent = content.trim();

      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent
          .replace(/^```json\s*/, '')
          .replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent
          .replace(/^```\s*/, '')
          .replace(/\s*```$/, '');
      }

      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanContent = jsonMatch[0];
      }

      const parsedResponse = JSON.parse(cleanContent);

      if (
        !parsedResponse.answers ||
        typeof parsedResponse.answers !== 'object'
      ) {
        throw new Error('Invalid response format: answers object not found');
      }

      const validAnswers: Record<string, string> = {};
      const questionIds = test.questions.map((q) => q.id);

      console.log('Parsing answers from Gemini response...');
      console.log('Question IDs to fill:', questionIds);

      for (const [questionId, answer] of Object.entries(
        parsedResponse.answers
      )) {
        if (questionIds.includes(questionId) && typeof answer === 'string') {
          validAnswers[questionId] = answer.trim();
          console.log(`✓ Q${questionId}: "${validAnswers[questionId].substring(0, 50)}${validAnswers[questionId].length > 50 ? '...' : ''}"`);
        }
      }

      questionIds.forEach((qId) => {
        if (!(qId in validAnswers)) {
          validAnswers[qId] = '';
          console.log(`⚠️  Q${qId}: (empty - no answer found)`);
        }
      });

      console.log('Successfully parsed answers:', Object.keys(validAnswers));
      console.log('Answer summary:', Object.entries(validAnswers).map(([id, text]) => `${id}: ${text ? 'yes' : 'empty'}`));

      return NextResponse.json({ answers: validAnswers });
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);

      return NextResponse.json(
        {
          error: 'Failed to parse AI response.',
          rawResponse: content,
        },
        { status: 422 }
      );
    }
  } catch (error: any) {
    console.error('Error in answer digitization:', error);

    if (error.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'Google Gemini API quota exceeded.' },
        { status: 402 }
      );
    }

    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Invalid Google Gemini API key' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to process images' },
      { status: 500 }
    );
  }
}