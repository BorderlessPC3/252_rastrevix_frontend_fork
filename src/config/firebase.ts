/** Quando true, CRUD e auth usam Firestore/Firebase Auth direto (sem backend Express). */
export const useFirebaseDirect = (): boolean =>
  import.meta.env.VITE_USE_FIREBASE === 'true';

/** ID do banco Firestore nomeado. Vazio = database (default) do projeto Firebase. */
export const firestoreDatabaseId = (): string | undefined => {
  const id = import.meta.env.VITE_FIRESTORE_DATABASE_ID?.trim();
  if (!id || id === '(default)') return undefined;
  return id;
};
