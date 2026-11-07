import { Router } from "express";
import { validateBody } from "../middleware/validate";
import { signupSchema, type SignupInput } from "../schemas/auth.schema";
import { signup } from "../services/auth.service";

export const authRouter = Router();

authRouter.post("/signup", validateBody(signupSchema), async (req, res) => {
  const input = req.body as SignupInput;
  const result = await signup(input);
  res.status(201).json(result);
});
