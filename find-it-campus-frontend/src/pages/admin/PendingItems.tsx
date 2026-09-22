import { useEffect, useState } from "react";
import { Item, ReportedBy } from "../../types/Item";
import { getPendingItems, approveItem, rejectItem } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import EmptyState from "../../components/EmptyState";

const PendingItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPendingItems();
      setItems(data);
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
      await approveItem(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActioningId(id);
    try {
      await rejectItem(id, reason);
      setItems((prev) => prev.filter((i) => i._id !== id));
      setRejectingId(null);
      setReason("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Pending Items</h1>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState title="No pending items" description="All caught up — no reports awaiting review." />
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => {
            const reporter = item.reportedBy as ReportedBy;
            return (
              <div key={item._id} className="card flex flex-col gap-4 p-5 sm:flex-row">
                <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge capitalize bg-slate-100 text-slate-600">{item.type}</span>
                    <span className="badge bg-slate-100 text-slate-600">{item.category}</span>
                  </div>
                  <p className="mt-2 font-semibold text-slate-800">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.description}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Reported by {reporter?.fullName} ({reporter?.email}) &middot; {item.location} &middot;{" "}
                    {new Date(item.date).toLocaleDateString()}
                  </p>

                  {rejectingId === item._id ? (
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <input
                        className="input-field flex-1"
                        placeholder="Rejection reason (optional)"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />
                      <button
                        onClick={() => handleReject(item._id)}
                        disabled={actioningId === item._id}
                        className="btn-danger"
                      >
                        Confirm Reject
                      </button>
                      <button onClick={() => setRejectingId(null)} className="btn-secondary">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleApprove(item._id)}
                        disabled={actioningId === item._id}
                        className="btn-primary !bg-emerald-600 hover:!bg-emerald-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectingId(item._id)}
                        disabled={actioningId === item._id}
                        className="btn-danger"
                      >
                        Reject
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

export default PendingItems;
