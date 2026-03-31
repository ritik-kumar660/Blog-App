import { Metadata } from 'next';
import Link from 'next/link';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/models/Post';

export const metadata: Metadata = {
  title: 'Blog | Ritik Blog',
  description: 'Read the latest tutorials and updates.',
};

export default async function BlogPage() {
  await connectToDatabase();
  
  const dbPosts = await Post.find({ published: true, isAuthorBanned: { $ne: true } })
    .sort({ createdAt: -1 });

  const posts = dbPosts.map((p) => {
    const rawText = p.content.replace(/<[^>]+>/g, '');
    return {
      id: p._id.toString(),
      title: p.title,
      excerpt: rawText.substring(0, 150) + (rawText.length > 150 ? '...' : ''),
      date: new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      slug: p._id.toString(), // Using DB ID as slug placeholder for routing
      readTime: (p.readTime || 5) + ' min read',
    };
  });

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Latest Writing</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Insights, tutorials, and technical deep-dives on modern web development, design, and engineering excellence.
        </p>
      </div>

      <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article 
            key={post.id} 
            className="group relative flex flex-col items-start justify-between rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-x-4 text-xs mb-4">
              <time dateTime={post.date} className="text-muted-foreground">{post.date}</time>
              <span className="relative z-10 rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary">
                {post.readTime}
              </span>
            </div>
            <div className="group relative">
              <h3 className="mt-3 text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                <Link href={`/blog/${post.slug}`}>
                  <span className="absolute inset-0" />
                  {post.title}
                </Link>
              </h3>
              <p className="mt-5 line-clamp-3 text-sm leading-6 text-muted-foreground">
                {post.excerpt}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
