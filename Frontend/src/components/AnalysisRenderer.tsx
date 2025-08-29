// components/AnalysisRenderer.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

type Props = {
  text: string | null | undefined;
};

const AnalysisRenderer: React.FC<Props> = ({ text }) => {
  if (!text) return null;

  return (
    <div className="prose max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,       // parse inline HTML from model
          rehypeSanitize,  // sanitize parsed HTML
          rehypeHighlight, // syntax highlighting (runs after sanitize; trusted plugin)
        ]}
        components={{
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto">
              <table {...props} />
            </div>
          ),
          a: ({ node, ...props }) => (
            <a target="_blank" rel="noopener noreferrer" {...props} />
          ),
          code({ node, className, children, ...props }) {
            const isInline = !className || !className.includes('language-');
            if (isInline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <pre className={className}>
                <code {...props}>{children}</code>
              </pre>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};

export default AnalysisRenderer;
