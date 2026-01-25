const defaultEllipsis = '…';

/**
 * Strips markdown formatting from text and returns plain text
 */
function stripMarkdown(markdown: string): string {
  let str = markdown.trim();
  // Process code blocks before other processing (TODO: To check for inner code blocks?)
  const isOnlyCode = str.startsWith('```') && str.endsWith('```');
  if (isOnlyCode) {
    str = str.replace(/```/g, '');
  } else {
    // Remove only code blocks content
    str = str.replace(/```[\s\S]*?```/g, '');
  }
  return (
    str
      // Remove headers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bold/italic
      .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
      .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
      // Remove strikethrough
      .replace(/~~([^~]+)~~/g, '$1')
      // Remove inline code
      .replace(/`([^`]+)`/g, '$1')
      // Remove links
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove images
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
      // Remove blockquotes
      .replace(/^>\s+/gm, '')
      // Remove list markers
      .replace(/^[\s]*[-*+]\s+/gm, '')
      .replace(/^[\s]*\d+\.\s+/gm, '')
      // Remove horizontal rules
      .replace(/^---+$/gm, '')
      // Clean up extra whitespace and newlines
      .replace(/\n{2,}/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Truncates markdown text while preserving formatting when possible
 * Falls back to plain text truncation if markdown is too complex
 */
export function truncateMarkdown(
  markdown?: string,
  len?: number,
  ellipsis: string = defaultEllipsis,
): string {
  if (!markdown || !markdown.trim().length) {
    return '';
  }

  // Convert to plain text first to check if we need complex processing
  const plainText = stripMarkdown(markdown.trim());

  // If the original markdown is shorter than the limit, return as-is
  if (!len || plainText.length <= len) {
    return plainText;
  }

  // If plain text is short enough, use it
  if (plainText.length <= len) {
    return plainText;
  }

  // // UNUSED: For simple cases, try to preserve formatting
  // const hasComplexMarkdown = /^#{1,6}\s|```|^>\s|^[-*+]\s|^\d+\.\s|\[.*\]\(.*\)/m.test(markdown);
  // if (!hasComplexMarkdown) {
  //   // Try to truncate while preserving simple formatting
  //   let truncated = markdown.substring(0, len - ellipsis.length);
  //   // Find the last complete word to avoid breaking in the middle
  //   const lastSpace = truncated.lastIndexOf(' ');
  //   if (lastSpace > len * 0.8) {
  //     truncated = truncated.substring(0, lastSpace);
  //   }
  //   // Check if we're inside markdown formatting and try to close it
  //   const openBold = (truncated.match(/\*\*/g) || []).length % 2;
  //   const openItalic = (truncated.match(/(?<!\*)\*(?!\*)/g) || []).length % 2;
  //   const openCode = (truncated.match(/`/g) || []).length % 2;
  //   // Close open formatting
  //   if (openCode) truncated += '`';
  //   if (openItalic) truncated += '*';
  //   if (openBold) truncated += '**';
  //   return truncated + ellipsis;
  // }

  // Fall back to plain text truncation for complex markdown
  const lastSpace = plainText.lastIndexOf(' ', len - ellipsis.length);
  const truncateAt = lastSpace > len * 0.8 ? lastSpace : len - ellipsis.length;

  return plainText.substring(0, truncateAt) + ellipsis;
}
