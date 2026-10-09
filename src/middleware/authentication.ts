import "dotenv/config";
import type { RequestHandler } from "express";
import { eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { z } from "zod";

import { db } from "../db/client";
import { users } from "../db/schema";

const secretValue = process.env.JWT_SECRET;

if (!secretValue || secretValue.length < 32) {
  throw new Error("JWT_SECRET must contain a random secret");
}

const secret = new TextEncoder().encode(secretValue);

const registerBody = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().trim().min(8).max(50),
});

const loginBody = registerBody.pick({
  email: true,
  password: true,
});

export const register: RequestHandler = async (req, res, next) => {
  const result = registerBody.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ errors: result.error.issues });
    return;
  }

  try {
    const { name, email, password } = result.data;
    const passwordHash = await Bun.password.hash(password, {
      algorithm: "argon2id",
    });

    const [user] = await db
      .insert(users)
      .values({ name, email, passwordHash })
      .onConflictDoNothing({ target: users.email })
      .returning({ id: users.id, name: users.name, email: users.email });

    if (!user) {
      res.status(409).json({ message: "User already registered" });
      return;
    }
    res.status(201).json({ user });
  } catch (error) {
    return next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  const result = loginBody.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ errors: result.error.issues });
    return;
  }

  try {
    const { email, password } = result.data;
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!user || !(await Bun.password.verify(password, user.passwordHash))) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(String(user.id))
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    return next(error);
  }
};

export const requireAuth: RequestHandler = async (req, res, next) => {
  const authorization = req.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  let userId: number;

  try {
    const token = authorization.slice(7);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
      requiredClaims: ["sub", "exp"],
    });

    userId = Number(payload.sub);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      throw new Error("Invalid user ID");
    }
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token", error });
    return;
  }

  res.locals.userId = userId;
  next();
};
