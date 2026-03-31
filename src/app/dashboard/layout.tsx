import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border/50 bg-muted/30 p-6 md:flex">
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Dashboard</h2>
          <nav className="flex flex-col space-y-2 text-sm font-medium">
            <Link href="/dashboard" className="transition-colors hover:text-primary p-2 rounded-md hover:bg-foreground/5">
              Overview
            </Link>
            <Link href="/dashboard/posts" className="transition-colors hover:text-primary p-2 rounded-md hover:bg-foreground/5">
              My Posts
            </Link>
            <Link href="/dashboard/drafts" className="transition-colors hover:text-primary p-2 rounded-md hover:bg-foreground/5">
              Drafts
            </Link>
            <Link href="/dashboard/saved" className="transition-colors hover:text-primary p-2 rounded-md hover:bg-foreground/5">
              Saved Bookmarks 🔖
            </Link>
            <Link href="/dashboard/analytics" className="transition-colors hover:text-primary p-2 rounded-md hover:bg-foreground/5">
              Analytics 📊
            </Link>
            <Link href="/profile" className="transition-colors hover:text-primary p-2 rounded-md hover:bg-foreground/5 mt-4 border-t border-border/50 pt-4">
              Profile Settings
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
