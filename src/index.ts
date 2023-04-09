import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constant';
import mikroOrmConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import RedisStore from 'connect-redis';
import session from 'express-session';
import { createClient } from 'redis';
import { MyContext } from './types';

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();
  const emFork = orm.em.fork();

  const app = express();
  app.set('trust proxy', !__prod__);
  app.set('Access-Control-Allow-Origin', 'https://studio.apollographql.com');
  app.set('Access-Control-Allow-Credentials', true);
  // Initialize client.
  let redisClient = createClient();
  redisClient.connect().catch(console.error);

  // Initialize sesssion storage.
  app.use(
    session({
      name: 'qid',
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }) as any,
      resave: false, // required: force lightweight session keep alive (touch)
      saveUninitialized: false, // recommended: only save session when data exists
      secret: 'wopevinowqevocmiownqe',
      cookie: {
        sameSite: 'none',
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
      },
    }),
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({
      em: emFork,
      req,
      res,
    }),
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    cors: { credentials: true, origin: 'https://studio.apollographql.com' },
  });

  app.listen(4000, () => {
    console.log('started localhost:4000');
  });

  // const post = emFork.create(Post, { title: 'First Post' })
  // await emFork.persistAndFlush(post)

  // const posts = await emFork.find(Post, {})
  // console.log(posts)
};

main().catch(e => console.error(e));
