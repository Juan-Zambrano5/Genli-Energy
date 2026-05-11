import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import clienteAxios from "../api/axios";
import useAuth from "../hooks/useAuth";
import {
  RefreshCw,
  FileText,
  Edit3,
  Trash2,
  Search,
  LogOut,
  BarChart3,
  Sun,
  Moon,
  Calendar,
  LayoutDashboard,
} from "lucide-react";

export default function Index() {
  const { userRole, puedeAnalizar, puedeCrear, puedeEditar, puedeEliminar, logout } = useAuth();
  const [genlienergy, setGenlienergy] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const obtenerRegistros = async () => {
    try {
      const res = await clienteAxios.get("/registros");
      const dataLimpia = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];
      setGenlienergy(dataLimpia);
    } catch (error) {
      console.error("Error cargando datos", error);
    }
  };

  const eliminarRegistro = async (id) => {
    if (!window.confirm("¿Desea eliminar este registro permanentemente?"))
      return;
    try {
      await clienteAxios.delete(`/registros/${id}`);
      setGenlienergy(genlienergy.filter((item) => item.idRegistro !== id));
    } catch (error) {
      console.error("Error al eliminar", error);
    }
  };

  const registrosFiltrados = genlienergy.filter((item) => {
    const busqueda = searchTerm.toLowerCase();
    const coincideTexto =
      item.barrio.toLowerCase().includes(busqueda) ||
      item.idRegistro.toString().includes(busqueda);
    const coincideTipo = tipoFiltro === "" || item.tipo === tipoFiltro;
    const coincideFecha =
      (!fechaInicio || item.fecha >= fechaInicio) &&
      (!fechaFin || item.fecha <= fechaFin);
    return coincideTexto && coincideTipo && coincideFecha;
  });

  useEffect(() => {
    obtenerRegistros();
  }, []);

  const totalKwh = Math.round(
    registrosFiltrados.reduce((acc, curr) => acc + parseFloat(curr.pEnergia || 0), 0) * 100
  ) / 100;

  const theme = {
    bg: darkMode ? "bg-[#0F172A]" : "bg-[#F1F5F9]",
    card: darkMode
      ? "bg-[#1E293B] border-[#334155]"
      : "bg-white border-slate-200",
    textMain: darkMode ? "text-slate-100" : "text-slate-800",
    textSub: darkMode ? "text-slate-400" : "text-slate-500",
    tableHead: darkMode
      ? "bg-[#161E2E] text-slate-500"
      : "bg-slate-100 text-slate-500",
    input: darkMode
      ? "bg-[#0F172A] border-[#334155] text-white"
      : "bg-white border-slate-200 text-slate-800",
    nav: darkMode
      ? "bg-[#1E293B] border-emerald-500/30"
      : "bg-[#064E3B] border-emerald-900",
  };

  return (
    <div
      className={`${theme.bg} ${theme.textMain} min-h-screen transition-colors duration-300`}
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
            <div className="hidden md:flex gap-8 text-[12px] font-black uppercase tracking-tighter">
              <Link
                to="/index"
                className="flex items-center gap-2 pb-1 transition-all text-white border-b-2 border-emerald-400"
              >
                <LayoutDashboard size={14} /> Dashboard
              </Link>
              {puedeAnalizar && (
                <Link
                  to="/analisis"
                  className="flex items-center gap-2 pb-1 transition-all text-emerald-50/70 hover:text-white"
                >
                  <BarChart3 size={14} /> Análisis
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-black/20 text-emerald-100 hover:bg-black/40 transition-all"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {puedeCrear && (
              <Link
                to="/create"
                className="bg-[#10B981] hover:bg-[#059669] text-white px-5 py-2.5 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg"
              >
                Nuevo Reporte
              </Link>
            )}
            {userRole === "administrador" && (
              <Link
                to="/users"
                className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-5 py-2.5 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg"
              >
                Usuarios
              </Link>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-2 ml-2 px-3 py-2 text-emerald-100 hover:text-white hover:bg-red-600/20 rounded-md transition-all text-xs font-bold uppercase"
            >
              <LogOut size={16} /> Salir
            </button>
          </div>
        </div>
      </nav>

      {/* CONTENIDO */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* KPI SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className={`${theme.card} border p-6 rounded-md shadow-sm`}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Energía Total
                </p>
                <h3 className="text-2xl font-black">
                  {Math.round(totalKwh * 100) / 100}{" "}
                  <span className="text-xs font-normal">kWh</span>
                </h3>
              </div>
              <div className={`${theme.card} border p-6 rounded-md shadow-sm`}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Registros
                </p>
                <h3 className="text-2xl font-black">
                  {registrosFiltrados.length}
                </h3>
              </div>
              <div className={`${theme.card} border p-6 rounded-md shadow-sm`}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Barrios
                </p>
                <h3 className="text-2xl font-black">
                  {new Set(registrosFiltrados.map((r) => r.barrio)).size}
                </h3>
              </div>
            </div>

            {/* FILTROS */}
            <div
              className={`${theme.card} border p-6 rounded-md mb-8 shadow-md`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="relative lg:col-span-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="BUSCAR BARRIO..."
                    className={`w-full pl-10 pr-4 py-2.5 rounded border text-[11px] font-bold uppercase tracking-wider outline-none ${theme.input} focus:border-emerald-500`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className={`px-4 py-2.5 border rounded text-[11px] font-bold uppercase tracking-wider outline-none ${theme.input}`}
                  value={tipoFiltro}
                  onChange={(e) => setTipoFiltro(e.target.value)}
                >
                  <option value="">TODOS LOS TIPOS</option>
                  <option value="Tecnica">PÉRDIDA TÉCNICA</option>
                  <option value="No Tecnica">PÉRDIDA NO TÉCNICA</option>
                </select>
                <div className="flex gap-2 lg:col-span-2">
                  <div className="flex-1 relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    <input
                      type="date"
                      className={`w-full pl-8 pr-4 py-2.5 border rounded text-[11px] font-bold uppercase ${theme.input}`}
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    <input
                      type="date"
                      className={`w-full pl-8 pr-4 py-2.5 border rounded text-[11px] font-bold uppercase ${theme.input}`}
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setTipoFiltro("");
                      setFechaInicio("");
                      setFechaFin("");
                    }}
                    className="p-2.5 text-slate-400 hover:text-emerald-500 transition-all"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* TABLA */}
            <div
              className={`${theme.card} border rounded-md overflow-hidden shadow-2xl`}
            >
              <table className="w-full text-left">
                <thead>
                  <tr
                    className={`${theme.tableHead} border-b font-bold text-[10px] uppercase tracking-[0.15em]`}
                  >
                    <th className="px-8 py-5">Barrio / Identificador</th>
                    <th className="px-8 py-5 text-center">
                      Energía Suministrada (kWh)
                    </th>
                    <th className="px-8 py-5 text-center">Magnitud (kWh)</th>
                    <th className="px-8 py-5 text-center">Usuario</th>
                    <th className="px-8 py-5">Tipo de Pérdida</th>
                    <th className="px-8 py-5">Fecha de Reporte</th>
                    <th className="px-8 py-5 text-center">Observaciones</th>
                    <th className="px-8 py-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/10">
                  {registrosFiltrados.map((item) => (
                    <tr
                      key={item.idRegistro}
                      className={`${darkMode ? "hover:bg-slate-800" : "hover:bg-slate-50"} transition-all`}
                    >
                      <td className="px-8 py-6">
                        <div className="text-sm font-bold uppercase tracking-tight">
                          {item.barrio}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-mono mt-0.5">
                          ID REGISTRO: #{item.idRegistro}
                        </div>
                      </td>
                      <td className={`px-8 py-6 text-center font-mono text-base font-bold ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                        {Math.round(parseFloat(item.energiaS) * 100) / 100}
                      </td>
                      <td className={`px-8 py-6 text-center font-mono text-base font-bold ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                        {Math.round(parseFloat(item.pEnergia) * 100) / 100}
                      </td>
                      <td className="px-8 py-6">
                        {userRole === "administrador" ? (
                          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">
                            {item.usuario}
                          </span>
                        ) : (
                          <span className="text-[9px] font-black px-3 py-1 border rounded bg-slate-200 text-slate-600 border-slate-300">
                            {item.rol?.toUpperCase()}
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`text-[9px] font-black px-3 py-1 border rounded ${
                            item.tipo === "Tecnica"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          }`}
                        >
                          {item.tipo === "Tecnica" ? "TÉCNICA" : "NO TÉCNICA"}
                        </span>
                      </td>
                      <td className={`px-8 py-6 text-[11px] font-medium ${darkMode ? "text-slate-400" : "text-slate-400"}`}>
                        {item.fecha ? new Date(item.fecha).toLocaleString('es-CO', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        }) : '-'}
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-bold uppercase tracking-tight">
                          {item.observaciones}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right flex justify-end gap-3">
                          <a
                            href={`http://localhost:8000/api/reporte-pdf/${item.idRegistro}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-md transition-all"
                          >
                            <FileText size={18} />
                          </a>
                          {puedeEditar && (
                            <Link
                              to={`/edit/${item.idRegistro}`}
                              className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-md transition-all"
                            >
                              <Edit3 size={18} />
                            </Link>
                          )}
                          {puedeEliminar && (
                            <button
                              onClick={() => eliminarRegistro(item.idRegistro)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
      </main>
    </div>
  );
}
