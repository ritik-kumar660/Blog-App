import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";
import DeletePostButton from "@/components/DeletePostButton";

export default async function DashboardDraftsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  await connectToDatabase();
  const dbDrafts = await Post.find({
    author: session.user.id,
    published: false,
  }).sort({ updatedAt: -1 });

  // Map to front-end schema
  const drafts = dbDrafts.map((d) => ({
    id: d._id.toString(),
    title: d.title || "Untitled Draft",
    lastEdited: new Date(d.updatedAt).toLocaleDateString(),
    words: d.content.split(/\s+/).filter((w: string) => w.length > 0).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drafts</h1>
          <p className="text-sm text-muted-foreground mt-1">Stories you&apos;re currently working on.</p>
        </div>
        <Link href="/write">
          <Button>Draft New Post</Button>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {drafts.map((draft) => (
          <div 
            key={draft.id} 
            className="flex flex-col justify-between rounded-xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:shadow-md group relative"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground border border-border/50">
                  Draft
                </span>
                <span className="text-xs text-muted-foreground">{draft.words} words</span>
              </div>
              
              <h3 className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary mb-2 line-clamp-2">
                <Link href={`/write?id=${draft.id}`}>
                  <span className="absolute inset-0 z-10" />
                  {draft.title}
                </Link>
              </h3>
            </div>
            
            <div className="mt-6 flex items-center justify-between border-t border-border/10 pt-4 text-xs text-muted-foreground">
              <span>Edited {draft.lastEdited}</span>
              <DeletePostButton id={draft.id} />
            </div>
          </div>
        ))}
        
        {drafts.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border/50 p-12 text-center flex flex-col items-center justify-center bg-muted/20">
            <h3 className="text-lg font-medium mb-2">No drafts found</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
              You don&apos;t have any unpublished stories. Create a new draft and let your creativity flow.
            </p>
            <Link href="/write">
              <Button variant="outline" className="bg-transparent border-white/20 hover:bg-white/10">Start Writing</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
