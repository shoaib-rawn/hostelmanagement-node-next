import { Router } from "express";
import { authenticate, getAuth } from "../middleware/authenticate";
import { requireRole } from "../middleware/require-role";
import { validateBody } from "../middleware/validate";
import { forTenant } from "../lib/tenant";
import {
  createMemberSchema,
  memberIdParamSchema,
  type CreateMemberInput,
} from "../schemas/member.schema";
import {
  createMember,
  getMember,
  listMembers,
} from "../services/member.service";

export const memberRouter = Router();

memberRouter.use(authenticate);

memberRouter.get("/", requireRole("OWNER", "MANAGER"), async (req, res) => {
  const { hostelId } = getAuth(req);
  const members = await listMembers(forTenant(hostelId));
  res.json(members);
});

memberRouter.get("/:id", requireRole("OWNER", "MANAGER"), async (req, res) => {
  const { hostelId } = getAuth(req);
  const { id } = memberIdParamSchema.parse(req.params);
  const member = await getMember(forTenant(hostelId), id);
  res.json(member);
});

memberRouter.post(
  "/",
  requireRole("OWNER"),
  validateBody(createMemberSchema),
  async (req, res) => {
    const { hostelId } = getAuth(req);
    const input = req.body as CreateMemberInput;
    const member = await createMember(forTenant(hostelId), hostelId, input);
    res.status(201).json(member);
  },
);
