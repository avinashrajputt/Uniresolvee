import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from '@/lib/prisma';
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Starting auto-grading for test:', id);

    // Get ALL answers for this test
    const answers = await prisma.answer.findMany({
      where: {
        testId: id,
      },
      include: {
        question: true,
      },
    });

    console.log(`Found ${answers.length} answers to grade`);

    if (answers.length === 0) {
      return NextResponse.json(
        { message: 'No answers to grade', gradedCount: 0 },
        { status: 200 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let gradedCount = 0;
    const errors: string[] = [];

    for (const answer of answers) {
      try {
        console.log(
          `Grading answer ${answer.id} for question: ${answer.question.orderForAi}`
        );

        const prompt = `You are a fair and encouraging teacher grading a student's essay answer.

Question (${answer.question.marks} marks):
${answer.question.text}

Student's Answer:
${answer.answer}

Grading Guidelines:
- Award full marks (${answer.question.marks}) if the answer demonstrates good understanding and effort
- Award 70-90% marks for answers that cover main points but have minor issues
- Award 50-70% marks for basic understanding with some gaps
- Award 30-50% marks for limited understanding or very brief answers
- Award 0-30% marks only for completely wrong or no attempt

Evaluation Criteria:
1. Content Relevance & Accuracy (40% weight)
2. Depth of Understanding (30% weight)
3. Structure & Presentation (20% weight)
4. Effort & Completeness (10% weight)

Note: Don't penalize heavily for grammar/spelling errors in handwritten work.

IMPORTANT: Provide detailed feedback in this JSON format:
{
  "marks": <number between 0 and ${answer.question.marks}>,
  "remarks": "✓ Strengths: [What student did well]\n✗ Areas to improve: [What could be better]\n📊 Score Breakdown: Content (X/${Math.round(answer.question.marks * 0.4)}), Understanding (X/${Math.round(answer.question.marks * 0.3)}), Structure (X/${Math.round(answer.question.marks * 0.2)}), Effort (X/${Math.round(answer.question.marks * 0.1)})\n💡 Overall: [Encouraging 1-line summary]"
}

Respond with ONLY valid JSON, no other text.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const content = response.text();

        console.log('Gemini grading response:', content);

        // Clean JSON response
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

        const grading = JSON.parse(cleanContent);

        // Validate the response
        if (
          typeof grading.marks !== 'number' ||
          grading.marks < 0 ||
          grading.marks > answer.question.marks
        ) {
          throw new Error('Invalid marks in response');
        }

        // Update the answer with grading
        await prisma.answer.update({
          where: { id: answer.id },
          data: {
            marksScored: grading.marks,
            remarks: grading.remarks || '',
          },
        });

        gradedCount++;
        console.log(
          `Successfully graded answer ${answer.id}: ${grading.marks}/${answer.question.marks}`
        );
      } catch (error: any) {
        console.error(`Failed to grade answer ${answer.id}:`, error);
        errors.push(`Answer ${answer.id}: ${error.message}`);
      }
    }

    console.log(`Auto-grading completed: ${gradedCount}/${answers.length} answers graded`);

    return NextResponse.json({
      message: `Graded ${gradedCount} out of ${answers.length} answers`,
      gradedCount,
      totalAnswers: answers.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error in auto-grading:', error);

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
      { error: error.message || 'Failed to auto-grade answers' },
      { status: 500 }
    );
  }
}