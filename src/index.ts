import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { mySession } from "./redisLogic";
import { connect } from "./postgres";
import { createSchema } from "./utils/createSchema";

(async () => {
  const app = express();
  const corsOptions = { credentials: true, origin: "http://localhost:3000" };

  // Connect to PostgreSQL DB
  if (["development", "production"].includes(process.env.ENV as string)) {
    await connect();
  }

  // Add session middleware for storing cookies with Redis
  app.use(mySession);

  // Create ApolloServer instance
  const apolloServer = new ApolloServer({
    playground: process.env.ENV === "development",
    introspection: true,
    schema: await createSchema(),
    context: ({ req, res }) => ({ req, res }),
  });

  // Apply Apollo and start up express application
  // Note: We listen on port 1234, but expose that on process.env.PORT in docker-compose
  apolloServer.applyMiddleware({ app, cors: corsOptions });
  app.listen(1234, () => {
    console.log(`🔥 API running in ${process.env.ENV}`);
    process.env.ENV === "development" &&
      console.log(`🔬 http://localhost:${process.env.PORT}/graphql`);
  });
})();
