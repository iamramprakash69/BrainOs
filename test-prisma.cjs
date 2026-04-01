const { PrismaClient } = require('@prisma/client');
try {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || "file:./dev.db"
  });
  console.log("Success with config");
} catch (e) {
  console.log("Error:", e.message);
}
