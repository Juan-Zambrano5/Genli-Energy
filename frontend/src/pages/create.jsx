import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import clienteAxios from "../api/axios";
import useAuth from "../hooks/useAuth";
import {
  Zap,
  MapPin,
  Activity,
  Layers,
  ArrowLeft,
  Sun,
  Moon,
  LogOut,
  Save,
  RefreshCw,
} from "lucide-react";

export default function Create() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [barrios, setBarrios] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    barrio: "",
    energiaS: "",
    pEnergia: "",
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
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "energiaS" || name === "pEnergia") {
      const num = parseFloat(value);
      setFormData({ ...formData, [name]: isNaN(num) ? value : Math.round(num * 100) / 100 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // IMPORTANTE: pEnergia debe ser número
      const dataToSend = {
        ...formData,
        energiaS: parseFloat(formData.energiaS),
        pEnergia: parseFloat(formData.pEnergia),
      };

      const response = await clienteAxios.post("/registros", dataToSend);

      if (response.status === 201 || response.status === 200) {
        navigate("/index"); // Si todo sale bien, volvemos
      }
    } catch (error) {
      // ESTO TE DIRÁ EL ERROR REAL EN LA CONSOLA
      console.error("ERROR DE LARAVEL:", error.response?.data);
      alert("Error: " + (error.response?.data?.message || "Revisa los campos"));
    } finally {
      setLoading(false);
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

  return (
    <div
      className={`${theme.bg} ${theme.textMain} min-h-screen transition-colors duration-300 font-sans`}
    >
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
                Registrar
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
        <Link
          to="/index"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600 hover:gap-3 transition-all mb-8"
        >
          <ArrowLeft size={16} /> Volver al Dashboard
        </Link>

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black tracking-tighter uppercase">
            Nuevo Reporte Técnico
          </h1>
          <p
            className={`${darkMode ? "text-slate-400" : "text-slate-500"} text-xs font-bold mt-2 uppercase tracking-widest`}
          >
            Sistema de Integridad de Datos Genli Energy
          </p>
        </div>

        <div
          className={`${theme.card} border p-10 rounded-sm shadow-2xl relative overflow-hidden`}
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                Identificación del Sector (Barrio)
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                <input
                  type="text"
                  list="lista-barrios"
                  name="barrio"
                  value={formData.barrio}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 rounded-sm border text-xs font-bold tracking-widest outline-none transition-all ${theme.input} focus:border-emerald-500`}
                  placeholder="INGRESE EL NOMBRE DEL BARRIO"
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
                Magnitud de Energía Suministrada
              </label>
              <div className="relative">
                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                <input
                  type="number"
                  step="0.01"
                  name="energiaS"
                  value={formData.energiaS}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-16 py-4 rounded-sm border text-sm font-mono font-bold outline-none transition-all ${theme.input} focus:border-emerald-500`}
                  placeholder="0.00"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">
                  kWh
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                Magnitud de Pérdida Identificada
              </label>
              <div className="relative">
                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                <input
                  type="number"
                  step="0.01"
                  name="pEnergia"
                  value={formData.pEnergia}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-16 py-4 rounded-sm border text-sm font-mono font-bold outline-none transition-all ${theme.input} focus:border-emerald-500`}
                  placeholder="0.00"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">
                  kWh
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                Usuario Responsable del Registro
              </label>
              <div className="relative">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                <input
                  type="text"
                  value={user?.name || "Usuario"}
                  readOnly
                  className={`w-full pl-12 pr-4 py-4 rounded-sm border text-[11px] font-black uppercase tracking-widest outline-none appearance-none transition-all bg-slate-100 ${theme.input}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                Clasificación de la Pérdida
              </label>
              <div className="relative">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 rounded-sm border text-[11px] font-black uppercase tracking-widest outline-none appearance-none transition-all ${theme.input} focus:border-emerald-500`}
                >
                  <option value="Tecnica">⚙️ RED TÉCNICA</option>
                  <option value="No Tecnica">⚠️ RED NO TÉCNICA</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                Observaciones y Hallazgos Técnicos
              </label>
              <div className="relative">
                <Activity className="absolute left-4 top-4 w-4 h-4 text-emerald-500" />
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full pl-12 pr-4 py-4 rounded-sm border text-xs font-bold tracking-widest outline-none transition-all resize-none ${theme.input} focus:border-emerald-500`}
                  placeholder="DESCRIBA DETALLES ADICIONALES, ESTADO DE LOS EQUIPOS O ANOMALÍAS DETECTADAS..."
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-sm font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl ${
                loading
                  ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
              }`}
            >
              {loading ? (
                <RefreshCw className="animate-spin w-4 h-4" />
              ) : (
                <>
                  <Save size={16} /> Confirmar y Guardar Registro
                </>
              )}
            </button>
          </form>
        </div>

        <footer className="mt-12 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          © {new Date().getFullYear()} Genli Energy Solutions S.A.S — Pasto,
          Nariño
        </footer>
      </main>
    </div>
  );
}
