import React, { type ReactNode } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

interface PageFeedbackProps {
  loading?: boolean;
  loadingMessage?: string;
  error?: string | null;
  onRetry?: () => void;
  empty?: boolean;
  emptyMessage?: string;
  children?: ReactNode;
}

/**
 * Estados padronizados de carregamento, erro e vazio para telas principais.
 */
const PageFeedback: React.FC<PageFeedbackProps> = ({
  loading,
  loadingMessage = 'Carregando…',
  error,
  onRetry,
  empty,
  emptyMessage = 'Nenhum registro encontrado.',
  children
}) => {
  if (loading) {
    return (
      <div className="page-feedback page-feedback--loading" role="status">
        <Loader2 size={32} className="page-feedback-spinner" aria-hidden />
        <p>{loadingMessage}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-feedback page-feedback--error" role="alert">
        <AlertCircle size={28} aria-hidden />
        <p>{error}</p>
        {onRetry && (
          <button type="button" className="btn btn-secondary" onClick={onRetry}>
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="page-feedback page-feedback--empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default PageFeedback;
