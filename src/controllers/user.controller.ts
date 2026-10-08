import { db } from "../db/client";
import { users } from "../db/schema";
import { type RequestHandler } from "express";

const getUsers: RequestHandler = async (req, res, next) => {
  try {
    const records = await db.select().from(users).limit(20)
    if (!records) {
      throw new Error("Error found");
    }
    res.status(200).json({message: "Succesful", records})
  } catch (error) {
    res.status(500).json({message: "Internal server error", error})
  }
}

export {getUsers}