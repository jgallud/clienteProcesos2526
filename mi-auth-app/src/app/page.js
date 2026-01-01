"use client";
import React, { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus, X } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '' });

  // Acceso a la variable de entorno
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => setFormData({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Determinamos el endpoint según el estado del formulario
    const endpoint = isLogin ? '/loginUsuario' : '/registrarUsuario';
    
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        //alert(isLogin ? '¡Inicio de sesión exitoso!' : 'Cuenta creada correctamente');
        window.location.href = '/dashboard';
        console.log('Respuesta:', data);
      } else {
        alert('Error en la autenticación. Revisa tus datos.');
      }
    } catch (error) {
      console.error('Error de red:', error);
      alert('No se pudo conectar con el servidor.');
    }
  };

  const handleGoogleAuth = () => {
    // Redirección directa al endpoint get del backend
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
      {/* Contenedor Principal */}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        <div className="p-8">
          {/* Encabezado */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
              {isLogin ? 'Iniciar sesión' : 'Crear una cuenta'}
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              {isLogin ? 'Ingresa tus credenciales para continuar' : 'Completa los datos para registrarte'}
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-gray-800"
                  placeholder="ejemplo@correo.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-gray-800"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm font-semibold"
              >
                <X size={16} /> Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-semibold"
              >
                {isLogin ? <LogIn size={16} /> : <UserPlus size={16} />}
                {isLogin ? 'Login' : 'Aceptar'}
              </button>
            </div>
          </form>

          {/* Separador */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400 tracking-wider">o continuar con</span>
            </div>
          </div>

          {/* Botón de Google Estilo Oficial */}
          <button
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg bg-white hover:shadow-md hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium text-sm"
          >
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google" 
              className="w-5 h-5"
            />
            Sign in with Google
          </button>

          {/* Cambio de modo (Login/Registro) */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes cuenta?"}
              <button
                onClick={() => { setIsLogin(!isLogin); resetForm(); }}
                className="ml-1 text-blue-600 font-bold hover:underline"
              >
                {isLogin ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}