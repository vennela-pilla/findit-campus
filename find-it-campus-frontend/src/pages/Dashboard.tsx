import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyItems } from "../services/itemService";
import { getMyClaims } from "../services/claimService";
import { getErrorMessage } from "../services/api";
import { Item } from "../types/Item";
import { Claim } from "../types/Claim";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

const statusBadgeStyles: Record<string, { bg: string; text: string; dot: string }> = {
  pending: {
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  approved: {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  rejected: {
    bg: "bg-red-50 text-red-700 border-red-200",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  claimed: {
    bg: "bg-purple-50 text-purple-700 border-purple-200",
    text: "text-purple-700",
    dot: "bg-purple-500",
  },
};

// Realistic sample campus data for development preview when backend is offline
const samplePreviewItems: Item[] = [
  {
    _id: "demo-item-1",
    title: "MacBook Pro 14-inch (Space Gray)",
    description: "Left in a padded sleeve on the 2nd floor silent study area near desk #14.",
    category: "Electronics",
    type: "lost",
    location: "Main Library, 2nd Floor",
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: "pending",
    reportedBy: "dev-preview-student",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    _id: "demo-item-2",
    title: "Campus Student ID & Keycard (Alex R.)",
    description: "Student ID lanyard with dorm room key and meal plan card.",
    category: "Documents",
    type: "lost",
    location: "Campus Dining Hall",
    date: new Date(Date.now() - 86400000 * 4).toISOString(),
    status: "approved",
    reportedBy: "dev-preview-student",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    _id: "demo-item-3",
    title: "Hydro Flask 32oz Wide Mouth (Pacific Blue)",
    description: "Stainless steel water bottle with university science club stickers.",
    category: "Accessories",
    type: "found",
    location: "Science Complex Rm 204",
    date: new Date(Date.now() - 86400000 * 6).toISOString(),
    status: "claimed",
    reportedBy: "dev-preview-student",
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

const samplePreviewClaims: Claim[] = [
  {
    _id: "demo-claim-1",
    item: {
      _id: "demo-claim-item-1",
      title: "TI-84 Plus CE Graphing Calculator",
      description: "Black graphing calculator found in lecture hall.",
      category: "Electronics",
      type: "found",
      location: "Mathematics Hall 101",
      date: new Date(Date.now() - 86400000 * 1).toISOString(),
      status: "approved",
      reportedBy: "campus-finder",
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    claimant: "dev-preview-student",
    message: "Left it on row 3 desk during Math 101 exam review. My initials 'AR' are etched on the battery door.",
    status: "pending",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    claimsSubmitted: 0,
  });
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [recentClaims, setRecentClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    setIsPreviewMode(false);
    try {
      const [items, claims] = await Promise.all([getMyItems(), getMyClaims()]);
      setStats({
        total: items.length,
        pending: items.filter((i) => i.status === "pending").length,
        approved: items.filter((i) => i.status === "approved" || i.status === "claimed").length,
        claimsSubmitted: claims.length,
      });
      setRecentItems(items.slice(0, 3));
      setRecentClaims(claims.slice(0, 3));
    } catch (err) {
      // Real API failed (e.g. backend offline without .env): safely activate Development Preview Mode
      setIsPreviewMode(true);
      setStats({
        total: samplePreviewItems.length,
        pending: samplePreviewItems.filter((i) => i.status === "pending").length,
        approved: samplePreviewItems.filter((i) => i.status === "approved" || i.status === "claimed").length,
        claimsSubmitted: samplePreviewClaims.length,
      });
      setRecentItems(samplePreviewItems);
      setRecentClaims(samplePreviewClaims);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const firstName = user?.fullName ? user.fullName.split(" ")[0] : "Student";
  const userInitials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  // Statistics cards with color accents, SVGs, and direct drilldown links
  const statCards = [
    {
      label: "Total Reports",
      subtitle: "Lifetime submissions",
      value: stats.total,
      to: "/dashboard/my-reports",
      badgeText: "View all",
      borderHover: "hover:border-blue-300",
      accentBg: "bg-blue-50 text-blue-700",
      iconBg: "bg-blue-100 text-blue-600",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      label: "Pending Reports",
      subtitle: "Under review by admin",
      value: stats.pending,
      to: "/dashboard/my-reports",
      badgeText: "Awaiting approval",
      borderHover: "hover:border-amber-300",
      accentBg: "bg-amber-50 text-amber-700",
      iconBg: "bg-amber-100 text-amber-600",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: "Approved Reports",
      subtitle: "Published & active",
      value: stats.approved,
      to: "/dashboard/my-reports",
      badgeText: "Public on board",
      borderHover: "hover:border-emerald-300",
      accentBg: "bg-emerald-50 text-emerald-700",
      iconBg: "bg-emerald-100 text-emerald-600",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    },
    {
      label: "Claims Submitted",
      subtitle: "Ownership requests",
      value: stats.claimsSubmitted,
      to: "/dashboard/my-claims",
      badgeText: "Track progress",
      borderHover: "hover:border-indigo-300",
      accentBg: "bg-indigo-50 text-indigo-700",
      iconBg: "bg-indigo-100 text-indigo-600",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          />
        </svg>
      ),
    },
  ];

  // Quick action cards
  const quickActions = [
    {
      to: "/dashboard/report-lost",
      title: "Report Lost Item",
      desc: "Misplaced something on campus? Submit details so finders can recognize it.",
      badge: "Lost Something?",
      badgeColor: "bg-rose-100 text-rose-700",
      iconBg: "bg-rose-500 text-white",
      hoverBg: "hover:border-rose-300 hover:shadow-rose-100/50",
      actionText: "Report lost item",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
          />
        </svg>
      ),
    },
    {
      to: "/dashboard/report-found",
      title: "Report Found Item",
      desc: "Discovered unattended property? Post it here to return it safely to its owner.",
      badge: "Found an Item?",
      badgeColor: "bg-emerald-100 text-emerald-700",
      iconBg: "bg-emerald-500 text-white",
      hoverBg: "hover:border-emerald-300 hover:shadow-emerald-100/50",
      actionText: "Report found item",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
    },
    {
      to: "/dashboard/my-reports",
      title: "My Reports",
      desc: "Check verification status, edit details, or manage items you've submitted.",
      badge: `${stats.total} Total`,
      badgeColor: "bg-primary-100 text-primary-700",
      iconBg: "bg-primary-600 text-white",
      hoverBg: "hover:border-primary-300 hover:shadow-blue-100/50",
      actionText: "View reports",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
    {
      to: "/dashboard/my-claims",
      title: "My Claims",
      desc: "Monitor ownership claims you submitted on found campus listings.",
      badge: `${stats.claimsSubmitted} Submitted`,
      badgeColor: "bg-indigo-100 text-indigo-700",
      iconBg: "bg-indigo-600 text-white",
      hoverBg: "hover:border-indigo-300 hover:shadow-indigo-100/50",
      actionText: "View claims",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Development Preview Mode Indicator */}
      {isPreviewMode && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/95 p-4 text-sm text-amber-900 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900 text-xs font-bold">
              ⚡
            </span>
            <div>
              <p className="font-bold text-xs sm:text-sm text-amber-950">
                Development Preview Mode
                <span className="ml-2 font-medium text-amber-700">• Backend API offline</span>
              </p>
              <p className="mt-0.5 text-xs text-amber-700">
                Displaying realistic sample campus reports &amp; claims for visual UI verification. Real API data will load automatically as soon as your team's backend is running.
              </p>
            </div>
          </div>
          <button
            onClick={loadDashboardData}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-xs hover:bg-amber-100 transition whitespace-nowrap self-start sm:self-center"
          >
            <svg
              className={`h-3.5 w-3.5 text-amber-700 ${isLoading ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Retry Real API
          </button>
        </div>
      )}

      {/* Welcome & Profile Header Section */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-primary-50/40 p-6 shadow-sm transition-all sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4 sm:gap-5">
            {/* Student Initials Avatar */}
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary-700 via-primary-600 to-blue-500 text-xl font-bold text-white shadow-md shadow-primary-500/20 ring-4 ring-white">
              {userInitials}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Welcome back, {firstName}
                </h1>
                <span className="badge border border-primary-200 bg-primary-100 text-primary-800 capitalize font-medium">
                  {user?.role || "Student"}
                </span>
                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition"
                  >
                    Admin Panel
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>

              <p className="mt-1.5 text-sm text-slate-600 sm:text-base">
                Find It Campus Portal • Centralized lost &amp; found hub for our university community.
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {user?.email}
                </span>
                <span className="hidden sm:inline text-slate-300">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {new Date().toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 lg:flex-nowrap">
            <Link
              to="/dashboard/report-lost"
              className="btn-danger !bg-rose-600 hover:!bg-rose-700 shadow-sm transition hover:shadow !px-4 !py-2.5 text-sm font-semibold"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Report Lost
            </Link>
            <Link
              to="/dashboard/report-found"
              className="btn-primary !bg-emerald-600 hover:!bg-emerald-700 shadow-sm transition hover:shadow !px-4 !py-2.5 text-sm font-semibold"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Report Found
            </Link>
            <Link
              to="/search"
              className="btn-secondary !px-4 !py-2.5 text-sm font-semibold hover:border-slate-400"
            >
              <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Browse Items
            </Link>
          </div>
        </div>
      </section>

      {/* Error state display */}
      {error && (
        <div className="mt-6">
          <ErrorMessage message={error} onRetry={loadDashboardData} />
        </div>
      )}

      {/* Statistics Cards Section */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Activity Overview</h2>
            <p className="text-xs text-slate-500">Live statistics across your campus reports and claims</p>
          </div>
          <button
            onClick={loadDashboardData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-xs hover:bg-slate-50 disabled:opacity-60 transition"
            title="Refresh statistics"
          >
            <svg
              className={`h-3.5 w-3.5 text-slate-500 ${isLoading ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <Link
                key={card.label}
                to={card.to}
                className={`card group relative flex flex-col justify-between overflow-hidden p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${card.borderHover}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {card.label}
                    </span>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl transition duration-200 group-hover:scale-110 ${card.iconBg}`}
                    >
                      {card.icon}
                    </div>
                  </div>

                  <div className="mt-3 flex items-baseline gap-2">
                    <p className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                      {card.value}
                    </p>
                    <span className="text-xs font-medium text-slate-400">items</span>
                  </div>

                  <p className="mt-1 text-xs text-slate-500">{card.subtitle}</p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-medium text-slate-600 transition group-hover:text-primary-600">
                  <span>{card.badgeText}</span>
                  <svg
                    className="h-3.5 w-3.5 transition group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Quick Actions Grid */}
      <section className="mt-10">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
          <p className="text-xs text-slate-500">Choose an action to get started immediately</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className={`card group relative flex flex-col justify-between p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${action.hoverBg}`}
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-xs transition duration-200 group-hover:scale-105 ${action.iconBg}`}
                  >
                    {action.icon}
                  </div>
                  <span className={`badge text-xs font-semibold ${action.badgeColor}`}>
                    {action.badge}
                  </span>
                </div>

                <h3 className="mt-4 text-base font-bold text-slate-900 transition group-hover:text-primary-700">
                  {action.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{action.desc}</p>
              </div>

              <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-primary-600 transition group-hover:text-primary-700">
                <span>{action.actionText}</span>
                <svg
                  className="h-4 w-4 transition duration-200 group-hover:translate-x-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Real API Data: Recent Reports & Claims Section */}
      <section className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Reports Panel */}
        <div className="card flex flex-col justify-between overflow-hidden p-6">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">My Recent Reports</h3>
                  <p className="text-xs text-slate-500">Items you recently posted on the portal</p>
                </div>
              </div>
              <Link
                to="/dashboard/my-reports"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline"
              >
                View all ({stats.total})
              </Link>
            </div>

            <div className="mt-4">
              {isLoading ? (
                <div className="py-8">
                  <LoadingSpinner />
                </div>
              ) : recentItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-8 px-4 text-center">
                  <svg className="h-9 w-9 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p className="mt-2 text-sm font-semibold text-slate-700">No reports submitted yet</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Submit your first lost or found report to get started.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Link to="/dashboard/report-lost" className="btn-primary !px-3 !py-1.5 text-xs">
                      + Report Item
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentItems.map((item) => {
                    const badge = statusBadgeStyles[item.status] || {
                      bg: "bg-slate-100 text-slate-700",
                      text: "text-slate-700",
                      dot: "bg-slate-400",
                    };
                    return (
                      <Link
                        key={item._id}
                        to={`/items/${item._id}`}
                        className="group flex items-center justify-between py-3.5 transition hover:bg-slate-50/80 rounded-lg px-2"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200/80">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-400 text-xs font-semibold">
                                {item.type === "lost" ? "LOST" : "FND"}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`badge !py-0.5 !px-1.5 text-[10px] font-semibold uppercase ${
                                  item.type === "lost"
                                    ? "bg-rose-50 text-rose-600 border border-rose-200"
                                    : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                }`}
                              >
                                {item.type}
                              </span>
                              <p className="truncate font-semibold text-slate-800 text-sm group-hover:text-primary-600">
                                {item.title}
                              </p>
                            </div>
                            <p className="mt-0.5 truncate text-xs text-slate-400">
                              {item.location} • {new Date(item.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${badge.bg}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`}></span>
                            {item.status}
                          </span>
                          <svg
                            className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3">
            <Link
              to="/dashboard/my-reports"
              className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              <span>Manage all your reports</span>
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Recent Claims Panel */}
        <div className="card flex flex-col justify-between overflow-hidden p-6">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">My Recent Claims</h3>
                  <p className="text-xs text-slate-500">Ownership claims filed on found listings</p>
                </div>
              </div>
              <Link
                to="/dashboard/my-claims"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline"
              >
                View all ({stats.claimsSubmitted})
              </Link>
            </div>

            <div className="mt-4">
              {isLoading ? (
                <div className="py-8">
                  <LoadingSpinner />
                </div>
              ) : recentClaims.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-8 px-4 text-center">
                  <svg className="h-9 w-9 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="mt-2 text-sm font-semibold text-slate-700">No claims submitted yet</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Recognize an item on the public board? Submit a claim to recover it.
                  </p>
                  <div className="mt-3">
                    <Link to="/search" className="btn-secondary !px-3 !py-1.5 text-xs">
                      Search Public Listings
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentClaims.map((claim) => {
                    const item = typeof claim.item === "object" && claim.item !== null ? (claim.item as Item) : null;
                    const badge = statusBadgeStyles[claim.status] || {
                      bg: "bg-slate-100 text-slate-700",
                      text: "text-slate-700",
                      dot: "bg-slate-400",
                    };
                    return (
                      <div
                        key={claim._id}
                        className="group flex items-start justify-between py-3.5 transition hover:bg-slate-50/80 rounded-lg px-2"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500">
                            {item?.imageUrl ? (
                              <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                            ) : (
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="min-w-0">
                            {item?._id ? (
                              <Link
                                to={`/items/${item._id}`}
                                className="font-semibold text-slate-800 text-sm hover:underline hover:text-primary-600 block truncate"
                              >
                                {item.title}
                              </Link>
                            ) : (
                              <p className="font-semibold text-slate-800 text-sm">Campus Item</p>
                            )}
                            <p className="line-clamp-1 mt-0.5 text-xs text-slate-500">
                              "{claim.message}"
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">
                              Claimed on {new Date(claim.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${badge.bg}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`}></span>
                            {claim.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3">
            <Link
              to="/dashboard/my-claims"
              className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              <span>Track all claim statuses</span>
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Campus Lost & Found Guidelines Card */}
      <section className="mt-10">
        <div className="card overflow-hidden border border-blue-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white p-6 sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-primary-800 mb-3">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Campus Lost &amp; Found Assistance
              </div>
              <h3 className="text-lg font-bold text-slate-900">How verification works on campus</h3>
              <p className="mt-1 text-sm text-slate-600">
                To keep our campus safe and prevent fraudulent claims, all reported items are verified by campus
                administrators before being marked as claimed. For physical handovers, please visit the Campus Security
                Desk.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                    1
                  </div>
                  <span>Accurate descriptions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                    2
                  </div>
                  <span>Admin review &amp; match</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                    3
                  </div>
                  <span>Safe campus handover</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 flex-shrink-0">
              <Link
                to="/search"
                className="btn-primary !py-2.5 !px-4 text-xs font-semibold text-center whitespace-nowrap shadow-xs"
              >
                Search Campus Items
              </Link>
              <a
                href="#campus-support"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Campus Safety Office: Student Center Rm 102 • Open Mon-Fri 8:00 AM - 5:00 PM • Extension 4400");
                }}
                className="btn-secondary !py-2.5 !px-4 text-xs font-semibold text-center whitespace-nowrap"
              >
                Campus Desk Info
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

