import {
    createContext,
    useContext,
    useEffect,
    useState
  } from 'react';
  
  import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User
  } from 'firebase/auth';
  
  import { auth } from '../backend/firebaseconfig';
  
  type AuthContextType = {
    user: User | null;
    login: (email: string, senha: string) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
  };
  
  const AuthContext = createContext<AuthContextType>(
    {} as AuthContextType
  );
  
  export function AuthProvider({ children }: any) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (usuario) => {
        setUser(usuario);
        setLoading(false);
      });
  
      return unsubscribe;
    }, []);
  
    async function login(email: string, senha: string) {
      await signInWithEmailAndPassword(auth, email, senha);
    }
  
    async function logout() {
      await signOut(auth);
    }
  
    return (
      <AuthContext.Provider
        value={{
          user,
          login,
          logout,
          loading
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }
  
  export function useAuth() {
    return useContext(AuthContext);
  }