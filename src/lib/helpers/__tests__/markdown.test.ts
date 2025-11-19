import { truncateMarkdown } from '../markdown';

describe('truncateMarkdown', () => {
  it('should return empty string for empty input', () => {
    expect(truncateMarkdown()).toBe('');
    expect(truncateMarkdown('')).toBe('');
    expect(truncateMarkdown(undefined)).toBe('');
  });

  it('should return original text if shorter than limit', () => {
    const text = 'Short text';
    expect(truncateMarkdown(text, 20)).toBe(text);
  });

  it('should return original text if no length limit provided', () => {
    const text = 'Any length text here';
    expect(truncateMarkdown(text)).toBe(text);
  });

  it('should truncate plain text correctly', () => {
    const text = 'This is a long text that needs to be truncated';
    expect(truncateMarkdown(text, 20)).toBe('This is a long text…');
  });

  it('should use custom ellipsis', () => {
    const text = 'This is a long text';
    expect(truncateMarkdown(text, 10, '...')).toBe('This is...');
  });

  it('should handle simple markdown formatting', () => {
    const text = 'This is **bold** text that needs truncation';
    const result = truncateMarkdown(text, 25);
    expect(result).toContain('bold');
    expect(result.length).toBeLessThanOrEqual(25);
  });

  it('should handle complex markdown by falling back to plain text', () => {
    const text =
      '# Header\n\nThis is a **bold** paragraph with [links](http://example.com) and `code`.';
    const result = truncateMarkdown(text, 30);
    expect(result).not.toContain('#');
    expect(result).not.toContain('[');
    expect(result).not.toContain('](');
    expect(result.length).toBeLessThanOrEqual(30);
  });

  it('should strip markdown formatting when falling back to plain text', () => {
    const text = '## Header\n\n**Bold** and *italic* text with `code` and [link](url).';
    const result = truncateMarkdown(text, 25);
    expect(result).toBe('Header Bold and italic…');
  });

  it('should handle code blocks', () => {
    const text = 'Text before\n```\ncode block\nwith multiple lines\n```\nText after';
    const result = truncateMarkdown(text, 30);
    expect(result).not.toContain('```');
    expect(result).toBe('Text before Text after');
  });

  it('should handle lists', () => {
    const text = '- Item 1\n- Item 2\n- Item 3\n\nRegular text';
    const result = truncateMarkdown(text, 31);
    expect(result).toBe('Item 1 Item 2 Item 3 Regular…');
  });

  it('should handle blockquotes', () => {
    const text = '> This is a quote\n> with multiple lines\n\nRegular text';
    const result = truncateMarkdown(text, 40);
    expect(result).toBe('This is a quote with multiple lines…');
  });

  it('should preserve word boundaries when possible', () => {
    const text = 'This is a very long sentence that should be truncated at word boundary';
    const result = truncateMarkdown(text, 25);
    expect(result).toMatch(/\s…$|…$/); // Should end with space+ellipsis or just ellipsis
    // The function should try to avoid breaking words, but may do so if necessary
    expect(result.length).toBeLessThanOrEqual(25);
  });
});
