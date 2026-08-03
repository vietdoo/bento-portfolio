import { db, Guestbook } from "astro:db";

// https://astro.build/db/seed
export default async function seed() {
  await db.insert(Guestbook).values([
    {
      name: "Đỗ Quốc Việt",
      message: "Chào mừng bạn đến với bento portfolio của mình! Hãy để lại lời nhắn hoặc phản hồi góp ý tại đây nhé.",
      website: "https://vndo.vn",
      createdAt: new Date("2026-08-01T10:00:00Z"),
    },
    {
      name: "Alex Chen",
      message: "Awesome portfolio design! Love the darkslate theme, glassmorphism headers, and interactive Bento components.",
      website: "https://github.com",
      createdAt: new Date("2026-08-02T14:30:00Z"),
    },
    {
      name: "Minh Hoàng",
      message: "Giao diện mượt mà và thiết kế rất chỉn chu. Rất ấn tượng với kiến trúc Big Data & Microservices showcase!",
      createdAt: new Date("2026-08-03T09:15:00Z"),
    },
  ]);
}
