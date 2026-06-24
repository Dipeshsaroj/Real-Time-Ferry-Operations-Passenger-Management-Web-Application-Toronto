import { PrismaClient } from "@prisma/client"
import fs from "fs"

const prismaClientSingleton = () => {
  let dbUrl = process.env.DATABASE_URL;

  // In Vercel serverless environment, the filesystem is read-only.
  // We copy the read-only dev.db to /tmp/dev.db on first invoke so writes succeed.
  if (process.env.VERCEL) {
    const sourceDbPath = "/var/task/prisma/dev.db";
    const targetDbPath = "/tmp/dev.db";

    try {
      if (!fs.existsSync(targetDbPath)) {
        console.log(`Copying SQLite database to writable path: ${targetDbPath}`);
        fs.copyFileSync(sourceDbPath, targetDbPath);
      }
      dbUrl = `file:${targetDbPath}`;
    } catch (err) {
      console.error("Failed to initialize SQLite in /tmp:", err);
    }
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma
