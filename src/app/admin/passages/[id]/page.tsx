"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Passage, Language, Difficulty, Length } from "@/lib/supabase/types";
import { MdArrowBack } from "react-icons/md";
import Link from "next/link";

const ADMIN_EMAIL = "touxhk@gmail.com";
const ADMIN_ID = "8OZdxsSF8gY5ysBogP5yqkTMaZI3";

export default function EditPassagePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const passageId = params.id as string;

  const [passage, setPassage] = useState<Passage | null>(null);
  const [formData, setFormData] = useState({
    content: "",
    language: "english" as Language,
    difficulty: "beginner" as Difficulty,
    length: "medium" as Length,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || (user.email !== ADMIN_EMAIL && user.id !== ADMIN_ID)) {
        router.push("/");
      } else {
        fetchPassage();
      }
    }
  }, [user, loading, router, passageId]);

  const fetchPassage = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("passages")
        .select("*")
        .eq("id", passageId)
        .single();

      if (error) throw error;

      setPassage(data);
      setFormData({
        content: data.content,
        language: data.language,
        difficulty: data.difficulty,
        length: data.length,
      });
    } catch (error) {
      console.error("Failed to fetch passage:", error);
      alert("Failed to load passage");
      router.push("/admin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const supabase = createClient();
      const wordCount = formData.content.trim().split(/\s+/).length;

      const { error } = await supabase
        .from("passages")
        .update({
          content: formData.content,
          language: formData.language,
          difficulty: formData.difficulty,
          length: formData.length,
          word_count: wordCount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", passageId);

      if (error) throw error;

      router.push("/admin");
    } catch (error) {
      console.error("Failed to update passage:", error);
      alert("Failed to update passage");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1e1e1e]">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  if (!user || (user.email !== ADMIN_EMAIL && user.id !== ADMIN_ID)) {
    return null;
  }

  if (!passage) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] py-8 px-4">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4"
          >
            <MdArrowBack className="h-5 w-5" />
            Back to Admin
          </Link>
          <h1 className="text-4xl font-black uppercase tracking-wider text-white mb-2">
            Edit Passage
          </h1>
          <p className="text-foreground/60">Modify passage details and content</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/3 border border-white/10 rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-white mb-2">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={12}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-foreground/40 focus:border-primary focus:outline-none resize-y"
              placeholder="Enter passage content..."
            />
            <p className="text-xs text-foreground/50 mt-2">
              Word count: {formData.content.trim() ? formData.content.trim().split(/\s+/).length : 0}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-white mb-2">
                Language *
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value as Language })}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
              >
                <option value="english">English</option>
                <option value="lao">Lao</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-white mb-2">
                Difficulty *
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-white mb-2">
                Length *
              </label>
              <select
                value={formData.length}
                onChange={(e) => setFormData({ ...formData, length: e.target.value as Length })}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href="/admin"
              className="px-6 py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-all text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
