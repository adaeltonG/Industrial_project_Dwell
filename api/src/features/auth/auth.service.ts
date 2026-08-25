import type { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { config } from "../../config.js";
import { prisma } from "../../db.js";
import { ApiError } from "../../lib/api-error.js";

export function publicUser(user: User) {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

export function issueToken(user: Pick<User, "id" | "role">) {
  return jwt.sign({ role: user.role }, config.JWT_SECRET, {
    subject: user.id,
    expiresIn: config.JWT_EXPIRES_IN as SignOptions["expiresIn"]
  });
}

export async function register(input: { name: string; email: string; password: string }) {
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash }
  });
  return { user: publicUser(user), token: issueToken(user) };
}

export async function login(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
  }
  return { user: publicUser(user), token: issueToken(user) };
}
