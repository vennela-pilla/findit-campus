const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 text-xs text-white">
              FC
            </span>
            Find It Campus
          </div>
          <p className="text-center text-xs text-slate-500">
            Helping students reunite with their belongings, one report at a time.
          </p>
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Find It Campus. Built for campus communities.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
