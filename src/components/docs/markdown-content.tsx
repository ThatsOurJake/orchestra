interface MarkdownContentProps {
  html: string;
}

export const MarkdownContent = ({ html }: MarkdownContentProps) => {
  return (
    <article
      className="prose prose-invert prose-lg max-w-none
        prose-headings:font-bold
        prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-0
        prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-8
        prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-6
        prose-p:text-gray-300 prose-p:leading-relaxed
        prose-a:text-blue-400 prose-a:no-underline prose-a:hover:underline
        prose-strong:text-white prose-strong:font-semibold
        prose-code:text-pink-400 prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
        prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700
        prose-ul:text-gray-300 prose-ol:text-gray-300
        prose-li:my-1
        prose-blockquote:border-l-blue-500 prose-blockquote:text-gray-400"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Markdown content is static and safe
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
