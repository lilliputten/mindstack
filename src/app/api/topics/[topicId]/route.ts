import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';

import { TopicSchema } from '@/generated/prisma';

import { TApiResponse } from '@/lib/types/api';
import { makeNullableFieldsOptional } from '@/lib/helpers/zod';
import { TopicIncludeParamsSchema } from '@/lib/zod-schemas';
import { updateTopic } from '@/features/topics/actions';
import { getAvailableTopicById } from '@/features/topics/actions/getAvailableTopicById';
import { TTopic } from '@/features/topics/types';

const updateTopicSchema = makeNullableFieldsOptional(TopicSchema).omit({
  createdAt: true,
  updatedAt: true,
  userId: true,
});

/** GET /api/topics/[topicId]?... - Get topic data */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> },
) {
  const { topicId } = await params;
  const { searchParams } = request.nextUrl;
  try {
    const params = Object.fromEntries(searchParams.entries());
    const parsedParams = TopicIncludeParamsSchema.parse(params);
    const {
      // TopicIncludeParamsSchema params
      includeWorkout,
      includeUser,
      includeQuestionsCount,
    } = parsedParams;

    const topic = await getAvailableTopicById({
      id: topicId,
      includeWorkout,
      includeUser,
      includeQuestionsCount,
    });

    const response: TApiResponse<typeof topic> = {
      data: topic,
      ok: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof ZodError) {
      // eslint-disable-next-line no-console
      console.error('[API /api/topics/[topicId] GET] ZodError', error);
      debugger; // eslint-disable-line no-debugger

      const response: TApiResponse<null> = {
        data: null,
        ok: false,
        error: {
          code: 'ZOD_ERROR',
          message: 'Zod parsing error', // error instanceof Error ? error.message : 'Failed to fetch topics',
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
    console.error('[API /api/topics/[topicId] GET]', error);
    debugger; // eslint-disable-line no-debugger

    const response: TApiResponse<null> = {
      data: null,
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch topics',
        details: { error: error instanceof Error ? error.message : String(error) },
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/** PUT /api/topics/[topicId] - Update topic */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> },
) {
  try {
    const { topicId } = await params;
    const body = await request.json();
    const topicData = updateTopicSchema.parse({ ...body, id: topicId });

    const updatedTopic = await updateTopic(topicData);

    const response: TApiResponse<typeof updatedTopic> = {
      data: updatedTopic,
      ok: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[API /topics/[topicId] PUT]', {
      error,
      params,
      request,
    });
    debugger; // eslint-disable-line no-debugger

    const response: TApiResponse<null> = {
      data: null,
      ok: false,
      error: {
        code: error instanceof z.ZodError ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR',
        message:
          error instanceof z.ZodError
            ? 'Invalid topic data'
            : error instanceof Error
              ? error.message
              : 'Failed to update topic',
        details:
          error instanceof z.ZodError
            ? { errors: error.errors }
            : { error: error instanceof Error ? error.message : String(error) },
      },
    };

    return NextResponse.json(response, { status: error instanceof z.ZodError ? 400 : 500 });
  }
}
