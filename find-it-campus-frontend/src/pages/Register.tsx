import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage, isNetworkError } from "../services/api";
import ErrorMessage from "../components/ErrorMessage";

const Register = () => {
  const { register, loginAsPreview } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [previewNotice, setPreviewNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = (): string | null => {
    if (form.fullName.trim().length < 2) return "Please enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email address";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setPreviewNotice(null);
    setIsSubmitting(true);
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (isNetworkError(err)) {
        // Safe development-only preview fallback when backend is offline
        setPreviewNotice(
          "Development Preview Mode: Backend is offline. This form submission is only for UI testing."
        );
        loginAsPreview({ fullName: form.fullName, email: form.email });
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1100);
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Join Find It Campus to report and search lost &amp; found items.
        </p>

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
            <label className="label-text" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              required
              className="input-field"
              placeholder="Jane Doe"
              value={form.fullName}
              onChange={update("fullName")}
            />
          </div>

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
              value={form.email}
              onChange={update("email")}
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
              placeholder="At least 6 characters"
              value={form.password}
              onChange={update("password")}
            />
          </div>

          <div>
            <label className="label-text" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              className="input-field"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary mt-2">
            {isSubmitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
