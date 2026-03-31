"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, UserX, UserCheck } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [data, setData] = useState<{users: any[], posts: any[]}>({ users: [], posts: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "posts">("users");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/data");
      if (res.ok) {
        setData(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeletePost = async (id: string) => {
    if (!confirm("Delete this post permanently?")) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setData(prev => ({ ...prev, posts: prev.posts.filter((p: any) => p._id !== id) }));
      }
    } catch (e) { console.error(e); }
  };

  const handleBanUser = async (id: string, currentlyBanned: boolean) => {
    if (!confirm(currentlyBanned ? "Unban this user?" : "Ban and hide this user's content?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "PATCH" });
      if (res.ok) {
        const dataRes = await res.json();
        setData(prev => ({
          ...prev,
          users: prev.users.map((u: any) => u._id === id ? { ...u, isBanned: dataRes.isBanned } : u)
        }));
      } else {
        const error = await res.json();
        alert(error.error || "Failed to toggle ban");
      }
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="p-10 text-center text-muted-foreground">Loading Admin Data...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">System Overview</h1>
        <div className="flex gap-4">
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-4 flex items-center justify-between gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{data.users.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-4 flex items-center justify-between gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{data.posts.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex gap-4 border-b border-border pb-4">
        <button 
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 font-medium rounded-md transition-colors ${activeTab === "users" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
        >
          Manage Users
        </button>
        <button 
          onClick={() => setActiveTab("posts")}
          className={`px-4 py-2 font-medium rounded-md transition-colors ${activeTab === "posts" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
        >
          Manage Posts
        </button>
      </div>

      {activeTab === "users" && (
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle>Registered Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-white/5">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Joined</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((u: any) => (
                    <tr key={u._id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-6 py-4 font-medium">{u.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-green-500/20 text-green-300'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        {u.role !== 'admin' && (
                          <Button 
                            variant={u.isBanned ? "outline" : "destructive"} 
                            size="sm" 
                            onClick={() => handleBanUser(u._id, u.isBanned)} 
                            className={`flex gap-2 ${u.isBanned ? 'text-green-400 border-green-500/30 hover:bg-green-500/10' : ''}`}
                          >
                            {u.isBanned ? (
                              <><UserCheck size={14} /> Unban</>
                            ) : (
                              <><UserX size={14} /> Ban</>
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "posts" && (
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle>All Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-white/5">
                  <tr>
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Author</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.posts.map((p: any) => (
                    <tr key={p._id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-6 py-4 font-medium max-w-xs truncate">
                        <Link href={`/blog/${p._id}`} className="hover:underline">{p.title}</Link>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{p.author?.name || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        {p.published ? (
                          <span className="text-green-400 text-xs bg-green-400/10 px-2 py-1 rounded">Published</span>
                        ) : (
                          <span className="text-yellow-400 text-xs bg-yellow-400/10 px-2 py-1 rounded">Draft</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <Button variant="destructive" size="sm" onClick={() => handleDeletePost(p._id)} className="flex gap-2">
                          <Trash2 size={14} /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
