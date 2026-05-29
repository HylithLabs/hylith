import { config } from "dotenv";
import { connectMongoose } from "@/lib/mongoose";
import { Meeting } from "@/models/meeting";

config();

async function deleteAllMeetings() {
  try {
    console.log("Connecting to MongoDB...");
    await connectMongoose();
    console.log("Connected successfully!");

    console.log("Deleting all meetings...");
    const result = await Meeting.deleteMany({});
    console.log(`✓ Deleted ${result.deletedCount} meetings`);

    process.exit(0);
  } catch (error) {
    console.error("Error deleting meetings:", error);
    process.exit(1);
  }
}

deleteAllMeetings();
