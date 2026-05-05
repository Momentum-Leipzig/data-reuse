"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const MIN_CHARACTERS = 3;

type SearchPreviewProps<T> = {
  items: T[];
  getItemKey: (item: T) => string;
  getSearchFields: (item: T) => Array<string | number | null | undefined>;
  renderItem: (item: T) => React.ReactNode;
  onSelect?: (item: T) => void;
  placeholder?: string;
  //   label?: string;
  maxResults?: number;
  loading?: boolean;
  error?: string | null;
  noResultsText?: string;
};

export default function SearchPreview<T>({
  items,
  getItemKey,
  getSearchFields,
  renderItem,
  onSelect,
  placeholder = "Search...",
  //   label = "Search",
  maxResults = 8,
  loading = false,
  error = null,
  noResultsText = "No matching results.",
}: SearchPreviewProps<T>) {
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLElement | null>(null);
  const normalizedQuery = query.trim().toLowerCase();
  const canSearch = normalizedQuery.length >= MIN_CHARACTERS;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current) {
        return;
      }

      if (!containerRef.current.contains(event.target as Node)) {
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const filteredResults = useMemo(() => {
    if (!canSearch) {
      return [];
    }

    return items
      .filter((item) => {
        const searchableText = getSearchFields(item)
          .filter((field) => field !== null && field !== undefined)
          .map((field) => String(field).toLowerCase())
          .join(" ");

        return searchableText.includes(normalizedQuery);
      })
      .slice(0, maxResults);
  }, [canSearch, getSearchFields, items, maxResults, normalizedQuery]);

  return (
    <section ref={containerRef} className="">
      <label className="block">
        {/* <span className="mb-1 block font-semibold">{label}</span> */}
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl bg-lmp-gray1 border border-lmp-gray2 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lmp-green text-lmp-text"
        />
      </label>

      {loading && <p>Loading search data...</p>}
      {error && <p className="text-red-700">Error: {error}</p>}

      {!loading && !error && canSearch && (
        <div className="rounded-bl-2xl rounded-br-2xl pt-8 -mt-6 bg-white p-2 border border-lmp-gray2">
          {filteredResults.length === 0 ? (
            <p className="px-2 py-1 text-sm">{noResultsText}</p>
          ) : (
            <ul className="space-y-2 px-6">
              {filteredResults.map((item) => (
                <li key={getItemKey(item)}>
                  {onSelect ? (
                    <button
                      type="button"
                      onClick={() => onSelect(item)}
                      className="cursor-pointer rounded-xl px-3 py-2 text-left bg-lmp-gray3 hover:bg-lmp-gray3/70 transition"
                    >
                      {renderItem(item)}
                    </button>
                  ) : (
                    <div className="rounded-xl px-3 py-2 bg-lmp-gray3">
                      {renderItem(item)}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!loading && !error && !canSearch && query.length > 0 && (
        <p className="text-sm text-lmp-text/70">
          Enter at least {MIN_CHARACTERS} characters to see search preview.
        </p>
      )}
    </section>
  );
}
