import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  likes: number;
  likedBy: mongoose.Types.ObjectId[];
  replies: mongoose.Types.ObjectId[];
  parentComment?: mongoose.Types.ObjectId;
  isAuthorBanned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    content: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    replies: [{
      type: Schema.Types.ObjectId,
      ref: "Comment",
    }],
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    isAuthorBanned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent Next.js HMR model overwrite crash
if (mongoose.models.Comment) {
  delete mongoose.models.Comment;
}
const Comment = mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
