import { db, Guestbook } from "astro:db";

// https://astro.build/db/seed
export default async function seed() {
  await db.insert(Guestbook).values([
    {
      name: "Đỗ Quốc Việt",
      message: "Chào mừng bạn đến với bento portfolio của mình! Hãy để lại lời nhắn hoặc phản hồi góp ý tại đây nhé.",
      website: "https://vndo.vn",
      createdAt: new Date("2026-08-02T10:00:00Z"),
    },
  ]);
}
