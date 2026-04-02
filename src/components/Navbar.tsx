"use client";

import { Search, Menu, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import UserAvatar from "./UserAvatar";

export default function Navbar() {
    const { data: session, status } = useSession();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setDropdownOpen(false);
            }
            if (
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target as Node)
            ) {
                // setMobileMenuOpen(false); // We handle this with the toggle usually, but could add if needed
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close mobile menu on route change (simulated by clicking a link)
    const closeMobileMenu = () => setMobileMenuOpen(false);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Trending", href: "/trending" },
        { name: "Dashboard", href: "/dashboard" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/10 bg-background/60 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">

                {/* Left Side: Logo + Desktop Nav */}
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter text-foreground shrink-0">
                        <img src="/icon.png" alt="Logo" className="w-6 h-6 rounded-md object-contain" />
                        <span>Ritik<span className="text-primary">.dev</span></span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} className="hover:text-foreground transition-colors">
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Right Side: Tools + User Profile */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="hidden sm:flex items-center gap-2">
                        {session && <NotificationBell />}
                        <Link href="/search" className="p-2 hover:bg-muted hover:text-foreground text-muted-foreground rounded-full border border-transparent hover:border-border transition-all">
                            <Search size={20} />
                        </Link>
                        <ThemeToggle />
                    </div>

                    {/* Mobile Search/Theme/Bell - keep minimal to prevent crowding */}
                    <div className="flex sm:hidden items-center gap-1">
                        <ThemeToggle />
                        <Link href="/search" className="p-2 text-muted-foreground">
                            <Search size={18} />
                        </Link>
                    </div>

                    <div className="relative" ref={dropdownRef}>
                        {status === "loading" ? (
                            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                        ) : session ? (
                            <>
                                {/* Avatar */}
                                <div
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={() => setDropdownOpen((prev) => !prev)}
                                >
                                    <UserAvatar name={session.user?.name} image={session.user?.image} size={32} />
                                    <span className="text-sm font-medium hidden lg:block">
                                        {session.user?.name?.split(' ')[0]}
                                    </span>
                                </div>

                                {/* User Dropdown */}
                                {dropdownOpen && (
                                    <div className="absolute right-0 top-12 w-56 rounded-xl bg-background border border-border/50 shadow-2xl p-2 animate-in fade-in zoom-in-95 z-[60]">
                                        <div className="px-3 py-2 border-b border-border/10 mb-2">
                                            <p className="text-sm font-semibold truncate">{session.user?.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                                        </div>

                                        <Link href="/profile" className="block px-3 py-2 text-sm rounded-md hover:bg-muted transition" onClick={() => setDropdownOpen(false)}>
                                            ⚙️ Settings
                                        </Link>
                                        <Link href={`/author/${session.user.id}`} className="block px-3 py-2 text-sm rounded-md hover:bg-muted transition" onClick={() => setDropdownOpen(false)}>
                                            👤 Public Profile
                                        </Link>
                                        <Link href="/dashboard" className="block px-3 py-2 text-sm rounded-md hover:bg-muted transition" onClick={() => setDropdownOpen(false)}>
                                            📊 Dashboard
                                        </Link>

                                        {(session.user as any)?.role === "admin" && (
                                            <Link href="/admin" className="block px-3 py-2 text-sm text-primary font-medium rounded-md hover:bg-primary/10 transition" onClick={() => setDropdownOpen(false)}>
                                                🛡️ Admin Panel
                                            </Link>
                                        )}

                                        <div className="mt-2 pt-2 border-t border-border/10">
                                            <button onClick={() => signOut()} className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-red-500/10 text-red-500 transition">
                                                🚪 Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="hidden sm:flex items-center gap-2">
                                <Link href="/auth/login">
                                    <Button variant="ghost" size="sm">Log in</Button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button size="sm">Sign up</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="p-2 ml-1 md:hidden hover:bg-muted rounded-md transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle Menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-border shadow-xl animate-in slide-in-from-top-4 duration-200 z-40">
                    <nav className="flex flex-col p-4 gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex items-center px-4 py-3 text-base font-medium rounded-lg hover:bg-muted transition-colors"
                                onClick={closeMobileMenu}
                            >
                                {link.name}
                            </Link>
                        ))}
                        
                        {!session && (
                            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50">
                                <Link href="/auth/login" onClick={closeMobileMenu}>
                                    <Button variant="outline" className="w-full">Log in</Button>
                                </Link>
                                <Link href="/auth/register" onClick={closeMobileMenu}>
                                    <Button className="w-full">Sign up</Button>
                                </Link>
                            </div>
                        )}

                        {session && (
                            <div className="mt-4 pt-4 border-t border-border/50">
                                <div className="flex items-center gap-3 px-4 mb-4">
                                    <UserAvatar name={session.user?.name} image={session.user?.image} size={40} />
                                    <div>
                                        <p className="text-sm font-semibold">{session.user?.name}</p>
                                        <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Link href="/profile" className="px-4 py-3 text-sm rounded-lg hover:bg-muted" onClick={closeMobileMenu}>⚙️ Settings</Link>
                                    <Link href="/dashboard" className="px-4 py-3 text-sm rounded-lg hover:bg-muted" onClick={closeMobileMenu}>📊 Dashboard</Link>
                                    <button onClick={() => { signOut(); closeMobileMenu(); }} className="w-full text-left px-4 py-3 text-sm rounded-lg hover:bg-red-500/10 text-red-500">🚪 Logout</button>
                                </div>
                            </div>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}