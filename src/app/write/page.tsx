"use client";

import { useState, useEffect, Suspense } from "react";
import PremiumEditor from "@/components/Editor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import AIAssistant from "@/components/AIAssistant";

// Form Component (relies on Search Params)
function WriteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isFetching, setIsFetching] = useState(!!editId);

  // Load existing post if in edit mode
  useEffect(() => {
    if (editId) {
      setIsFetching(true);
      fetch(`/api/posts/${editId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setTitle(data.title || "");
            setContent(data.content || "");
            setTags(data.tags?.join(", ") || "");
          }
        })
        .finally(() => setIsFetching(false));
    }
  }, [editId]);

  // Handle Create or Update
  const handleSave = async (published: boolean) => {
    if (!title.trim() || !content.trim()) {
      alert("Title and content are required.");
      return;
    }

    published ? setIsPublishing(true) : setIsLoading(true);

    try {
      const payload = { title, content, tags, published };

      const url = editId ? `/api/posts/${editId}` : `/api/posts`;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        if (published) {
          router.push(`/dashboard/posts`);
        } else {
          router.push(`/dashboard/drafts`);
        }
        router.refresh();
      } else {
        alert(data.error || "Something went wrong saving the post.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save post.");
    } finally {
      setIsPublishing(false);
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full border-4 border-muted/20 border-t-primary h-12 w-12" />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {editId ? "Edit Story" : "Write a New Story"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Craft something beautiful to share with the world.</p>
          </div>
          
          <div className="space-x-3 flex">
            <Button 
              variant="outline" 
              className="bg-background border-border/50 hover:bg-muted/30" 
              onClick={() => handleSave(false)}
              disabled={isLoading || isPublishing}
            >
              {isLoading ? "Saving..." : "Save Draft"}
            </Button>
            <Button 
              onClick={() => handleSave(true)}
              disabled={isLoading || isPublishing || !title.trim() || !content.trim()}
            >
              {isPublishing ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Title Input */}
          <input
            type="text"
            className="w-full bg-transparent text-4xl sm:text-5xl font-black tracking-tight placeholder:text-muted-foreground/30 focus:outline-none focus:ring-0 border-none px-0 mb-4 text-foreground"
            placeholder="New Post Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          
          {/* Editor Wrapper */}
          <div className="min-h-[500px]">
            <PremiumEditor content={content} onChange={setContent} />
          </div>

          {/* Tags / Metadata */}
          <div className="pt-8 space-y-2 pb-24">
            <label className="text-sm font-medium text-muted-foreground">Tags (comma separated)</label>
            <Input 
              className="bg-background border-border/50"
              placeholder="technology, programming, nextjs"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Floating AI Assistant */}
      <AIAssistant
        content={content}
        onApplyTitle={(t) => setTitle(t)}
        onApplyTags={(tg) => setTags(tg)}
        onApplyContent={(html) => setContent(html)}
      />
    </>
  );
}

// Wrapper with Suspense
export default function WritePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={
        <div className="flex h-[50vh] items-center justify-center">
          <div className="animate-spin rounded-full border-4 border-muted/20 border-t-primary h-12 w-12" />
        </div>
      }>
        <WriteForm />
      </Suspense>
    </div>
  );
}
