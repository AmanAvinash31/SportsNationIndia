import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const subscribers = sqliteTable("subscribers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  interests: text("interests").notNull().default("[]"),
  lang: text("lang").notNull().default("en"),
});

export const insertSubscriberSchema = createInsertSchema(subscribers)
  .omit({ id: true })
  .extend({
    email: z.string().trim().toLowerCase().email("Enter a valid email address, like name@example.com"),
    interests: z.string().default("[]"),
    lang: z.enum(["en", "hi", "gu"]).default("en"),
  });

export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type Subscriber = typeof subscribers.$inferSelect;
