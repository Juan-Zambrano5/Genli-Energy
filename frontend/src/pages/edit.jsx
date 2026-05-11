import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import clienteAxios from "../api/axios";
import useAuth from "../hooks/useAuth";
import {
  Edit3,
  MapPin,
  Activity,
  Layers,
  X,
  Save,
  Sun,
  Moon,
  LogOut,
  RefreshCw,
} from "lucide-react";

export default function Edit() {
  const navigate = useNavigate();
  const { userRole, puedeEditar, logout } = useAuth();
  const { id } = useParams();
  const [barrios, setBarrios] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [formData, setFormData] = useState({
    barrio: "",
    energiaS: "",
    pEnergia: "",
    usuario: "Administrador",
    tipo: "Tecnica",
    observaciones: "",
  });

  useEffect(() => {
    const cargarBarrios = async () => {
      try {
        const res = await clienteAxios.get("/barrios");
        setBarrios(res.data);
      } catch (error) {
        console.error("Error al obtener barrios:", error);
      }
    };
    cargarBarrios();

    if (!puedeEditar) {
      alert("No tienes permiso para editar registros.");
      navigate("/index");
      return;
    }

    const obtenerRegistro = async () => {
      try {
        const res = await clienteAxios.get(`/registros/${id}`);
        setFormData({
          barrio: res.data.barrio,
          energiaS: Math.round(parseFloat(res.data.energiaS) * 100) / 100,
          usuario: res.data.usuario,
          rol: res.data.rol,
          pEnergia: Math.round(parseFloat(res.data.pEnergia) * 100) / 100,
          tipo: res.data.tipo,
          observaciones: res.data.observaciones || "",
        });
      } catch (error) {
        console.error("Error al cargar el registro:", error);
        navigate("/index");
      } finally {
        setLoading(false);
      }
    };
    obtenerRegistro();
  }, [id, navigate, puedeEditar]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await clienteAxios.put(`/registros/${id}`, formData);
      navigate("/index");
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("Error al actualizar el registro.");
    } finally {
      setUpdating(false);
    }
  };

  const theme = {
    bg: darkMode ? "bg-[#0F172A]" : "bg-[#F1F5F9]",
    card: darkMode
      ? "bg-[#1E293B] border-[#334155]"
      : "bg-white border-slate-200",
    textMain: darkMode ? "text-slate-100" : "text-slate-800",
    input: darkMode
      ? "bg-[#0F172A] border-[#334155] text-white"
      : "bg-slate-50 border-slate-200 text-slate-800",
    nav: darkMode
      ? "bg-[#1E293B] border-emerald-500/30"
      : "bg-[#064E3B] border-emerald-900",
  };

  if (loading)
    return (
      <div
        className={`${theme.bg} min-h-screen flex items-center justify-center`}
      >
        <RefreshCw className="animate-spin text-emerald-500 w-10 h-10" />
      </div>
    );

  return (
    <div
      className={`${theme.bg} ${theme.textMain} min-h-screen transition-colors duration-300 font-sans`}
    >
      {/* NAVBAR */}
      <nav className={`${theme.nav} border-b-4 sticky top-0 z-50 shadow-xl`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-12">
            <img
              src="https://www.genli.com.co/assets/images/logo.svg"
              className="h-14 w-auto brightness-0 invert"
              alt="Genli Logo"
            />
            <div className="hidden md:flex gap-8 text-[12px] font-black uppercase tracking-tighter text-emerald-50/70">
              <Link to="/index" className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <span className="text-white border-b-2 border-emerald-400 pb-1">
                Edición
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

      <main className="max-w-xl mx-auto px-6 py-16">
        {/* BOTÓN VOLVER / CANCELAR */}
        <Link
          to="/index"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-all mb-8"
        >
          <X size={16} /> Cancelar y Volver
        </Link>

        {/* HEADER FORMULARIO */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black tracking-tighter uppercase">
            Modificar Registro
          </h1>
          <p className="text-emerald-600 text-[10px] font-mono font-bold mt-2 tracking-[0.3em]">
            IDENTIFICADOR TÉCNICO: #{id}
          </p>
        </div>

        {/* TARJETA FORMULARIO */}
        <div
          className={`${theme.card} border p-10 rounded-sm shadow-2xl relative overflow-hidden`}
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* CAMPO: BARRIO */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                Sector Registrado (Barrio)
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                <input
                  type="text"
                  list="lista-barrios"
                  name="barrio"
                  value={formData.barrio}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 rounded-sm border text-xs font-bold tracking-widest outline-none transition-all ${theme.input} focus:border-blue-500`}
                  placeholder="NOMBRE DEL BARRIO"
                  required
                />
                <datalist id="lista-barrios">
                  {barrios.map((nombre, index) => (
                    <option key={index} value={nombre} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                Magnitud de Energía Suministrada (kWh)
              </label>
              <div className="relative">
                <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                <input
                  type="number"
                  step="0.01"
                  name="energiaS"
                  value={formData.energiaS}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-16 py-4 rounded-sm border text-sm font-mono font-bold outline-none transition-all ${theme.input} focus:border-blue-500`}
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  Unidades kWh
                </span>
              </div>
            </div>

            {/* CAMPO: ENERGÍA */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                Magnitud de Energía (kWh)
              </label>
              <div className="relative">
                <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                <input
                  type="number"
                  step="0.01"
                  name="pEnergia"
                  value={formData.pEnergia}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-16 py-4 rounded-sm border text-sm font-mono font-bold outline-none transition-all ${theme.input} focus:border-blue-500`}
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  Unidades kWh
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                Usuario Responsable del Registro
              </label>
              <div className="relative">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                {userRole === "administrador" ? (
                  <input
                    type="text"
                    value={formData.usuario}
                    readOnly
                    className={`w-full pl-12 pr-4 py-4 rounded-sm border text-[11px] font-black uppercase tracking-widest outline-none bg-slate-100 ${theme.input}`}
                  />
                ) : (
                  <input
                    type="text"
                    value={formData.rol?.toUpperCase() || "USUARIO"}
                    readOnly
                    className={`w-full pl-12 pr-4 py-4 rounded-sm border text-[11px] font-black uppercase tracking-widest outline-none bg-slate-100 ${theme.input}`}
                  />
                )}
              </div>
            </div>

            {/* CAMPO: TIPO */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                Naturaleza de la Pérdida
              </label>
              <div className="relative">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 rounded-sm border text-[11px] font-black uppercase tracking-widest outline-none appearance-none transition-all ${theme.input} focus:border-blue-500`}
                >
                  <option value="Tecnica">⚙️ PÉRDIDA TÉCNICA</option>
                  <option value="No Tecnica">⚠️ PÉRDIDA NO TÉCNICA</option>
                </select>
              </div>
            </div>

            {/* CAMPO: OBSERVACIONES TÉCNICAS */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                Notas de Campo y Observaciones Adicionales
              </label>
              <div className="relative">
                <Edit3 className="absolute left-4 top-4 w-4 h-4 text-blue-500" />
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full pl-12 pr-4 py-4 rounded-sm border text-xs font-bold tracking-widest outline-none transition-all resize-none ${theme.input} focus:border-blue-500`}
                  placeholder="DESCRIBA CUALQUIER CAMBIO O HALLAZGO RELEVANTE..."
                ></textarea>
              </div>
            </div>

            {/* BOTÓN SUBMIT */}
            <button
              type="submit"
              disabled={updating}
              className={`w-full py-5 rounded-sm font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl ${
                updating
                  ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
              }`}
            >
              {updating ? (
                <RefreshCw className="animate-spin w-4 h-4" />
              ) : (
                <>
                  <Save size={16} /> Actualizar Registro del Sistema
                </>
              )}
            </button>
          </form>
        </div>

        <footer className="mt-12 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          © {new Date().getFullYear()} Genli Energy Solutions S.A.S — Data
          Integrity System
        </footer>
      </main>
    </div>
  );
}
