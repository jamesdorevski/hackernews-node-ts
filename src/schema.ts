import { makeExecutableSchema } from "@graphql-tools/schema";
import typeDefs from "./schema.graphql";
import { GraphQLContext } from "./context";
import { Link, User } from "@prisma/client";
import { APP_SECRET } from "./auth";
import { hash, compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { PubSubChannels } from "./pubsub";

const resolvers = {
    Query: {
        info: () => "Test",
        feed: async (parent: unknown, args: {}, context: GraphQLContext) => {
            return context.prisma.link.findMany();
        },
        me: (parent: unknown, args: {}, context: GraphQLContext) => {
            if (context.currUser === null) {
                throw new Error("Unauthenticated");
            }

            return context.currUser;
        },
    },
    Link: {
        id: (parent: Link) => parent.id,
        description: (parent: Link) => parent.description,
        url: (parent: Link) => parent.url,
        postedBy: async (parent: Link, args: {}, context: GraphQLContext) => {
            if (!parent.postedById) {
                return null;
            }

            return context.prisma.link
                .findUnique({ where: { id: parent.id }})
                .postedBy();
        },
    },
    User: {
        links: (parent: User, args: {}, context: GraphQLContext) => 
            context.prisma.user.findUnique({ where: { id: parent.id } }).links(),
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
            const password = await hash(args.password, 10);

            const user = await context.prisma.user.create({
                data: { ...args, password },
            });

            const token = sign({ userId: user.id}, APP_SECRET);

            return {
                token,
                user,
            };
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
            if (context.currUser === null) {
                return new Error("Unauthenticated!");
            }

            const result = await context.prisma.link.create({
                data: {
                    url: args.url,
                    description: args.description,
                    postedBy: {
                        connect: {
                            id: context.currUser.id
                        }
                    }
                }
            });
            
            context.pubSub.publish("newLink", { createdLink: result });

            return result;
        },
    },
    Subscription: {
        newLink: {
            subscribe: (parent: unknown, args: {}, context: GraphQLContext) => {
                return context.pubSub.asyncIterator("newLink");
            },
            resolve: (payload: PubSubChannels["newLink"][0]) => {
                return payload.createdLink;
            },
        }
    }
};

export const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});
