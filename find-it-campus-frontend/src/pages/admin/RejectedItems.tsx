import { useEffect, useState } from "react";
import { Item, ReportedBy } from "../../types/Item";
import { getRejectedItems } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import EmptyState from "../../components/EmptyState";

const RejectedItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getRejectedItems();
        setItems(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Rejected Items</h1>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : items.length === 0 ? (
        <EmptyState title="No rejected items" description="Rejected reports will show up here for reference." />
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => {
            const reporter = item.reportedBy as ReportedBy;
            return (
              <div key={item._id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-400">
                      Reported by {reporter?.fullName} &middot; {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="badge bg-red-100 text-red-700">Rejected</span>
                </div>
                {item.rejectionReason && (
                  <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    Reason: {item.rejectionReason}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RejectedItems;
