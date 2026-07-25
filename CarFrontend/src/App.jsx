import React from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import { useVaultStore } from "./store/vaultStore";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Records from "./pages/Records";
import Ingest from "./pages/Ingest";
import ManualEntry from "./pages/ManualEntry";
import AuditHistory from "./pages/AuditHistory";

import DashboardLayout from "./Dashboardlayout";

function ProtectedRoute() {
  const { isAuthenticated } = useVaultStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function MobilizerRoute() {
  const { user } = useVaultStore();

  if (user?.role !== "Mobilizer") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

function AdminRoute() {
  const { user } = useVaultStore();

  const allowedRoles = [
    "Super Admin",
    "Operation Head",
    "Project Head",
  ];

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/mobilizer-form" replace />;
  }

  return <Outlet />;
}

export default function App() {
  const { isAuthenticated, user } = useVaultStore();
  const role = user?.role;

  return (
    <Routes>
      {/* ---------------- PUBLIC ---------------- */}

      <Route
        path="/login"
        element={
          isAuthenticated ? (
            user?.role === "Mobilizer" ? (
              <Navigate to="/mobilizer-form" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          ) : (
            <Login />
          )
        }
      />

      {/* ---------------- PROTECTED ---------------- */}

      <Route element={<ProtectedRoute />}>

        {/* ---------- Mobilizer ---------- */}

        <Route element={<MobilizerRoute />}>
          <Route
            path="/mobilizer-form"
            element={<ManualEntry />}
          />
        </Route>

        {/* ---------- Admin Layout ---------- */}

        <Route element={<AdminRoute />}>
          <Route element={<DashboardLayout />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/records"
              element={<Records />}
            />

            <Route
              path="/ingest"
              element={<Ingest isProjectHead = {role === 'Super Admin' ? true : false} />}
            />

            <Route
              path="/history"
              element={<AuditHistory />}
            />
          </Route>
        </Route>
      </Route>

      {/* ---------------- DEFAULT ---------------- */}

      <Route
        path="/"
        element={
          <Navigate
            to={
              !isAuthenticated
                ? "/login"
                : user?.role === "Mobilizer"
                ? "/mobilizer-form"
                : "/dashboard"
            }
            replace
          />
        }
      />

      {/* ---------------- UNKNOWN ---------------- */}

      <Route
        path="*"
        element={
          <Navigate
            to={
              !isAuthenticated
                ? "/login"
                : user?.role === "Mobilizer"
                ? "/mobilizer-form"
                : "/dashboard"
            }
            replace
          />
        }
      />
    </Routes>
  );
}