/**
 * UserAvatar - Displays user's profile image if set,
 * otherwise falls back to a styled circle with the first letter of their name.
 */

interface UserAvatarProps {
  name?: string | null;
  image?: string | null;
  size?: number; // width & height in pixels (e.g. 40)
  className?: string;
}

// Generate a deterministic hue from a name for a unique color per user
function nameToHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

export default function UserAvatar({ name, image, size = 40, className = "" }: UserAvatarProps) {
  const hasImage = image && image.trim() !== "" && image !== "/default-avatar.png";
  const initial = name ? name.charAt(0).toUpperCase() : "?";
  const hue = name ? nameToHue(name) : 220;

  const style: React.CSSProperties = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    fontSize: Math.max(10, Math.round(size * 0.38)),
  };

  if (hasImage) {
    return (
      <img
        src={image!}
        alt={name || "User"}
        style={style}
        className={`rounded-full object-cover border border-white/10 ${className}`}
      />
    );
  }

  return (
    <div
      style={{
        ...style,
        background: `linear-gradient(135deg, hsl(${hue}, 65%, 40%), hsl(${(hue + 40) % 360}, 70%, 55%))`,
      }}
      className={`rounded-full flex items-center justify-center font-bold text-white border border-white/10 select-none shrink-0 ${className}`}
      aria-label={`${name || "User"} avatar`}
    >
      {initial}
    </div>
  );
}
