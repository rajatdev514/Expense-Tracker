import { Navigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // Already handled by AuthProvider spinner

  return user ? children : <Navigate to="/" />;
};

export default PrivateRoute;
