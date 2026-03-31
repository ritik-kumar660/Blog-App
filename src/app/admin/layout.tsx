import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-border bg-muted/20 p-6 hidden md:block">
        <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
        <nav className="space-y-4 flex flex-col">
          <Link href="/admin" className="p-3 bg-primary/10 text-primary font-medium rounded-md hover:bg-primary/20 transition-colors">
            Dashboard
          </Link>
          <Link href="/" className="p-3 rounded-md hover:bg-muted/80 transition-colors mt-8 text-muted-foreground border border-border">
            ← Back to App
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-10 bg-background">
        {children}
      </main>
    </div>
  );
}
