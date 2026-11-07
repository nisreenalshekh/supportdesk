import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import RequireAuth from "./components/layout/RequireAuth";
import { ToastProvider } from "./components/ui/Toast";
import ArticlePage from "./pages/ArticlePage";
import BoardPage from "./pages/BoardPage";
import DashboardPage from "./pages/DashboardPage";
import EmployeesPage from "./pages/EmployeesPage";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";
import LoginPage from "./pages/LoginPage";
import MyTicketsPage from "./pages/MyTicketsPage";
import NewTicketPage from "./pages/NewTicketPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import TicketDetailPage from "./pages/TicketDetailPage";
import TicketsPage from "./pages/TicketsPage";
import TicketSubmittedPage from "./pages/TicketSubmittedPage";
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
                  <Route path="/board" element={<BoardPage />} />
                  <Route path="/employees" element={<EmployeesPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
                <Route path="/my-tickets" element={<MyTicketsPage />} />
                <Route path="/tickets/new" element={<NewTicketPage />} />
                <Route path="/tickets/submitted/:id" element={<TicketSubmittedPage />} />
                <Route path="/tickets/:id" element={<TicketDetailPage />} />
                <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
                <Route path="/knowledge-base/:slug" element={<ArticlePage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </StoreProvider>
  );
}
