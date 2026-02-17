import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router';

interface DocMetadata {
  slug: string;
  title: string;
}

interface DocsLayoutProps {
  docs: DocMetadata[];
  children: React.ReactNode;
}

export const DocsLayout = ({ docs, children }: DocsLayoutProps) => {
  const { slug } = useParams();
  const currentSlug = slug || docs[0]?.slug;
  const mainRef = useRef<HTMLElement>(null);

  // Reset scroll position when slug changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to reset scroll when page changes
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [currentSlug]);

  return (
    <div className="flex w-full h-full">
      {/* Main content */}
      <main ref={mainRef} className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-12">{children}</div>
      </main>

      {/* Sidebar */}
      <aside
        className="w-64 bg-gray-850 border-l border-gray-700 overflow-y-auto"
        style={{ backgroundColor: 'rgb(26, 32, 44)' }}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6">Documentation</h2>
          <nav>
            <ul className="space-y-2">
              {docs.map((doc) => (
                <li key={doc.slug}>
                  <Link
                    to={`/docs/${doc.slug}`}
                    className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                      currentSlug === doc.slug
                        ? 'bg-gray-700 text-white font-medium'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {doc.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </div>
  );
};
