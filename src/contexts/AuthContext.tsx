import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  password?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('pqp_current_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('pqp_current_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setError(null);
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const users: User[] = JSON.parse(localStorage.getItem('pqp_users') || '[]');
        const found = users.find(u => u.email === email && u.password === pass);
        if (found) {
          const { password, ...safeUser } = found;
          setUser(safeUser as User);
          localStorage.setItem('pqp_current_user', JSON.stringify(safeUser));
          resolve();
        } else {
          setError('ईमेल या पासवर्ड गलत है।');
          reject(new Error('Invalid credentials'));
        }
      }, 800);
    });
  };

  const signup = async (name: string, email: string, pass: string) => {
    setError(null);
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const users: User[] = JSON.parse(localStorage.getItem('pqp_users') || '[]');
        if (users.find(u => u.email === email)) {
          setError('यह ईमेल पहले से पंजीकृत है।');
          reject(new Error('User exists'));
          return;
        }
        const newUser: User = { id: Date.now().toString(), name, email, password: pass };
        users.push(newUser);
        localStorage.setItem('pqp_users', JSON.stringify(users));
        
        const { password, ...safeUser } = newUser;
        setUser(safeUser as User);
        localStorage.setItem('pqp_current_user', JSON.stringify(safeUser));
        resolve();
      }, 800);
    });
  };

  const logout = () => {
    localStorage.removeItem('pqp_current_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
