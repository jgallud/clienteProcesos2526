"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterWrapper() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#111",
          color: "#fff",
          fontWeight: "bold",
        },
      }}
    />
  );
}
