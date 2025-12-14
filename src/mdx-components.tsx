import type { MDXComponents } from 'mdx/types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nightOwl } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  // @see src/components/ui/MarkdownText.tsx
  return {
    h1: ({ children }) => (
      <h1 className="text-gradient-brand mb-4 text-balance p-4 text-5xl font-semibold leading-tight tracking-tight lg:text-6xl">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-4 text-3xl font-semibold leading-tight tracking-tight text-theme lg:text-4xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => <h3 className="mb-2 text-2xl font-medium">{children}</h3>,
    p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
    ul: ({ children }) => <ul className="mb-4 list-inside list-disc space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="mb-4 list-inside list-decimal space-y-1">{children}</ol>,
    li: ({ children }) => <li className="ml-4">{children}</li>,
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children, className }) => {
      const match = /language-(\w+)/.exec(className || '');
      return (
        <SyntaxHighlighter
          PreTag="div"
          language={match ? match[1] : undefined}
          style={nightOwl}
          className="mb-4 rounded-lg prose-code:!text-sm"
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      );
    },
    pre: ({ children }) => children,
    ...components,
  };
}
