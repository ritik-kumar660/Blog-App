"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Heart, Reply, Trash2 } from "lucide-react";
import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";

interface CommentType {
  _id: string;
  content: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
  author: { _id: string; name: string; image: string; role?: string; };
  replies: CommentType[];
}

function CommentItem({
  comment,
  session,
  depth = 0,
  onReply,
  onLike,
  onDelete,
}: {
  comment: CommentType;
  session: any;
  depth?: number;
  onReply: (parentId: string, content: string) => Promise<boolean>;
  onLike: (commentId: string, isLiked: boolean) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Derive initial local state for optimistic UI
  const [likesCount, setLikesCount] = useState(comment.likes || 0);
  const currentUserId = session?.user?.id;
  const [isLiked, setIsLiked] = useState<boolean>(
    currentUserId ? comment.likedBy?.includes(currentUserId) : false
  );

  const handleLikeClick = async () => {
    if (!session) return;
    const previousIsLiked = isLiked;
    setIsLiked(!isLiked);
    setLikesCount(prev => (isLiked ? prev - 1 : prev + 1));
    await onLike(comment._id, previousIsLiked);
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    const success = await onReply(comment._id, replyContent);
    setSubmitting(false);
    if (success) {
      setIsReplying(false);
      setReplyContent("");
    }
  };

  // Only allow replies 1 level deep to avoid nested squishing
  const canReply = depth < 1 && session;

  return (
    <div className={`flex gap-4 ${depth > 0 ? "ml-12 mt-4" : "mt-6"}`}>
      <Link href={`/author/${comment.author?._id}`} className="shrink-0 group/avatar">
        <div className="group-hover/avatar:ring-2 group-hover/avatar:ring-primary/50 rounded-full transition-all">
          <UserAvatar name={comment.author?.name} image={comment.author?.image} size={40} />
        </div>
      </Link>
      <div className="flex-1 space-y-2">
        <div className="bg-card/50 dark:bg-white/5 border border-border/30 dark:border-white/10 rounded-2xl rounded-tl-sm p-4 text-sm shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Link href={`/author/${comment.author?._id}`} className="font-semibold flex items-center gap-1 hover:text-primary transition-colors">
              {comment.author?.name}
              {comment.author?.role === "admin" && (
                <span className="ml-1 text-[10px] font-bold tracking-wider uppercase bg-primary text-primary-foreground px-1.5 py-[1px] rounded shadow-sm">Admin</span>
              )}
            </Link>
            <span className="text-xs text-muted-foreground">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="whitespace-pre-wrap leading-relaxed">{comment.content}</p>
        </div>
        
        <div className="flex items-center gap-4 px-2 text-xs text-muted-foreground font-medium">
          <button onClick={handleLikeClick} className={`flex items-center gap-1.5 transition-colors hover:text-red-400 ${isLiked ? "text-red-500" : ""}`}>
            <Heart size={14} className={isLiked ? "fill-current" : ""} />
            {likesCount}
          </button>
          
          {canReply && (
            <button onClick={() => setIsReplying(!isReplying)} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Reply size={14} /> Reply
            </button>
          )}

          {(currentUserId === comment.author?._id || session?.user?.role === "admin") && (
            <button onClick={() => onDelete(comment._id)} className="flex items-center gap-1.5 hover:text-red-400 transition-colors ml-auto">
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>

        {isReplying && (
          <div className="mt-4 flex gap-3">
            <div className="flex-1">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full bg-background border border-border/50 rounded-lg p-3 text-sm min-h-[60px] resize-none focus:outline-none focus:border-primary/50 text-foreground"
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button size="sm" variant="ghost" onClick={() => setIsReplying(false)}>Cancel</Button>
                <Button size="sm" onClick={handleReplySubmit} disabled={submitting || !replyContent.trim()}>Reply</Button>
              </div>
            </div>
          </div>
        )}

        {/* Render nested replies */}
        {comment.replies?.length > 0 && (
          <div className="space-y-4">
            {comment.replies.map(reply => (
              <CommentItem 
                key={reply._id} 
                comment={reply} 
                session={session} 
                depth={depth + 1} 
                onReply={onReply}
                onLike={onLike}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentsSection({ postId }: { postId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");

  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch(`/api/posts/${postId}/comments`);
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } catch (err) {
        console.error("Failed to load comments", err);
      } finally {
        setLoading(false);
      }
    }
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const newComment = await res.json();
        newComment.replies = [];
        setComments((prev) => [newComment, ...prev]);
        setContent("");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string, replyContent: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent, replyTo: parentId }),
      });
      if (res.ok) {
        const newReply = await res.json();
        // Insert reply locally into the correct parent
        setComments(prev => prev.map(c => {
          if (c._id === parentId) {
            return { ...c, replies: [...(c.replies || []), newReply] };
          }
          return c;
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleLike = async (commentId: string, previouslyLiked: boolean) => {
    try {
      await fetch(`/api/posts/${postId}/comments/${commentId}/like`, { method: "POST" });
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, { method: "DELETE" });
      if (res.ok) {
        // Deep removal
        setComments(prev => {
          return prev.filter(c => c._id !== commentId).map(c => ({
            ...c,
            replies: c.replies?.filter(r => r._id !== commentId) // Also check 1 level deep
          }));
        });
      }
    } catch (error) {
       console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center py-10">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Count total comments including replies
  const totalCommentsCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  return (
    <section className="mt-16 pt-10 border-t border-border/50" id="comments">
      <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
        Discussion <span className="text-primary text-sm bg-primary/20 px-3 py-1 rounded-full">{totalCommentsCount}</span>
      </h3>

      {session?.user ? (
        <form onSubmit={handleSubmit} className="mb-10 bg-card/30 border border-border/50 rounded-2xl p-4 shadow-sm relative z-10 font-sans">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts on this article..."
            className="w-full bg-transparent border-none text-sm resize-none outline-none min-h-[80px]"
            maxLength={1000}
            required
          />
          <div className="flex items-center justify-between border-t border-border/10 pt-3 mt-2">
             <div className="flex items-center gap-3">
                <UserAvatar name={session.user.name} image={session.user.image} size={32} />
                <span className="text-sm font-medium text-muted-foreground">Commenting as <span className="text-foreground">{session.user.name}</span></span>
             </div>
             <Button type="submit" disabled={submitting || !content.trim()} className="rounded-full shadow-lg">
               {submitting ? "Posting..." : "Post Comment"}
             </Button>
          </div>
        </form>
      ) : (
        <div className="mb-10 p-6 rounded-2xl border border-border/50 bg-muted/30 text-center">
          <p className="text-muted-foreground mb-4">You must be logged in to join the discussion.</p>
          <Button onClick={() => window.location.href = "/auth/login"} variant="outline" className="rounded-full">
            Log in to comment
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {comments.length === 0 ? (
           <p className="text-center text-muted-foreground py-8 italic font-serif">Be the first to share your thoughts!</p>
        ) : (
          comments.map((comment) => (
            <CommentItem 
              key={comment._id}
              comment={comment}
              session={session}
              onReply={handleReply}
              onLike={handleLike}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </section>
  );
}
