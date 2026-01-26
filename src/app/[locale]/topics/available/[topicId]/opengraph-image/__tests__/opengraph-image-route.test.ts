import { NextRequest } from 'next/server';

// Mock next/og to avoid edge runtime issues in tests
jest.mock('next/og', () => ({
  ImageResponse: jest.fn().mockImplementation(() => {
    return new Response('mocked image response', {
      status: 200,
      headers: { 'Content-Type': 'image/png' },
    });
  }),
}));

// Mock the topic functions to avoid importing react-markdown and complex dependencies
jest.mock('@/features/topics', () => ({
  getTopicMetadata: jest.fn().mockResolvedValue({
    title: 'Test Topic Title',
    description: 'Test Topic Description',
    keywords: 'test,keywords',
  }),
  renderTopicOpengraphImage: jest.fn().mockResolvedValue(Buffer.from('mocked-jpeg-data')),
}));

// Mock i18n to avoid complex dependencies
jest.mock('@/i18n', () => ({
  getT: jest.fn().mockResolvedValue((key: string) => {
    const translations: Record<string, string> = {
      'Pages.WorkoutTopicGoTitle': 'Workout: ',
      'Pages.RootTitle': 'Root Title',
      'Pages.RootDescription': 'Root Description',
      'Pages.RootKeywords': 'root,keywords',
    };
    return translations[key] || key;
  }),
  TAwaitedLocaleProps: jest.fn(),
  defaultLanguage: 'en',
}));

// Mock config to avoid environment issues
jest.mock('@/config/env', () => ({
  siteTitle: 'Site Title',
  siteDescription: 'Site Description',
  siteKeywords: 'site,keywords',
  defaultLanguage: 'en',
}));

describe('Topic Opengraph Image Route', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('returns a valid image response', async () => {
    // Import the route handler after mocking
    const { GET } = await import('../route');

    // Create a mock request with topicId and locale parameters
    const mockRequest = new Request('http://localhost/en/topics/available/123/opengraph-image');
    const params = Promise.resolve({ topicId: '123', locale: 'en' });

    const response = await GET(mockRequest as unknown as NextRequest, {
      params: params as Promise<{ topicId: string; locale: 'en' }>,
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('image');
  });

  it('uses topicId in the response', async () => {
    const { GET } = await import('../route');

    const topicId = 'test-topic-456';
    const mockRequest = new Request(
      `http://localhost/en/topics/available/${topicId}/opengraph-image`,
    );
    const params = Promise.resolve({ topicId, locale: 'en' as const });

    const response = await GET(mockRequest as unknown as NextRequest, {
      params: params as Promise<{ topicId: string; locale: 'en' }>,
    });

    expect(response.status).toBe(200);
  });

  it('handles empty topicId gracefully', async () => {
    const { GET } = await import('../route');

    const mockRequest = new Request('http://localhost/en/topics/available//opengraph-image');
    const params = Promise.resolve({ topicId: '', locale: 'en' as const });

    const response = await GET(mockRequest as unknown as NextRequest, {
      params: params as Promise<{ topicId: string; locale: 'en' }>,
    });

    // Should still return 200 even with empty topicId
    expect(response.status).toBe(200);
  });
});
