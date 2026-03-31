"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import UserAvatar from "./UserAvatar";
export default function Navbar() {
    const { data: session, status } = useSession();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/10 bg-background/60 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter text-foreground">
                    <img src="/icon.png" alt="Logo" className="w-6 h-6 rounded-md object-contain" />
                    <span>Ritik<span className="text-primary">.dev</span></span>
                </Link>

                {/* Nav */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground mr-4">
                    <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                    <Link href="/trending" className="hover:text-foreground transition-colors">Trending</Link>
                    <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
                    <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
                    <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
                </nav>

                {/* Right Side */}
                <div className="relative flex items-center gap-4" ref={dropdownRef}>
                    {session && <NotificationBell />}
                    <Link href="/search" className="p-2 hover:bg-muted hover:text-foreground text-muted-foreground transition-colors rounded-full transition-colors border border-transparent hover:border-border">
                        <Search size={20} />
                    </Link>
                    <ThemeToggle />
                    {status === "loading" ? (
                        <p className="text-sm text-muted-foreground">...</p>
                    ) : session ? (
                        <>
                            {/* Avatar + Name */}
                            <div
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => setOpen((prev) => !prev)}
                            >
                            <UserAvatar name={session.user?.name} image={session.user?.image} size={32} />
                                <span className="text-sm font-medium hidden sm:block">
                                    {session.user?.name}
                                </span>
                            </div>

                            {/* Dropdown */}
                            {open && (
                                <div className="absolute right-0 top-12 w-52 rounded-xl bg-background border border-border/50 shadow-xl p-2 animate-in fade-in zoom-in-95 z-[60]">

                                    {/* User Info */}
                                    <div className="px-3 py-2 border-b border-border/10 mb-2">
                                        <p className="text-sm font-semibold">
                                            {session.user?.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {session.user?.email}
                                        </p>
                                    </div>

                                    {/* Profile */}
                                    <Link
                                        href="/profile"
                                        className="block px-3 py-2 text-sm rounded-md hover:bg-foreground/5 transition text-foreground"
                                        onClick={() => setOpen(false)}
                                    >
                                        ⚙️ Settings
                                    </Link>

                                    {/* Public Profile */}
                                    <Link
                                        href={`/author/${session.user.id}`}
                                        className="block px-3 py-2 text-sm rounded-md hover:bg-foreground/5 transition text-foreground"
                                        onClick={() => setOpen(false)}
                                    >
                                        👤 View Public Profile
                                    </Link>

                                    {/* Dashboard */}
                                    <Link
                                        href="/dashboard"
                                        className="block px-3 py-2 text-sm rounded-md hover:bg-foreground/5 transition text-foreground"
                                        onClick={() => setOpen(false)}
                                    >
                                        📊 Dashboard
                                    </Link>

                                    {/* Admin Panel */}
                                    {(session.user as any)?.role === "admin" && (
                                        <Link
                                            href="/admin"
                                            className="block px-3 py-2 text-sm text-primary font-medium rounded-md hover:bg-primary/20 transition"
                                            onClick={() => setOpen(false)}
                                        >
                                            🛡️ Admin Panel
                                        </Link>
                                    )}

                                    {/* Logout */}
                                    <button
                                        onClick={() => signOut()}
                                        className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-red-500/20 text-red-400 transition"
                                    >
                                        🚪 Logout
                                    </button>

                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <Link href="/auth/login">
                                <Button variant="ghost" size="sm">
                                    Log in
                                </Button>
                            </Link>
                            <Link href="/auth/register">
                                <Button size="sm">
                                    Sign up
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

            </div>
        </header>
    );
}