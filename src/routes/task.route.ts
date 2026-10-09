import { Router } from "express";
import { addTask, deleteTask, listTasks, queryTask, specificTask, updateTask } from "../controllers/task.controller";

export const router = Router()

router.route("/").post(addTask).get(listTasks).get(queryTask)
router.route("/search").get(queryTask)
router.route("/:id").get(specificTask).patch(updateTask).delete(deleteTask)