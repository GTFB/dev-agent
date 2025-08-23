'use client';

import { useState } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export function Search() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Integrate with Typesense
      // For now, simulate search results
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockResults = [
        {
          id: 1,
          title: 'Getting Started with lnd-boilerplate',
          excerpt: 'Learn how to set up your first project...',
          url: '/blog/getting-started',
          type: 'blog',
        },
        {
          id: 2,
          title: 'Understanding the Monorepo Architecture',
          excerpt: 'Deep dive into how our monorepo structure works...',
          url: '/blog/monorepo-architecture',
          type: 'blog',
        },
      ].filter(result => 
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
      setResults([]);
    }
  };

  return (
    <>
      {/* Search Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
        aria-label={t('common.search')}
      >
        <SearchIcon className="h-5 w-5" />
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-x-4 top-4 z-50 mx-auto max-w-2xl">
            <div className="relative bg-background border border-border rounded-lg shadow-lg">
              {/* Search Input */}
              <form onSubmit={handleSubmit} className="flex items-center border-b border-border">
                <SearchIcon className="ml-4 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('common.search')}
                  className="flex-1 px-4 py-4 bg-transparent border-none outline-none text-foreground placeholder-muted-foreground"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setQuery('');
                    setResults([]);
                  }}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </form>

              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    {t('common.loading')}...
                  </div>
                ) : results.length > 0 ? (
                  <div className="p-2">
                    {results.map((result) => (
                      <a
                        key={result.id}
                        href={result.url}
                        className="block p-3 hover:bg-accent rounded-md transition-colors"
                        onClick={() => {
                          setIsOpen(false);
                          setQuery('');
                          setResults([]);
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-foreground truncate">
                              {result.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {result.excerpt}
                            </p>
                            <div className="flex items-center mt-2 space-x-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                {result.type}
                              </span>
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : query && !isLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No results found for "{query}"
                  </div>
                ) : null}
              </div>

              {/* Search Tips */}
              <div className="p-4 border-t border-border bg-muted/50">
                <div className="text-xs text-muted-foreground">
                  <strong>Search tips:</strong> Use quotes for exact phrases, use - to exclude terms
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
