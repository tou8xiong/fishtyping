"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-left"
      toastOptions={{
        style: {
          background: "rgba(18, 18, 18, 0.95)",
          border: "1px solid rgba(11, 175, 231, 0.3)",
          color: "#e5e5e5",
          backdropFilter: "blur(12px)",
        },
        className: "font-black",
      }}
    />
  );
}
