import { Router } from "express";
import { addTask, deleteTask, listTasks, specificTask, updateTask } from "../controllers/task.controller";

export const router = Router()

router.route("/").post(addTask).get(listTasks)
router.route("/:id").get(specificTask).patch(updateTask).delete(deleteTask)