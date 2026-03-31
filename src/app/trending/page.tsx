import Link from "next/link";
import { Metadata } from "next";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";
import User from "@/models/User";
import UserAvatar from "@/components/UserAvatar";
import { auth } from "@/auth";
import PostInteractions from "@/components/PostInteractions";

export const metadata: Metadata = {
  title: "Trending | Ritik Blog",
  description: "Discover the most popular and engaging content on our platform.",
};

export default async function TrendingPage() {
  const session = await auth();
  await connectToDatabase();
  
  // Real dynamic trending sort: by views, then likes. Limited to Top 5.
  const dbPosts = await Post.find({ published: true, isAuthorBanned: { $ne: true } })
    .sort({ views: -1, likes: -1 })
    .limit(5)
    .populate({ path: "author", model: User, select: "name image role" });

  // Get user's saved posts for initial state
  const currentUser = session?.user?.id ? await User.findById(session.user.id).select("savedPosts") : null;
  const savedPosts = currentUser?.savedPosts?.map((id: any) => id.toString()) || [];

  const trendingPosts = dbPosts.map((p, index) => {
    const rawText = p.content.replace(/<[^>]+>/g, '');
    const postId = p._id.toString();
    
    return {
      id: postId,
      rank: index + 1,
      title: p.title,
      excerpt: rawText.substring(0, 150) + (rawText.length > 150 ? "..." : ""),
      authorId: p.author ? (p.author as any)._id?.toString() || "" : "",
      author: (p.author as any)?.name || "Anonymous",
      authorImage: (p.author as any)?.image || "/default-avatar.png",
      date: new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      views: p.views?.toLocaleString() || "0",
      likes: p.likes || 0,
      hasLiked: session?.user?.id ? p.likedBy?.some((id: any) => id.toString() === session.user.id) : false,
      hasSaved: savedPosts.includes(postId),
      commentCount: p.commentCount || 0,
      slug: postId,
    };
  });

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">
      <div className="mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
          Trending Right Now
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
          What the world is reading.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Discover the top articles generating the most conversation across our platform today.
        </p>
      </div>

      <div className="space-y-12">
        {trendingPosts.map((post) => (
          <article 
            key={post.id} 
            className="group relative flex flex-col md:flex-row gap-6 items-start rounded-2xl border border-transparent p-4 md:p-6 transition-all hover:bg-muted/30 hover:border-border/50"
          >
            {/* Massive Rank Number Overlay */}
            <div className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-foreground/20 to-transparent italic w-16 md:w-24 shrink-0 -mt-2 md:-mt-4 select-none">
              0{post.rank}
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Link href={`/author/${post.authorId}`} className="flex items-center gap-2 group/author relative z-20">
                  <div className="group-hover/author:ring-2 group-hover/author:ring-primary/50 rounded-full transition-all shrink-0">
                    <UserAvatar name={post.author} image={post.authorImage} size={24} />
                  </div>
                  <span className="font-medium text-foreground group-hover/author:text-primary transition-colors">{post.author}</span>
                </Link>
                <span>&middot;</span>
                <span>{post.date}</span>
                <span>&middot;</span>
                <div className="flex items-center gap-4 text-muted-foreground mt-1 relative z-20">
                  <PostInteractions 
                    postId={post.id}
                    initialLikes={post.likes}
                    initialHasLiked={post.hasLiked || false}
                    initialHasSaved={post.hasSaved || false}
                    initialCommentCount={post.commentCount}
                    variant="feed"
                    showComment={true}
                  />
                  <span className="flex items-center gap-1 font-semibold text-primary/80 text-xs ml-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    {post.views} views
                  </span>
                </div>
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary mb-3">
                  <Link href={`/blog/${post.slug}`}>
                    <span className="absolute inset-0 z-10" />
                    {post.title}
                  </Link>
                </h2>
                <p className="text-muted-foreground leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
      
      <div className="mt-16 flex justify-center">
        <Link href="/blog">
          <button className="px-6 py-3 rounded-full border border-border/50 text-sm font-semibold hover:bg-muted/10 transition-colors">
            Explore All Content
          </button>
        </Link>
      </div>
    </div>
  );
}
