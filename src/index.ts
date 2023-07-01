console.log('Hello World, from TypeScript!');

import 'graphql-import-node';
import { execute, parse } from 'graphql';
import { schema } from './schema';
import fastify from 'fastify';

async function main() {
  const server = fastify();

  server.get('/', (req, resp) => {
    resp.send({ test: true});
  });

  server.listen(8080, "0.0.0.0", () => {
    console.log('Server is running on http://localhost:8080/');
  });
}

main();
