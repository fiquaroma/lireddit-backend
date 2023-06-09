import { EntityManager, IDatabaseDriver, Connection } from '@mikro-orm/core'
import { Request, Response } from 'express'

// Overloading SessionData Type tp customize our needs
declare module 'express-session' {
  interface SessionData {
    userId: number
  }
}

export type MyContext = {
  em: EntityManager<IDatabaseDriver<Connection>>
  req: Request
  res: Response
}
