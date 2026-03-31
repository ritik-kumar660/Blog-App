"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface InteractionProps {
  postId: string;
  initialLikes: number;
  initialHasLiked: boolean;
  initialHasSaved: boolean;
  initialCommentCount?: number;
  variant?: "full" | "feed";
  showComment?: boolean;
}

export default function PostInteractions({
  postId,
  initialLikes,
  initialHasLiked,
  initialHasSaved,
  initialCommentCount = 0,
  variant = "full",
  showComment = false,
}: InteractionProps) {
  const router = useRouter();

  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [hasSaved, setHasSaved] = useState(initialHasSaved);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareText, setShareText] = useState("Share");

  const handleLike = async () => {
    // Optimistic Update
    setHasLiked(!hasLiked);
    setLikes(hasLiked ? likes - 1 : likes + 1);
    setIsLiking(true);

    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (!res.ok) {
        // Revert on failure
        setHasLiked(hasLiked);
        setLikes(initialLikes);
        
        if (res.status === 401) {
          alert("Please login to like this post.");
        }
      }
    } catch (err) {
      setHasLiked(hasLiked);
      setLikes(initialLikes);
    } finally {
      setIsLiking(false);
      router.refresh();
    }
  };

  const handleSave = async () => {
    // Optimistic Update
    setHasSaved(!hasSaved);
    setIsSaving(true);

    try {
      const res = await fetch(`/api/posts/${postId}/save`, { method: "POST" });
      if (!res.ok) {
        // Revert on failure
        setHasSaved(hasSaved);
        if (res.status === 401) {
          alert("Please login to save this post.");
        }
      }
    } catch (err) {
      setHasSaved(hasSaved);
    } finally {
      setIsSaving(false);
      router.refresh();
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    const shareUrl = window.location.href;
    const shareTitle = typeof document !== "undefined" ? document.title : "Ritik Blog Post";

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        });
        setShareText("Shared!");
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      // Fallback for desktop: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareText("Copied!");
      } catch (err) {
        setShareText("Error");
      }
    }

    setTimeout(() => {
      setShareText("Share");
      setIsSharing(false);
    }, 2000);
  };

  const isFeed = variant === "feed";

  return (
    <div className={`flex items-center ${isFeed ? "gap-2" : "gap-4 border-t border-b border-white/10 py-4 my-8"} relative z-30`}>
      {/* Like Button */}
      <Button
        variant="ghost"
        onClick={handleLike}
        disabled={isLiking}
        className={`flex items-center gap-2 rounded-full transition-all ${
          isFeed ? "px-2 h-8" : "px-4"
        } ${
          hasLiked
            ? "text-red-500 bg-red-500/10 hover:bg-red-500/20 hover:text-red-400"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={isFeed ? "16" : "20"}
          height={isFeed ? "16" : "20"}
          viewBox="0 0 24 24"
          fill={hasLiked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          className={hasLiked ? "scale-110 transition-transform" : "scale-100 transition-transform"}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span className={`${isFeed ? "text-xs" : "font-semibold"}`}>{likes}</span>
      </Button>

      {/* Comment Button (Feed Only) */}
      {isFeed && showComment && (
        <Button
          variant="ghost"
          onClick={() => router.push(`/blog/${postId}#comments`)}
          className="flex items-center gap-2 rounded-full px-2 h-8 transition-all text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="text-xs">{initialCommentCount}</span>
        </Button>
      )}

      {/* Save Button */}
      <Button
        variant="ghost"
        onClick={handleSave}
        disabled={isSaving}
        className={`flex items-center gap-2 rounded-full transition-all ${
          isFeed ? "px-2 h-8" : "px-4"
        } ${
          hasSaved
            ? "text-primary bg-primary/10 hover:bg-primary/20"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={isFeed ? "16" : "20"}
          height={isFeed ? "16" : "20"}
          viewBox="0 0 24 24"
          fill={hasSaved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          className={hasSaved ? "scale-110 transition-transform" : "scale-100 transition-transform"}
        >
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </svg>
        {!isFeed && <span className="font-semibold">{hasSaved ? "Saved" : "Save"}</span>}
      </Button>

      {/* Share Button (Full Only for UI clarity, but logic is added below for both) */}
      <Button
        variant="ghost"
        onClick={handleShare}
        disabled={isSharing}
        className={`flex items-center gap-2 rounded-full transition-all text-muted-foreground hover:text-foreground hover:bg-accent ${
          isFeed ? "px-2 h-8" : "px-4"
        } ${
          isSharing ? "text-primary bg-primary/10" : ""
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={isFeed ? "16" : "20"}
          height={isFeed ? "16" : "20"}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={isSharing ? "scale-110 transition-transform" : "scale-100 transition-transform"}
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        {!isFeed && <span className="font-semibold">{shareText}</span>}
      </Button>
    </div>
  );
}
