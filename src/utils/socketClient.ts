import { default as io, Socket as SocketType } from 'socket.io-client';

let socket: typeof SocketType | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      autoConnect: true,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};