import { useEffect, useState } from "react";
import { Item, ReportedBy } from "../../types/Item";
import { getApprovedItems } from "../../services/adminService";
import { deleteItem } from "../../services/itemService";
import { getErrorMessage } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import EmptyState from "../../components/EmptyState";

const ApprovedItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getApprovedItems();
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

  const handleRemove = async (id: string) => {
    if (!confirm("Remove this item listing? This cannot be undone.")) return;
    setRemovingId(id);
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Approved Items</h1>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState title="No approved items found" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Reported By</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => {
                const reporter = item.reportedBy as ReportedBy;
                return (
                  <tr key={item._id}>
                    <td className="px-4 py-3 font-medium text-slate-800">{item.title}</td>
                    <td className="px-4 py-3 capitalize text-slate-500">{item.type}</td>
                    <td className="px-4 py-3 text-slate-500">{reporter?.fullName}</td>
                    <td className="px-4 py-3">
                      <span className="badge bg-emerald-100 capitalize text-emerald-700">{item.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleRemove(item._id)}
                        disabled={removingId === item._id}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApprovedItems;
