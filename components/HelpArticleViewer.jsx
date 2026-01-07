import React, { useState, useEffect } from "react";
import { ArrowLeft, ThumbsUp, Eye, Clock, Edit2, Trash2, Share2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HelpArticleViewer({ articleId, onEdit = null }) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userIsAuthor, setUserIsAuthor] = useState(false);
  const [isHelpful, setIsHelpful] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchArticle();
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/help/${articleId}`);
      const data = await response.json();
      setArticle(data);

      // Check if current user is author
      const userResponse = await fetch("/api/set-user");
      const userData = await userResponse.json();
      if (userData.user && userData.user.id === data.authorId) {
        setUserIsAuthor(true);
      }
    } catch (error) {
      console.error("Error fetching article:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkHelpful = async () => {
    if (!article) return;

    try {
      const response = await fetch(`/api/help/${articleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          helpful: (article.helpful || 0) + 1,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setArticle(updated);
        setIsHelpful(true);
      }
    } catch (error) {
      console.error("Error marking helpful:", error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this article?")) {
      return;
    }

    try {
      const response = await fetch(`/api/help/${articleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/help");
      }
    } catch (error) {
      console.error("Error deleting article:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Link
          href="/help"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Help
        </Link>
        <div className="text-center py-12">
          <p className="text-gray-600">Article not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/help"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Help
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{article.viewCount || 0} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>
                  {new Date(article.createdAt).toLocaleDateString()}
                </span>
              </div>
              {article.author && (
                <div>
                  <span>by {article.author.name}</span>
                </div>
              )}
            </div>
          </div>

          {userIsAuthor && (
            <div className="flex gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(article)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Edit article"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
              )}
              <button
                onClick={handleDelete}
                className="p-2 hover:bg-red-50 rounded-lg transition"
                title="Delete article"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {article.tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Course Link */}
      {article.course && (
        <div className="mb-6 p-3 bg-gray-50 rounded-lg text-sm">
          Course: <strong>{article.course.code} - {article.course.title}</strong>
        </div>
      )}

      {/* Content */}
      <div className="space-y-8 mb-8">
        {/* Question */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Question</h2>
          <div className="p-4 bg-blue-50 rounded-lg text-gray-800 whitespace-pre-wrap">
            {article.question}
          </div>
        </div>

        {/* Answer */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Answer</h2>
          <div className="p-4 bg-green-50 rounded-lg text-gray-800 whitespace-pre-wrap">
            {article.answer}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 border-t pt-6">
        <button
          onClick={handleMarkHelpful}
          disabled={isHelpful}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            isHelpful
              ? "bg-green-100 text-green-700"
              : "border border-gray-300 hover:border-green-400"
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          <span>
            Mark Helpful ({article.helpful || 0})
          </span>
        </button>

        <button
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-blue-400 transition"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
          }}
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Related Articles */}
      {article.forumPost && (
        <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-900">
            This help article was created from a forum discussion.{" "}
            <Link
              href={`/community/${article.forumPost.channelId}/post/${article.forumPost.id}`}
              className="text-purple-700 hover:underline font-semibold"
            >
              View original discussion →
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
