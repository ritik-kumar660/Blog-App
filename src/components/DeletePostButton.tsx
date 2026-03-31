"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function DeletePostButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        // Automatically refresh Server Components to update the list
        router.refresh(); 
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete");
        setIsDeleting(false);
      }
    } catch (err) {
      alert("Something went wrong");
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleDelete}
      disabled={isDeleting}
      className={`h-8 px-2 relative z-20 ${
        isDeleting 
          ? "opacity-50 text-muted-foreground" 
          : "text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-colors"
      }`}
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  );
}
