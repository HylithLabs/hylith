import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import {
  AGENCY_TIMEZONE,
  SLOT_DURATION_MINUTES,
} from "@/lib/availability-constants";

const availabilitySettingsSchema = new Schema(
  {
    /** ISO-8601 UTC strings for each open 30-min slot (Asia/Dhaka wall time). */
    availableSlots: { type: [String], default: [] },
    slotDurationMinutes: {
      type: Number,
      default: SLOT_DURATION_MINUTES,
      min: 15,
      max: 120,
    },
    timezone: { type: String, default: AGENCY_TIMEZONE },
  },
  { timestamps: true },
);

export type AvailabilitySettingsDocument = InferSchemaType<
  typeof availabilitySettingsSchema
> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

// Avoid stale schema from earlier deploys (e.g. workDays-only model) in dev HMR.
if (mongoose.models.AvailabilitySettings) {
  delete mongoose.models.AvailabilitySettings;
}

export const AvailabilitySettings: Model<AvailabilitySettingsDocument> =
  mongoose.model<AvailabilitySettingsDocument>(
    "AvailabilitySettings",
    availabilitySettingsSchema,
  );
