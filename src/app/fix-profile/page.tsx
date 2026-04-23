"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fixUserProfile } from "./actions";

export default function FixProfilePage() {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFix = async () => {
    setLoading(true);
    setStatus("Creating your profile...");

    try {
      const result = await fixUserProfile();

      if (result.error) {
        setStatus(`Error: ${result.error}`);
        setLoading(false);
        return;
      }

      setStatus(`✓ Profile created successfully! Welcome, ${result.displayName}!`);

      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 1500);
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-3xl font-bold">Fix User Profile</h1>
        <p className="text-gray-400">
          If your username and avatar are not showing in the header, click the button below to create your profile.
        </p>

        <button
          onClick={handleFix}
          disabled={loading}
          className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Fixing..." : "Fix My Profile"}
        </button>

        {status && (
          <div className={`mt-4 p-4 rounded-lg text-sm ${
            status.includes('Error') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
          }`}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
