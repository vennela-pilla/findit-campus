import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ITEM_CATEGORIES } from "../types/Item";
import { createItem } from "../services/itemService";
import { getErrorMessage } from "../services/api";
import ErrorMessage from "../components/ErrorMessage";

interface Props {
  type: "lost" | "found";
}

const ItemReportForm = ({ type }: Props) => {
  const navigate = useNavigate();
  const isLost = type === "lost";

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    date: "",
    additionalDetails: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.description || !form.location || !form.date) {
      setError("Please fill in all required fields");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await createItem({ ...form, type, image });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard/my-reports"), 1200);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">
        Report {isLost ? "Lost" : "Found"} Item
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {isLost
          ? "Give as much detail as possible to help others recognize your item."
          : "Thank you for helping reunite this item with its owner."}
      </p>

      <form onSubmit={handleSubmit} className="card mt-6 flex flex-col gap-4 p-6">
        {error && <ErrorMessage message={error} />}
        {success && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Report submitted successfully! Redirecting to your reports...
          </div>
        )}

        <div>
          <label className="label-text">Item Name</label>
          <input
            className="input-field"
            placeholder="e.g. Black Wallet"
            value={form.title}
            onChange={update("title")}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label-text">Category</label>
            <select className="input-field" value={form.category} onChange={update("category")} required>
              <option value="">Select category</option>
              {ITEM_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">Location {isLost ? "Lost" : "Found"}</label>
            <input
              className="input-field"
              placeholder="e.g. Library, 2nd floor"
              value={form.location}
              onChange={update("location")}
              required
            />
          </div>
        </div>

        <div>
          <label className="label-text">Description</label>
          <textarea
            className="input-field min-h-[100px]"
            placeholder="Describe the item in detail..."
            value={form.description}
            onChange={update("description")}
            required
          />
        </div>

        <div>
          <label className="label-text">Date {isLost ? "Lost" : "Found"}</label>
          <input
            type="date"
            className="input-field"
            value={form.date}
            onChange={update("date")}
            max={new Date().toISOString().split("T")[0]}
            required
          />
        </div>

        <div>
          <label className="label-text">Image</label>
          <input type="file" accept="image/*" className="input-field" onChange={handleImageChange} />
          {preview && (
            <img src={preview} alt="Preview" className="mt-3 h-36 w-36 rounded-lg object-cover" />
          )}
        </div>

        <div>
          <label className="label-text">Additional Details (optional)</label>
          <textarea
            className="input-field min-h-[70px]"
            placeholder="Any other identifying details..."
            value={form.additionalDetails}
            onChange={update("additionalDetails")}
          />
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary mt-2">
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
};

export default ItemReportForm;
