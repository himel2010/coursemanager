"use client";

import React, { useState } from "react";
import HelpArticleViewer from "@/components/HelpArticleViewer";
import CreateHelpArticleModal from "@/components/CreateHelpArticleModal";

export default function HelpArticlePage({ params }) {
  const [articleData, setArticleData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEditClick = (article) => {
    setArticleData(article);
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HelpArticleViewer articleId={params.articleId} onEdit={handleEditClick} />

      <CreateHelpArticleModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setArticleData(null);
        }}
        courseId={articleData?.courseId}
        initialData={articleData}
        onSuccess={() => {
          setShowEditModal(false);
          setArticleData(null);
          // Reload the page
          window.location.reload();
        }}
      />
    </div>
  );
}
