import express from "express";
import { router as userRouter } from "./routes/user.route";
import { router as taskRouter } from "./routes/task.route";
import { router as authRouter } from "./routes/auth.route";

const app = express();

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({status: "OK"})
})

app.use(express.json());
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tasks", taskRouter)

export default app;