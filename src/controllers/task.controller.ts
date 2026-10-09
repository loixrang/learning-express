import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { tasks } from "../db/schema";
import type { RequestHandler } from "express";

const addTask: RequestHandler = async (req, res) => {
  try {
    const {title, description, completed} = req.body;

    if (!title || !description) {
      return res.status(401).json({message: "Incomplete detail"})
    }

    const good = await db.insert(tasks).values({title: title, description: description, completed: completed})

    if (!good) {
      return res.status(500).json({message: "can't complete request"})
    }

    res.status(200).json({message: "Task added succesfully"})
  } catch (error) {
    res.status(400).json({message: "Internal server error", error})
  }
};

const listTasks: RequestHandler =  async (req, res) => {
  try {
    const taskLists = await db.select().from(tasks)
    if (!taskLists) {
      throw new Error("Error found");
    }
    res.status(200).json({message: "Succesful", taskLists})
  } catch (error) {
    res.status(500).json({message: "Internal server error", error})
  }
}

const specificTask: RequestHandler =  async (req, res) => {
  try {
    const id = Number(req.params.id)
    const task = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1)
    if (task.length === 0)
      return res.status(404).json({message: "user not found"})
    res.status(200).json({message: "Request completed", specificTask: task[0]})
  } catch (error) {
    res.status(500).json({message: "Internal server error", error})
  }
}

export {addTask, listTasks, specificTask}