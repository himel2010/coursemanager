import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";

export function useDocuments() {
  const { userId } = useAuth();

  const documents = useQuery(
    api.documents.listDocuments,
    userId ? { userId } : "skip"
  );

  const createDocument = useMutation(api.documents.createDocument);
  const updateDocument = useMutation(api.documents.updateDocument);
  const deleteDocument = useMutation(api.documents.deleteDocument);

  return {
    documents,
    createDocument,
    updateDocument,
    deleteDocument,
  };
}

export function useDocument(documentId) {
  const document = useQuery(api.documents.getDocument, { documentId });
  const updateDocument = useMutation(api.documents.updateDocument);
  const deleteDocument = useMutation(api.documents.deleteDocument);

  return {
    document,
    updateDocument,
    deleteDocument,
  };
}

export function useDocumentSharing() {
  const { userId } = useAuth();

  const sharedDocuments = useQuery(
    api.documents.getSharedDocuments,
    userId ? { userId } : "skip"
  );

  const shareDocument = useMutation(api.documents.shareDocument);

  return {
    sharedDocuments,
    shareDocument,
  };
}

export function useCursorPositions(documentId) {
  const cursors = useQuery(api.documents.getCursorPositions, { documentId });
  const updateCursorPosition = useMutation(api.documents.updateCursorPosition);

  return {
    cursors,
    updateCursorPosition,
  };
}
