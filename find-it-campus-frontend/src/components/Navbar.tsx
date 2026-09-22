import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const navLinks = [
    { to: "/search", label: "Search Items" },
    ...(user
      ? [
          { to: "/dashboard", label: "Dashboard" },
          ...(user.role === "admin" ? [{ to: "/admin", label: "Admin" }] : []),
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-primary-700">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
            FC
          </span>
          Find It Campus
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-slate-600 transition hover:text-primary-700"
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">Hi, {user.fullName.split(" ")[0]}</span>
              <button onClick={handleLogout} className="btn-secondary !px-3 !py-1.5 text-xs">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-primary-700">
                Login
              </Link>
              <Link to="/register" className="btn-primary !px-4 !py-2 text-xs">
                Register
              </Link>
            </div>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-slate-600"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <button onClick={handleLogout} className="btn-secondary w-full text-xs">
                Logout
              </button>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary flex-1 text-xs">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary flex-1 text-xs">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
