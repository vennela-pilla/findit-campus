import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage, isNetworkError } from "../services/api";
import ErrorMessage from "../components/ErrorMessage";

const Login = () => {
  const { login, loginAsPreview } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [previewNotice, setPreviewNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setPreviewNotice(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (isNetworkError(err)) {
        // Safe development-only preview fallback when backend is offline
        setPreviewNotice(
          "Development Preview Mode: Backend is offline. This form submission is only for UI testing."
        );
        loginAsPreview({ email });
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1100);
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviewLogin = () => {
    loginAsPreview({ email: email || "alex.student@campus.edu" });
    navigate(from, { replace: true });
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Log in to report items and track your claims.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {error && <ErrorMessage message={error} />}

          {previewNotice && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50/95 p-3.5 text-xs text-amber-900 shadow-xs">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-800 text-[11px] font-bold mt-0.5">
                ⚡
              </span>
              <div>
                <p className="font-bold text-amber-950">{previewNotice}</p>
                <p className="mt-0.5 text-amber-700">Connecting to Dashboard preview...</p>
              </div>
            </div>
          )}

          <div>
            <label className="label-text" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="input-field"
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="label-text" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary mt-2">
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Development UI Preview Mode */}
        <div className="mt-6 rounded-xl border border-dashed border-amber-300 bg-amber-50/70 p-3.5 text-center">
          <p className="text-xs font-semibold text-amber-900">
            Development &amp; UI Preview
          </p>
          <p className="mt-0.5 text-[11px] text-amber-700">
            Backend offline? Explore and test the redesigned Dashboard UI with sample campus data.
          </p>
          <button
            type="button"
            onClick={handlePreviewLogin}
            className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-900 shadow-xs transition hover:bg-amber-100"
          >
            <svg className="h-3.5 w-3.5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview Dashboard as Student
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-primary-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
