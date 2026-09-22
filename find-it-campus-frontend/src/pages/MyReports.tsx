import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Item } from "../types/Item";
import { getMyItems } from "../services/itemService";
import { getErrorMessage } from "../services/api";
import ItemCard from "../components/ItemCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";

const MyReports = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyItems();
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">My Reports</h1>
        <div className="flex gap-2">
          <Link to="/dashboard/report-lost" className="btn-secondary !px-3 !py-2 text-xs">
            + Lost
          </Link>
          <Link to="/dashboard/report-found" className="btn-secondary !px-3 !py-2 text-xs">
            + Found
          </Link>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No reports yet"
          description="Once you report a lost or found item, it will show up here."
          action={
            <Link to="/dashboard/report-lost" className="btn-primary mt-2">
              Report an item
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item._id} item={item} showStatus />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReports;
