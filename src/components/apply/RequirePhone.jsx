import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getUser } from "../../lib/auth";

const RequirePhone = () => {
  const location = useLocation();
  const user = getUser();
  if (user && !user.phone && location.pathname !== "/profile") {
    return <Navigate to="/profile" replace />;
  }
  return <Outlet />;
};

export default RequirePhone;
