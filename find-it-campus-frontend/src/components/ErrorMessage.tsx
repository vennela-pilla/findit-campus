interface Props {
  message?: string | null;
  onRetry?: () => void;
}

const ErrorMessage = ({ message, onRetry }: Props) => {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div className="flex-1">
        <p>{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-1 text-xs font-semibold underline">
            Try again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
