import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Categories from "./pages/Categories";
import Authors from "./pages/Authors";
import Members from "./pages/Members";
import Loans from "./pages/Loans";
import Analytics from "./pages/Analytics";
import Users from "./pages/Users";

import api from "./services/api";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("access_token"))
  );

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const [currentUser, setCurrentUser] =
  useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setCurrentUser(null);
        return;
      }

      try {
        const response = await api.get("/auth/me");

        setCurrentUser(response.data);
      } catch (error) {
        console.error(error);

        localStorage.removeItem("access_token");
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    };

    fetchCurrentUser();
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsAuthenticated(false);
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login onLogin={handleLogin} />
          )
        }
      />

      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <Dashboard
              onLogout={handleLogout}
              currentUser={currentUser}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated ? "/dashboard" : "/login"}
            replace
          />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? "/dashboard" : "/login"}
            replace
          />
        }
      />

      <Route
        path="/books"
        element={
          isAuthenticated ? (
            <Books
              onLogout={handleLogout}
              currentUser={currentUser}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/categories"
        element={
          isAuthenticated ? (
            <Categories
              onLogout={handleLogout}
              currentUser={currentUser}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/authors"
        element={
          isAuthenticated ? (
            <Authors
              onLogout={handleLogout}
              currentUser={currentUser}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/members"
        element={
          isAuthenticated ? (
            <Members
              onLogout={handleLogout}
              currentUser={currentUser}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/loans"
        element={
          isAuthenticated ? (
            <Loans
              onLogout={handleLogout}
              currentUser={currentUser}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/analytics"
        element={
          isAuthenticated ? (
            <Analytics
              onLogout={handleLogout}
              currentUser={currentUser}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/users"
        element={
          isAuthenticated ? (
            <Users
              onLogout={handleLogout}
              currentUser={currentUser}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>

    
  );
}

export default App;