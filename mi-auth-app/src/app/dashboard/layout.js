// src/app/dashboard/layout.js
"use client"; // Necesario porque usamos el SocketProvider y eventos de clic
import '@/app/globals.css';
import { SocketProvider } from '@/context/SocketContext';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cerrarSesion`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        window.location.href = '/'; 
      }
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return (
    <SocketProvider>
      <div className="flex h-screen bg-gray-100 font-sans">
        {/* --- BARRA LATERAL (SIDEBAR) --- */}
        <aside className="w-64 bg-indigo-900 text-white flex flex-col shadow-xl">
          <div className="p-6 text-2xl font-bold border-b border-indigo-800">
            Mi Juego App
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <div className="bg-indigo-800 p-3 rounded-lg cursor-pointer">Inicio</div>
            <div className="p-3 hover:bg-indigo-800 rounded-lg cursor-pointer transition">Mi Perfil</div>
            <div className="p-3 hover:bg-indigo-800 rounded-lg cursor-pointer transition">Ranking</div>
          </nav>
          <div className="p-4 border-t border-indigo-800">
            <button 
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 p-2 rounded-lg transition font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* --- CONTENIDO DERECHA --- */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* BARRA SUPERIOR (NAVBAR) */}
          <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8">
            <h2 className="text-gray-600 font-medium">Dashboard de Usuario</h2>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                U
              </div>
            </div>
          </header>

          {/* EL PANEL (CHILDREN) */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </SocketProvider>
  );
}