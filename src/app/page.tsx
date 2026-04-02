import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/auth";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";
import User from "@/models/User";
import UserAvatar from "@/components/UserAvatar";
import PostInteractions from "@/components/PostInteractions";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; feed?: string }>;
}) {
  const session = await auth();
  const { tag, feed = "latest" } = await searchParams;

  await connectToDatabase();
  
  const query: Record<string, any> = { published: true, isAuthorBanned: { $ne: true } };
  if (tag) {
    // Perform case-insensitive regex match on the array of tags natively in MongoDB
    query.tags = { $regex: new RegExp(`^${tag}$`, 'i') };
  }

  let sortOptions: any = { createdAt: -1 };

  if (feed === "following" && session?.user?.id) {
    const currentUser = await User.findById(session.user.id).select("following");
    if (currentUser && currentUser.following && currentUser.following.length > 0) {
      query.author = { $in: currentUser.following };
    } else {
      query.author = null; // Forces empty result if not following anyone
    }
  } else if (feed === "trending") {
    sortOptions = { likes: -1, views: -1, createdAt: -1 };
  }

  const dbPosts = await Post.find(query)
    .sort(sortOptions)
    .populate({ path: "author", model: User, select: "name image role" })
    .limit(20);

  // Get user's saved posts for initial state
  const currentUser = session?.user?.id ? await User.findById(session.user.id).select("savedPosts") : null;
  const savedPosts = currentUser?.savedPosts?.map((id: { toString: () => string }) => id.toString()) || [];

  const realPosts = dbPosts.map(p => {
    // Basic text extraction from HTML content if we stored raw tiptap HTML
    const rawText = p.content.replace(/<[^>]+>/g, '');
    const postId = p._id.toString();
    
    return {
      id: postId,
      title: p.title,
      excerpt: rawText.substring(0, 150) + (rawText.length > 150 ? "..." : ""),
      authorId: p.author ? (p.author as any)._id?.toString() || p.author.toString() : "",
      author: (p.author as any)?.name || "Anonymous",
      authorImage: (p.author as any)?.image || "/default-avatar.png",
      authorRole: (p.author as any)?.role || "user",
      date: new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      readTime: (p.readTime || 5) + " min read",
      tags: p.tags && p.tags.length > 0 ? p.tags.slice(0, 3) : ["Blog"],
      likes: p.likes || 0,
                      hasLiked: session?.user?.id ? p.likedBy?.some((id: { toString: () => string }) => id.toString() === session.user.id) : false,
                      hasSaved: savedPosts.includes(postId),
                      commentCount: p.commentCount || 0,
                    };
                  });

  return (
    <div className="flex min-h-screen flex-col items-center pb-20">
      {/* Hero Section */}
      <section className="w-full flex justify-center py-20 px-4 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none -translate-y-1/2" />

        <div className="max-w-4xl text-center z-10 space-y-6">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/50 leading-[1.1]">
            Publish your passions, your way.
          </h1>
          <p className="text-lg md:text-2xl text-muted-foreground mx-auto max-w-2xl px-4">
            Create a unique and beautiful blog easily. Discover amazing creators and join a community of thinkers.
          </p>

          <div className="pt-8 flex gap-4 justify-center">
            {session ? (
              <Link href="/write">
                <Button size="lg" className="rounded-full px-8 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-shadow">
                  Start Writing
                </Button>
              </Link>
            ) : (
              <Link href="/auth/register">
                <Button size="lg" className="rounded-full px-8 font-semibold shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-primary/30 transition-all">
                  Get Started
                </Button>
              </Link>
            )}
            <Link href="/trending">
              <Button size="lg" variant="outline" className="rounded-full px-8 font-semibold border-white/20 hover:bg-white/5">
                Explore Reading
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Feed */}
      <section className="w-full max-w-5xl px-4 mt-8 flex flex-col md:flex-row gap-8">
        {/* Feed Column */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between border-b border-border/30 pb-4">
            <h2 className="text-2xl font-bold">
              {tag ? `Exploring: ${tag}` : "Latest Posts"}
            </h2>
            <div className="flex gap-4 text-sm font-medium text-muted-foreground overflow-x-auto whitespace-nowrap">
              {tag && (
                <Link href="/" className="text-primary hover:underline transition-colors pb-1">
                  Clear Filter ✕
                </Link>
              )}
              {!tag && (
                <>
                  <Link href="/?feed=latest" className={`${feed === "latest" ? "text-foreground border-b-2 border-primary" : "hover:text-foreground transition-colors"} pb-1`}>For You</Link>
                  <Link href="/?feed=trending" className={`${feed === "trending" ? "text-foreground border-b-2 border-primary" : "hover:text-foreground transition-colors"} pb-1`}>Trending 📈</Link>
                  {session && (
                    <Link href="/?feed=following" className={`${feed === "following" ? "text-foreground border-b-2 border-primary" : "hover:text-foreground transition-colors"} pb-1`}>Following</Link>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="space-y-8 pt-4">
            {realPosts.length === 0 ? (
              <p className="text-muted-foreground italic text-center py-10">No posts published yet. Be the first!</p>
            ) : (
             realPosts.map(post => (
              <div key={post.id} className="group cursor-pointer relative">
                <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground relative z-20">
                  <Link href={`/author/${post.authorId}`} className="flex items-center gap-2 group/author cursor-pointer">
                    <div className="group-hover/author:ring-2 group-hover/author:ring-primary/50 rounded-full transition-all">
                      <UserAvatar name={post.author} image={post.authorImage} size={24} />
                    </div>
                    <span className="font-medium text-foreground flex items-center gap-1 group-hover/author:text-primary transition-colors">
                      {post.author}
                      {post.authorRole === "admin" && (
                        <span className="ml-1 text-[10px] font-bold tracking-wider uppercase bg-primary text-primary-foreground px-1.5 py-0.5 rounded shadow-sm">Admin</span>
                      )}
                    </span>
                  </Link>
                  <span>·</span>
                  <span>{post.date}</span>
                </div>

                <div className="flex justify-between gap-4 items-start">
                  <div className="space-y-2 flex-1">
                    <h3 className="text-2xl font-bold group-hover:underline decoration-primary underline-offset-4">
                      <Link href={`/blog/${post.id}`}>
                        <span className="absolute inset-0" />
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      {post.tags.map((tag: string) => (
                        <span key={tag} className="px-2 py-1 bg-muted/50 border border-border/30 rounded-full text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-default">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{post.readTime}</span>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground mr-1">
                    <PostInteractions 
                      postId={post.id}
                      initialLikes={post.likes}
                      initialHasLiked={post.hasLiked || false}
                      initialHasSaved={post.hasSaved || false}
                      initialCommentCount={post.commentCount}
                      variant="feed"
                      showComment={true}
                    />
                  </div>
                </div>
                <div className="h-px w-full bg-border/20 mt-8 pointer-events-none" />
              </div>
            )))}
          </div>
        </div>

        {/* Sidebar Column */}
        <aside className="w-full md:w-80 space-y-8 sticky top-24 self-start">
          <Card className="bg-card/50 border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Discover more of what matters to you</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {['Programming', 'Data Science', 'Technology', 'Self Improvement', 'Writing', 'Relationships', 'Machine Learning'].map(topic => (
                <Link 
                  key={topic} 
                  href={`/?tag=${encodeURIComponent(topic)}`}
                  className={`px-3 py-2 border rounded-full text-sm transition-colors ${tag?.toLowerCase() === topic.toLowerCase() ? 'bg-primary/20 border-primary text-primary' : 'bg-muted/50 border-border/50 hover:bg-foreground/10 hover:text-foreground text-muted-foreground'}`}
                >
                  {topic}
                </Link>
              ))}
            </CardContent>
            <CardFooter>
              <Link href="/trending" className="text-sm text-primary hover:underline font-medium">
                See global trends instead &rarr;
              </Link>
            </CardFooter>
          </Card>
        </aside>
      </section>
    </div>
  );
}
