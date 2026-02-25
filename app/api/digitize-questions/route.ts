import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from '@/lib/prisma';
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    console.log('Starting question digitization...');

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.error('Google Gemini API key not found');
      return NextResponse.json(
        { error: 'Google Gemini API key not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    console.log('Processing image:', image.name, image.size, image.type);

    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    console.log('Sending request to Google Gemini...');

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Analyze this image and extract all questions from the test/exam paper.

IMPORTANT: You MUST respond with ONLY valid JSON, no other text.

For each question you find:
1. Extract the complete question text
2. Identify the marks/points for the question (if visible)
3. Number the questions in order

Required JSON format:
{
  "questions": [
    {
      "text": "Complete question text here",
      "marks": 10,
      "orderForAi": "Q1"
    }
  ]
}

Rules:
- Extract ALL questions you can see
- Include complete question text including sub-parts (a, b, c, etc.)
- If marks are not visible, estimate based on question complexity or use 10
- Maintain the order of questions as they appear
- Respond with ONLY the JSON object, no additional text`;

    const imagePart = {
      inlineData: {
        data: base64,
        mimeType: image.type,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
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

      if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
        throw new Error('Invalid response format: questions array not found');
      }

      const validQuestions = parsedResponse.questions
        .filter((q: any) => q.text && typeof q.text === 'string')
        .map((q: any, idx: number) => ({
          text: q.text.trim(),
          marks: typeof q.marks === 'number' && q.marks > 0 ? q.marks : 10,
          orderForAi: q.orderForAi || `Q${idx + 1}`,
        }));

      if (validQuestions.length === 0) {
        throw new Error('No valid questions found in image');
      }

      console.log(`Successfully extracted ${validQuestions.length} questions`);

      return NextResponse.json({ questions: validQuestions });
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      console.error('Raw content:', content);

      return NextResponse.json(
        {
          error: 'Failed to parse AI response. The image might not contain clear questions.',
          suggestion: 'Try uploading a clearer image with better lighting and legible text.',
          rawResponse: content,
        },
        { status: 422 }
      );
    }
  } catch (error: any) {
    console.error('Error in question digitization:', error);

    if (error.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'Google Gemini API quota exceeded. Please check your billing.' },
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
      { error: error.message || 'Failed to process image' },
      { status: 500 }
    );
  }
}