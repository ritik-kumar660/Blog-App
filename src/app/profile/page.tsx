"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
  const { update, data: session } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [preview, setPreview] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    socialLinks: {
      github: "",
      linkedin: "",
      twitter: ""
    }
  });

  // Fetch true database stats rather than relying blindly on NextAuth session storage which only holds email/image
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.name || "",
            bio: data.bio || "",
            socialLinks: {
              github: data.socialLinks?.github || "",
              linkedin: data.socialLinks?.linkedin || "",
              twitter: data.socialLinks?.twitter || ""
            }
          });
          setPreview(data.image || "");
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instantly preview 
    setPreview(URL.createObjectURL(file));
    setSavingAvatar(true);

    try {
      // 1. Upload to Cloudinary instantly
      const formUpload = new FormData();
      formUpload.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formUpload,
      });
      const data = await res.json();

      if (!data.url) throw new Error(data.error || "Cloudinary upload failed");

      // 2. Patch into DB exclusively via the Avatar endpoint
      await fetch("/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: data.url }),
      });

      // 3. Update NextAuth Session so Navbar repaints
      await update({
        image: data.url,
        user: { image: data.url },
      });

      alert("Avatar changed successfully! ✅");
      router.refresh();

    } catch (error: any) {
      console.error(error);
      alert(`Avatar upload failed ❌\n${error.message || "Please check your network."}`);
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Update failed");

      // Update NextAuth Session if name changed (since Name is displayed in Navbar)
      if (session?.user?.name !== formData.name) {
         await update({
            name: formData.name,
            user: { name: formData.name }
         });
      }

      alert("Profile metadata updated! ✨");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to update profile data");
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your public identity and social presence.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
        
        {/* Left Side: Avatar Panel */}
        <div className="flex flex-col items-center gap-4 bg-card border border-border/50 rounded-2xl p-6 shadow-sm text-center">
          <div className="relative group cursor-pointer w-32 h-32 rounded-full overflow-hidden border-2 border-border/30 shadow-md bg-muted/30 flex shrink-0 items-center justify-center">
             
             {preview ? (
               <img src={preview} alt="Avatar" className="w-full h-full object-cover transition-opacity group-hover:opacity-50" />
             ) : (
               <span className="text-4xl font-bold text-primary">{formData.name ? formData.name.charAt(0) : "?"}</span>
             )}

             {/* Hover Overlay */}
             <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
             </div>

             {savingAvatar && (
               <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                 <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
               </div>
             )}

             <input 
               type="file" 
               accept="image/*"
               onChange={handleFileChange}
               className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
               disabled={savingAvatar}
             />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{formData.name || "Your Name"}</h3>
            <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
          </div>
          <p className="text-xs text-muted-foreground pt-2 px-4 leading-relaxed border-t border-border/10 w-full mt-2">
            Click the avatar to instantly swap your profile picture globally. Max 5MB.
          </p>
        </div>

        {/* Right Side: Metadata Form */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 shadow-sm">
           <form onSubmit={handleProfileSave} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/90">Display Name</label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Jane Doe"
                  className="bg-background border-border/50 focus-visible:ring-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/90">Short Bio</label>
                <textarea 
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Senior software engineer exploring React Native..."
                  className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary min-h-[100px] resize-none transition-colors"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground text-right">{formData.bio.length} / 200</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/10">
                <h3 className="font-semibold text-foreground/90">Social Links</h3>
                
                <div className="flex bg-background rounded-md border border-border/50 items-center px-3 focus-within:ring-1 focus-within:ring-primary h-10 overflow-hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                  <Input 
                    value={formData.socialLinks.github}
                    onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, github: e.target.value }})}
                    placeholder="github.com/username"
                    className="border-none bg-transparent shadow-none focus-visible:ring-0"
                  />
                </div>

                <div className="flex bg-background rounded-md border border-border/50 items-center px-3 focus-within:ring-1 focus-within:ring-primary h-10 overflow-hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                  <Input 
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value }})}
                    placeholder="linkedin.com/in/username"
                    className="border-none bg-transparent shadow-none focus-visible:ring-0"
                  />
                </div>

                <div className="flex bg-background rounded-md border border-border/50 items-center px-3 focus-within:ring-1 focus-within:ring-primary h-10 overflow-hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                  <Input 
                    value={formData.socialLinks.twitter}
                    onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: e.target.value }})}
                    placeholder="twitter.com/username"
                    className="border-none bg-transparent shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={savingProfile}
                  className="rounded-full px-8 shadow-sm hover:shadow-md transition-all h-10 border-transparent"
                >
                  {savingProfile ? "Saving..." : "Save Changes"}
                </Button>
              </div>

           </form>
        </div>
      </div>
    </div>
  );
}