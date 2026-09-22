import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Item } from "../types/Item";
import { searchItems } from "../services/itemService";
import ItemCard from "../components/ItemCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

const Home = () => {
  const [lostItems, setLostItems] = useState<Item[]>([]);
  const [foundItems, setFoundItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [lost, found] = await Promise.all([
          searchItems({ type: "lost", limit: 4 }),
          searchItems({ type: "found", limit: 4 }),
        ]);
        setLostItems(lost.items);
        setFoundItems(found.items);
      } catch {
        // Home page stays usable even if this fails silently
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const steps = [
    {
      title: "Report",
      description: "Lost something or found an item on campus? Submit a quick report with a photo.",
    },
    {
      title: "Review",
      description: "Our admin team reviews every report to keep the platform accurate and trustworthy.",
    },
    {
      title: "Search",
      description: "Browse approved lost and found listings using search, category, and location filters.",
    },
    {
      title: "Reunite",
      description: "Found your item? Submit a claim and our team will help verify and connect you.",
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-primary-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="badge mb-4 bg-primary-100 text-primary-700">
              Your campus community, reconnecting belongings
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Lost something on campus?
              <span className="block text-primary-600">Find It Campus has your back.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-slate-600">
              A dedicated lost &amp; found platform for students — report items, search verified
              listings, and get reunited with what matters to you.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/dashboard/report-lost" className="btn-primary">
                Report Lost Item
              </Link>
              <Link to="/dashboard/report-found" className="btn-secondary">
                Report Found Item
              </Link>
              <Link to="/search" className="btn-secondary">
                Search Items
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
          <p className="mt-2 text-sm text-slate-500">
            Four simple steps to report, verify, and recover campus belongings.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="card p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold text-slate-800">{step.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recently lost */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Recently reported lost items</h2>
          <Link to="/search?type=lost" className="text-sm font-medium text-primary-600 hover:underline">
            View all
          </Link>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : lostItems.length === 0 ? (
          <EmptyState title="No lost items yet" description="Approved lost item reports will appear here." />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {lostItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Recently found */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Recently reported found items</h2>
          <Link to="/search?type=found" className="text-sm font-medium text-primary-600 hover:underline">
            View all
          </Link>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : foundItems.length === 0 ? (
          <EmptyState title="No found items yet" description="Approved found item reports will appear here." />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {foundItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
