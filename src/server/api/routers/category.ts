import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { db } from '../../db';
import { categories, postCategories } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { slugify } from '../../utils/slugify';

export const categoryRouter = createTRPCRouter({
  // Get all categories
  getAll: publicProcedure.query(async () => {
    return await db
      .select()
      .from(categories)
      .orderBy(desc(categories.createdAt));
  }),

  // Get a single category by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const category = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, input.slug))
        .limit(1);

      if (!category || category.length === 0) {
        throw new Error('Category not found');
      }

      return category[0];
    }),

  // Get a single category by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const category = await db
        .select()
        .from(categories)
        .where(eq(categories.id, input.id))
        .limit(1);

      if (!category || category.length === 0) {
        throw new Error('Category not found');
      }

      return category[0];
    }),

  // Create a new category
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const slug = slugify(input.name);

      const newCategory = await db
        .insert(categories)
        .values({
          name: input.name,
          slug,
          description: input.description,
        })
        .returning();

      return newCategory[0];
    }),

  // Update an existing category
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1, 'Name is required').optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;

      // Update slug if name is being updated
      const dataToUpdate = updateData.name
        ? { ...updateData, slug: slugify(updateData.name) }
        : updateData;

      const updatedCategory = await db
        .update(categories)
        .set(dataToUpdate)
        .where(eq(categories.id, id))
        .returning();

      if (!updatedCategory || updatedCategory.length === 0) {
        throw new Error('Category not found');
      }

      return updatedCategory[0];
    }),

  // Delete a category
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const deletedCategory = await db
        .delete(categories)
        .where(eq(categories.id, input.id))
        .returning();

      if (!deletedCategory || deletedCategory.length === 0) {
        throw new Error('Category not found');
      }

      return { success: true };
    }),

  // Get categories for a specific post
  getByPostId: publicProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      const result = await db
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
        })
        .from(postCategories)
        .innerJoin(categories, eq(postCategories.categoryId, categories.id))
        .where(eq(postCategories.postId, input.postId));

      return result;
    }),
});
