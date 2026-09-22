import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardStats, getDashboardStats } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const cards = stats
    ? [
        { label: "Total Items", value: stats.totalItems, color: "bg-primary-50 text-primary-700" },
        { label: "Pending Items", value: stats.pendingItems, color: "bg-amber-50 text-amber-700" },
        { label: "Approved Items", value: stats.approvedItems, color: "bg-emerald-50 text-emerald-700" },
        { label: "Rejected Items", value: stats.rejectedItems, color: "bg-red-50 text-red-700" },
        { label: "Pending Claims", value: stats.pendingClaims, color: "bg-violet-50 text-violet-700" },
        { label: "Total Users", value: stats.totalUsers, color: "bg-slate-100 text-slate-700" },
      ]
    : [];

  const links = [
    { to: "/admin/pending", label: "Pending Items" },
    { to: "/admin/approved", label: "Approved Items" },
    { to: "/admin/rejected", label: "Rejected Items" },
    { to: "/admin/claims", label: "Claims" },
    { to: "/admin/users", label: "Users" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Overview of platform activity and quick access to moderation tools.</p>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {cards.map((card) => (
            <div key={card.label} className={`card p-5 ${card.color}`}>
              <p className="text-3xl font-bold">{card.value}</p>
              <p className="mt-1 text-sm font-medium">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        {links.map((link) => (
          <Link key={link.to} to={link.to} className="btn-secondary">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
