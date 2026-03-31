"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserCheck, UserPlus } from "lucide-react";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
  followerCount?: number;
}

export default function FollowButton({ targetUserId, initialIsFollowing, followerCount }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [count, setCount] = useState(followerCount ?? 0);
  const [loading, setLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const handleFollow = async () => {
    if (!session) {
      router.push("/auth/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/users/${targetUserId}/follow`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing);
        setCount(prev => data.isFollowing ? prev + 1 : prev - 1);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const label = loading
    ? "..."
    : isFollowing
      ? isHovering ? "Unfollow" : "Following ✓"
      : "Follow";

  return (
    <Button 
      onClick={handleFollow} 
      disabled={loading}
      variant={isFollowing ? "outline" : "default"}
      className={`rounded-full px-5 transition-all duration-200 ${
        isFollowing && isHovering 
          ? "border-red-500/50 text-red-400 hover:bg-red-500/10" 
          : ""
      }`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {isFollowing ? (
        isHovering ? <UserCheck size={14} className="mr-1.5 text-red-400" /> : <UserCheck size={14} className="mr-1.5" />
      ) : (
        <UserPlus size={14} className="mr-1.5" />
      )}
      {label}
    </Button>
  );
}
