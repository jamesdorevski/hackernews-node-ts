import { makeExecutableSchema } from '@graphql-tools/schema';
import typeDefs from './schema.graphql';
import { GraphQLContext } from './context';
import { Link } from '@prisma/client';

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
