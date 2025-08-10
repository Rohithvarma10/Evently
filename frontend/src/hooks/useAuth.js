// src/hooks/useAuth.js
export default function useAuth() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  return {
    token,
    role,
    isAuthed: Boolean(token),
    isAdmin: role === "admin",
  };
}
