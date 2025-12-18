import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function getLoginUser() {
  try {
    const raw = localStorage.getItem("loginUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const user = getLoginUser();

  if (!user) {
    // 원래 가려던 경로를 state로 넘김 (로그인 후 다시 돌아오게)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
