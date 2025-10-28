'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Twitter, Facebook, Linkedin, Link2, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';

export default function PostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [copied, setCopied] = useState(false);

  const { data: post, isLoading, error } = trpc.post.getBySlug.useQuery({ slug });


  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnTwitter = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = post?.title || '';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnFacebook = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  // Note: Email sharing removed to avoid unused function warnings. Use social sharing buttons above.

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !post) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The post you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/blog">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Calculate reading time
  const wordCount = post.content ? post.content.split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  return (
    <MainLayout>
      <article className="min-h-screen">
        {/* Back to Blog Link */}
        <div className="max-w-3xl mx-auto px-4 pt-8 pb-4">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Blog</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="max-w-3xl mx-auto px-4 py-8">
          {/* Category Badge */}
          {post.categories && post.categories.length > 0 && (
            <div className="mb-4">
              {post.categories.slice(0, 1).map((category) => {
                let badgeColor = "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300";
                if (category.name === "Design") badgeColor = "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300";
                else if (category.name === "Research") badgeColor = "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300";
                else if (category.name === "Presentation") badgeColor = "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300";
                else if (category.name === "Software Engineering") badgeColor = "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300";
                else if (category.name === "Frameworks") badgeColor = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
                else if (category.name === "Leadership") badgeColor = "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300";
                
                return (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className={`${badgeColor} rounded-full px-4 py-1.5 text-sm font-medium inline-block hover:shadow-md transition-shadow`}
                  >
                    {category.name}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
            {post.title}
          </h1>

          {/* Author & Meta */}
          <div className="flex items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
            {post.author && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">
                    {post.author.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {post.author}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <time dateTime={post.createdAt.toISOString()}>
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </time>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {readingTime} min read
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Hero Image */}
        {post.coverImageUrl && (
          <div className="max-w-3xl mx-auto px-4 mb-12">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-md">
              <Image
                src={post.coverImageUrl}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="max-w-3xl mx-auto px-4 pb-12">
          <div className="prose prose-lg lg:prose-xl dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:scroll-mt-20
            prose-h1:text-4xl prose-h1:mt-16 prose-h1:mb-8
            prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pt-4
            prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-5
            prose-h4:text-xl prose-h4:mt-10 prose-h4:mb-4
            prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-loose prose-p:mb-6 prose-p:text-lg
            prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
            prose-strong:font-bold prose-strong:text-gray-900 dark:prose-strong:text-white
            prose-ul:my-8 prose-ul:space-y-3
            prose-ol:my-8 prose-ol:space-y-3
            prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:leading-relaxed prose-li:my-2
            prose-li:marker:text-primary prose-li:marker:font-bold
            prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-800/50 prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:my-8 prose-blockquote:italic prose-blockquote:rounded-r
            prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:text-primary prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-['']
            prose-pre:bg-gray-900 dark:prose-pre:bg-black prose-pre:text-gray-100 prose-pre:p-6 prose-pre:rounded-xl prose-pre:overflow-x-auto prose-pre:shadow-lg prose-pre:border prose-pre:border-gray-700 prose-pre:my-8
            prose-img:rounded-xl prose-img:shadow-lg prose-img:my-10
            prose-hr:my-12 prose-hr:border-gray-300 dark:prose-hr:border-gray-700
            [&>*:first-child]:mt-0
            animate-fade-in">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Share Section */}
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Share this article
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Found this helpful? Share it with others
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={shareOnTwitter}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-all hover:shadow-md"
                  aria-label="Share on Twitter"
                >
                  <Twitter className="h-4 w-4" />
                  <span className="text-sm font-medium">Twitter</span>
                </button>
                <button
                  onClick={shareOnLinkedIn}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-all hover:shadow-md"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                  <span className="text-sm font-medium">LinkedIn</span>
                </button>
                <button
                  onClick={shareOnFacebook}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-all hover:shadow-md"
                  aria-label="Share on Facebook"
                >
                  <Facebook className="h-4 w-4" />
                  <span className="text-sm font-medium">Facebook</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-all hover:shadow-md"
                  aria-label="Copy link"
                >
                  <Link2 className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {copied ? 'Copied!' : 'Copy Link'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </MainLayout>
  );
}
