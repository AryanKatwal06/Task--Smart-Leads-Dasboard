import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import { ThemeProvider } from './providers/ThemeProvider';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegisterConfirmPage from './pages/RegisterConfirmPage';
import ProtectedRoute from './components/ProtectedRoute';
import RequireRole from './components/RequireRole';
import AdminPage from './pages/AdminPage';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';

const LeadsPage = lazy(() => import('./pages/LeadsPage'));
const LeadDetailsPage = lazy(() => import('./pages/LeadDetailsPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));

const queryClient = new QueryClient();
import { Surface } from './components/ui';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/confirm" element={<RegisterConfirmPage />} />
          <Route path="/dashboard" element={<MainLayout />}>
            <Route
              index
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="/leads" element={<MainLayout />}>
            <Route
              index
              element={
                <ProtectedRoute>
                  <Suspense fallback={<RouteFallback label="Loading leads..." />}>
                    <LeadsPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path=":leadId"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<RouteFallback label="Loading lead details..." />}>
                    <LeadDetailsPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="/analytics" element={<MainLayout />}>
            <Route
              index
              element={
                <ProtectedRoute>
                  <Suspense fallback={<RouteFallback label="Loading analytics..." />}>
                    <AnalyticsPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/admin"
            element={
              <RequireRole allowedRoles={['admin']}>
                <MainLayout />
              </RequireRole>
            }
          >
            <Route
              index
              element={
                <RequireRole allowedRoles={['admin']}>
                  <AdminPage />
                </RequireRole>
              }
            />
          </Route>
        </Routes>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function RouteFallback({ label }: { label: string }) {
  return (
    <div className="mx-auto mt-8 max-w-6xl space-y-6 px-4">
      <div className="animate-pulse">
        <div className="h-6 w-48 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-3 h-8 w-72 rounded bg-slate-200 dark:bg-slate-700" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="metric-card relative overflow-hidden p-4">
            <div className="h-6 w-28 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="mt-3 h-8 w-20 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
          </div>
        ))}
      </div>

      <div className="surface overflow-hidden">
        <div className="p-4">
          <div className="h-6 w-40 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
        </div>
        <div className="p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="mb-3 h-12 w-full rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
