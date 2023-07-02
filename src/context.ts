import { PrismaClient, User } from "@prisma/client";
import { FastifyRequest } from "fastify";
import { auth } from "./auth";

const prisma = new PrismaClient();

export type GraphQLContext = {
    prisma: PrismaClient;
    currUser: User | null;
};

export async function contextFactory(req: FastifyRequest): Promise<GraphQLContext> {
    return {
        prisma,
        currUser: await auth(prisma, req),
    };
}
