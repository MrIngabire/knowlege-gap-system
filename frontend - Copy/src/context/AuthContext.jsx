import {
  createContext,
  useEffect,
  useState,
} from "react";

import api from "../api/axios";

export const AuthContext =
  createContext();

export default function AuthProvider({
  children,
}) {

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    loadUser();

  }, []);

  const loadUser =
    async () => {

      try {

        const response =
          await api.get(
            "/users/profile/"
          );

        setUser(
          response.data
        );

      } catch {

        setUser(null);

      } finally {

        setLoading(false);
      }
    };

  return (

    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
      }}
    >

      {children}

    </AuthContext.Provider>
  );
}