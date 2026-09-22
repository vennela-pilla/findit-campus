import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyItems } from "../services/itemService";
import { getMyClaims } from "../services/claimService";
import LoadingSpinner from "../components/LoadingSpinner";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    claimsSubmitted: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [items, claims] = await Promise.all([getMyItems(), getMyClaims()]);
        setStats({
          total: items.length,
          pending: items.filter((i) => i.status === "pending").length,
          approved: items.filter((i) => i.status === "approved" || i.status === "claimed").length,
          claimsSubmitted: claims.length,
        });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const summaryCards = [
    { label: "Total Reports", value: stats.total, color: "bg-primary-50 text-primary-700" },
    { label: "Pending Reports", value: stats.pending, color: "bg-amber-50 text-amber-700" },
    { label: "Approved Reports", value: stats.approved, color: "bg-emerald-50 text-emerald-700" },
    { label: "Claims Submitted", value: stats.claimsSubmitted, color: "bg-slate-100 text-slate-700" },
  ];

  const quickActions = [
    { to: "/dashboard/report-lost", label: "Report Lost Item", desc: "Lost something? Let the community help." },
    { to: "/dashboard/report-found", label: "Report Found Item", desc: "Found something? Report it here." },
    { to: "/dashboard/my-reports", label: "My Reports", desc: "Track the status of everything you've reported." },
    { to: "/dashboard/my-claims", label: "My Claims", desc: "See how your submitted claims are progressing." },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.fullName.split(" ")[0]}</h1>
      <p className="mt-1 text-sm text-slate-500">Here's an overview of your Find It Campus activity.</p>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <div key={card.label} className={`card p-5 ${card.color}`}>
              <p className="text-3xl font-bold">{card.value}</p>
              <p className="mt-1 text-sm font-medium">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="mb-4 mt-10 text-lg font-bold text-slate-900">Quick Actions</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {quickActions.map((action) => (
          <Link key={action.to} to={action.to} className="card group flex items-center justify-between p-5">
            <div>
              <p className="font-semibold text-slate-800">{action.label}</p>
              <p className="mt-0.5 text-sm text-slate-500">{action.desc}</p>
            </div>
            <svg
              className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
