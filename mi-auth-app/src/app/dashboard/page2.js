"use client";
import { useState, useEffect, useContext } from 'react';
import { SocketContext } from '@/context/SocketContext';

export default function DashboardPage() {
    const { socket } = useContext(SocketContext);
    const [userEmail, setUserEmail] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Estados de la lógica de juego
    const [codigoPartida, setCodigoPartida] = useState('');
    const [listaPartidas, setListaPartidas] = useState([]);
    const [enJuego, setEnJuego] = useState(false);
    const [inputCodigo, setInputCodigo] = useState('');

    useEffect(() => {
        // 1. Verificar sesión al cargar
        const checkSession = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verificarSesion`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setUserEmail(data.email);
                } else {
                    window.location.href = '/';
                }
            } catch (error) {
                console.error("Error verificando sesión", error);
            } finally {
                setLoading(false);
            }
        };
        checkSession();
    }, []);

    useEffect(() => {
        if (!socket) return;

        // 2. Listeners de Socket.io
        socket.on('partidaCreada', (data) => {
            const codigo = typeof data === 'object' ? data.codigo : data;
            setCodigoPartida(codigo);
            setListaPartidas([]); // Limpiamos lista al crear
        });

        socket.on('unidoAPartida', (data) => {
            const codigo = typeof data === 'object' ? data.codigo : data;
            setCodigoPartida(codigo);
            setListaPartidas([]); // Limpiamos lista al unirnos
        });

        socket.on('iniciarPartida', (datos) => {
            console.log("Iniciando juego...", datos);
            setEnJuego(true);
            setListaPartidas([]);
        });

        socket.on('actualizarListaPartidas', (partidas) => {
            // Solo actualizamos si no estamos ya en una partida
            if (!codigoPartida && !enJuego) {
                setListaPartidas(partidas);
            }
        });

        socket.on('errorPartida', (msj) => {
            alert(msj);
        });

        return () => {
            socket.off('partidaCreada');
            socket.off('unidoAPartida');
            socket.off('iniciarPartida');
            socket.off('actualizarListaPartidas');
            socket.off('errorPartida');
        };
    }, [socket, codigoPartida, enJuego]);

    // 3. Funciones de acción
    const crear = () => {
        socket.emit('crearPartida', { email: userEmail });
    };

    const unir = (codigo) => {
        const c = codigo || inputCodigo;
        if (!c) return alert("Código necesario");
        socket.emit('unirAPartida', { email: userEmail, codigo: c.toUpperCase() });
    };

    const abandonar = () => {
        socket.emit('abandonarPartida', { email: userEmail, codigo: codigoPartida });
        setCodigoPartida('');
        setEnJuego(false);
        socket.emit('pedirListaPartidas');
    };

    if (loading) return <div className="p-10 text-center font-mono">Cargando sistema...</div>;

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-700">
            {/* --- CABECERA DINÁMICA --- */}
            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tighter uppercase">
                        {enJuego ? "🕹️ En Partida" : "🌐 Lobby Principal"}
                    </h1>
                    <p className="text-gray-500 text-sm font-medium">{userEmail}</p>
                </div>
                {codigoPartida && (
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Código Sala</span>
                        <span className="text-2xl font-mono font-black text-indigo-600 tracking-widest leading-none">
                            {codigoPartida}
                        </span>
                    </div>
                )}
            </div>

            {/* --- CONTENIDO PRINCIPAL --- */}
            {!enJuego ? (
                /* VISTA LOBBY */
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Tarjeta Crear */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <h2 className="text-xl font-bold mb-4">Nueva Partida</h2>
                            <p className="text-gray-500 mb-6 text-sm">Crea una sala privada y espera a que otros se unan.</p>
                            <button 
                                onClick={crear}
                                disabled={!!codigoPartida}
                                className={`w-full py-4 rounded-xl font-bold transition-all ${codigoPartida ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 shadow-lg'}`}
                            >
                                {codigoPartida ? 'Esperando oponente...' : 'Crear Sala Ahora'}
                            </button>
                        </div>

                        {/* Tarjeta Unirse Manual */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold mb-4">Unirse con Código</h2>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="EJ: AB1234"
                                    value={inputCodigo}
                                    onChange={(e) => setInputCodigo(e.target.value)}
                                    className="flex-1 bg-gray-50 border-none rounded-xl px-4 font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                                />
                                <button 
                                    onClick={() => unir()}
                                    className="bg-gray-900 text-white px-6 py-4 rounded-xl font-bold hover:bg-black transition-colors"
                                >
                                    Ir
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* LISTA DE PARTIDAS (Solo si no estamos esperando en una) */}
                    {!codigoPartida && (
                        <div className="pt-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Partidas Públicas
                                </h3>
                                <span className="text-xs font-bold text-gray-400">{listaPartidas.length} Disponibles</span>
                            </div>

                            {listaPartidas.length === 0 ? (
                                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl py-12 text-center text-gray-400">
                                    No hay partidas activas en este momento.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {listaPartidas.map((partida, idx) => {
                                        const codigo = typeof partida === 'object' ? partida.codigo : partida;
                                        return (
                                            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-center group hover:border-indigo-300 transition-colors">
                                                <span className="font-mono font-bold text-lg text-gray-700">{codigo}</span>
                                                <button 
                                                    onClick={() => unir(codigo)}
                                                    className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all"
                                                >
                                                    Unirse
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                /* VISTA JUEGO ACTIVO */
                <div className="bg-gray-900 rounded-[3rem] p-12 min-h-[400px] flex flex-col items-center justify-center border-[12px] border-gray-800 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    
                    <h2 className="text-white text-3xl font-black mb-8 z-10">EL JUEGO HA COMENZADO</h2>
                    
                    {/* Placeholder del Tablero */}
                    <div className="w-64 h-64 bg-gray-800 rounded-2xl border-4 border-indigo-500/30 flex items-center justify-center z-10">
                        <p className="text-indigo-400 font-mono text-xs animate-pulse text-center p-4">
                            [ ESPERANDO LÓGICA DEL TABLERO ]
                        </p>
                    </div>

                    <button 
                        onClick={abandonar}
                        className="mt-12 text-gray-400 hover:text-red-400 font-bold transition-colors z-10"
                    >
                        Salir de la partida
                    </button>
                </div>
            )}
        </div>
    );
}