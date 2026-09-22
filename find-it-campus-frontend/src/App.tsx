import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ReportLost from "./pages/ReportLost";
import ReportFound from "./pages/ReportFound";
import MyReports from "./pages/MyReports";
import MyClaims from "./pages/MyClaims";
import SearchItems from "./pages/SearchItems";
import ItemDetails from "./pages/ItemDetails";

import AdminDashboard from "./pages/admin/AdminDashboard";
import PendingItems from "./pages/admin/PendingItems";
import ApprovedItems from "./pages/admin/ApprovedItems";
import RejectedItems from "./pages/admin/RejectedItems";
import AdminClaims from "./pages/admin/Claims";
import AdminUsers from "./pages/admin/Users";

const NotFound = () => (
  <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
    <h1 className="text-3xl font-bold text-slate-900">404</h1>
    <p className="mt-2 text-slate-500">The page you're looking for doesn't exist.</p>
  </div>
);

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<SearchItems />} />
          <Route path="/items/:id" element={<ItemDetails />} />

          {/* Student-protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/report-lost" element={<ReportLost />} />
            <Route path="/dashboard/report-found" element={<ReportFound />} />
            <Route path="/dashboard/my-reports" element={<MyReports />} />
            <Route path="/dashboard/my-claims" element={<MyClaims />} />
          </Route>

          {/* Admin-protected routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/pending" element={<PendingItems />} />
            <Route path="/admin/approved" element={<ApprovedItems />} />
            <Route path="/admin/rejected" element={<RejectedItems />} />
            <Route path="/admin/claims" element={<AdminClaims />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
