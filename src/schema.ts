import { makeExecutableSchema } from '@graphql-tools/schema';
import typeDefs from './schema.graphql';
import { GraphQLContext } from './context';
import { Link, User } from '@prisma/client';
import { APP_SECRET } from './auth';
import { hash, compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

const resolvers = {
    Query: {
        info: () => 'Test',
        feed: async (parent: unknown, args: {}, context: GraphQLContext) => {
            return context.prisma.link.findMany();
        },
    },
    Link: {
        id: (parent: Link) => parent.id,
        description: (parent: Link) => parent.description,
        url: (parent: Link) => parent.url,
    },
    Mutation: {
        signup: async (
            parent: unknown,
            args: { 
                email: string; 
                password: string; 
                name: string;
            },
            context: GraphQLContext
        ) => {
            const password = await hash(args.password, APP_SECRET);

            const user = await context.prisma.user.create({
                data: { ...args, password },
            });

            const token = sign({ userId: user.id}, APP_SECRET);

            return {
                token,
                user,
            }
        },
        login: async (
            parent: unknown,
            args: { 
                email: string;
                password: string;
            },
            context: GraphQLContext
        ) => {
            const user = await context.prisma.user.findUnique({
                where: {
                    email: args.email
                },
            });
            if (!user) {
                throw new Error("No user found");
            }

            const validPassword = await compare(args.password, user.password);
            if (!validPassword) {
                throw new Error("Invalid password");
            }

            const token = sign({ userId: user.id }, APP_SECRET);

            return {
                token,
                user,
            };
        },
        post: async (
            parent: unknown, 
            args: { description: string, url: string },
            context: GraphQLContext
        ) => {
            const newLink = context.prisma.link.create({
                data: {
                    url: args.url,
                    description: args.description,
                }
            });

            return newLink;
        },
    },
};

export const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});
