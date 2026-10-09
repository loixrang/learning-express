import { Router } from "express";
import { login, register } from "../module/auth.module";
export const router = Router()

router.route("/register").post(register)
router.route("/login").post(login)