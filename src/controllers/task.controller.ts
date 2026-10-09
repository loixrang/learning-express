import { eq, and } from "drizzle-orm";
import { db } from "../db/client";
import { tasks } from "../db/schema";
import { z } from "zod";
import type { RequestHandler } from "express";

const createTaskSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().nullable().optional(),
  completed: z.boolean().optional(),
});

const addTask: RequestHandler = async (req, res) => {
  const result = createTaskSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ errors: result.error.issues });
    return;
  }
  try {
    const validatedTask = result.data;

    const good = await db
      .insert(tasks)
      .values({
        title: validatedTask.title,
        description: validatedTask.description,
        completed: validatedTask.completed,
        userId: res.locals.userId,
      })
      .returning();

    if (!good) {
      return res.status(500).json({ message: "can't complete request" });
    }

    res.status(200).json({ message: "Task added succesfully", good });
  } catch (error) {
    res.status(400).json({ message: "Internal server error", error });
  }
};

const listTasks: RequestHandler = async (_req, res) => {
  try {
    const taskLists = await db.select().from(tasks);
    if (!taskLists) {
      throw new Error("Error found");
    }
    res.status(200).json({ message: "Succesful", taskLists });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

const specificTask: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const task = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    if (task.length === 0)
      return res.status(404).json({ message: "user not found" });
    res
      .status(200)
      .json({ message: "Request completed", specificTask: task[0] });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

const updateTask: RequestHandler = async (req, res) => {
  const result = createTaskSchema.safeParse(req.body);
  const id = Number(req.params.id);
  if (!result.success) {
    res.status(401).json({ errors: result.error.issues });
    return;
  }
  try {
    const validatedTask = result.data;
    const [updatedTask] = await db
      .update(tasks)
      .set({ title: validatedTask?.title, completed: validatedTask?.completed })
      .where(and(eq(tasks.id, id), eq(tasks.userId, res.locals.userId)))
      .returning();

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json({ message: "Task updated succesfully", updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

const deleteTask: RequestHandler = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1 || id > 2_147_483_647) {
    res.status(400).json({ message: "Invalid task ID." });
    return;
  }
  try {
    const deleteTask = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning();
    if (!deleteTask) {
      res.status(404).json({ message: "Task not found." });
      return;
    }
    res.status(201).json({ message: "deleted successfully", deleteTask });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

const queryTask: RequestHandler = async (req, res, next) => {
  const completed = req.query.completed;
  if (
    completed !== undefined &&
    completed !== "true" &&
    completed !== "false"
  ) {
    res.status(400).json({ message: "Completed must be true or false" });
    return;
  }
  const completionFIlter =
    completed === undefined
      ? undefined
      : eq(tasks.completed, completed === "true");

  const records = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, res.locals.userId), completionFIlter))
    .orderBy(tasks.id)
    .limit(20);

  try {
    const records = await db
      .select()
      .from(tasks)
      .where(completionFIlter)
      .orderBy(tasks.id)
      .limit(20);
    if (records.length === 0) {
      return res.status(404).json({ message: "No tasks found for this user" });
    }
    res.json(records);
  } catch (error) {
    next(error);
  }
};

export { addTask, listTasks, specificTask, updateTask, deleteTask, queryTask };
