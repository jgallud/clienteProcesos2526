"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // 1. Crear la instancia solo una vez al montar
        const URL =  "/";
        const socketInstance = io(URL, {
            withCredentials: true,
            autoConnect: true,
            transports: ['websocket', 'polling']
        });

        setSocket(socketInstance);

        // 2. LIMPIEZA CRÍTICA: Se ejecuta al desmontar o antes de re-renderizar
        return () => {
            if (socketInstance) {
                console.log("Desconectando socket antiguo...");
                socketInstance.disconnect();
            }
        };
    }, []); // Array vacío para que solo se ejecute una vez

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);