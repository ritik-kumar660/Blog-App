import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  type: "like" | "comment" | "follow";
  post?: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "comment", "follow"],
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Notification) {
  delete mongoose.models.Notification;
}
const Notification = mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
