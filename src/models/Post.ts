import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  title: string;
  content: string; // Storing rich text or JSON from Tiptap
  published: boolean;
  author: mongoose.Types.ObjectId;
  coverImage?: string;
  tags: string[];
  views: number;
  likes: number;
  likedBy?: mongoose.Types.ObjectId[];
  commentCount: number;
  readTime: number; // in minutes
  isAuthorBanned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    published: { type: Boolean, default: false },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    coverImage: { type: String, default: '' },
    tags: [{ type: String }],
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    commentCount: { type: Number, default: 0 },
    readTime: { type: Number, default: 1 },
    isAuthorBanned: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite in Next.js
if (mongoose.models.Post) {
  delete mongoose.models.Post;
}
const Post = mongoose.model<IPost>("Post", PostSchema);

export default Post;
