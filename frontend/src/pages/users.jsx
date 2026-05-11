import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import clienteAxios from "../api/axios";
import useAuth from "../hooks/useAuth";
import {
  Users as UsersIcon,
  PlusCircle,
  Edit3,
  Trash2,
  Search,
  LogOut,
  Sun,
  Moon,
  ArrowLeft,
  RefreshCw,
  Shield,
  User,
} from "lucide-react";

export default function Users() {
  const navigate = useNavigate();
  const { esAdministrador, logout } = useAuth();
  const [userList, setUserList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "tecnico",
  });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!esAdministrador) {
      alert("No tienes permiso para acceder.");
      navigate("/index");
    } else {
      cargarDatos();
    }
  }, [esAdministrador, navigate]);

  const cargarDatos = async () => {
    try {
      const res = await clienteAxios.get("/users");
      setUserList(res.data.users);
      setRoles(res.data.roles);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const usersFiltrados = userList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const abrirModal = (tipo, usuario = null) => {
    setModal(tipo);
    if (usuario) {
      setEditId(usuario.id);
      setFormData({
        name: usuario.name,
        email: usuario.email,
        password: "",
        role: usuario.roles?.[0]?.name || "tecnico",
      });
    } else {
      setEditId(null);
      setFormData({ name: "", email: "", password: "", role: "tecnico" });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === "create") {
        await clienteAxios.post("/users", formData);
      } else {
        await clienteAxios.put("/users/" + editId, formData);
      }
      setModal(null);
      cargarDatos();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;
    try {
      await clienteAxios.delete("/users/" + id);
      cargarDatos();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const theme = {
    bg: darkMode ? "bg-[#0F172A]" : "bg-[#F1F5F9]",
    card: darkMode ? "bg-[#1E293B] border-[#334155]" : "bg-white border-slate-200",
    textMain: darkMode ? "text-slate-100" : "text-slate-800",
    tableHead: darkMode ? "bg-[#161E2E]" : "bg-slate-100",
    input: darkMode
      ? "bg-[#0F172A] border-[#334155] text-white"
      : "bg-white border-slate-200 text-slate-800",
    nav: darkMode
      ? "bg-[#1E293B] border-emerald-500/30"
      : "bg-[#064E3B] border-emerald-900",
  };

  if (loading) {
    return (
      <div className={`${theme.bg} min-h-screen flex items-center justify-center`}>
        <RefreshCw className="animate-spin text-emerald-500 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className={`${theme.bg} ${theme.textMain} min-h-screen transition-colors duration-300 font-sans`}>
      <nav className={`${theme.nav} border-b-4 sticky top-0 z-50 shadow-xl`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-12">
            <img
              src="https://www.genli.com.co/assets/images/logo.svg"
              className="h-14 w-auto brightness-0 invert"
              alt="Genli Logo"
            />
            <div className="hidden md:flex gap-8 text-[12px] font-black uppercase tracking-tighter">
              <Link
                to="/index"
                className="text-emerald-50/70 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <span className="text-white border-b-2 border-emerald-400 pb-1">
                Usuarios
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-black/20 text-emerald-100 hover:bg-black/40 transition-all"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 ml-2 px-3 py-2 text-emerald-100 hover:text-white hover:bg-red-600/20 rounded-md transition-all text-xs font-bold uppercase"
            >
              <LogOut size={16} /> Salir
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-900/20">
              <UsersIcon className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter">
                Gestión de Usuarios
              </h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
                Administrador del Sistema
              </p>
            </div>
          </div>
          <button
            onClick={() => abrirModal("create")}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
          >
            <PlusCircle size={16} /> Nuevo Usuario
          </button>
        </div>

        <div className={`${theme.card} border p-6 rounded-md mb-8 shadow-md`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="BUSCAR USUARIOS..."
              className={`w-full pl-10 pr-4 py-2.5 rounded border text-[11px] font-bold uppercase tracking-wider outline-none ${theme.input} focus:border-emerald-500`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className={`${theme.card} border rounded-md overflow-hidden shadow-2xl`}>
          <table className="w-full text-left">
            <thead>
              <tr className={`${theme.tableHead} border-b font-bold text-[10px] uppercase text-slate-500 tracking-[0.15em]`}>
                <th className="px-8 py-5">Usuario</th>
                <th className="px-8 py-5">Correo</th>
                <th className="px-8 py-5">Rol</th>
                <th className="px-8 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/10">
              {usersFiltrados.map((u) => (
                <tr
                  key={u.id}
                  className={`${
                    darkMode ? "hover:bg-slate-800" : "hover:bg-slate-50"
                  } transition-all`}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-200 rounded-full">
                        <User size={16} className="text-slate-600" />
                      </div>
                      <span className="text-sm font-bold">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm">{u.email}</td>
                  <td className="px-8 py-6">
                    <span
                      className={`text-[9px] font-black px-3 py-1 border rounded ${
                        u.roles?.[0]?.name === "administrador"
                          ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                          : u.roles?.[0]?.name === "gerente"
                          ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                          : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      }`}
                    >
                      {u.roles?.[0]?.name?.toUpperCase() || "SIN ROL"}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right flex justify-end gap-3">
                    <button
                      onClick={() => abrirModal("edit", u)}
                      className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-md transition-all"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => eliminarUsuario(u.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`${theme.card} border p-10 rounded-md shadow-2xl w-full max-w-md`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase">
                {modal === "create" ? "Nuevo Usuario" : "Editar Usuario"}
              </h3>
              <button
                onClick={() => setModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <ArrowLeft size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-sm border text-xs font-bold outline-none ${theme.input}`}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                  Correo
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-sm border text-xs font-bold outline-none ${theme.input}`}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                  Contraseña {modal === "edit" && "(opcional)"}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-sm border text-xs font-bold outline-none ${theme.input}`}
                  placeholder={modal === "create" ? "Mínimo 8 caracteres" : "••••••••"}
                  required={modal === "create"}
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                  Rol
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-sm border text-xs font-bold outline-none ${theme.input}`}
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className={`w-full py-4 rounded-sm font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 ${
                  saving
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                }`}
              >
                {saving ? (
                  <RefreshCw className="animate-spin w-4 h-4" />
                ) : (
                  <Shield size={16} />
                )}
                {modal === "create" ? "Crear Usuario" : "Guardar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}