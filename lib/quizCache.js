// Lightweight in-memory cache for generated quizzes
// Note: suitable for development; replace with DB persistence for production

const globalCache = globalThis.__quizCache || new Map();
globalThis.__quizCache = globalCache;

export function saveQuiz(documentId, payload) {
  if (!documentId) return false;
  try {
    globalCache.set(String(documentId), payload);
    return true;
  } catch {
    return false;
  }
}

export function getQuiz(documentId) {
  if (!documentId) return null;
  return globalCache.get(String(documentId)) || null;
}

export function listQuizKeys() {
  return Array.from(globalCache.keys());
}
