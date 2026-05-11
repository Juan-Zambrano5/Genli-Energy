import { useMemo } from "react";

const ROLE_HIERARCHY = {
  administrador: ['administrador', 'gerente', 'tecnico'],
  gerente: ['gerente', 'tecnico'],
  tecnico: ['tecnico'],
};

export function useAuth() {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const userRole = user.roles?.[0] || 'tecnico';

  const permissions = useMemo(() => ({
    puedeAnalizar: userRole === 'administrador' || userRole === 'gerente',
    puedeCrear: true,
    puedeEditar: userRole === 'administrador' || userRole === 'gerente',
    puedeEliminar: userRole === 'administrador',
    esAdministrador: userRole === 'administrador',
    esGerente: userRole === 'gerente',
    esTecnico: userRole === 'tecnico',
  }), [userRole]);

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return {
    user,
    userRole,
    ...permissions,
    logout,
  };
}

export default useAuth;