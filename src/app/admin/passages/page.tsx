"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface PoolStatus {
  difficulty: string;
  length: string;
  theme: string;
  challengeType: string;
  count: number;
}

export default function AdminPassagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [poolStatus, setPoolStatus] = useState<PoolStatus[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [minPoolSize, setMinPoolSize] = useState(5);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const fetchPoolStatus = async () => {
    try {
      const response = await fetch("/api/worker/generate-pool");
      const data = await response.json();
      setPoolStatus(data.poolStatus || []);
      setMinPoolSize(data.minPoolSize || 5);
    } catch (error) {
      console.error("Failed to fetch pool status:", error);
      setMessage("Failed to fetch pool status");
    }
  };

  useEffect(() => {
    fetchPoolStatus();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setMessage("Generating passages...");

    try {
      const response = await fetch("/api/worker/generate-pool", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Success! Generated ${data.generated} passages`);
        await fetchPoolStatus();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Failed to generate passages:", error);
      setMessage("Failed to generate passages");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const lowStockCombinations = poolStatus.filter(p => p.count < minPoolSize);
  const totalPassages = poolStatus.reduce((sum, p) => sum + p.count, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Passage Pool Management</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="text-sm text-foreground/60 mb-2">Total Passages</div>
          <div className="text-3xl font-bold text-primary">{totalPassages}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="text-sm text-foreground/60 mb-2">Combinations</div>
          <div className="text-3xl font-bold text-primary">{poolStatus.length}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="text-sm text-foreground/60 mb-2">Low Stock</div>
          <div className="text-3xl font-bold text-yellow-500">{lowStockCombinations.length}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Actions</h2>
        <div className="flex gap-4 items-center">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? "Generating..." : "Generate Passages"}
          </button>
          <button
            onClick={fetchPoolStatus}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all"
          >
            Refresh Status
          </button>
        </div>
        {message && (
          <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg">
            {message}
          </div>
        )}
      </div>

      {/* Low Stock Alert */}
      {lowStockCombinations.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-yellow-500">
            ⚠️ Low Stock Combinations ({lowStockCombinations.length})
          </h2>
          <div className="space-y-2">
            {lowStockCombinations.slice(0, 10).map((combo, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span>
                  {combo.difficulty} / {combo.length} / {combo.theme} / {combo.challengeType}
                </span>
                <span className="text-yellow-500 font-bold">{combo.count} passages</span>
              </div>
            ))}
            {lowStockCombinations.length > 10 && (
              <div className="text-sm text-foreground/60">
                ... and {lowStockCombinations.length - 10} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pool Status Table */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Pool Status</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4">Difficulty</th>
                <th className="text-left py-3 px-4">Length</th>
                <th className="text-left py-3 px-4">Theme</th>
                <th className="text-left py-3 px-4">Challenge Type</th>
                <th className="text-right py-3 px-4">Count</th>
                <th className="text-right py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {poolStatus.map((combo, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 capitalize">{combo.difficulty}</td>
                  <td className="py-3 px-4 capitalize">{combo.length}</td>
                  <td className="py-3 px-4 capitalize">{combo.theme}</td>
                  <td className="py-3 px-4 capitalize">{combo.challengeType}</td>
                  <td className="py-3 px-4 text-right font-bold">{combo.count}</td>
                  <td className="py-3 px-4 text-right">
                    {combo.count >= minPoolSize ? (
                      <span className="text-green-500">✓ OK</span>
                    ) : (
                      <span className="text-yellow-500">⚠ Low</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-white/5 border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Setup Instructions</h2>
        <div className="space-y-4 text-sm text-foreground/80">
          <div>
            <h3 className="font-bold mb-2">Manual Generation:</h3>
            <code className="block bg-black/40 p-3 rounded">
              node scripts/generate-passages.js
            </code>
          </div>
          <div>
            <h3 className="font-bold mb-2">Cron Job (Hourly):</h3>
            <code className="block bg-black/40 p-3 rounded">
              0 * * * * cd /path/to/fishtyping && node scripts/generate-passages.js
            </code>
          </div>
          <div>
            <h3 className="font-bold mb-2">Vercel Cron:</h3>
            <code className="block bg-black/40 p-3 rounded whitespace-pre">
{`{
  "crons": [{
    "path": "/api/worker/generate-pool",
    "schedule": "0 * * * *"
  }]
}`}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
