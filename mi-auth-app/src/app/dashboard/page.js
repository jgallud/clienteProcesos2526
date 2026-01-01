"use client";
import React, { useEffect, useState } from 'react';
import { LogOut, User, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
 const [userEmail, setUserEmail] = useState("");
 const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

//   useEffect(() => {
//     // Intentamos leer la cookie 'nick' que envió el backend
//     const cookies = document.cookie.split('; ');
//     const nickCookie = cookies.find(row => row.startsWith('nick='));
//     if (nickCookie) {
//       // Decodificamos el email (por si tiene caracteres especiales como @)
//       setUserEmail(decodeURIComponent(nickCookie.split('=')[1]));
//     }
//   }, []);
const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
  const comprobarAcceso = async () => {
    try {
      const res = await fetch(`${API_URL}/dashboard?t=${new Date().getTime()}`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json();
        
        // 1. Usa los datos que vienen del servidor, son más fiables que la cookie
        setUser(data.user);
        // data.user debería traer el email o nick si lo configuraste en el back
        setUserEmail(data.user.email || data.user.nick || ""); 
        const nickDesdeCookie = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('nick='))
                    ?.split('=')[1];
                
        setUserEmail(decodeURIComponent(nickDesdeCookie || data.user.email));
        //setLoading(false);
        // 2. SOLO ahora permitimos ver el dashboard
        setLoading(false); 
      } else {
        // Si no es OK (401), mandamos al login y NO quitamos el loading
        router.push('/');
      }
    } catch (error) {
      console.error("Error verificando sesión", error);
      router.push('/');
    }
  };

  comprobarAcceso();
}, [router]);

// 3. Este bloque es el que evita que se vea el dashboard vacío
if (loading) {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 font-medium">Verificando acceso...</p>
      </div>
    </div>
  );
}

// Opcional: Si por un milagro loading es false pero no hay user, no pintes nada
if (!user) return null;

 const handleLogout = async () => {
    try {
        // 1. Avisamos al servidor para que invalide la sesión
        await fetch(`${API_URL}/cerrarSesion`, {
            method: 'POST',
            credentials: 'include', // Clave para que el servidor sepa qué sesión cerrar
        });
    } catch (error) {
        console.error("Error contactando al back:", error);
    } finally {
        // 2. BORRADO MANUAL LOCAL (Doble seguridad)
        // Esto limpia la cookie 'nick' en el navegador del cliente
        document.cookie = "nick=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;";
        
        // 3. Redirigir al Login
        window.location.href = "/";
    }
};

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Simple */}
      <div className="w-64 bg-indigo-900 text-white hidden md:flex flex-col p-6">
        <div className="flex items-center gap-2 mb-10">
          <ShieldCheck className="text-indigo-400" size={32} />
          <span className="font-bold text-xl tracking-tight">MiApp</span>
        </div>
        <nav className="flex-1 space-y-2">
          <a href="#" className="flex items-center gap-3 bg-indigo-800 p-3 rounded-lg text-sm font-medium">
            <LayoutDashboard size={18} /> Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 hover:bg-indigo-800 p-3 rounded-lg text-sm font-medium transition-colors text-indigo-200">
            <User size={18} /> Perfil
          </a>
        </nav>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 text-indigo-300 hover:text-white p-3 transition-colors text-sm font-medium"
        >
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>

      {/* Contenido Principal */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>
            <p className="text-gray-500 text-sm">Bienvenido de nuevo al sistema</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-700">{userEmail || "Usuario"}</p>
              <p className="text-xs text-green-500 font-medium">En línea</p>
            </div>
            <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
              {userEmail ? userEmail[0].toUpperCase() : "U"}
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Estado de cuenta</p>
            <p className="text-2xl font-bold text-gray-800 mt-2">Activa</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-2">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Email Registrado</p>
            <p className="text-2xl font-bold text-gray-800 mt-2">{userEmail || "Cargando..."}</p>
          </div>
        </section>
      </main>
    </div>
  );
}