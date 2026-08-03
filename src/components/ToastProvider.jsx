"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      reverseOrder={false}
      toastOptions={{
        style: {
          borderRadius: "12px",
          background: "#fff",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          padding: "14px 20px",
          fontFamily: "'Inter', sans-serif",
        },
        success: {
          iconTheme: {
            primary: "#d87c3c",
            secondary: "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: "#c73a2b",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}
