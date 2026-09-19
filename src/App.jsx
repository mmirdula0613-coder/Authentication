import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5010/api/auth";

function App() {
  const [page, setPage] = useState("login");

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await fetch(`${API_URL}/me`, {
        method: "GET",
        credentials: "include"
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleSignup = async (name, email, password) => {
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setUser(data.user);

    } catch (error) {
      console.error(error);
      alert("Unable to connect to server");
    }
  };


  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setUser(data.user);

    } catch (error) {
      console.error(error);
      alert("Unable to connect to server");
    }
  };


  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include"
      });

      setUser(null);
      setPage("login");

    } catch (error) {
      console.error(error);
    }
  };


  if (loading) {
    return (
      <div className="loading-screen">
        Checking authentication...
      </div>
    );
  }


  if (user) {
    return (
      <div className="dashboard">
        <div className="dashboard-card">

          <div className="success-icon">
            ✓
          </div>

          <h1>Welcome, {user.name}!</h1>

          <p className="subtitle">
            You are successfully authenticated.
          </p>

          <div className="user-info">

            <div className="info-row">
              <span>Name</span>
              <strong>{user.name}</strong>
            </div>

            <div className="info-row">
              <span>Email</span>
              <strong>{user.email}</strong>
            </div>

            <div className="info-row">
              <span>Authentication</span>
              <strong className="authenticated">
                Cookie Authenticated
              </strong>
            </div>

          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>
      </div>
    );
  }


  return (
    <div className="auth-container">

      <div className="auth-card">

        <div className="logo">
          AUTH<span>.</span>
        </div>

        <h1>
          {page === "login"
            ? "Welcome back"
            : "Create your account"}
        </h1>

        <p className="subtitle">
          {page === "login"
            ? "Login to continue to your account"
            : "Sign up to get started"}
        </p>


        {page === "login" ? (
          <LoginForm
            onLogin={handleLogin}
            onSwitch={() => setPage("signup")}
          />
        ) : (
          <SignupForm
            onSignup={handleSignup}
            onSwitch={() => setPage("login")}
          />
        )}

      </div>

    </div>
  );
}


// ==========================
// LOGIN FORM
// ==========================

function LoginForm({ onLogin, onSwitch }) {

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);


  const submit = async (e) => {
    e.preventDefault();

    setLoading(true);

    await onLogin(email, password);

    setLoading(false);
  };


  return (
    <form onSubmit={submit}>

      <div className="input-group">

        <label>Email</label>

        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

      </div>


      <div className="input-group">

        <label>Password</label>

        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

      </div>


      <button
        className="primary-button"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>


      <p className="switch-text">
        Don't have an account?
        <button
          type="button"
          className="link-button"
          onClick={onSwitch}
        >
          Sign up
        </button>
      </p>

    </form>
  );
}


// ==========================
// SIGNUP FORM
// ==========================

function SignupForm({ onSignup, onSwitch }) {

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);


  const submit = async (e) => {

    e.preventDefault();

    setLoading(true);

    await onSignup(
      name,
      email,
      password
    );

    setLoading(false);
  };


  return (
    <form onSubmit={submit}>

      <div className="input-group">

        <label>Full Name</label>

        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

      </div>


      <div className="input-group">

        <label>Email</label>

        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

      </div>


      <div className="input-group">

        <label>Password</label>

        <input
          type="password"
          placeholder="Minimum 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength="6"
          required
        />

      </div>


      <button
        className="primary-button"
        disabled={loading}
      >
        {loading ? "Creating account..." : "Create account"}
      </button>


      <p className="switch-text">
        Already have an account?
        <button
          type="button"
          className="link-button"
          onClick={onSwitch}
        >
          Login
        </button>
      </p>

    </form>
  );
}


export default App;