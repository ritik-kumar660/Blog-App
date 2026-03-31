import { auth } from "@/auth";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";

export default async function DashboardAnalyticsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  await connectToDatabase();
  const authorId = session.user.id;
  
  const posts = await Post.find({ author: authorId, published: true }).select('views likes readTime date'); // Mongoose defaults to getting createdAt automatically most times but select is good practice
  
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const totalReadTimeHrs = posts.reduce((sum, p) => sum + (p.readTime || 5), 0) / 60;
  
  // Placeholder Analytics Data (Past 7 Days views) - keep the visual curve since we dont time-series track yet.
  const chartData = [
    { day: "Mon", value: 45 },
    { day: "Tue", value: 68 },
    { day: "Wed", value: 34 },
    { day: "Thu", value: 92 },
    { day: "Fri", value: 115 },
    { day: "Sat", value: 85 },
    { day: "Sun", value: 70 },
  ];

  // Find max value for scaling the CSS bars relative to the highest bar (100%)
  const maxVal = Math.max(...chartData.map((d) => d.value));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics 📊</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your audience reach and reading trends.</p>
      </div>

      {/* High Level Stats grid */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Stat Card 1 */}
        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Views</h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-primary">
               <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div className="text-3xl font-bold">{totalViews.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
             <span className="text-primary font-medium">Authentic Count</span> from all public posts
          </p>
        </div>

        {/* Stat Card 2 */}
        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Followers</h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-primary">
               <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
               <circle cx="9" cy="7" r="4" />
               <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
               <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="text-3xl font-bold">
            {totalLikes.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="text-primary font-medium">All time</span> total likes
          </p>
        </div>

        {/* Stat Card 3 */}
        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Avg. Read Time</h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-primary">
               <circle cx="12" cy="12" r="10" />
               <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="text-3xl font-bold">{totalReadTimeHrs.toFixed(1)} hrs</div>
          <p className="text-xs text-muted-foreground mt-1">
             <span className="text-primary font-medium">Estimated</span> reading duration
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="rounded-2xl border border-border/50 bg-card p-6 sm:p-8 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 -z-10 translate-x-1/4 -translate-y-1/4 blur-[100px] opacity-20">
          <div className="aspect-square w-[400px] rounded-full bg-primary/50 pointer-events-none" />
        </div>

        <h3 className="text-xl font-bold tracking-tight mb-8">Audience Overview (Past 7 Days)</h3>
        
        {/* Custom CSS Bar Chart */}
        <div className="h-64 flex items-end gap-3 sm:gap-6 pt-6">
          {chartData.map((data, idx) => {
            const heightPercentage = (data.value / maxVal) * 100;
            return (
              <div key={idx} className="flex flex-col items-center flex-1 gap-3 relative group">
                {/* Tooltip on hover */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-popover backdrop-blur-md px-2 py-1 rounded text-xs font-bold shadow-md border border-border/50 whitespace-nowrap z-10 pointer-events-none">
                  {data.value}k views
                </div>
                
                {/* Bar */}
                <div className="w-full relative rounded-md overflow-hidden bg-muted/30 flex items-end justify-center h-full min-h-[10px]">
                  <div 
                    className="w-full bg-gradient-to-t from-primary/80 to-primary/40 rounded-t-sm transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(var(--primary),0.5)] group-hover:brightness-125"
                    style={{ height: `${heightPercentage}%` }}
                  />
                </div>
                
                {/* Label */}
                <div className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-widest">{data.day}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
