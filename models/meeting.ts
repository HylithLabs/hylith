import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const meetingSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    startAt: { type: Date, required: true, index: true },
    timezone: { type: String, required: true },
    durationMinutes: { type: Number, default: 30 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "closed"],
      default: "pending",
    },
    projectSummary: { type: String, required: true },
    company: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { timestamps: true },
);

meetingSchema.index({ startAt: 1, status: 1 });

export type MeetingDocument = InferSchemaType<typeof meetingSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Meeting: Model<MeetingDocument> =
  mongoose.models.Meeting ??
  mongoose.model<MeetingDocument>("Meeting", meetingSchema);
