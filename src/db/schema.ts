import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
})

export const tasks = pgTable("tasks", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  title: text("title").notNull(),
  userId: integer("user_id").references(()=>users.id),
  description: text("description"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("createdAt", {withTimezone: true}).defaultNow().notNull().$onUpdate(() => new Date())
})