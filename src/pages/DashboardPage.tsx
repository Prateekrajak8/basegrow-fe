import { useNavigate } from "react-router-dom";
import { clearToken } from "@/features/auth/auth";

export function DashboardPage() {
  const navigate = useNavigate();

  function logout() {
    clearToken();
    navigate("/login");
  }

  return (
    <div className="container">
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ marginTop: 0 }}>Dashboard (React Migration Start)</h2>
        <p style={{ color: "#475569" }}>
          This is the first migrated frontend shell. Next step is porting analytics, event, and campaign modules.
        </p>
        <button className="button" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}
