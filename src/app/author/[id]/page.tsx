import { auth } from "@/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Post from "@/models/Post";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import FollowButton from "@/components/FollowButton";
import UserAvatar from "@/components/UserAvatar";

export default async function AuthorProfile({ params }: { params: { id: string } }) {
  const { id } = await params;
  const session = await auth();

  await connectToDatabase();

  const author = await User.findById(id).select("name image role bio followers following socialLinks createdAt");
  if (!author) return notFound();

  const posts = await Post.find({ author: id, published: true, isAuthorBanned: { $ne: true } }).sort({ createdAt: -1 });

  const currentUserId = session?.user?.id;
  const isFollowing = currentUserId 
    ? author.followers.some((id: any) => id.toString() === currentUserId)
    : false;

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl min-h-screen">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 border-b border-border pb-10">
        <UserAvatar name={author.name} image={author.image} size={160} className="ring-4 ring-primary/20" />
        
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-bold mb-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
            {author.name}
            {author.role === "admin" && (
              <span className="text-xs font-black tracking-widest uppercase bg-primary text-primary-foreground px-2 py-1 rounded-full shadow-md align-middle">Admin</span>
            )}
          </h1>
          <p className="text-muted-foreground mb-4 max-w-lg mx-auto md:mx-0">
            {author.bio || "This author hasn't added a bio yet."}
          </p>

          <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
            {author.socialLinks?.github && (
              <a href={`https://${author.socialLinks.github.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted hover:bg-primary/20 hover:text-primary rounded-full transition-all" title="GitHub">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              </a>
            )}
            {author.socialLinks?.linkedin && (
              <a href={`https://${author.socialLinks.linkedin.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted hover:bg-primary/20 hover:text-primary rounded-full transition-all" title="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            )}
            {author.socialLinks?.twitter && (
              <a href={`https://${author.socialLinks.twitter.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted hover:bg-primary/20 hover:text-primary rounded-full transition-all" title="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
            )}
          </div>
          
          <div className="flex items-center justify-center md:justify-start gap-6 mb-6">
            <div className="text-center">
              <span className="block font-bold text-xl">{author.followers?.length || 0}</span>
              <span className="text-sm text-muted-foreground">Followers</span>
            </div>
            <div className="text-center">
              <span className="block font-bold text-xl">{author.following?.length || 0}</span>
              <span className="text-sm text-muted-foreground">Following</span>
            </div>
          </div>
          
          {currentUserId !== id && (
            <FollowButton 
              targetUserId={id} 
              initialIsFollowing={isFollowing} 
              followerCount={author.followers?.length || 0}
            />
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-6">Articles by {author.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map(post => (
            <Card key={post._id.toString()} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-6">
                <Link href={`/blog/${post._id}`}>
                  <h3 className="text-xl font-bold mb-2 group-hover:underline">{post.title}</h3>
                </Link>
                <div className="flex items-center text-sm text-muted-foreground gap-4">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span>{post.readTime || 5} min read</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {posts.length === 0 && (
            <p className="text-muted-foreground">No published posts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
