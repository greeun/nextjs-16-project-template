/**
 * prisma db seed — 부트스트랩 Owner 계정 1개 생성(upsert).
 * 자격증명은 .env 의 OWNER_EMAIL / OWNER_PASSWORD (미설정 시 dev 기본값).
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  const email = process.env.OWNER_EMAIL || "admin@example.local";
  const password = process.env.OWNER_PASSWORD || "changeme-dev-only";
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await db.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Owner",
      passwordHash,
      role: "OWNER",
      emailVerified: new Date(),
    },
  });

  console.log(`[seed] owner ready: ${user.email} (id=${user.id})`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
