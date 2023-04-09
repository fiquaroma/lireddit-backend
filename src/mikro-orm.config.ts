import { ReflectMetadataProvider } from '@mikro-orm/core'
import { MikroORM } from '@mikro-orm/postgresql'
import { __prod__ } from './constant'
import { Post } from './entities/Post'
import path from 'path'
import { User } from './entities/User'

export default {
  metadataProvider: ReflectMetadataProvider,
  migrations: {
    path: path.join(__dirname, './migrations'),
  },
  entities: [Post, User],
  dbName: 'lireddit',
  debug: !__prod__,
  type: 'postgresql',
  password: 'Admin1234',
} as Parameters<typeof MikroORM.init>[0]
