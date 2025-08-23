'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface GiscusCommentsProps {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping?: string;
  strict?: boolean;
  reactionsEnabled?: boolean;
  emitMetadata?: boolean;
  inputPosition?: 'top' | 'bottom';
  theme?: 'light' | 'dark' | 'preferred_color_scheme';
  lang?: string;
  loading?: 'lazy' | 'eager';
}

export function GiscusComments({
  repo,
  repoId,
  category,
  categoryId,
  mapping = 'pathname',
  strict = false,
  reactionsEnabled = true,
  emitMetadata = false,
  inputPosition = 'bottom',
  theme = 'preferred_color_scheme',
  lang = 'en',
  loading = 'lazy',
}: GiscusCommentsProps) {
  const commentsRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!commentsRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', repo);
    script.setAttribute('data-repo-id', repoId);
    script.setAttribute('data-category', category);
    script.setAttribute('data-category-id', categoryId);
    script.setAttribute('data-mapping', mapping);
    script.setAttribute('data-strict', strict.toString());
    script.setAttribute('data-reactions-enabled', reactionsEnabled.toString());
    script.setAttribute('data-emit-metadata', emitMetadata.toString());
    script.setAttribute('data-input-position', inputPosition);
    script.setAttribute('data-theme', theme === 'preferred_color_scheme' ? resolvedTheme || 'light' : theme);
    script.setAttribute('data-lang', lang);
    script.setAttribute('data-loading', loading);
    script.crossOrigin = 'anonymous';
    script.async = true;

    // Remove existing script if it exists
    const existingScript = commentsRef.current.querySelector('script');
    if (existingScript) {
      existingScript.remove();
    }

    commentsRef.current.appendChild(script);

    return () => {
      if (commentsRef.current) {
        const scriptElement = commentsRef.current.querySelector('script');
        if (scriptElement) {
          scriptElement.remove();
        }
      }
    };
  }, [
    repo,
    repoId,
    category,
    categoryId,
    mapping,
    strict,
    reactionsEnabled,
    emitMetadata,
    inputPosition,
    theme,
    lang,
    loading,
    resolvedTheme,
  ]);

  return (
    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Comments
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Share your thoughts and join the discussion
        </p>
      </div>
      <div ref={commentsRef} className="giscus-comments" />
    </div>
  );
}
