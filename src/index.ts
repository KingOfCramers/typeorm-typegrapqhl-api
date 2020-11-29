import "reflect-metadata";
import path from "path";
import dotenv from "dotenv";
import { createConnection, getConnectionOptions } from "typeorm";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import {
  DisclosureResolver,
  HouseHearingResolver,
  SenateHearingResolver,
} from "./resolvers";
import { Disclosure, HouseHearing } from "./entity";

// Set environment variables
const environment = process.env.NODE_ENV;
dotenv.config({ path: path.resolve(__dirname, "..", `.env.${environment}`) });

(async () => {
  const app = express();

  const options = await getConnectionOptions(
    process.env.NODE_ENV || "development"
  );

  await createConnection({
    ...options,
    entities: [Disclosure, HouseHearing],
    subscribers: [],
    migrations: [],
    name: "default",
  });

  const apolloServer = new ApolloServer({
    playground: true,
    introspection: true,
    schema: await buildSchema({
      resolvers: [
        DisclosureResolver,
        HouseHearingResolver,
        SenateHearingResolver,
      ],
      validate: true,
    }),
    context: ({ req, res }) => ({ req, res }),
  });

  apolloServer.applyMiddleware({ app, cors: false });
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}/graphql`);
  });
})();
