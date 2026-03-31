import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/models/Post';
import User from '@/models/User';
import { auth } from '@/auth';
import PostInteractions from '@/components/PostInteractions';
import CommentsSection from '@/components/CommentsSection';
import FollowButton from '@/components/FollowButton';
import UserAvatar from '@/components/UserAvatar';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  await connectToDatabase();
  const post = await Post.findById(slug).select("title content");
  
  if (!post) {
    return {
      title: "Story Not Found",
    };
  }

  const rawText = post.content?.replace(/<[^>]+>/g, "").substring(0, 160) || "";

  return {
    title: post.title,
    description: rawText,
    openGraph: {
      title: post.title,
      description: rawText,
      type: "article",
    },
  };
}


// Next 15+ dynamic route params must be awaited
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  await connectToDatabase();
  
  // Find the post and populate the assigned author details
  const dbPost = await Post.findById(slug).populate({ path: 'author', model: User, select: 'name image role' });
  
  if (!dbPost || !dbPost.published || dbPost.isAuthorBanned) {
    notFound(); // Triggers the elegant Next.js 404 page we built!
  }

  // Atomically increment view count on successful read
  await Post.findByIdAndUpdate(slug, { $inc: { views: 1 } });

  // Get current user to pass their interaction state
  const session = await auth();
  const userId = session?.user?.id;
  const userHasLiked = userId ? (dbPost.likedBy?.includes(userId as any) ?? false) : false;
  
  let userHasSaved = false;
  if (userId) {
    const dbUser = await User.findById(userId).select('savedPosts');
    userHasSaved = dbUser?.savedPosts?.includes(slug as any) || false;
  }

  const post = {
    _id: dbPost._id.toString(),
    title: dbPost.title,
    authorId: (dbPost.author as any)?._id?.toString() || "",
    author: (dbPost.author as any)?.name || 'Anonymous',
    authorImage: (dbPost.author as any)?.image || '/default-avatar.png',
    authorRole: (dbPost.author as any)?.role || 'Contributor',
    date: new Date(dbPost.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    readTime: (dbPost.readTime || 5) + ' min read',
    content: dbPost.content,
    likes: dbPost.likes || 0,
  };

  // Check if current user follows the author
  const currentUserId = session?.user?.id;
  let isFollowingAuthor = false;
  if (currentUserId && post.authorId && currentUserId !== post.authorId) {
    const authorDoc = await User.findById(post.authorId).select('followers');
    isFollowingAuthor = authorDoc?.followers?.some((id: any) => id.toString() === currentUserId) ?? false;
  }

  return (
    <article className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
      <Link href="/blog" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
        &larr; Back to articles
      </Link>
      
      <header className="mb-14 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-muted-foreground mb-6">
          <time dateTime={post.date}>{post.date}</time>
          <span>&middot;</span>
          <span>{post.readTime}</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-8 leading-tight">
          {post.title}
        </h1>
        
        <div className="flex items-center justify-center sm:justify-start gap-4">
          <Link href={`/author/${post.authorId}`} className="flex items-center gap-4 group/author">
            <div className="group-hover/author:ring-2 group-hover/author:ring-primary/50 rounded-full transition-all">
              <UserAvatar name={post.author} image={post.authorImage} size={48} />
            </div>
            <div className="text-left">
              <div className="font-semibold text-foreground flex items-center gap-1 group-hover/author:text-primary transition-colors">
                {post.author}
                {post.authorRole === "admin" && (
                  <span className="ml-1 text-[10px] font-bold tracking-wider uppercase bg-primary text-primary-foreground px-1.5 py-0.5 rounded shadow-sm">Admin</span>
                )}
              </div>
              <div className="text-sm text-muted-foreground capitalize">{post.authorRole}</div>
            </div>
          </Link>
          {currentUserId && post.authorId && currentUserId !== post.authorId && (
            <FollowButton
              targetUserId={post.authorId}
              initialIsFollowing={isFollowingAuthor}
              followerCount={0}
            />
          )}
        </div>
      </header>

      {/* Interactions (Likes & Saves) */}
      <PostInteractions 
        postId={post._id} 
        initialLikes={post.likes} 
        initialHasLiked={userHasLiked} 
        initialHasSaved={userHasSaved} 
      />
      
      <div 
        className="prose dark:prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl"
        dangerouslySetInnerHTML={{ __html: post.content || "" }}
      />
      
      {/* Discussion Thread */}
      <CommentsSection postId={post._id} />
    </article>
  );
}
