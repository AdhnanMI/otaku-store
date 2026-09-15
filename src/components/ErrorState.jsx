import { RefreshCw } from 'lucide-react';
import './ErrorState.css';

/**
 * Shared "couldn't load this" state for failed fetches.
 * Used anywhere a page needs to show a server/network failure with a retry action.
 *
 * Props:
 * - title: short heading, e.g. "Unable to load products"
 * - message: one line of detail
 * - onRetry: fn called when the retry button is pressed
 * - retryLabel: button text (default "Try Again")
 * - compact: smaller inline variant for tight spaces (e.g. admin panels)
 */
export default function ErrorState({
  title = "Something didn't load",
  message = "That's on us. Please try again.",
  onRetry,
  retryLabel = 'Try Again',
  compact = false,
}) {
  return (
    <div className={`error-state${compact ? ' error-state-compact' : ''}`} role="alert">
      <svg className="error-state-icon" viewBox="0 0 120 56" aria-hidden="true">
        <circle cx="14" cy="28" r="6" className="es-node" />
        <path d="M22 28 H48" className="es-line" />
        <circle cx="60" cy="28" r="4.5" className="es-spark" />
        <path d="M72 28 H98" className="es-line" />
        <circle cx="106" cy="28" r="6" className="es-node" />
      </svg>

      <div className="error-state-copy">
        <h2>{title}</h2>
        {message && <p>{message}</p>}
      </div>

      {onRetry && (
        <button
          type="button"
          className={compact ? 'btn btn-outline error-state-retry' : 'btn btn-primary error-state-retry'}
          onClick={onRetry}
        >
          <RefreshCw size={compact ? 13 : 15} />
          {retryLabel}
        </button>
      )}
    </div>
  );
}
