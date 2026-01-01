import React, { useState, useEffect } from "react";
import { Search, Eye, ThumbsUp, ExternalLink, Clock } from "lucide-react";
import Link from "next/link";

export default function HelpSearch({ courseId }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [helpArticles, setHelpArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHelpArticles();
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [searchQuery, page, courseId]);

  const fetchHelpArticles = async () => {
    if (!courseId) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        courseId,
        limit: 10,
        page,
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/help?${params}`);
      const data = await response.json();

      if (data.success) {
        setHelpArticles(data.articles);
        setTotalPages(data.totalPages || 1);
        setTotalResults(data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching help articles:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="space-y-4">
        {/* Search Header */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Results Count */}
        {totalResults > 0 && (
          <p className="text-sm text-gray-600">
            Found {totalResults} result{totalResults !== 1 ? "s" : ""}
          </p>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && helpArticles.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">
              {searchQuery
                ? "No help articles found matching your search."
                : "No help articles available yet."}
            </p>
          </div>
        )}

        {/* Articles List */}
        <div className="space-y-3">
          {helpArticles.map((article) => (
            <Link
              key={article.id}
              href={`/help/${article.id}`}
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div className="space-y-2">
                {/* Title */}
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 flex items-start justify-between">
                  <span className="flex-1 line-clamp-2">{article.title}</span>
                  <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                </h3>

                {/* Question Preview */}
                <p className="text-sm text-gray-600 line-clamp-2">
                  {article.question}
                </p>

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {article.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {article.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{article.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{article.viewCount || 0} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{article.helpful || 0} helpful</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(article.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Author */}
                <p className="text-xs text-gray-400">
                  by {article.author?.name || "Unknown"}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1 || loading}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-400"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    disabled={loading}
                    className={`px-3 py-2 rounded-lg ${
                      page === pageNum
                        ? "bg-blue-500 text-white"
                        : "border border-gray-300 hover:border-blue-400"
                    } disabled:opacity-50`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <span className="px-2 py-2 text-gray-500">...</span>
              )}
            </div>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || loading}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-400"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
