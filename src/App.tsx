import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import RequireAuth from "./components/layout/RequireAuth";
import { ToastProvider } from "./components/ui/Toast";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import TicketDetailPage from "./pages/TicketDetailPage";
import TicketsPage from "./pages/TicketsPage";
import { StoreProvider, useStore } from "./store/StoreContext";

function HomeRedirect() {
  const { currentUser, isAgent } = useStore();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <Navigate to={isAgent ? "/dashboard" : "/my-tickets"} replace />;
}

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<HomeRedirect />} />

            <Route element={<RequireAuth />}>
              <Route element={<AppShell />}>
                <Route element={<RequireAuth agentOnly />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/tickets" element={<TicketsPage />} />
                </Route>
                <Route path="/tickets/:id" element={<TicketDetailPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </StoreProvider>
  );
}
