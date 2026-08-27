import axios from "axios";

// Use the Vite dev-server proxy so the browser never makes a cross-origin
// request to the FastAPI server. This avoids CORS issues on localhost/127.0.0.1.
const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export default api;
