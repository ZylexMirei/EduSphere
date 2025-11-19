import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api'; 
const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 


  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          // Le decimos a Axios que use este token en todas las futuras peticiones
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Error al cargar usuario de localStorage:", error);
        localStorage.clear(); // Limpia si está corrupto
      }
      setLoading(false); // Termina de cargar
    };
    loadUserFromStorage();
  }, []);

  // 4. Función de Login (que usará la página de Login)
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user); // Actualiza el estado global
      
      return response; 
    } catch (error) {
      throw error;
    }
  };

  // 5. Función de Logout (que usará el Dashboard)
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    api.defaults.headers.common['Authorization'] = null;
    setUser(null); // Borra al usuario del estado global
  };

  // 6. Si aún está cargando, muestra una pantalla de carga (EVITA EL CRASH)
  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B1120', color: 'white', fontFamily: 'Inter, sans-serif' }}>
        <h2>Cargando EduSphere...</h2>
      </div>
    );
  }

  // 7. Pone los datos a disposición de toda la app
  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};



export const useAuth = () => {
  return useContext(AuthContext);
};