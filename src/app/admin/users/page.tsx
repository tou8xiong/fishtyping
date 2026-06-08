"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import TablePagination from "@/components/TablePagination";
import type { User } from "@/lib/supabase/types";
import { MdAdd, MdClose, MdEdit, MdDelete } from "react-icons/md";
import { getAuthHeaders } from "@/lib/auth/getAuthHeaders";

const ADMIN_EMAIL = "touxhk@gmail.com";
const ADMIN_ID = "8OZdxsSF8gY5ysBogP5yqkTMaZI3";

interface UserFormData {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  preferred_language: string;
}

export default function AdminUsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formData, setFormData] = useState<UserFormData>({
    id: "",
    username: "",
    display_name: "",
    avatar_url: "",
    preferred_language: "english",
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
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const authHeaders = await getAuthHeaders();
      const response = await fetch("/api/admin/users", {
        headers: authHeaders,
      });

      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      setUsers(data.users || []);
      setFilteredUsers(data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(
        (u) =>
          u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (languageFilter !== "all") {
      filtered = filtered.filter((u) => u.preferred_language === languageFilter);
    }

    setFilteredUsers(filtered);
    setPage(1);
  }, [searchQuery, languageFilter, users]);

  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      id: "",
      username: "",
      display_name: "",
      avatar_url: "",
      preferred_language: "english",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
    setEditingUser(user);
    setFormData({
      id: user.id,
      username: user.username || "",
      display_name: user.display_name || "",
      avatar_url: user.avatar_url || "",
      preferred_language: user.preferred_language,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingUser ? "PUT" : "POST";
      const authHeaders = await getAuthHeaders();
      const response = await fetch("/api/admin/users", {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save user");
      }

      await fetchUsers();
      handleCloseModal();
    } catch (error: any) {
      console.error("Failed to save user:", error);
      alert(error.message || "Failed to save user");
    }
  };

  const handleDelete = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch(`/api/admin/users?id=${userToDelete}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      if (!response.ok) throw new Error("Failed to delete user");

      await fetchUsers();
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
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

  const languages = ["all", "english", "lao"];

  return (
    <AdminLayout>
      <div className="py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <AdminBreadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Users" }]} />

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            <div className="bg-white/3 border border-white/10 rounded-md px-3 py-2">
              <div className="text-[10px] uppercase tracking-[0.18em] text-foreground/50">Total</div>
              <div className="text-lg font-bold text-primary">{users.length}</div>
            </div>
            <div className="bg-white/3 border border-white/10 rounded-md px-3 py-2">
              <div className="text-[10px] uppercase tracking-[0.18em] text-foreground/50">English</div>
              <div className="text-lg font-bold text-white">
                {users.filter((u) => u.preferred_language === "english").length}
              </div>
            </div>
            <div className="bg-white/3 border border-white/10 rounded-md px-3 py-2">
              <div className="text-[10px] uppercase tracking-[0.18em] text-foreground/50">Lao</div>
              <div className="text-lg font-bold text-white">
                {users.filter((u) => u.preferred_language === "lao").length}
              </div>
            </div>
            <div className="bg-white/3 border border-white/10 rounded-md px-3 py-2">
              <div className="text-[10px] uppercase tracking-[0.18em] text-foreground/50">Filtered</div>
              <div className="text-lg font-bold text-primary">{filteredUsers.length}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/3 border border-white/10 rounded-md px-3 py-2 mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username, name, or ID..."
              className="flex-1 min-w-[200px] px-2.5 py-1 bg-white/5 border border-white/10 rounded text-white text-xs placeholder-foreground/40 focus:border-primary focus:outline-none"
            />

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.18em] text-foreground/50">Language</span>
              <div className="flex gap-1">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguageFilter(lang)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                      languageFilter === lang
                        ? "bg-primary text-black"
                        : "bg-white/5 text-foreground/60 hover:bg-white/10"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleOpenCreate}
              className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-primary text-black text-xs font-bold uppercase tracking-wider rounded hover:bg-primary/90 transition-all"
            >
              <MdAdd className="h-4 w-4" />
              New User
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white/3 border border-white/10 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#1e1e1e] border-b border-white/10">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">
                      ID
                    </th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">
                      Username
                    </th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">
                      Display Name
                    </th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">
                      Language
                    </th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">
                      Created At
                    </th>
                    <th className="text-right py-3 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-4 text-foreground/60 font-mono text-xs">
                        {user.id.slice(0, 12)}...
                      </td>
                      <td className="py-3 px-4 text-foreground/80 font-medium">
                        {user.username || "-"}
                      </td>
                      <td className="py-3 px-4 text-foreground/80">
                        {user.display_name || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-1 rounded text-xs font-bold uppercase bg-primary/20 text-primary">
                          {user.preferred_language}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-foreground/60">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => handleOpenEdit(e, user)}
                            className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-all"
                            title="Edit user"
                          >
                            <MdEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, user.id)}
                            className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-all"
                            title="Delete user"
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
              totalRows={filteredUsers.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
            />
          </div>

          {/* Create/Edit Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#1e1e1e] border border-white/10 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black uppercase tracking-wider text-white">
                    {editingUser ? "Edit User" : "Create User"}
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
                      User ID * {editingUser && "(Cannot be changed)"}
                    </label>
                    <input
                      type="text"
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      required
                      disabled={!!editingUser}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-foreground/40 focus:border-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter Firebase user ID..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-foreground/50 mb-1.5">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-foreground/40 focus:border-primary focus:outline-none"
                      placeholder="Enter username..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-foreground/50 mb-1.5">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-foreground/40 focus:border-primary focus:outline-none"
                      placeholder="Enter display name..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-foreground/50 mb-1.5">
                      Avatar URL
                    </label>
                    <input
                      type="text"
                      value={formData.avatar_url}
                      onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-foreground/40 focus:border-primary focus:outline-none"
                      placeholder="Enter avatar URL..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-foreground/50 mb-1.5">
                      Preferred Language *
                    </label>
                    <select
                      value={formData.preferred_language}
                      onChange={(e) =>
                        setFormData({ ...formData, preferred_language: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-primary focus:outline-none"
                    >
                      <option value="english">English</option>
                      <option value="lao">Lao</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 px-5 py-2.5 bg-primary text-black text-sm font-bold rounded-lg hover:bg-primary/90 transition-all"
                    >
                      {editingUser ? "Update" : "Create"}
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
                    Delete User
                  </h2>
                  <button
                    onClick={cancelDelete}
                    className="flex items-center justify-center h-7 w-7 rounded bg-white/10 text-white hover:bg-white/20 transition-all"
                  >
                    <MdClose className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-foreground/80 mb-6">
                  Are you sure you want to delete this user? This action cannot be undone and will
                  also delete all associated data.
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
