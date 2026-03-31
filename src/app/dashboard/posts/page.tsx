import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";
import DeletePostButton from "@/components/DeletePostButton";

export default async function DashboardPostsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  await connectToDatabase();
  const dbPosts = await Post.find({
    author: session.user.id,
    published: true,
  }).sort({ createdAt: -1 });

  // Map to front-end schema
  const posts = dbPosts.map((p) => ({
    id: p._id.toString(),
    title: p.title,
    status: "Published",
    date: new Date(p.createdAt).toLocaleDateString(),
    views: p.views?.toLocaleString() || "0",
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and measure your published content.</p>
        </div>
        <Link href="/write">
          <Button>Create New Post</Button>
        </Link>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden shadow-sm relative z-10 transition-shadow hover:shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border/50">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium tracking-wider">Title</th>
                <th scope="col" className="px-6 py-4 font-medium tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 font-medium tracking-wider">Published Date</th>
                <th scope="col" className="px-6 py-4 font-medium tracking-wider text-right">Views</th>
                <th scope="col" className="px-6 py-4 font-medium tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-foreground/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground max-w-xs truncate">
                    {post.title}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{post.date}</td>
                  <td className="px-6 py-4 text-right">{post.views}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 items-center">
                      <Link href={`/write?id=${post.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
                          Edit
                        </Button>
                      </Link>
                      <DeletePostButton id={post.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {posts.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No published posts found. Start writing!
          </div>
        )}
      </div>
    </div>
  );
}
