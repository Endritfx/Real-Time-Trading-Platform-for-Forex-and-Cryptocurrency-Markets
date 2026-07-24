import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import { FcGoogle } from "react-icons/fc";
import { register, login, googleLogin } from "../services/auth";

export default function Login() {

  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister() {
    if (!username || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      await register(username, email, password);
      navigate("/MarketSelect");
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleLogin() {
    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }
    try {
      await login(email, password);
      navigate("/MarketSelect");
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleGoogleLogin() {
    try {
      await googleLogin();
      navigate("/MarketSelect");
    } catch (error) {
      alert(error.message);
    }
  }
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Welcome</h1>
          <p>
            {isLogin
              ? "Sign in to access your account."
              : "Create your account to get started."}
          </p>
        </div>
        <div className="login-tabs">
          <button className={isLogin ? "active" : ""} onClick={() => setIsLogin(true)} >
            Login
          </button>
          <button className={!isLogin ? "active" : ""} onClick={() => setIsLogin(false)}>
            Register
          </button>
        </div>
        <div className="login-form">
          {!isLogin && (
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          )}
          <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {isLogin ? (
            <button className="main-btn" onClick={handleLogin}>
              Login
            </button>
          ) : (
            <button className="main-btn" onClick={handleRegister}>
              Create Account
            </button>
          )}
          <div className="divider">
            <span>or</span>
          </div>
          <button className="google" onClick={handleGoogleLogin}>
            <FcGoogle size={22} />
            <span>
              Continue with Google
            </span>
          </button>
        </div>
        <div className="bottom-text">
          {isLogin ? (
            <>
              Don't have an account?
              <span onClick={() => setIsLogin(false)}>
                Register
              </span>
            </>
          ) : (
            <>
              Already have an account?
              <span onClick={() => setIsLogin(true)}>
                Login
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}