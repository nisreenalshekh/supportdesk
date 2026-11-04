import { Navigate, Outlet } from "react-router-dom";
import { useStore } from "../../store/StoreContext";

// Wraps routes that need a signed-in user. Pass agentOnly for IT-only pages.
export default function RequireAuth({ agentOnly }: { agentOnly?: boolean }) {
  const { currentUser, isAgent } = useStore();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (agentOnly && !isAgent) return <Navigate to="/my-tickets" replace />;
  return <Outlet />;
}
