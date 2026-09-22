import { useEffect, useState } from "react";
import { Claim, Claimant } from "../../types/Claim";
import { Item } from "../../types/Item";
import { getAllClaims, approveClaim, rejectClaim } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import EmptyState from "../../components/EmptyState";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const AdminClaims = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllClaims();
      setClaims(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id: string) => {
    setActioningId(id);
    try {
      await approveClaim(id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActioningId(id);
    try {
      await rejectClaim(id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Claims</h1>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : claims.length === 0 ? (
        <EmptyState title="No claims found" />
      ) : (
        <div className="flex flex-col gap-4">
          {claims.map((claim) => {
            const item = claim.item as Item;
            const claimant = claim.claimant as Claimant;
            return (
              <div key={claim._id} className="card flex flex-col gap-4 p-5 sm:flex-row">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {item?.imageUrl && <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-slate-800">{item?.title}</p>
                    <span className={`badge capitalize ${statusStyles[claim.status]}`}>{claim.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Claimant: {claimant?.fullName} ({claimant?.email})
                  </p>
                  <p className="mt-2 text-sm text-slate-600">{claim.message}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Submitted {new Date(claim.createdAt).toLocaleDateString()}
                  </p>

                  {claim.status === "pending" && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleApprove(claim._id)}
                        disabled={actioningId === claim._id}
                        className="btn-primary !bg-emerald-600 hover:!bg-emerald-700"
                      >
                        Approve Claim
                      </button>
                      <button
                        onClick={() => handleReject(claim._id)}
                        disabled={actioningId === claim._id}
                        className="btn-danger"
                      >
                        Reject Claim
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminClaims;
