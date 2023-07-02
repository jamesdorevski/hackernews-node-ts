import { PrismaClient, User } from "@prisma/client";
import { FastifyRequest } from "fastify";
import { JwtPayload, verify } from "jsonwebtoken";

export const APP_SECRET = "boo";

