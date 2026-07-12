import { Navigate, Outlet } from "react-router-dom";
import { isAuthed } from "../../lib/auth";

const RequireAuth = () => (isAuthed() ? <Outlet /> : <Navigate to="/login" replace />);

export default RequireAuth;
