import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Item } from "../types/Item";
import { ITEM_CATEGORIES } from "../types/Item";
import { searchItems } from "../services/itemService";
import { getErrorMessage } from "../services/api";
import ItemCard from "../components/ItemCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";

const SearchItems = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [type, setType] = useState(searchParams.get("type") || "all");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [location, setLocation] = useState(searchParams.get("location") || "");

  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runSearch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await searchItems({ search, type, category, location, limit: 24 });
      setItems(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Re-run search whenever a filter changes; keep the URL in sync so
  // searches are shareable/bookmarkable.
  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (type !== "all") params.type = type;
    if (category !== "all") params.category = category;
    if (location) params.location = location;
    setSearchParams(params, { replace: true });

    const timeout = setTimeout(runSearch, 300); // debounce typing
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, type, category, location]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Search Items</h1>
      <p className="mt-1 text-sm text-slate-500">Browse approved lost and found reports from your campus.</p>

      <div className="card mt-6 grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input
          className="input-field"
          placeholder="Search by item name or description"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input-field" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
        <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {ITEM_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input
          className="input-field"
          placeholder="Filter by location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <p className="mt-4 text-sm text-slate-500">{isLoading ? "Searching..." : `${total} result${total === 1 ? "" : "s"} found`}</p>

      <div className="mt-4">
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} onRetry={runSearch} />
        ) : items.length === 0 ? (
          <EmptyState title="No items found" description="Try adjusting your search or filters." />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchItems;
