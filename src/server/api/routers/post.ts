import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { db } from '../../db';
import { posts, categories, postCategories } from '../../db/schema';
import { eq, desc, inArray, ilike, and, or, SQL } from 'drizzle-orm';
import { slugify } from '../../utils/slugify';
import type { PostListItem, PostWithCategories as TypesPostWithCategories } from '@/types';

export const postRouter = createTRPCRouter({
  // Get all posts (with optional filtering by category/categories and published status)
  getAll: publicProcedure
    .input(
      z
        .object({
          // Back-compat: allow single categoryId, but prefer categoryIds
          categoryId: z.number().optional(),
          categoryIds: z.array(z.number()).optional(),
          published: z.boolean().optional(),
          search: z.string().optional(),
          page: z.number().min(1).optional().default(1),
          limit: z.number().min(1).max(50).optional().default(9),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 9;
      const offset = (page - 1) * limit;
      
      // Dynamic where conditions
      const whereConds: SQL[] = [];
      if (input?.published !== undefined) {
        whereConds.push(eq(posts.published, input.published));
      }
      if (input?.search && input.search.trim()) {
        const s = `%${input.search.trim()}%`;
        whereConds.push(
          or(
            ilike(posts.title, s),
            ilike(posts.content, s),
            ilike(posts.author, s)
          )!
        );
      }

      // Base query sorted by newest
      const baseQuery = db
        .select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          content: posts.content,
          published: posts.published,
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
          coverImageUrl: posts.coverImageUrl,
          author: posts.author,
        })
        .from(posts)
        .orderBy(desc(posts.createdAt));
      
      // When applying dynamic where conditions we cast to satisfy Drizzle's narrow types
      const base = whereConds.length > 0 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (baseQuery as any).where(and(...whereConds)) 
        : baseQuery;

      // If no category filters, return directly
      const categoriesFilter = input?.categoryIds?.length
        ? input.categoryIds
        : input?.categoryId
        ? [input.categoryId]
        : [];

      if (!categoriesFilter.length) {
        // total count
        const countQuery = whereConds.length > 0
          ? db.select({ id: posts.id }).from(posts).where(and(...whereConds))
          : db.select({ id: posts.id }).from(posts);
        const allRows = await countQuery;
        const total = allRows.length;

        // page slice
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const all = await (base as any).limit(limit).offset(offset) as PostListItem[];
        
        // Fetch categories for each post
        const postsWithCategories: TypesPostWithCategories[] = await Promise.all(
          all.map(async (post) => {
            const postCats = await db
              .select({
                id: categories.id,
                name: categories.name,
                slug: categories.slug,
              })
              .from(postCategories)
              .innerJoin(categories, eq(postCategories.categoryId, categories.id))
              .where(eq(postCategories.postId, post.id));
            
            return {
              ...post,
              categories: postCats,
            } as TypesPostWithCategories;
          })
        );
        
        return { items: postsWithCategories, total, page, limit } as const;
      }

      // Fetch postIds that are in ANY of the selected categories
      const postIdsRows = await db
        .select({ postId: postCategories.postId })
        .from(postCategories)
        .where(inArray(postCategories.categoryId, categoriesFilter));
      const postIds = Array.from(new Set(postIdsRows.map((r) => r.postId)));

      if (postIds.length === 0) return { items: [], total: 0, page, limit } as const;

      // Build a filtered base query selecting the same columns but constrained to postIds
      let filteredBase = db
        .select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          content: posts.content,
          published: posts.published,
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
          coverImageUrl: posts.coverImageUrl,
          author: posts.author,
        })
        .from(posts)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .where(inArray(posts.id, postIds)) as any;

      if (whereConds.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filteredBase = filteredBase.where(and(...whereConds)) as any;
      }

      // total count for filtered
      const filteredCountQuery = db
        .select({ id: posts.id })
        .from(posts)
        .where(inArray(posts.id, postIds));
      if (whereConds.length) {
        // apply whereConds to count as well
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (filteredCountQuery as any).where(and(...whereConds));
      }
      const total = (await filteredCountQuery).length;

      // page slice
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filtered = await (filteredBase as any).limit(limit).offset(offset) as PostListItem[];
      
      // Fetch categories for each filtered post
      const filteredWithCategories: TypesPostWithCategories[] = await Promise.all(
  filtered.map(async (post: PostListItem) => {
          const postCats = await db
            .select({
              id: categories.id,
              name: categories.name,
              slug: categories.slug,
            })
            .from(postCategories)
            .innerJoin(categories, eq(postCategories.categoryId, categories.id))
            .where(eq(postCategories.postId, post.id));
          
            return {
              ...post,
              categories: postCats,
            } as TypesPostWithCategories;
        })
      );
      
      return { items: filteredWithCategories, total, page, limit } as const;
    }),

  // Get a single post by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const post = await db
        .select()
        .from(posts)
        .where(eq(posts.slug, input.slug))
        .limit(1);

      if (!post || post.length === 0) {
        throw new Error('Post not found');
      }

      // Get categories for this post
      const postCats = await db
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        })
        .from(postCategories)
        .innerJoin(categories, eq(postCategories.categoryId, categories.id))
        .where(eq(postCategories.postId, post[0].id));

      return {
        ...post[0],
        categories: postCats,
      };
    }),

  // Get a single post by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const post = await db
        .select()
        .from(posts)
        .where(eq(posts.id, input.id))
        .limit(1);

      if (!post || post.length === 0) {
        throw new Error('Post not found');
      }

      // Get categories for this post
      const postCats = await db
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        })
        .from(postCategories)
        .innerJoin(categories, eq(postCategories.categoryId, categories.id))
        .where(eq(postCategories.postId, post[0].id));

      return {
        ...post[0],
        categories: postCats,
        categoryIds: postCats.map((c) => c.id),
      };
    }),

  // Create a new post
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1, 'Title is required'),
        content: z.string().min(1, 'Content is required'),
        author: z.string().optional(),
        published: z.boolean().default(false),
        categoryIds: z.array(z.number()).optional(),
        coverImageUrl: z.string().url().optional().or(z.string().startsWith('data:image/').optional()),
      })
    )
    .mutation(async ({ input }) => {
      const slug = slugify(input.title);

      // Create the post
      const newPost = await db
        .insert(posts)
        .values({
          title: input.title,
          slug,
          content: input.content,
          author: input.author,
          published: input.published,
          coverImageUrl: input.coverImageUrl,
        })
        .returning();

      // Add categories if provided
      if (input.categoryIds && input.categoryIds.length > 0) {
        await db.insert(postCategories).values(
          input.categoryIds.map((categoryId) => ({
            postId: newPost[0].id,
            categoryId,
          }))
        );
      }

      return newPost[0];
    }),

  // Update an existing post
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1, 'Title is required').optional(),
        content: z.string().min(1, 'Content is required').optional(),
        author: z.string().optional(),
        published: z.boolean().optional(),
        categoryIds: z.array(z.number()).optional(),
        coverImageUrl: z.string().url().optional().or(z.string().startsWith('data:image/').optional()),
      })
    )
    .mutation(async ({ input }) => {
      const { id, categoryIds, ...updateData } = input;

      // Update slug if title is being updated
      const dataToUpdate = updateData.title 
        ? { ...updateData, slug: slugify(updateData.title) }
        : updateData;

      // Update the post
      const updatedPost = await db
        .update(posts)
        .set({
          ...dataToUpdate,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, id))
        .returning();

      if (!updatedPost || updatedPost.length === 0) {
        throw new Error('Post not found');
      }

      // Update categories if provided
      if (categoryIds !== undefined) {
        // Remove existing categories
        await db
          .delete(postCategories)
          .where(eq(postCategories.postId, id));

        // Add new categories
        if (categoryIds.length > 0) {
          await db.insert(postCategories).values(
            categoryIds.map((categoryId) => ({
              postId: id,
              categoryId,
            }))
          );
        }
      }

      return updatedPost[0];
    }),

  // Delete a post
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const deletedPost = await db
        .delete(posts)
        .where(eq(posts.id, input.id))
        .returning();

      if (!deletedPost || deletedPost.length === 0) {
        throw new Error('Post not found');
      }

      return { success: true };
    }),

  // Toggle published status
  togglePublished: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const post = await db
        .select()
        .from(posts)
        .where(eq(posts.id, input.id))
        .limit(1);

      if (!post || post.length === 0) {
        throw new Error('Post not found');
      }

      const updatedPost = await db
        .update(posts)
        .set({
          published: !post[0].published,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, input.id))
        .returning();

      return updatedPost[0];
    }),

  // Get recent posts (published by default)
  getRecent: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(20).default(5),
          published: z.boolean().optional().default(true),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const limit = input?.limit ?? 5;
      const onlyPublished = input?.published ?? true;

      const baseQuery = db
        .select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          createdAt: posts.createdAt,
          coverImageUrl: posts.coverImageUrl,
          author: posts.author,
        })
        .from(posts)
        .orderBy(desc(posts.createdAt))
        .limit(limit);

      const q = onlyPublished 
        ? baseQuery.where(eq(posts.published, true))
        : baseQuery;

      const rows = await q;
      return rows;
    }),

  // Get counts summary
  getCounts: publicProcedure
    .query(async () => {
      const all = await db.select({ id: posts.id }).from(posts);
      const published = await db
        .select({ id: posts.id })
        .from(posts)
        .where(eq(posts.published, true));
      const draft = all.length - published.length;
      return { total: all.length, published: published.length, draft } as const;
    }),
});
