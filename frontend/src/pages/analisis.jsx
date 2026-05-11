import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LineChart, Line, AreaChart, Area,
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from "recharts";
import clienteAxios from "../api/axios";
import useAuth from "../hooks/useAuth";
import {
  Sun, Moon, BarChart3, LayoutDashboard,
  LogOut
} from "lucide-react";

const COLORS = ["#f97316", "#fb923c", "#fdba74"];
const ZONA_COLORS = ["#0ea5e9", "#38bdf8", "#7dd3fc", "#bae6fd", "#e0f2fe"];

const fmtKwh = (v) => `${Math.round(Number(v || 0) * 100) / 100} kWh`;

const StatCard = ({ icon, label, value, sub, color, darkMode }) => (
  <div className={`rounded-2xl border p-5 flex gap-4 items-start shadow-sm ${darkMode ? "bg-[#1E293B] border-[#334155]" : "bg-white border-slate-100"}`}>
    <div className={`rounded-xl p-3 ${color}`}>
      <span className="text-2xl">{icon}</span>
    </div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`text-2xl font-bold mt-0.5 ${darkMode ? "text-slate-100" : "text-slate-800"}`}>{value}</p>
      {sub && <p className={`text-xs mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{sub}</p>}
    </div>
  </div>
);

const SectionTitle = ({ children, darkMode }) => (
  <h2 className={`text-sm font-bold uppercase tracking-widest mb-4 ${darkMode ? "text-slate-400" : "text-slate-400"}`}>{children}</h2>
);

const CustomTooltip = ({ active, payload, label, darkMode, valueFormatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`border rounded-xl shadow-lg px-4 py-3 text-sm ${darkMode ? "bg-[#1E293B] border-[#334155]" : "bg-white border-slate-100"}`}>
      <p className={`font-bold mb-1 ${darkMode ? "text-slate-200" : "text-slate-700"}`}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: <span className={darkMode ? "text-slate-200" : "text-slate-700"}>{valueFormatter ? valueFormatter(p.value) : p.value}{p.unit === "" ? "" : ` ${p.unit || "kWh"}`}</span>
        </p>
      ))}
    </div>
  );
};

const ChartCard = ({ title, darkMode, children }) => (
  <div className={`rounded-2xl border p-6 ${darkMode ? "bg-[#1E293B] border-[#334155]" : "bg-white border-slate-100"}`}>
    <SectionTitle darkMode={darkMode}>{title}</SectionTitle>
    {children}
  </div>
);

export default function Analisis() {
  const { userRole, puedeCrear, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await clienteAxios.get('/dashboard-stats');
        setData(res.data);
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const theme = {
    bg: darkMode ? "bg-[#0F172A]" : "bg-slate-50",
    card: darkMode ? "bg-[#1E293B] border-[#334155]" : "bg-white border-slate-100",
    textMain: darkMode ? "text-slate-100" : "text-slate-800",
    textSub: darkMode ? "text-slate-400" : "text-slate-500",
    chartGrid: darkMode ? "#334155" : "#f1f5f9",
    chartTick: darkMode ? "#94a3b8" : "#94a3b8",
    chartLegend: darkMode ? "#cbd5e1" : "#64748b",
    nav: darkMode ? "bg-[#1E293B] border-emerald-500/30" : "bg-[#064E3B] border-emerald-900",
  };

  if (loading) {
    return (
      <div className={`${theme.bg} min-h-screen flex items-center justify-center transition-colors duration-300`}>
        <p className={`${theme.textSub} font-bold`}>Cargando métricas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${theme.bg} min-h-screen flex items-center justify-center transition-colors duration-300`}>
        <p className="text-red-500 font-bold">Error: {error}</p>
      </div>
    );
  }

  const mensual = data?.mensual || [];
  const porZona = data?.porZona || [];
  const tipoPerdida = data?.tipoPerdida || [];
  const topCasas = data?.topCasas || [];

  const totalPerdida = mensual.reduce((s, m) => s + (m.perdida || 0), 0);
  const totalConsumo = mensual.reduce((s, m) => s + (m.consumo || 0), 0);
  const eficienciaMedia = mensual.length > 0
    ? Math.round(mensual.reduce((s, m) => s + (m.eficiencia || 0), 0) / mensual.length)
    : 0;
  const mesPico = [...mensual].sort((a, b) => (b.perdida || 0) - (a.perdida || 0))[0] || { mes: '-', perdida: 0 };

  const porZonaConPromedio = porZona.map(z => ({
    ...z,
    promedio: z.casas > 0 ? parseFloat((z.perdida / z.casas).toFixed(1)) : 0,
    suministro: z.consumo ?? 0,
  }));

  const getRatioColor = (ratio) => ratio > 50 ? "#ef4444" : ratio > 25 ? "#f97316" : "#10b981";

  const porZonaConRatio = porZona.map(z => {
    const cons = z.consumo ?? 0;
    const per = z.perdida ?? 0;
    const ratio = cons > 0 ? parseFloat(((per / cons) * 100).toFixed(1)) : 0;
    return { ...z, ratio };
  });

  return (
    <div className={`${theme.bg} ${theme.textMain} min-h-screen font-sans transition-colors duration-300`}>
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
                className="flex items-center gap-2 pb-1 transition-all text-emerald-50/70 hover:text-white"
              >
                <LayoutDashboard size={14} /> Dashboard
              </Link>
              <span className="flex items-center gap-2 pb-1 text-white border-b-2 border-emerald-400">
                <BarChart3 size={14} /> Análisis
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

      <main className={`${theme.bg} max-w-7xl mx-auto px-6 py-8 space-y-10 transition-colors duration-300`}>

        <section>
          <SectionTitle darkMode={darkMode}>Resumen de pérdidas</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon="📉"
              label="Pérdida total"
              value={fmtKwh(totalPerdida)}
              sub={`${totalConsumo > 0 ? (Math.round((totalPerdida / totalConsumo) * 1000) / 10).toFixed(1) : 0}% del consumo`}
              color={darkMode ? "bg-red-900/30" : "bg-red-50"}
              darkMode={darkMode}
            />
            <StatCard
              icon="🏠"
              label="Consumo total"
              value={fmtKwh(totalConsumo)}
              sub="Suma de todos los registros"
              color={darkMode ? "bg-sky-900/30" : "bg-sky-50"}
              darkMode={darkMode}
            />
            <StatCard
              icon="⚙️"
              label="Eficiencia media"
              value={`${eficienciaMedia}%`}
              sub="Red de distribución"
              color={darkMode ? "bg-emerald-900/30" : "bg-emerald-50"}
              darkMode={darkMode}
            />
            <StatCard
              icon="📆"
              label="Mes pico"
              value={mesPico.mes}
              sub={`${Math.round(mesPico.perdida * 100) / 100} kWh de pérdida`}
              color={darkMode ? "bg-orange-900/30" : "bg-orange-50"}
              darkMode={darkMode}
            />
          </div>
        </section>

        <section>
          <SectionTitle darkMode={darkMode}>Evolución de registros — Pérdida vs Energía Suministrada (kWh)</SectionTitle>
          <div className={`rounded-2xl border p-6 ${theme.card}`}>
            {mensual.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mensual} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradConsumo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={darkMode ? 0.4 : 0.25} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradPerdida" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={darkMode ? 0.5 : 0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fill: theme.chartTick }} />
                  <YAxis tick={{ fontSize: 12, fill: theme.chartTick }} />
                  <Tooltip content={<CustomTooltip darkMode={darkMode} valueFormatter={(v) => Math.round(v * 100) / 100} />} />
                  <Legend wrapperStyle={{ fontSize: 13, color: theme.chartLegend }} />
                  <Area type="monotone" dataKey="consumo" name="Energía Suministrada" stroke="#0ea5e9" strokeWidth={2} fill="url(#gradConsumo)" />
                  <Area type="monotone" dataKey="perdida" name="Pérdida" stroke="#f97316" strokeWidth={2} fill="url(#gradPerdida)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-10 text-slate-400">No hay datos mensuales disponibles</p>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 rounded-2xl border p-6 ${theme.card}`}>
            <SectionTitle darkMode={darkMode}>Pérdidas por sector/barrio (kWh)</SectionTitle>
            {porZona.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={porZonaConPromedio} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} />
                  <XAxis dataKey="zona" tick={{ fontSize: 11, fill: theme.chartTick }} />
                  <YAxis tick={{ fontSize: 12, fill: theme.chartTick }} />
                  <Tooltip content={<CustomTooltip darkMode={darkMode} valueFormatter={(v) => Math.round(v * 100) / 100} />} />
                  <Bar dataKey="perdida" name="Pérdida" radius={[6, 6, 0, 0]}>
                    {porZona.map((_, i) => (
                      <Cell key={i} fill={ZONA_COLORS[i % ZONA_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-10 text-slate-400">No hay datos por sector</p>
            )}
          </div>

          <div className={`rounded-2xl border p-6 flex flex-col ${theme.card}`}>
            <SectionTitle darkMode={darkMode}>Tipo de pérdida (%)</SectionTitle>
            <div className="flex-1 flex flex-col items-center justify-center">
              {tipoPerdida.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={tipoPerdida}
                        cx="50%" cy="50%"
                        innerRadius={55} outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {tipoPerdida.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `${Math.round(v * 10) / 10}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <ul className="mt-2 space-y-1 text-sm w-full">
                    {tipoPerdida.map((t, i) => (
                      <li key={i} className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full inline-block" style={{ background: COLORS[i] }} />
                          <span className={theme.textSub}>{t.name}</span>
                        </span>
                        <span className={`font-semibold ${theme.textMain}`}>{t.value}%</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-slate-400">No hay datos</p>
              )}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 rounded-2xl border p-6 ${theme.card}`}>
            <SectionTitle darkMode={darkMode}>Índice de eficiencia mensual (%)</SectionTitle>
            {mensual.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={mensual} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fill: theme.chartTick }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: theme.chartTick }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(value) => [<span style={{ color: "#000" }}>{Math.round(value)}%</span>, "Eficiencia"]} />
                  <Legend wrapperStyle={{ fontSize: 13, color: theme.chartLegend }} />
                  <Line
                    type="monotone" dataKey="eficiencia" name="Eficiencia"
                    stroke="#10b981" strokeWidth={2.5}
                    dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-10 text-slate-400">No hay datos</p>
            )}
          </div>

          <div className={`rounded-2xl border p-6 ${theme.card}`}>
            <SectionTitle darkMode={darkMode}>Top 5 — Mayor pérdida</SectionTitle>
            {topCasas.length > 0 ? (
              <ul className="space-y-3 mt-1">
                {topCasas.map((c, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center
                      ${i === 0 ? (darkMode ? "bg-red-900/40 text-red-300" : "bg-red-100 text-red-600") :
                        i === 1 ? (darkMode ? "bg-orange-900/40 text-orange-300" : "bg-orange-100 text-orange-600") :
                        (darkMode ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500")}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${theme.textMain}`}>{c.id}</p>
                      <p className={`text-xs truncate ${theme.textSub}`}>{c.direccion}</p>
                    </div>
                    <span className={`text-sm font-bold whitespace-nowrap ${darkMode ? "text-red-400" : "text-red-500"}`}>{Math.round(c.perdida * 100) / 100} kWh</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center py-10 text-slate-400">No hay registros</p>
            )}
          </div>
        </section>

        <section>
          <SectionTitle darkMode={darkMode}>Energía Suministrada por sector/barrio (kWh)</SectionTitle>
          <div className={`rounded-2xl border p-6 ${theme.card}`}>
            {porZona.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={porZonaConPromedio} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradSuministrada" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={darkMode ? 0.4 : 0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} />
                  <XAxis dataKey="zona" tick={{ fontSize: 11, fill: theme.chartTick }} />
                  <YAxis tick={{ fontSize: 12, fill: theme.chartTick }} />
                  <Tooltip content={<CustomTooltip darkMode={darkMode} valueFormatter={(v) => Math.round(v * 100) / 100} />} />
                  <Legend wrapperStyle={{ fontSize: 13, color: theme.chartLegend }} />
                  <Area type="monotone" dataKey="consumo" name="Energía Suministrada" stroke="#10b981" strokeWidth={2} fill="url(#gradSuministrada)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-10 text-slate-400">No hay datos por sector</p>
            )}
          </div>
        </section>

        <section>
          <SectionTitle darkMode={darkMode}>Comparativa: Pérdida vs Energía Suministrada por sector (kWh)</SectionTitle>
          <div className={`rounded-2xl border p-6 ${theme.card}`}>
            {porZona.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={porZonaConPromedio} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} />
                  <XAxis dataKey="zona" tick={{ fontSize: 11, fill: theme.chartTick }} />
                  <YAxis tick={{ fontSize: 12, fill: theme.chartTick }} />
                  <Tooltip content={<CustomTooltip darkMode={darkMode} valueFormatter={(v) => Math.round(v * 100) / 100} />} />
                  <Legend wrapperStyle={{ fontSize: 13, color: theme.chartLegend }} />
                  <Bar dataKey="consumo" name="Energía Suministrada" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="perdida" name="Pérdida" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-10 text-slate-400">No hay datos por sector</p>
            )}
          </div>
        </section>

        <section>
          <SectionTitle darkMode={darkMode}>Relación pérdida/suministro (%) por sector</SectionTitle>
          <div className={`rounded-2xl border p-6 ${theme.card}`}>
            {porZona.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={porZonaConRatio} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} />
                  <XAxis dataKey="zona" tick={{ fontSize: 11, fill: theme.chartTick }} />
                  <YAxis tick={{ fontSize: 12, fill: theme.chartTick }} tickFormatter={(v) => `${v}%`} />
                          <Tooltip content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const value = payload[0]?.value;
                        const color = getRatioColor(value);
                        return (
                          <div className={`border rounded-xl shadow-lg px-4 py-3 text-sm ${darkMode ? "bg-[#1E293B] border-[#334155]" : "bg-white border-slate-100"}`}>
                            <p className={`font-bold mb-1 ${darkMode ? "text-slate-200" : "text-slate-700"}`}>{label}</p>
                            <p style={{ color }} className="font-medium">% Pérdida: <span className={darkMode ? "text-slate-200" : "text-slate-700"}>{Math.round(value * 10) / 10}%</span></p>
                          </div>
                        );
                      }} />
                  <Bar dataKey="ratio" name="% Pérdida" radius={[4, 4, 0, 0]}>
                    {porZonaConRatio.map((z, i) => {
                      const color = getRatioColor(z.ratio);
                      return <Cell key={i} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-10 text-slate-400">No hay datos por sector</p>
            )}
          </div>
        </section>

        <footer className={`text-center text-xs pb-4 ${theme.textSub}`}>
          Genli Energy Solutions S.A.S · Panel de métricas · {new Date().getFullYear()}
        </footer>
      </main>
    </div>
  );
}
