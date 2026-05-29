/**
 * Resolves MongoDB connection string.
 * Use MONGODB_URI_DIRECT (standard mongodb://…) if mongodb+srv:// fails with querySrv ECONNREFUSED.
 */
export function getMongoUri(): string {
  const uri =
    process.env.MONGODB_URI_DIRECT?.trim() ||
    process.env.MONGODB_URI?.trim();

  if (!uri) {
    throw new Error(
      "Missing MONGODB_URI (or MONGODB_URI_DIRECT) environment variable",
    );
  }

  return uri;
}

export function isSrvUri(uri: string) {
  return uri.startsWith("mongodb+srv://");
}
