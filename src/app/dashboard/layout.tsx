import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const dashboardLinks = [
  { name: "Overview", href: "/dashboard" },
  { name: "My Posts", href: "/dashboard/posts" },
  { name: "Drafts", href: "/dashboard/drafts" },
  { name: "Saved Bookmarks 🔖", href: "/dashboard/saved" },
  { name: "Analytics 📊", href: "/dashboard/analytics" },
  { name: "Profile Settings", href: "/profile" },
];

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
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 flex-col border-r border-border/50 bg-muted/30 p-6 md:flex shrink-0">
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Dashboard</h2>
          <nav className="flex flex-col space-y-2 text-sm font-medium">
            {dashboardLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`transition-colors hover:text-primary p-2 rounded-md hover:bg-foreground/5 ${link.name === "Profile Settings" ? "mt-4 border-t border-border/10 pt-4" : ""}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Nav - Top horizontal scroll */}
      <div className="md:hidden border-b border-border/50 bg-muted/20 overflow-x-auto whitespace-nowrap scrollbar-hide py-3 px-4">
        <nav className="flex items-center gap-4 text-sm font-medium">
          {dashboardLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className="transition-colors hover:text-primary px-3 py-1.5 rounded-full bg-background border border-border/50 text-xs shadow-sm hover:shadow-md active:scale-95 transition-all"
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

