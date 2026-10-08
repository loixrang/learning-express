import { db } from "../db/client";
import { tasks } from "../db/schema";
import type { RequestHandler } from "express";

const addTask: RequestHandler = async (req, res) => {
  try {
    const {title, description, completed} = req.body;

    if (!title || !description || !completed) {
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
    const taskLists = await db.select().from(tasks).limit(20)
    if (!taskLists) {
      throw new Error("Error found");
    }
    res.status(200).json({message: "Succesful", taskLists})
  } catch (error) {
    res.status(500).json({message: "Internal server error", error})
  }
}

export {addTask, listTasks}