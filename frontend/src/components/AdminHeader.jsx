// src/components/AdminHeader.jsx
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AdminHeader() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link
          to="/admin/events"
          className="text-2xl font-extrabold text-indigo-600 tracking-wide"
        >
          Evently
        </Link>

        {/* Logout Button */}
        <Button
          className="font-bold bg-red-600 hover:bg-red-700 text-white px-5"
          onClick={logout}
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
