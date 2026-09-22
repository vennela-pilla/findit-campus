import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Claim } from "../types/Claim";
import { Item } from "../types/Item";
import { getMyClaims } from "../services/claimService";
import { getErrorMessage } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const MyClaims = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyClaims();
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">My Claims</h1>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : claims.length === 0 ? (
        <EmptyState
          title="No claims yet"
          description="Claims you submit on found items will appear here."
          action={
            <Link to="/search" className="btn-primary mt-2">
              Search items
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {claims.map((claim) => {
            const item = claim.item as Item;
            return (
              <div key={claim._id} className="card flex flex-col gap-3 p-5 sm:flex-row">
                <Link to={`/items/${item?._id}`} className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {item?.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                  ) : null}
                </Link>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/items/${item?._id}`} className="font-semibold text-slate-800 hover:underline">
                      {item?.title || "Item"}
                    </Link>
                    <span className={`badge capitalize ${statusStyles[claim.status]}`}>{claim.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{claim.message}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Submitted {new Date(claim.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyClaims;
