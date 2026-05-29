import dns from "node:dns";
import { isSrvUri } from "@/lib/mongodb-uri";

/**
 * Node on Windows often cannot resolve mongodb+srv via router DNS (querySrv ECONNREFUSED).
 * Call before every MongoClient.connect().
 */
export function configureMongoDns() {
  const uri =
    process.env.MONGODB_URI_DIRECT?.trim() ||
    process.env.MONGODB_URI?.trim();

  if (!uri || !isSrvUri(uri)) return;

  dns.setDefaultResultOrder("ipv4first");

  if (process.env.MONGODB_DNS_SERVERS) {
    dns.setServers(
      process.env.MONGODB_DNS_SERVERS.split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
  } else if (process.platform === "win32") {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
  }
}
