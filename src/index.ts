console.log('Hello World, from TypeScript!');

import 'graphql-import-node';
import { execute, parse } from 'graphql';
import { schema } from './schema';

async function main() {
  const query = parse('query { info }');

  const result = await execute({
    schema,
    document: query
  });

  console.log(result);
}

main();