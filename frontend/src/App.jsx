import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/index";
import Create from "./pages/create";
import Edit from "./pages/edit";
import Login from "./pages/login";
import Users from "./pages/users";
import Analisis from "./pages/analisis";

function App() {
  const isAuthenticated = () => {
    return localStorage.getItem("user") !== null;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Si entran a la raíz, les mostramos el Login */}
        <Route
          path="/"
          element={!isAuthenticated() ? <Login /> : <Navigate to="/index" />}
        />

        {/* Protegemos las demás rutas */}
        <Route
          path="/index"
          element={isAuthenticated() ? <Index /> : <Navigate to="/" />}
        />
        <Route
          path="/create"
          element={isAuthenticated() ? <Create /> : <Navigate to="/" />}
        />
        <Route
          path="/edit/:id"
          element={isAuthenticated() ? <Edit /> : <Navigate to="/" />}
        />
        <Route
          path="/users"
          element={isAuthenticated() ? <Users /> : <Navigate to="/" />}
        />
        <Route
          path="/analisis"
          element={isAuthenticated() ? <Analisis /> : <Navigate to="/" />}
        />

        {/* Cualquier otra ruta loca manda al inicio */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
