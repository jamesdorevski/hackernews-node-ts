console.log('Hello World, from TypeScript!');

import 'graphql-import-node';
import { getGraphQLParameters, processRequest, Request, sendResult, renderGraphiQL, shouldRenderGraphiQL } from 'graphql-helix';
import { schema } from './schema';
import fastify from 'fastify';
import { request } from 'http';

async function main() {
    const server = fastify();

    server.get('/', (req, resp) => {
        resp.send({ test: true});
    });

    server.route({
        method: ["POST", "GET"],
        url: "/graphql",
        handler: async (req, resp) => {
            const request: Request = {
                headers: req.headers,
                method: req.method,
                query: req.query,
                body: req.body
            };

            if (shouldRenderGraphiQL(request)) {
                resp.header("Content-Type", "text/html");
                resp.send(
                    renderGraphiQL({
                        endpoint: "/graphql",
                    })
                );

                return;
            }

            const { operationName, query, variables } = getGraphQLParameters(request);

            const result = await processRequest({
                request,
                schema,
                operationName,
                query,
                variables,
            });

            sendResult(result, resp.raw);
        }
    });

    server.listen(8080, "0.0.0.0", () => {
        console.log('Server is running on http://localhost:8080/');
    });
}

main();
