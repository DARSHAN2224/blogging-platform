import { db } from './index';
import { posts, categories, postCategories } from './schema';
import { slugify } from '../utils/slugify';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create categories
    console.log('Creating categories...');
    const categoryData = [
      { name: 'Technology', description: 'Posts about technology and programming' },
      { name: 'Web Development', description: 'Web development tutorials and tips' },
      { name: 'AI & Machine Learning', description: 'Artificial Intelligence and ML content' },
      { name: 'DevOps', description: 'DevOps practices and tools' },
      { name: 'Tutorial', description: 'Step-by-step tutorials' },
    ];

    const createdCategories = await db
      .insert(categories)
      .values(
        categoryData.map((cat) => ({
          name: cat.name,
          slug: slugify(cat.name),
          description: cat.description,
        }))
      )
      .returning();

    console.log(`✅ Created ${createdCategories.length} categories`);

    // Create sample posts
    console.log('Creating sample posts...');
    const postData = [
      {
        title: 'Getting Started with Next.js 15',
        content: `# Getting Started with Next.js 15

Next.js 15 introduces exciting new features including:

- **Turbopack**: Faster build times
- **Server Actions**: Simplified server-side mutations
- **Improved App Router**: Better performance and DX

## Installation

\`\`\`bash
npx create-next-app@latest
\`\`\`

Start building amazing web applications today!`,
        published: true,
        categoryIds: [0, 1], // Technology, Web Development
      },
      {
        title: 'Understanding tRPC and Type Safety',
        content: `# Understanding tRPC and Type Safety

tRPC enables end-to-end typesafe APIs without code generation.

## Key Benefits

- Full TypeScript support
- No code generation needed
- Automatic type inference
- Great developer experience

Perfect for modern full-stack applications!`,
        published: true,
        categoryIds: [0, 1, 4], // Technology, Web Development, Tutorial
      },
      {
        title: 'Introduction to Drizzle ORM',
        content: `# Introduction to Drizzle ORM

Drizzle is a lightweight TypeScript ORM for SQL databases.

## Why Drizzle?

- Type-safe queries
- Zero dependencies
- SQL-like syntax
- Excellent performance

A perfect choice for your next project!`,
        published: true,
        categoryIds: [0, 4], // Technology, Tutorial
      },
      {
        title: 'Building Scalable APIs with Node.js',
        content: `# Building Scalable APIs with Node.js

Learn best practices for building production-ready APIs.

## Topics Covered

- RESTful design
- Error handling
- Authentication
- Rate limiting
- Caching strategies

This is a draft post that will be published soon.`,
        published: false,
        categoryIds: [0, 1, 3], // Technology, Web Development, DevOps
      },
      {
        title: 'Machine Learning for Beginners',
        content: `# Machine Learning for Beginners

A gentle introduction to machine learning concepts.

## What You'll Learn

- Supervised vs Unsupervised Learning
- Common algorithms
- Real-world applications
- Getting started with Python

Perfect for those new to AI!`,
        published: true,
        categoryIds: [2, 4], // AI & Machine Learning, Tutorial
      },
    ];

    for (const post of postData) {
      const { categoryIds, ...postContent } = post;
      
      // Insert post
      const [createdPost] = await db
        .insert(posts)
        .values({
          title: postContent.title,
          slug: slugify(postContent.title),
          content: postContent.content,
          published: postContent.published,
        })
        .returning();

      // Associate categories with post
      if (categoryIds.length > 0) {
        await db.insert(postCategories).values(
          categoryIds.map((catIndex) => ({
            postId: createdPost.id,
            categoryId: createdCategories[catIndex].id,
          }))
        );
      }

      console.log(`  ✅ Created post: "${createdPost.title}"`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Categories: ${createdCategories.length}`);
    console.log(`   - Posts: ${postData.length}`);
    console.log(`   - Published: ${postData.filter((p) => p.published).length}`);
    console.log(`   - Drafts: ${postData.filter((p) => !p.published).length}`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed database:', error);
    process.exit(1);
  });
