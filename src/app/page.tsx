import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BookOpen, Users, Zap, Shield, PenTool, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-20 px-4 bg-linear-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Share Your Stories with the World
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A modern blogging platform built with Next.js 15, tRPC, and PostgreSQL. 
              Create, publish, and manage your content with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/blog">
                <Button size="lg" className="text-lg">
                  Explore Blog
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/blog/new">
                <Button size="lg" variant="outline" className="text-lg">
                  Start Writing
                  <PenTool className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything You Need to Blog
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features to help you create and manage your content effectively
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Built with Next.js 15 and optimized for performance with Turbopack
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Type-Safe APIs</CardTitle>
                <CardDescription>
                  End-to-end type safety with tRPC and TypeScript for reliable development
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Markdown Support</CardTitle>
                <CardDescription>
                  Write in markdown and preview your posts with beautiful formatting
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Category Management</CardTitle>
                <CardDescription>
                  Organize your posts with categories and make them easy to discover
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 5 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <PenTool className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Easy Editor</CardTitle>
                <CardDescription>
                  Simple and intuitive editor for creating and editing your blog posts
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 6 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Dashboard</CardTitle>
                <CardDescription>
                  Manage all your posts and track drafts vs published content
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-center space-y-6 py-8">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Ready to Start Blogging?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Join our platform and start sharing your knowledge with the world today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Link href="/blog/new">
                    <Button size="lg">
                      Create Your First Post
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/blog">
                    <Button size="lg" variant="outline">
                      Browse Existing Posts
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
}

