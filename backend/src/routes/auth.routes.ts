import { Router } from "express";
import { validateBody } from "../middleware/validate";
import {
  loginSchema,
  refreshSchema,
  signupSchema,
  type LoginInput,
  type RefreshInput,
  type SignupInput,
} from "../schemas/auth.schema";
import { login, logout, refresh, signup } from "../services/auth.service";

export const authRouter = Router();

authRouter.post("/signup", validateBody(signupSchema), async (req, res) => {
  const input = req.body as SignupInput;
  const result = await signup(input);
  res.status(201).json(result);
});

authRouter.post("/login", validateBody(loginSchema), async (req, res) => {
  const input = req.body as LoginInput;
  const result = await login(input);
  res.json(result);
});

authRouter.post("/refresh", validateBody(refreshSchema), async (req, res) => {
  const { refreshToken } = req.body as RefreshInput;
  const result = await refresh(refreshToken);
  res.json(result);
});

authRouter.post("/logout", validateBody(refreshSchema), async (req, res) => {
  const { refreshToken } = req.body as RefreshInput;
  await logout(refreshToken);
  res.status(204).end();
});
