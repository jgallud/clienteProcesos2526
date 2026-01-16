"use client";
import React, { useEffect, useState } from 'react';
import { LogOut, User, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { toast } from "react-hot-toast";
import { useRouter } from 'next/navigation';
import { useSocket } from '@/context/SocketContext';
import GoBoard from "./GoBoard";
import GoBoardIA from "./GoBoardIA";
import { mejorJugadaIA } from "@/game/ia";
import { simularJugada } from "@/game/goUtils";

export default function DashboardPage() {
    const [userEmail, setUserEmail] = useState("");
    const url = process.env.urlConfirmar;

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const socket = useSocket();
    const [codigoPartida, setCodigoPartida] = useState('');
    const [inputCodigo, setInputCodigo] = useState('');
    const [listaPartidas, setListaPartidas] = useState([]);
    const [enJuego, setEnJuego] = useState(false);
    const [toastMsg, setToastMsg] = useState(null);
    const [partidaLista, setPartidaLista] = useState(false);
    const [estadoPartida, setEstadoPartida] = useState({
        tablero: Array(9).fill(null).map(() => Array(9).fill(0)),
        turno: "1",
        capturas: {
            negro: 0,
            blanco: 0,
        },
    });
    const [miColor, setMiColor] = useState("black"); // asignado al crear/unir
    // estado del juego local vs IA
    const [enJuegoIA, setEnJuegoIA] = useState(false);
    const [estadoIA, setEstadoIA] = useState({
        tablero: Array(9).fill(null).map(() => Array(9).fill(0)), // 9x9 vacío
        turno: "1", // o blanco dependiendo de la convención
        capturas: { negro: 0, blanco: 0 },
    });

    const [modoJuego, setModoJuego] = useState(null); // null | 'ONLINE' | 'IA'


    function colocarPiedraHumano(y, x) {
        setEstadoIA(prev => {
            if (prev.turno !== 1) return prev;

            const sim = simularJugada(prev.tablero, y, x, 1);
            if (!sim.valida) return prev;

            return {
                ...prev,
                tablero: sim.tablero,
                turno: 2,
                capturas: {
                    ...prev.capturas,
                    negro: prev.capturas.negro + sim.capturas
                }
            };
        });

        setTimeout(colocarPiedraIA, 400);
    }

    function colocarPiedraIA() {
        setEstadoIA(prev => {
            if (prev.turno !== 2) return prev;

            const jugada = mejorJugadaIA(prev.tablero);
            if (!jugada) return prev;

            const [y, x] = jugada;
            const sim = simularJugada(prev.tablero, y, x, 2);

            return {
                ...prev,
                tablero: sim.tablero,
                turno: 1,
                capturas: {
                    ...prev.capturas,
                    blanco: prev.capturas.blanco + sim.capturas
                }
            };
        });
    }

    useEffect(() => {
        const comprobarAcceso = async () => {
            try {
                // const res = await fetch(`/verificarSesion`, {
                //     method: 'GET',
                //     credentials: 'include',
                //     cache: 'no-store',
                // });
                const res = document.cookie.includes("email");
                const cookies = Object.fromEntries(
                    document.cookie.split("; ").map(c => {
                        const [key, value] = c.split("=");
                        return [key, decodeURIComponent(value)];
                    })
                );
                console.log("Cookies en dashboard:", cookies);
                if (res) {
                    const user = cookies;
                    console.log("Datos de usuario:", cookies);
                    setUser(user);
                    setUserEmail(user.email);
                    setLoading(false);
                } else {
                    router.push('/');
                }
            } catch (error) {
                console.error("Error verificando sesión", error);
                router.push('/');
            }
        };

        comprobarAcceso();
    }, [socket]); // <--- Ejecutar al montar, no depende de socket

    // --- NUEVO EFFECT: ESCUCHA DE EVENTOS ---
    // Este useEffect se encarga solo de "oír" lo que dice el servidor
    useEffect(() => {
        if (!socket) return;
        socket.on('partidaCreada', (datos) => {
            console.log("Socketon partidaCreada datos:", datos);
            setCodigoPartida(datos.codigo);
            setMiColor(datos.color);
            setEnJuego(true);
        });

        socket.on('errorPartida', (msj) => alert(msj));

        socket.on('actualizarListaPartidas', (partidas) => {
            console.log("Lista de partidas recibida:", partidas);
            // 'partidas' debe ser un array de objetos o strings
            setListaPartidas(partidas);
        });

        socket.on('unidoAPartida', (data) => {
            console.log("Te has unido con éxito:", data);
            // 1. Extraemos el código (manejando si viene como objeto o string)
            const codigo = typeof data === 'object' ? data.codigo : data;
            // 2. Actualizamos el estado para que la UI cambie
            setCodigoPartida(codigo);
            setMiColor(data.color);
            // 3. (Opcional) Aquí podrías redirigir al usuario a la pantalla del juego
            // router.push(`/dashboard/partida/${codigo}`);
        });

        socket.on('iniciarPartida', (data) => {
            setListaPartidas([]);
            setEnJuego(true);
            setPartidaLista(true);
            //setEstadoPartida(data);
            setEstadoPartida({ tablero: data.tablero, turno: data.turno, capturas: data.capturas });
            //setMiColor(data.miColor);
        });

        // Actualizar estado del tablero
        socket.on("estadoPartida", (data) => {
            setEstadoPartida({ tablero: data.tablero, turno: data.turno });
        });

        socket.on("jugadaRealizada", (estado) => {
            const nuevoTablero = estado.tablero.map(f => [...f]);
            setEstadoPartida({ ...estado, tablero: nuevoTablero });
        });

        // Jugada inválida (opcional: toast)
        socket.on("jugadaInvalida", ({ motivo }) => {
            if (motivo === "NO_TU_TURNO") {
                toast("No es tu turno");
            }
            if (motivo === "CASILLA_OCUPADA") {
                toast("Esa casilla ya está ocupada");
            }
        });

        socket.on('partidaAbandonada', (data) => {
            //console.log("Partida abandonada:", data);
            //console.log("Usuario que abandonó:", userEmail);
            if (data.id !== socket.id) {
                setToastMsg('El otro jugador ha abandonado la partida');
            }
            // Volvemos al dashboard inicial
            setEnJuego(false);
            setCodigoPartida('');
            setInputCodigo('');
            setListaPartidas([]);
            setMiColor("");
            setEstadoPartida({
                tablero: Array(9).fill(Array(9).fill(null)),
                turno: null
            });
        });


        return () => {
            socket.off('partidaCreada');
            socket.off('errorPartida');
            socket.off('actualizarListaPartidas');
            socket.off('unidoAPartida');
            socket.off('iniciarPartida');
            socket.off('partidaAbandonada');
            socket.off("estadoPartida");
            socket.off("jugadaInvalida");
        };
    }, [socket]);

    // --- MÉTODOS PARA TUS BOTONES ---
    const crear = () => {
        socket.emit('crearPartida', { email: userEmail });
    };

    const unir = (codigoInput) => {
        socket.emit('unirAPartida', { email: userEmail, codigo: codigoInput });
    };

    const colocarPiedra = (x, y) => {
        // Solo si es tu turno
        //console.log("CLICK EN:", x, y);
        if (miColor !== estadoPartida.turno) return;
        console.log("miColor:", miColor, "turno:", estadoPartida.turno);
        // Emitimos al backend
        socket.emit("colocarPiedra", { email: userEmail, codigo: codigoPartida, x, y });
    };


    const abandonar = () => {
        if (!socket) return;

        socket.emit("abandonarPartida", {
            email: userEmail,
            codigo: codigoPartida
        });

        // RESET TOTAL DEL ESTADO DE LA PARTIDA
        setCodigoPartida('');
        setEnJuego(false);
        setPartidaLista(false);
        setEstadoPartida({
            tablero: Array(9).fill(Array(9).fill(null)),
            turno: null
        });
        setMiColor(null);
    };

    const iniciarPartidaIA = () => {
        // Tablero vacío 9x9
        const tableroInicial = Array(9).fill(null).map(() => Array(9).fill(0)); // usar 0 para vacío

        setEstadoIA({
            tablero: tableroInicial,
            turno: 1, // humano empieza
            capturas: { negro: 0, blanco: 0 }
        });

        setEnJuegoIA(true);     // activa render de IA
        console.log("estadoIA después de iniciar:", tableroInicial);
    };

    // ... (Todo tu código anterior de useEffects y funciones)
    useEffect(() => {
        if (!toastMsg) return;

        const timeout = setTimeout(() => {
            setToastMsg(null);
        }, 2000);

        return () => clearTimeout(timeout);
    }, [toastMsg]);

    if (loading) return <div className="p-10 text-center">Verificando sesión...</div>;

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-700">

            {/* ================= CABECERA ================= */}
            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tighter uppercase">
                        {enJuego || enJuegoIA ? "🕹️ En Partida" : "🌐 Control de Partidas"}
                    </h1>
                    <p className="text-gray-500 text-sm font-medium">{userEmail}</p>
                </div>

                {codigoPartida && (
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Código Sala
                        </span>
                        <span className="text-2xl font-mono font-black text-indigo-600 tracking-widest leading-none">
                            {codigoPartida}
                        </span>
                    </div>
                )}
            </div>

            {/* ================= PARTIDA ONLINE ================= */}
            {enJuego && (
                <div className="bg-gray-900 rounded-[3rem] p-12 min-h-[400px]
                      flex flex-col items-center justify-center
                      border-[12px] border-gray-800 shadow-2xl">

                    {!partidaLista && (
                        <>
                            <h2 className="text-white text-3xl font-black mb-8">
                                Esperando al otro jugador...
                            </h2>
                            <button
                                onClick={abandonar}
                                className="mt-6 text-gray-400 hover:text-red-400 font-bold"
                            >
                                Abandonar partida
                            </button>
                        </>
                    )}

                    {partidaLista && (
                        <>
                            {/* ===== MARCADOR DE CAPTURAS ===== */}
                            <div className="flex gap-8 mb-4 text-white font-bold text-lg">
                                <div>⚫ Negro: {estadoPartida.capturas?.negro ?? 0}</div>
                                <div>⚪ Blanco: {estadoPartida.capturas?.blanco ?? 0}</div>
                            </div>
                            {/* ===== Indicador de Turno ===== */}
                            <div className="flex items-center gap-3 mb-6">
                                <div
                                    className="w-6 h-6 rounded-full"
                                    style={{
                                        backgroundColor: estadoPartida.turno === "black" ? "#000" : "#fff",
                                        border: "2px solid #999",
                                        boxShadow:
                                            estadoPartida.turno === "black"
                                                ? "0 0 0 2px #fff"
                                                : "0 0 0 2px #000",
                                    }}
                                />
                                <span className="text-white font-bold text-lg">
                                    Turno: {estadoPartida.turno === "black" ? "Negras" : "Blancas"}
                                </span>
                            </div>

                            <GoBoard
                                tablero={estadoPartida.tablero}
                                turno={estadoPartida.turno}
                                miColor={miColor}
                                onClickCelda={colocarPiedra}
                            />

                            <button
                                onClick={abandonar}
                                className="mt-8 text-gray-400 hover:text-red-400 font-bold"
                            >
                                Abandonar partida
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* ================= PARTIDA IA ================= */}
            {!enJuego && enJuegoIA && estadoIA && (
                <div className="bg-gray-900 rounded-[3rem] p-12 min-h-[400px]
                      flex flex-col items-center justify-center
                      border-[12px] border-gray-800 shadow-2xl">
                    <div className="flex gap-8 mb-6 text-white font-bold">
                        <div>⚫ Negro: {estadoIA.capturas.negro}</div>
                        <div>⚪ Blanco: {estadoIA.capturas.blanco}</div>
                    </div>

                    <GoBoardIA
                        tablero={estadoIA.tablero}
                        onClickCelda={colocarPiedraHumano}
                    />

                    <button
                        onClick={() => setEnJuegoIA(false)}
                        className="mt-8 text-gray-400 hover:text-red-400 font-bold"
                    >
                        Abandonar partida
                    </button>
                </div>
            )}

            {/* ================= LOBBY ================= */}
            {!enJuego && !enJuegoIA && (
                <div className="space-y-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Crear partida */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold mb-4">Nueva Partida</h2>
                            <p className="text-gray-500 mb-6 text-sm">
                                Crea una sala privada y espera a que otros se unan.
                            </p>
                            <button
                                onClick={crear}
                                disabled={!!codigoPartida}
                                className={`w-full py-4 rounded-xl font-bold transition-all ${codigoPartida
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 shadow-lg"
                                    }`}
                            >
                                {codigoPartida ? "Esperando oponente..." : "Crear Sala Ahora"}
                            </button>
                        </div>

                        {/* Unirse */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold mb-4">Unirse con Código</h2>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="EJ: AB1234"
                                    value={inputCodigo}
                                    onChange={(e) => setInputCodigo(e.target.value)}
                                    className="flex-1 bg-gray-50 rounded-xl px-4 font-mono font-bold"
                                />
                                <button
                                    onClick={() => unir(inputCodigo)}
                                    className="bg-gray-900 text-white px-6 py-4 rounded-xl font-bold"
                                >
                                    Ir
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* IA */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold mb-4">Partida contra la Máquina</h2>
                        <p className="text-gray-500 mb-6 text-sm">Juega un Go 9x9 contra la IA local.</p>
                        <button
                            onClick={iniciarPartidaIA}
                            className="w-full py-4 rounded-xl font-bold bg-green-600 text-white hover:bg-green-700 shadow-green-200 shadow-lg"
                        >
                            Jugar ahora
                        </button>
                    </div>

                </div>
            )}

            {/* ================= TOAST ================= */}
            {toastMsg && (
                <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-xl">
                    {toastMsg}
                </div>
            )}

        </div>
    );

}