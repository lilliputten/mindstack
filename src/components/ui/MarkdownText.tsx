import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nightOwl } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

import { cn } from '@/lib/utils';
import * as Icons from '@/components/shared/Icons';

interface MarkdownProps {
  children: string;
  className?: string;
  omitLinks?: boolean;
  vars?: Record<string, string>;
}

const remarkTypograph: Plugin = () => (tree) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  visit(tree, 'text', (node: any, index, parent: any) => {
    // Skip code, inlineCode, link URLs, etc.
    if (!parent || ['code', 'inlineCode', 'link'].includes(parent.type)) return;

    let value: string = node.value;

    // -- to em dash (basic example)
    value = value.replace(/(^|[^-])--([^-]|$)/g, '$1—$2');

    // "text" to «text»
    value = value.replace(/"([^"]+)"/g, '«$1»');

    node.value = value;
  });
};

export function MarkdownText({ children, className, omitLinks, vars }: MarkdownProps) {
  let processedChildren = children;

  // Remove HTML comments
  processedChildren = processedChildren.replace(/<!--[\s\S]*?-->/g, '');

  // Replace variables
  if (vars) {
    processedChildren = processedChildren.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
  }

  /* // Naive typography processing
   * processedChildren = processedChildren
   *   .replace(/--/g, '—')
   *   .replace(/"/g, '«')
   *   .replace(/«([^«»]*)«/g, '«$1»');
   */

  // @see https://react-syntax-highlighter.github.io/react-syntax-highlighter/demo/
  // @see https://www.npmjs.com/package/react-syntax-highlighter
  const syntax = nightOwl; // resolvedTheme === 'dark' ? nightOwl : materialLight;
  // @see https://github.com/remarkjs/react-markdown
  // @see src/mdx-components.tsx
  return (
    <div
      className={cn(
        'MarkdownText',
        // 'flex flex-col gap-4',
        'prose prose-sm max-w-none',
        'prose-headings:font-semibold prose-headings:text-foreground',
        'prose-p:leading-relaxed prose-p:text-foreground',
        'prose-a:text-theme prose-a:no-underline hover:prose-a:underline',
        'prose-strong:font-semibold prose-strong:text-foreground',
        'prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-sm prose-code:text-foreground',
        'prose-pre:rounded-lg prose-pre:border prose-pre:bg-muted',
        'prose-blockquote:border-l-theme prose-blockquote:text-muted-foreground',
        'prose-ol:text-foreground prose-ul:text-foreground',
        'prose-li:text-foreground',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkTypograph]}
        components={{
          // Customize link behavior
          a: ({ href, children, ...props }) => {
            if (omitLinks) {
              return children;
            }
            const isHttp = href?.startsWith('http');
            return (
              <a
                href={href}
                target={isHttp ? '_blank' : undefined}
                rel={isHttp ? 'noopener noreferrer' : undefined}
                {...props}
                className="inline-flex items-center gap-1"
              >
                {children}
                {isHttp && <Icons.ExternalLink className="size-3" />}
              </a>
            );
          },
          hr: ({ children }) => (
            <hr className="my-4 border-theme-600/10 bg-theme-600/10">{children}</hr>
          ),
          code: (props) => {
            const { children, className, ...rest } = props;
            const { ref, ...syntaxProps } = rest;
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              (() => {
                return (
                  <SyntaxHighlighter
                    className="SyntaxHighlighter"
                    {...syntaxProps}
                    PreTag="div"
                    language={match[1]}
                    style={syntax}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                );
              })()
            ) : (
              <code ref={ref} {...syntaxProps} className={className}>
                {children}
              </code>
            );
          },
        }}
      >
        {processedChildren}
      </ReactMarkdown>
    </div>
  );
}
