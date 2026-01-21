'use client';

import { io, type Socket } from 'socket.io-client';

// Singleton socket instance
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      // Auto-connect to the same host
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
