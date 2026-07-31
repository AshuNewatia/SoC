import { io } from "socket.io-client";

// Fallback directly to your Render backend URL if environment variable is missing
const SOCKET_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "https://soc-backend-5xba.onrender.com";

const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"], // 🟢 Added polling for production reliability
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  withCredentials: true,
});

export default socket;