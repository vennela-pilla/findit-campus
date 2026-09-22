interface Props {
  label?: string;
  fullPage?: boolean;
}

const LoadingSpinner = ({ label = "Loading...", fullPage = false }: Props) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-slate-500">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      <span className="text-sm">{label}</span>
    </div>
  );

  if (fullPage) {
    return <div className="flex min-h-[60vh] items-center justify-center">{spinner}</div>;
  }

  return spinner;
};

export default LoadingSpinner;
