import axios from 'axios';

// Creamos una instancia de Axios con la URL de tu backend
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // La dirección de tu servidor
});

// Interceptor: Antes de cada petición, si tienes un token, pégalo
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Buscamos el token en el navegador
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Lo pegamos como "Bearer Token"
  }
  return config;
});

export default api;