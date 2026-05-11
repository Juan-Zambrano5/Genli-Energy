import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { ShieldCheck, Lock } from "lucide-react";
import clienteAxios from "../api/axios"; // <--- Importación faltante

export default function Login() {
  const navigate = useNavigate();

  const handleSuccess = async (response) => {
    try {
      const userObject = jwtDecode(response.credential);
      const email = userObject.email;

      // Validación de dominio
      if (email.endsWith("@umariana.edu.co") || email.endsWith("@gmail.com")) {
        const res = await clienteAxios.post("/auth/login", {
          email: email,
          name: userObject.name,
        });

        const userData = {
          ...userObject,
          roles: res.data.roles,
          permissions: res.data.permissions,
        };
        localStorage.setItem("user", JSON.stringify(userData));
        window.location.href = "/index";
      } else {
        alert("Acceso denegado. Debes usar tu correo institucional (@umariana.edu.co) o una cuenta de Gmail.");
      }
  }catch (error) {
      console.error("Error en login:", error);
      alert("Error al intentar iniciar sesión en el servidor.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#064E3B] relative overflow-hidden font-sans">
      {/* Elementos decorativos de fondo (Sutiles) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-black/20 rounded-full blur-[120px]"></div>

      <div className="relative z-10 bg-white p-12 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-center max-w-md w-full border-t-8 border-emerald-500">
        {/* Logo Corporativo */}
        <img
          src="https://www.genli.com.co/assets/images/logo.svg"
          alt="Genli Energy"
          className="h-16 mx-auto mb-8 transition-transform hover:scale-105 duration-300"
        />

        <div className="flex justify-center mb-4">
          <div className="bg-emerald-50 p-3 rounded-full">
            <ShieldCheck className="text-emerald-600 w-8 h-8" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-3">
          Genli Energy SAS
        </h1>

        <p className="text-slate-500 mb-10 text-[11px] font-bold uppercase tracking-[0.15em] leading-relaxed">
          Sistema de Control de Pérdidas Energéticas <br />
          <span className="text-emerald-600">
            Ingresa con tu cuenta corporativa o de Gmail
          </span>
        </p>

        <div className="space-y-6">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => alert("Error en la conexión con Google")}
              theme="filled_blue"
              size="large"
              shape="square"
              width="320"
            />
          </div>

          <div className="flex items-center justify-center gap-2 text-slate-400">
            <Lock size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">
              Acceso Restringido y Encriptado
            </span>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
            Genli Energy Solutions S.A.S — 2026
          </p>
        </div>
      </div>
    </div>
  );
}
