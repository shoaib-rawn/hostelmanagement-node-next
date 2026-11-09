import { Router } from "express";
import { authenticate, getAuth } from "../middleware/authenticate";
import { validateBody } from "../middleware/validate";
import {
  loginSchema,
  refreshSchema,
  signupSchema,
  type LoginInput,
  type RefreshInput,
  type SignupInput,
} from "../schemas/auth.schema";
import {
  getMe,
  login,
  logout,
  logoutAll,
  refresh,
  signup,
} from "../services/auth.service";
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
authRouter.get("/me", authenticate, async (req, res) => {
  const { userId } = getAuth(req);
  const me = await getMe(userId);
  res.json(me);
});

authRouter.post("/logout-all", authenticate, async (req, res) => {
  const { userId } = getAuth(req);
  await logoutAll(userId);
  res.status(204).end();
});
