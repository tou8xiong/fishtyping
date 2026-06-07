"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import TablePagination from "@/components/TablePagination";
import type { Passage, Language, Difficulty, Length } from "@/lib/supabase/types";
import { MdAdd, MdClose, MdEdit, MdDelete, MdToggleOn, MdToggleOff } from "react-icons/md";

const ADMIN_EMAIL = "touxhk@gmail.com";
const ADMIN_ID = "8OZdxsSF8gY5ysBogP5yqkTMaZI3";

interface PassageFormData {
  content: string;
  language: Language;
  difficulty: Difficulty;
  length: Length;
  word_count: number;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [passages, setPassages] = useState<Passage[]>([]);
  const [filteredPassages, setFilteredPassages] = useState<Passage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [languageFilter, setLanguageFilter] = useState<Language | "all">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "all">("all");
  const [enabledFilter, setEnabledFilter] = useState<"all" | "enabled" | "disabled">("all");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passageToDelete, setPassageToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formData, setFormData] = useState<PassageFormData>({
    content: "",
    language: "english",
    difficulty: "beginner",
    length: "medium",
    word_count: 0,
  });

  useEffect(() => {
    if (!loading) {
      if (!user || (user.email !== ADMIN_EMAIL && user.id !== ADMIN_ID)) {
        router.push("/");
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && (user.email === ADMIN_EMAIL || user.id === ADMIN_ID)) {
      fetchPassages();
    }
  }, [user]);

  const fetchPassages = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("passages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPassages(data || []);
      setFilteredPassages(data || []);
    } catch (error) {
      console.error("Failed to fetch passages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = passages;

    if (languageFilter !== "all") {
      filtered = filtered.filter((p) => p.language === languageFilter);
    }

    if (difficultyFilter !== "all") {
      filtered = filtered.filter((p) => p.difficulty === difficultyFilter);
    }

    if (enabledFilter !== "all") {
      const wantEnabled = enabledFilter === "enabled";
      filtered = filtered.filter((p) => (p.enabled ?? true) === wantEnabled);
    }

    setFilteredPassages(filtered);
    setPage(1);
  }, [languageFilter, difficultyFilter, enabledFilter, passages]);

  const paginatedPassages = filteredPassages.slice((page - 1) * pageSize, page * pageSize);

  const handleOpenCreate = () => {
    setFormData({
      content: "",
      language: "english",
      difficulty: "beginner",
      length: "medium",
      word_count: 0,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const supabase = createClient();
      const wordCount = formData.content.trim().split(/\s+/).length;

      const { error } = await supabase
        .from("passages")
        .insert({
          content: formData.content,
          language: formData.language,
          difficulty: formData.difficulty,
          length: formData.length,
          word_count: wordCount,
          status: "ready",
          generated_by: "manual",
          used_count: 0,
        });

      if (error) throw error;

      await fetchPassages();
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save passage:", error);
      alert("Failed to save passage");
    }
  };

  const handleEdit = (e: React.MouseEvent, passageId: string) => {
    e.stopPropagation();
    router.push(`/admin/passages/${passageId}`);
  };

  const handleToggleEnabled = async (e: React.MouseEvent, passage: Passage) => {
    e.stopPropagation();
    const next = !(passage.enabled ?? true);
    setPassages((prev) =>
      prev.map((p) => (p.id === passage.id ? { ...p, enabled: next } : p))
    );
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("passages")
        .update({ enabled: next, updated_at: new Date().toISOString() })
        .eq("id", passage.id);
      if (error) throw error;
    } catch (error) {
      console.error("Failed to toggle passage:", error);
      alert("Failed to update passage status");
      setPassages((prev) =>
        prev.map((p) => (p.id === passage.id ? { ...p, enabled: !next } : p))
      );
    }
  };

  const handleDelete = async (e: React.MouseEvent, passageId: string) => {
    e.stopPropagation();
    setPassageToDelete(passageId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!passageToDelete) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("passages")
        .delete()
        .eq("id", passageToDelete);

      if (error) throw error;

      await fetchPassages();
      setShowDeleteModal(false);
      setPassageToDelete(null);
    } catch (error) {
      console.error("Failed to delete passage:", error);
      alert("Failed to delete passage");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPassageToDelete(null);
  };

  if (loading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-xl text-white">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!user || (user.email !== ADMIN_EMAIL && user.id !== ADMIN_ID)) {
    return null;
  }

  const languages: Array<Language | "all"> = ["all", "english", "lao"];
  const difficulties: Array<Difficulty | "all"> = ["all", "beginner", "advanced", "expert"];

  return (
    <AdminLayout>
      <div className="py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <AdminBreadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Passages" }]} />

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
            <div className="bg-white/3 border border-white/10 rounded-md px-3 py-2">
              <div className="text-[10px] uppercase tracking-[0.18em] text-foreground/50">Total</div>
              <div className="text-lg font-bold text-primary">{passages.length}</div>
            </div>
            <div className="bg-white/3 border border-white/10 rounded-md px-3 py-2">
              <div className="text-[10px] uppercase tracking-[0.18em] text-foreground/50">Enabled</div>
              <div className="text-lg font-bold text-green-400">{passages.filter(p => p.enabled ?? true).length}</div>
            </div>
            <div className="bg-white/3 border border-white/10 rounded-md px-3 py-2">
              <div className="text-[10px] uppercase tracking-[0.18em] text-foreground/50">Disabled</div>
              <div className="text-lg font-bold text-red-400">{passages.filter(p => !(p.enabled ?? true)).length}</div>
            </div>
            <div className="bg-white/3 border border-white/10 rounded-md px-3 py-2">
              <div className="text-[10px] uppercase tracking-[0.18em] text-foreground/50">English / Lao</div>
              <div className="text-lg font-bold text-white">
                {passages.filter(p => p.language === 'english').length}
                <span className="text-foreground/40 mx-1">/</span>
                {passages.filter(p => p.language === 'lao').length}
              </div>
            </div>
            <div className="bg-white/3 border border-white/10 rounded-md px-3 py-2">
              <div className="text-[10px] uppercase tracking-[0.18em] text-foreground/50">Filtered</div>
              <div className="text-lg font-bold text-primary">{filteredPassages.length}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/3 border border-white/10 rounded-md px-3 py-2 mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.18em] text-foreground/50">Language</span>
              <div className="flex gap-1">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguageFilter(lang)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${languageFilter === lang
                      ? "bg-primary text-black"
                      : "bg-white/5 text-foreground/60 hover:bg-white/10"
                      }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.18em] text-foreground/50">Difficulty</span>
              <div className="flex gap-1">
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${difficultyFilter === diff
                      ? "bg-primary text-black"
                      : "bg-white/5 text-foreground/60 hover:bg-white/10"
                      }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.18em] text-foreground/50">Status</span>
              <div className="flex gap-1">
                {(["all", "enabled", "disabled"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setEnabledFilter(opt)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${enabledFilter === opt
                      ? "bg-primary text-black"
                      : "bg-white/5 text-foreground/60 hover:bg-white/10"
                      }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleOpenCreate}
              className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-primary text-black text-xs font-bold uppercase tracking-wider rounded hover:bg-primary/90 transition-all"
            >
              <MdAdd className="h-4 w-4" />
              New Passage
            </button>
          </div>

          {/* Passages Table */}
          <div className="bg-white/3 border border-white/10 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#1e1e1e] border-b border-white/10">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">ID</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">Language</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">Difficulty</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">Length</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">Words</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">Status</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">Lifecycle</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">Used</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">Content</th>
                    <th className="text-right py-3 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPassages.map((passage) => (
                    <tr
                      key={passage.id}
                      onClick={() => router.push(`/admin/passages/${passage.id}`)}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 text-foreground/60 font-mono text-xs">{passage.id.slice(0, 8)}...</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-1 rounded text-xs font-bold uppercase bg-primary/20 text-primary">
                          {passage.language}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase ${passage.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                          passage.difficulty === 'advanced' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                          {passage.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-4 capitalize text-foreground/80">{passage.length}</td>
                      <td className="py-3 px-4 text-foreground/80 font-bold">{passage.word_count}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase ${(passage.enabled ?? true)
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                          }`}>
                          {(passage.enabled ?? true) ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3 px-4 capitalize text-foreground/60">{passage.status}</td>
                      <td className="py-3 px-4 text-foreground/80">{passage.used_count}</td>
                      <td className="py-3 px-4 w-52">
                        <div className="max-w-[200px] truncate text-foreground/60 text-xs">{passage.content}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => handleToggleEnabled(e, passage)}
                            className={`p-2 rounded transition-all ${(passage.enabled ?? true)
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-white/10 text-foreground/60 hover:bg-white/20'
                              }`}
                            title={(passage.enabled ?? true) ? 'Disable passage' : 'Enable passage'}
                          >
                            {(passage.enabled ?? true) ? (
                              <MdToggleOn className="h-4 w-4" />
                            ) : (
                              <MdToggleOff className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={(e) => handleEdit(e, passage.id)}
                            className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-all"
                            title="Edit passage"
                          >
                            <MdEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, passage.id)}
                            className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-all"
                            title="Delete passage"
                          >
                            <MdDelete className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePagination
              page={page}
              pageSize={pageSize}
              totalRows={filteredPassages.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
            />
          </div>

          {/* Create Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#1e1e1e] border border-white/10 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black uppercase tracking-wider text-white">
                    Create Passage
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="flex items-center justify-center h-7 w-7 rounded bg-white/10 text-white hover:bg-white/20 transition-all"
                  >
                    <MdClose className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-foreground/50 mb-1.5">
                      Content *
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      required
                      rows={6}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-foreground/40 focus:border-primary focus:outline-none"
                      placeholder="Enter passage content..."
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-foreground/50 mb-1.5">
                        Language *
                      </label>
                      <select
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value as Language })}
                        required
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-primary focus:outline-none"
                      >
                        <option value="english">English</option>
                        <option value="lao">Lao</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-foreground/50 mb-1.5">
                        Difficulty *
                      </label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
                        required
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-primary focus:outline-none"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-foreground/50 mb-1.5">
                        Length *
                      </label>
                      <select
                        value={formData.length}
                        onChange={(e) => setFormData({ ...formData, length: e.target.value as Length })}
                        required
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-primary focus:outline-none"
                      >
                        <option value="short">Short</option>
                        <option value="medium">Medium</option>
                        <option value="long">Long</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 px-5 py-2.5 bg-primary text-black text-sm font-bold rounded-lg hover:bg-primary/90 transition-all"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-5 py-2.5 bg-white/10 text-white text-sm font-bold rounded-lg hover:bg-white/20 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="relative w-full max-w-md bg-[#1e1e1e] border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black uppercase tracking-wider text-white">
                    Delete Passage
                  </h2>
                  <button
                    onClick={cancelDelete}
                    className="flex items-center justify-center h-7 w-7 rounded bg-white/10 text-white hover:bg-white/20 transition-all"
                  >
                    <MdClose className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-foreground/80 mb-6">
                  Are you sure you want to delete this passage? This action cannot be undone.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-5 py-2.5 bg-red-500 text-white text-sm font-bold rounded-lg hover:bg-red-600 transition-all"
                  >
                    Delete
                  </button>
                  <button
                    onClick={cancelDelete}
                    className="flex-1 px-5 py-2.5 bg-white/10 text-white text-sm font-bold rounded-lg hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
