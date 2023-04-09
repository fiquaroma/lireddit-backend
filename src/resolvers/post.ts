import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { Post } from '../entities/Post'
import { MyContext } from '../types'

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em, req, res }: MyContext): Promise<Post[]> {
    return em.find(Post, {})
  }

  @Query(() => Post, { nullable: true })
  post(
    @Arg('id') id: number,
    @Ctx() { em, req, res }: MyContext
  ): Promise<Post | null> {
    return em.findOne(Post, { id })
  }

  @Mutation(() => Post)
  async createPost(
    @Arg('title') title: string,
    @Ctx() { em, req, res }: MyContext
  ): Promise<Post> {
    const post = em.create(Post, { title })
    await em.persistAndFlush(post)
    return post
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title', { nullable: true }) title: string,
    @Ctx() { em, req, res }: MyContext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id })
    if (!post) {
      return null
    }

    if (title !== undefined) {
      post.title = title
      await em.persistAndFlush(post)
    }
    return post
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg('id') id: number,
    @Ctx() { em, req, res }: MyContext
  ): Promise<boolean> {
    const post = await em.findOne(Post, { id })
    if (!post) {
      return false
    } else {
      await em.nativeDelete(Post, { id })
      return true
    }
  }
}
