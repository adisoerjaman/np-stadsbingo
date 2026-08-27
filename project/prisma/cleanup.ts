import { PrismaClient } from "@prisma/client";
import { deleteImage } from "../src/lib/storage";

/**
 * Bewaartermijn-opschoning (AVG). Verwijdert inzendingen — en de bijbehorende
 * foto's — die ouder zijn dan RETENTION_DAYS (default 90 dagen).
 *
 * Gebruik:           npm run db:cleanup
 * Productie (cron):  dagelijks draaien, bv. via een scheduled job.
 */
const prisma = new PrismaClient();

async function main() {
  const days = Number(process.env.RETENTION_DAYS ?? 90);
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const oldSubmissions = await prisma.submission.findMany({
    where: { createdAt: { lt: cutoff } },
    select: { id: true, answerImage: true },
  });

  for (const submission of oldSubmissions) {
    await deleteImage(submission.answerImage);
  }

  const { count } = await prisma.submission.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  console.log(
    `Cleanup klaar: ${count} inzending(en) ouder dan ${days} dagen verwijderd.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
