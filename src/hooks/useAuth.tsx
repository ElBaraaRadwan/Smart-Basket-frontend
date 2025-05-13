import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  gql,
  useApolloClient,
  useMutation,
  ApolloClient,
  NormalizedCacheObject,
} from "@apollo/client";
import { createApolloClient } from "../lib/apollo-client";
import { LOGIN, REGISTER, LOGOUT } from "../graphql/mutations";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: Error | null;
  apolloClient: ApolloClient<NormalizedCacheObject>;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface Error {
  message: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const apolloClient = createApolloClient(() => token);

  const [loginMutation] = useMutation(LOGIN, { client: apolloClient });
  const [registerMutation] = useMutation(REGISTER, { client: apolloClient });
  const [logoutMutation] = useMutation(LOGOUT, { client: apolloClient });

  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          const decoded = JSON.parse(atob(token.split(".")[1]));
          setUser({
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role || "user",
          });
        } catch (err) {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await loginMutation({
        variables: { input: { email, password } },
      });
      const { token: newToken, user: userData } = response.data.login;

      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);
    } catch (err: any) {
      setError({ message: err.message || "Login failed" });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterInput) => {
    setLoading(true);
    setError(null);

    try {
      const response = await registerMutation({
        variables: { input: userData },
      });
      const { token: newToken, user: newUser } = response.data.register;

      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(newUser);
    } catch (err: any) {
      setError({ message: err.message || "Registration failed" });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);

    try {
      await logoutMutation();
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } catch (err: any) {
      setError({ message: err.message || "Logout failed" });
    } finally {
      setLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    isAuthenticated: !!user,
    user,
    loading,
    error,
    apolloClient,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
