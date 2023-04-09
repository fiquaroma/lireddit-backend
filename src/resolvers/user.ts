import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql'
import { MyContext } from '../types'
import { hash, verify } from 'argon2'
import { User } from '../entities/User'

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string
  @Field()
  password: string
}

@ObjectType()
class ErrorField {
  @Field()
  field: string

  @Field()
  message: string
}

@ObjectType()
class UserResponse {
  @Field(() => [ErrorField], { nullable: true })
  errors?: ErrorField[]

  @Field(() => User, { nullable: true })
  user?: User
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req, res }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: 'username',
            message: 'must be greater than 2 characters',
          },
        ],
      }
    }

    const foundUser = await em.findOne(User, {
      username: options.username,
    })
    if (foundUser) {
      return {
        errors: [
          {
            field: 'username',
            message: 'username has been registered',
          },
        ],
      }
    }

    const hashedPassword = await hash(options.password)
    const user = em.create(User, {
      password: hashedPassword,
      username: options.username,
    })

    try {
      await em.persistAndFlush(user)
    } catch (error) {
      return {
        errors: [
          {
            field: 'username',
            message: error.message,
          },
        ],
      }
    }
    return {
      user,
    }
  }

  @Query(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req, res }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, {
      username: options.username,
    })

    if (!user) {
      return {
        errors: [
          {
            field: 'username, password',
            message: 'wrong username or password',
          },
        ],
      }
    }

    const isPasswordValid = await verify(user.password, options.password)
    if (!isPasswordValid) {
      return {
        errors: [
          {
            field: 'username, password',
            message: 'wrong username or password',
          },
        ],
      }
    }
    req.session.userId = user.id
    console.log('REQ SESSION: ', req.session)

    return {
      user,
    }
  }
}
