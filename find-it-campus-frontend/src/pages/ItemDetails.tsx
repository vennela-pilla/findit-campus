import { FormEvent, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Item, ReportedBy } from "../types/Item";
import { getItemById } from "../services/itemService";
import { createClaim } from "../services/claimService";
import { getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  claimed: "bg-slate-200 text-slate-600",
};

const ItemDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [claimMessage, setClaimMessage] = useState("");
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getItemById(id);
        setItem(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const reportedBy = item?.reportedBy as ReportedBy | undefined;
  const isOwner = user && reportedBy && typeof reportedBy === "object" && reportedBy._id === user.id;

  const handleClaimSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!item) return;
    if (claimMessage.trim().length < 10) {
      setClaimError("Please explain why this item belongs to you (min 10 characters)");
      return;
    }
    setClaimError(null);
    setIsSubmittingClaim(true);
    try {
      await createClaim(item._id, claimMessage);
      setClaimSuccess(true);
      setShowClaimForm(false);
    } catch (err) {
      setClaimError(getErrorMessage(err));
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  if (isLoading) return <LoadingSpinner fullPage />;

  if (error || !item) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <ErrorMessage message={error || "Item not found"} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="card overflow-hidden">
        <div className="h-72 w-full bg-slate-100 sm:h-96">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-300">No image provided</div>
          )}
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`badge capitalize ${item.type === "lost" ? "bg-red-50 text-red-600 border border-red-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"}`}>
              {item.type}
            </span>
            <span className={`badge capitalize ${statusStyles[item.status]}`}>{item.status}</span>
            <span className="badge bg-slate-100 text-slate-600">{item.category}</span>
          </div>

          <h1 className="mt-3 text-2xl font-bold text-slate-900">{item.title}</h1>
          <p className="mt-2 text-slate-600">{item.description}</p>

          <div className="mt-5 grid grid-cols-1 gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">Location</p>
              <p className="text-sm text-slate-700">{item.location}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">Date</p>
              <p className="text-sm text-slate-700">{new Date(item.date).toLocaleDateString()}</p>
            </div>
            {item.additionalDetails && (
              <div className="sm:col-span-2">
                <p className="text-xs font-medium uppercase text-slate-400">Additional Details</p>
                <p className="text-sm text-slate-700">{item.additionalDetails}</p>
              </div>
            )}
            {item.status === "rejected" && item.rejectionReason && (
              <div className="sm:col-span-2">
                <p className="text-xs font-medium uppercase text-red-400">Rejection Reason</p>
                <p className="text-sm text-red-600">{item.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* Claim section — only for found items that are approved and not the reporter's own */}
          {item.type === "found" && item.status === "approved" && !isOwner && (
            <div className="mt-6 border-t border-slate-200 pt-6">
              {!user ? (
                <p className="text-sm text-slate-500">
                  <Link to="/login" className="font-semibold text-primary-600 hover:underline">
                    Log in
                  </Link>{" "}
                  to claim this item.
                </p>
              ) : claimSuccess ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Claim submitted successfully. An admin will review it soon — check My Claims for updates.
                </div>
              ) : showClaimForm ? (
                <form onSubmit={handleClaimSubmit} className="flex flex-col gap-3">
                  {claimError && <ErrorMessage message={claimError} />}
                  <label className="label-text">Why do you believe this item belongs to you?</label>
                  <textarea
                    className="input-field min-h-[100px]"
                    value={claimMessage}
                    onChange={(e) => setClaimMessage(e.target.value)}
                    placeholder="Describe identifying details only you would know..."
                  />
                  <div className="flex gap-3">
                    <button type="submit" disabled={isSubmittingClaim} className="btn-primary">
                      {isSubmittingClaim ? "Submitting..." : "Submit Claim"}
                    </button>
                    <button type="button" onClick={() => setShowClaimForm(false)} className="btn-secondary">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setShowClaimForm(true)} className="btn-primary">
                  Claim This Item
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
