import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';

import { QuestionSchema } from '@/generated/prisma';

import { TApiResponse } from '@/lib/types/api';
import { makeNullableFieldsOptional } from '@/lib/helpers/zod';
import { QuestionIncludeParamsSchema } from '@/lib/zod-schemas';
import { updateQuestion } from '@/features/questions/actions';
import { getAvailableQuestionById } from '@/features/questions/actions/getAvailableQuestionById';
import { TQuestionData } from '@/features/questions/types';

const updateQuestionSchema = makeNullableFieldsOptional(QuestionSchema).omit({
  createdAt: true,
  updatedAt: true,
  topicId: true,
});

/*
const updateQuestionSchema = z.object({
  id: z.string(),
  topicId: z.string(),
  text: z.string().min(1),
  answersCountRandom: z.boolean().optional(),
  answersCountMin: z.union([z.string().optional(), z.number()]),
  answersCountMax: z.union([z.string().optional(), z.number()]),
});
*/

/** GET /api/questions/[questionId] - Get question */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> },
) {
  const { questionId } = await params;
  const { searchParams } = request.nextUrl;

  try {
    const params = Object.fromEntries(searchParams.entries());
    const parsedParams = QuestionIncludeParamsSchema.parse(params);
    const {
      // QuestionIncludeParamsSchema params
      includeTopic,
      includeAnswersCount,
    } = parsedParams;

    const question = await getAvailableQuestionById({
      id: questionId,
      includeTopic,
      includeAnswersCount,
    });

    const response: TApiResponse<typeof question> = {
      data: question,
      ok: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof ZodError) {
      // eslint-disable-next-line no-console
      console.error('[API GET /api/questions/[questionId]] ZodError', error);
      debugger; // eslint-disable-line no-debugger
      const response: TApiResponse<null> = {
        data: null,
        ok: false,
        error: {
          code: 'ZOD_ERROR',
          message: 'Zod parsing error',
          details: {
            // error: error instanceof Error ? error.message : String(error),
            stack: error.stack,
            issues: error.issues,
          },
        },
      };
      return NextResponse.json(response, { status: 500 });
    }

    // eslint-disable-next-line no-console
    console.error('[API GET /api/questions/[questionId]]', error);
    debugger; // eslint-disable-line no-debugger

    const response: TApiResponse<null> = {
      data: null,
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch questions',
        details: { error: error instanceof Error ? error.message : String(error) },
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/** PUT /api/questions/[questionId] - Update question */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> },
) {
  try {
    const { questionId } = await params;
    const body = await request.json();
    const questionData = updateQuestionSchema.parse({ ...body, id: questionId });

    const updatedQuestion = await updateQuestion(questionData as TQuestionData);

    const response: TApiResponse<typeof updatedQuestion> = {
      data: updatedQuestion,
      ok: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof ZodError) {
      // eslint-disable-next-line no-console
      console.error('[API GET /api/questions/[questionId]] ZodError', error);
      debugger; // eslint-disable-line no-debugger
      const response: TApiResponse<null> = {
        data: null,
        ok: false,
        error: {
          code: 'ZOD_ERROR',
          message: 'Zod parsing error',
          details: {
            // error: error instanceof Error ? error.message : String(error),
            stack: error.stack,
            issues: error.issues,
          },
        },
      };
      return NextResponse.json(response, { status: 500 });
    }

    // eslint-disable-next-line no-console
    console.error('[API /questions/[questionId] PUT]', error);
    debugger; // eslint-disable-line no-debugger

    const response: TApiResponse<null> = {
      data: null,
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message:
          error instanceof z.ZodError
            ? 'Invalid question data'
            : error instanceof Error
              ? error.message
              : 'Failed to update question',
        details:
          error instanceof z.ZodError
            ? { errors: error.errors }
            : { error: error instanceof Error ? error.message : String(error) },
      },
    };

    return NextResponse.json(response, { status: error instanceof z.ZodError ? 400 : 500 });
  }
}
