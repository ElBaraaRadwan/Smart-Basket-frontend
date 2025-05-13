import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type UserRole = "USER" | "ADMIN" | "DRIVER" | "STORE_OWNER";

interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  roles: UserRole[];
  createdAt: Date;
  updatedAt: Date;
  isEmailVerified: boolean;
  avatarUrl?: string;
  favoriteCategories?: string[];
  isStoreOwner: boolean;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(loginInput: { email: $email, password: $password }) {
      accessToken
      refreshToken
      user {
        _id
        firstName
        lastName
        email
        phoneNumber
        roles
        isEmailVerified
        avatarUrl
        favoriteCategories
        createdAt
        updatedAt
        isStoreOwner
      }
    }
  }
`;

const SIGNUP = gql`
  mutation Signup(
    $firstName: String!
    $lastName: String!
    $email: String!
    $password: String!
    $phoneNumber: String!
  ) {
    signup(
      signupInput: {
        firstName: $firstName
        lastName: $lastName
        email: $email
        password: $password
        phoneNumber: $phoneNumber
      }
    ) {
      accessToken
      refreshToken
      user {
        _id
        firstName
        lastName
        email
        phoneNumber
        roles
        isEmailVerified
        avatarUrl
        favoriteCategories
        createdAt
        updatedAt
        isStoreOwner
      }
    }
  }
`;

const REFRESH_TOKEN = gql`
  mutation RefreshToken($token: String!) {
    refreshToken(token: $token) {
      accessToken
      refreshToken
    }
  }
`;

const LOGOUT = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`;

const ME = gql`
  query Me {
    me {
      _id
      firstName
      lastName
      email
      phoneNumber
      roles
      isEmailVerified
      avatarUrl
      favoriteCategories
      createdAt
      updatedAt
      isStoreOwner
    }
  }
`;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: Error | null;
  isAdmin: boolean;
  isStoreOwner: boolean;
  isDriver: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  const [loginMutation] = useMutation(LOGIN);
  const [signupMutation] = useMutation(SIGNUP);
  const [refreshTokenMutation] = useMutation(REFRESH_TOKEN);
  const [logoutMutation] = useMutation(LOGOUT);
  const { data: userData, loading: userLoading } = useQuery(ME);

  useEffect(() => {
    if (userData?.me) {
      setUser(userData.me);
    }
    setLoading(userLoading);
  }, [userData, userLoading]);

  const handleAuthResponse = (response: AuthResponse) => {
    localStorage.setItem("token", response.accessToken);
    localStorage.setItem("refreshToken", response.refreshToken);
    setUser(response.user);
  };

  const login = async (email: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: { email, password },
      });
      handleAuthResponse(data.login);
      navigate("/");
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const signup = async (input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
  }) => {
    try {
      const { data } = await signupMutation({
        variables: input,
      });
      handleAuthResponse(data.signup);
      navigate("/");
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation();
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      setUser(null);
      navigate("/login");
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const refreshToken = async () => {
    const token = localStorage.getItem("refreshToken");
    if (token) {
      try {
        const { data } = await refreshTokenMutation({
          variables: { token },
        });
        localStorage.setItem("token", data.refreshToken.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken.refreshToken);
      } catch (err) {
        logout();
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1])) as JwtPayload;
      if (payload.exp * 1000 < Date.now()) {
        refreshToken();
      }
    }
  }, []);

  // Add role-based helper properties
  const isAdmin = user?.roles.includes("ADMIN") ?? false;
  const isStoreOwner = user?.roles.includes("STORE_OWNER") ?? false;
  const isDriver = user?.roles.includes("DRIVER") ?? false;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        loading,
        error,
        isAdmin,
        isStoreOwner,
        isDriver,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
