"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import UserAvatar from "./UserAvatar";

interface NotificationType {
  _id: string;
  sender: { _id: string; name: string; image: string; };
  type: "like" | "comment" | "follow";
  post?: { _id: string; title: string; };
  read: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session) return;

    async function fetchNotifications() {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
          setUnreadCount(data.filter((n: NotificationType) => !n.read).length);
        }
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    }
    fetchNotifications();
  }, [session]);

  const handleOpen = async () => {
    setOpen(!open);
    if (!open && unreadCount > 0) {
      // Mark as read in DB
      try {
        await fetch("/api/notifications", { method: "PATCH" });
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleOpen}
        className="p-2 hover:bg-muted hover:text-foreground text-muted-foreground transition-colors rounded-full relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background"></span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 rounded-xl bg-background/95 backdrop-blur-xl border border-border/50 shadow-xl p-2 animate-in fade-in zoom-in-95 z-50">
          <div className="px-3 py-2 border-b border-border/10 mb-2 flex justify-between items-center">
            <h3 className="font-semibold text-sm">Notifications</h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {notifications.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-4">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <div key={n._id} className={`flex gap-3 p-3 rounded-lg text-sm transition-all ${n.read ? "hover:bg-foreground/5" : "bg-primary/5 hover:bg-primary/10 border border-primary/10"}`}>
                  <UserAvatar name={n.sender?.name} image={n.sender?.image} size={32} />
                  <div className="flex-1">
                    <p className="leading-snug">
                      <span className="font-semibold text-foreground">{n.sender?.name}</span>
                      {" "}
                      {n.type === "like" && "liked your post"}
                      {n.type === "comment" && "commented on"}
                      {n.type === "follow" && "started following you"}
                      {" "}
                      {(n.type === "like" || n.type === "comment") && n.post && (
                        <Link href={`/blog/${n.post._id}`} className="font-medium text-primary hover:underline" onClick={() => setOpen(false)}>
                          &quot;{n.post.title}&quot;
                        </Link>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
