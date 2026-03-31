import { auth } from "@/auth";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Post from "@/models/Post";
import Link from "next/link";

export default async function DashboardSavedPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  await connectToDatabase();
  
  // We populate the savedPosts array, and also nicely nested populate the author of each saved post!
  const user = await User.findById(session.user.id).populate({
    path: "savedPosts",
    model: Post,
    populate: { path: "author", model: User, select: "name image text" }
  });

  const savedPosts = user?.savedPosts || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Saved Bookmarks 🔖</h1>
          <p className="text-muted-foreground mt-1">Articles you&apos;ve saved to read later.</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {savedPosts.length === 0 ? (
          <div className="col-span-full border border-dashed border-border/50 rounded-2xl p-12 text-center bg-muted/20">
            <p className="text-muted-foreground italic">You haven&apos;t bookmarked any articles yet!</p>
            <Link href="/trending" className="text-primary hover:underline mt-2 inline-block">
              Explore Trending Posts
            </Link>
          </div>
        ) : (
          savedPosts.map((post: any) => {
            const rawText = post.content?.replace(/<[^>]+>/g, '') || "";
            const excerpt = rawText.substring(0, 100) + (rawText.length > 100 ? "..." : "");

            return (
              <div key={post._id.toString()} className="group relative flex flex-col justify-between rounded-2xl border border-border/50 bg-card p-6 transition-all hover:shadow-md shadow-sm">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="inline-flex items-center rounded-full border border-border/50 bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                       {post.tags && post.tags.length > 0 ? post.tags[0] : "Article"}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary mb-2 line-clamp-2">
                    <Link href={`/blog/${post._id.toString()}`}>
                      <span className="absolute inset-0 z-10" />
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {excerpt}
                  </p>
                </div>
                
                <div className="mt-6 flex items-center justify-between border-t border-border/10 pt-4 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground/70">By {post.author?.name || "Anonymous"}</span>
                  <span className="text-primary flex items-center gap-1 font-bold">
                     <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                     {post.views} views
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
