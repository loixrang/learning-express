import { Router } from "express";
import { addTask, listTasks, specificTask } from "../controllers/task.controller";

export const router = Router()

router.route("/").post(addTask)
router.route("/").get(listTasks)
router.route("/:id").get(specificTask)