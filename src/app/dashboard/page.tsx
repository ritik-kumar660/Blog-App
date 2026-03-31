import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  await connectToDatabase();

  const authorId = session.user.id;

  // 1. Calculate Aggregates for Views, Likes, Read Time natively via Mongoose
  // Actually, Mongoose $match needs mongoose.Types.ObjectId. Let's just .find() and Array.reduce() since the blog scale is small and guarantees accuracy without type issues!
  const posts = await Post.find({ author: authorId, published: true }).select('title views likes readTime');
  
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const totalReadTime = posts.reduce((sum, p) => sum + (p.readTime || 5), 0);
  
  const sortedByViews = [...posts].sort((a, b) => b.views - a.views);
  const topPost = sortedByViews.length > 0 ? sortedByViews[0] : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s a quick look at your blog&apos;s performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 border-border/50 shadow-sm relative z-10 transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+Organic traffic</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50 shadow-sm relative z-10 transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Likes 🔥</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalLikes.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+Community engagement</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 shadow-sm relative z-10 transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Read Time</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalReadTime / 60).toFixed(1)} Hrs</div>
            <p className="text-xs text-muted-foreground">+Total hours accumulated</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 shadow-sm relative z-10 transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Post</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold leading-tight truncate">
              {topPost ? topPost.title : "No articles yet"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {topPost ? `${topPost.views.toLocaleString()} views` : "0 views"}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Mock Chart Area */}
      <h2 className="text-2xl font-bold tracking-tight pt-4">Recent Activity</h2>
      <Card className="bg-muted/10 border-border/50 h-64 flex items-center justify-center shadow-sm">
        <p className="text-muted-foreground">Chart Data will appear here...</p>
      </Card>
    </div>
  );
}
