"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Login: React.FC = () => {
   const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/"); // Redirect to dashboard if already logged in
    }
  }, []);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data,"data of login user")
        const { token } = data;
        localStorage.setItem("token", token);
        localStorage.setItem("roleType", data.user.scope);
        localStorage.setItem("userId", data.user.id);
        const roleType = localStorage.getItem("roleType")
          console.log("user scope",roleType)
        // Notify other components of token change
        window.dispatchEvent(new Event("storage"));

        // Force re-render
        // setTimeout(() => {
        //   // window.location.reload(); // Optional: if you need to refresh the page
        //   router.push("/");
        // }, 2000); // 
        router.push("/");
        // if (roleType  === "internal") {
        //   router.push("/");
        // } else if (roleType  === "external") {
        //   router.push("/sheet");
        // } else {
        //   setError("Unknown role type");
        // }
      } else {
        const data = await response.json();
        setError(data.error || "Login failed");
      }
    } catch (error) {
      console.log("Login error:", error);
      setError("An error occurred during login");
    }
  };


  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
       <div className="flex items-center justify-center  py-[20px]">
          {/* <img src="/logo.png" alt="Logo" className="h-6" /> */}
          <h1 className="text-lg font-bold text-gray-800 uppercase">BASEGROW</h1>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="email">Email:</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>
          {error && (
            <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
          )}
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
