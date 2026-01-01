import React, { useState } from "react";
import { BookMarked } from "lucide-react";
import CreateHelpArticleModal from "./CreateHelpArticleModal";

export default function SaveToHelpButton({ forumPost, courseId }) {
  const [showModal, setShowModal] = useState(false);

  const handleSaveClick = () => {
    setShowModal(true);
  };

  // Pre-fill the modal with forum post data
  const initialData = forumPost
    ? {
        title: forumPost.title,
        question: forumPost.content,
        answer: "", // User needs to fill this
        tags: [],
        courseId: courseId,
        forumPostId: forumPost.id,
      }
    : null;

  return (
    <>
      <button
        onClick={handleSaveClick}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition border border-amber-200"
        title="Save this resolved Q&A as a help article"
      >
        <BookMarked className="w-4 h-4" />
        Save as Help
      </button>

      <CreateHelpArticleModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        courseId={courseId}
        forumPostId={forumPost?.id}
        initialData={initialData}
        onSuccess={() => {
          setShowModal(false);
          // Optional: Show success message
          alert("Article saved to Help section!");
        }}
      />
    </>
  );
}
