import { defineDb, defineTable, column } from 'astro:db';

const Guestbook = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    name: column.text(),
    message: column.text(),
    website: column.text({ optional: true }),
    parentId: column.number({ optional: true, deprecated: true }),
    heartCount: column.number({ optional: true }),
    createdAt: column.date(),
  },
});

const BlogComment = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    postSlug: column.text(),
    name: column.text(),
    email: column.text({ optional: true }),
    website: column.text({ optional: true }),
    content: column.text(),
    ipAddress: column.text({ optional: true }),
    parentId: column.number({ optional: true }),
    createdAt: column.date(),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: {
    Guestbook,
    BlogComment,
  },
});

