import { makeExecutableSchema } from '@graphql-tools/schema';
import typeDefs from './schema.graphql';

type Link = {
    id: string;
    url: string;
    description: string;
}

// DEBUG: dummy data
const links: Link[] = [{
    id: "link-0",
    url: "www.example.com",
    description: "Create commons webpage",
}]

const resolvers = {
    Query: {
        info: () => 'Test',
        feed: () => links,
    },
    Link: {
        id: (parent: Link) => parent.id,
        description: (parent: Link) => parent.description,
        url: (parent: Link) => parent.url,
    }
}

export const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});
