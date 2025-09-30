import { Navigate, useLocation } from "react-router-dom";

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (token) {
    const decoded = parseJwt(token);

    // Se token válido → manda pra rota anterior ou home
    if (decoded && decoded.exp * 1000 > Date.now()) {
      const from = location.state?.from?.pathname;
      return <Navigate to={from || "/"} replace />;
    }
  }

  // Caso contrário, continua na rota pública
  return children;
};

export default PublicRoute;
