"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/hooks/useDebounce";
import UserAvatar from "@/components/UserAvatar";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const [results, setResults] = useState({ posts: [], users: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults({ posts: [], users: [] });
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
        if (res.ok) {
           const data = await res.json();
           setResults(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">
        Discover
      </h1>
      
      <div className="relative max-w-2xl mx-auto mb-12 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
        <Input 
          type="text"
          placeholder="Search for articles, tags, or people..."
          className="pl-12 h-12 text-lg rounded-full bg-muted/30 border-border/50 focus:border-primary/50 transition-colors"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {loading && <Loader2 className="absolute right-4 top-3.5 h-5 w-5 animate-spin text-muted-foreground" />}
      </div>

      {!loading && debouncedQuery && results.posts.length === 0 && results.users.length === 0 && (
        <p className="text-center text-muted-foreground text-lg mt-20">No results found for &quot;{debouncedQuery}&quot;</p>
      )}

      {(results.posts.length > 0 || results.users.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-bold border-b border-white/10 pb-4 text-muted-foreground">Articles</h2>
            {results.posts.map((post: any) => (
              <Card key={post._id} className="hover:bg-muted/30 transition-colors border-border/50 bg-card/50">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Link href={`/author/${post.author?._id}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                      <UserAvatar name={post.author?.name} image={post.author?.image} size={24} />
                      <span className="font-medium text-foreground">{post.author?.name}</span>
                    </Link>
                    <span>·</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <Link href={`/blog/${post._id}`}>
                    <h3 className="font-bold text-2xl mb-3 hover:underline decoration-primary underline-offset-4">{post.title}</h3>
                  </Link>
                  <div className="flex flex-wrap gap-2">
                    {post.tags?.map((tag: string) => (
                      <span key={tag} className="text-xs bg-muted/50 border border-border/30 px-3 py-1 rounded-full text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b border-white/10 pb-4 text-muted-foreground">People</h2>
            <div className="flex flex-col gap-4">
              {results.users.map((user: any) => (
                <Link key={user._id} href={`/author/${user._id}`} className="block">
                  <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50 bg-card/50">
                    <UserAvatar name={user.name} image={user.image} size={48} />
                    <div>
                      <p className="font-bold text-base">{user.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{user.followers?.length || 0} followers</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
