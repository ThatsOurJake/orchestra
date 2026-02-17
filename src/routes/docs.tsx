import { Navigate, useParams } from 'react-router';
import { DocsLayout } from '@/components/docs/docs-layout';
import { MarkdownContent } from '@/components/docs/markdown-content';

// Import all markdown files from docs folder
const docModules = import.meta.glob('/docs/*.md', { eager: true });

interface DocModule {
  attributes: { title?: string; position?: number };
  html: string;
}

interface DocMetadata {
  slug: string;
  title: string;
  position: number;
  module: DocModule;
}

// Process all docs and extract metadata
const docs: DocMetadata[] = Object.entries(docModules)
  .map(([path, module]) => {
    const doc = module as DocModule;
    const slug = path.replace('/docs/', '').replace('.md', '');
    const title = doc.attributes?.title || slug;
    const position = doc.attributes?.position ?? 999;

    return {
      slug,
      title,
      position,
      module: doc,
    };
  })
  .sort((a, b) => a.position - b.position);

export const Docs = () => {
  const { slug } = useParams();

  // If no slug provided, redirect to first doc
  if (!slug) {
    return <Navigate to={`/docs/${docs[0]?.slug || 'introduction'}`} replace />;
  }

  // Find the current doc
  const currentDoc = docs.find((doc) => doc.slug === slug);

  if (!currentDoc) {
    return (
      <DocsLayout docs={docs}>
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-300 mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-400">
            The documentation page you're looking for doesn't exist.
          </p>
        </div>
      </DocsLayout>
    );
  }

  return (
    <DocsLayout docs={docs}>
      <MarkdownContent html={currentDoc.module.html} />
    </DocsLayout>
  );
};
