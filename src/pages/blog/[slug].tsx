import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { GetStaticProps, GetStaticPaths } from 'next';
import {
  Calendar,
  User,
  ArrowLeft,
  ArrowRight,
  Clock,
  Twitter,
  Facebook,
  Linkedin
} from 'lucide-react';
import { getAllPostSlugs, getPostData, getRelatedPosts, BlogPost, BlogPostMeta } from '../../lib/blog';

// Import highlight.js CSS for code syntax highlighting
import 'highlight.js/styles/github.css';
import Layout from '@/components/Layout';

interface BlogPostPageProps {
  postData: BlogPost;
  relatedPosts: BlogPostMeta[];
}

export default function BlogPostPage({ postData, relatedPosts }: BlogPostPageProps) {
  const shareUrl = `https://turbo.network/blog/${postData.slug}`;
  const shareText = `${postData.title} - ${postData.excerpt}`;

  const shareLinks = [
    {
      label: 'Share on Twitter',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      Icon: Twitter,
    },
    {
      label: 'Share on Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      Icon: Facebook,
    },
    {
      label: 'Share on LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      Icon: Linkedin,
    },
  ];

  return (
    <>
      <Head>
        <title>{postData.title} - Turbo Blog</title>
        <meta name="description" content={postData.metaDescription} />
        <meta name="keywords" content={postData.tags.join(', ')} />
        <meta name="author" content={postData.author} />
        <meta property="article:published_time" content={postData.date} />
        <meta property="article:author" content={postData.author} />
        <meta property="article:section" content={postData.category} />
        {postData.tags.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}

        {/* Open Graph */}
        <meta property="og:title" content={postData.title} />
        <meta property="og:description" content={postData.metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={shareUrl} />
        {postData.image && <meta property="og:image" content={postData.image} />}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={postData.title} />
        <meta name="twitter:description" content={postData.metaDescription} />
        {postData.image && <meta name="twitter:image" content={postData.image} />}

        <link rel="canonical" href={shareUrl} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": postData.title,
              "description": postData.metaDescription,
              "author": {
                "@type": "Person",
                "name": postData.author
              },
              "datePublished": postData.date,
              "dateModified": postData.date,
              "publisher": {
                "@type": "Organization",
                "name": "Turbo",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://turbo.network/logo.png"
                }
              },
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": shareUrl
              },
              "image": postData.image || "https://turbo.network/default-blog-image.jpg",
              "keywords": postData.tags.join(", "),
              "articleSection": postData.category
            })
          }}
        />
      </Head>

      <Layout>
        {/* Article Container */}
        <article className="relative max-w-4xl mx-auto px-6 sm:px-10 pt-12 pb-16">
          <div className="pointer-events-none absolute -top-24 right-0 w-[400px] h-[400px] bg-orange-500/8 rounded-full blur-[140px]" />

          {/* Back to Blog */}
          <Link
            href="/blog"
            className="relative inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 mb-10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Article Header */}
          <header className="relative mb-12">
            <p className="text-xs font-mono tracking-widest uppercase text-orange-600 mb-4">
              // {postData.category.toLowerCase().replace(/[^a-z0-9]+/g, '_')}
            </p>

            <h1
              className="text-neutral-900 leading-tight mb-6"
              style={{
                fontFamily: "'Bitstream Iowan Old Style Bold BT', Georgia, serif",
                fontSize: 'clamp(2rem, 5vw, 3.25rem)',
              }}
            >
              {postData.title}
            </h1>

            <p className="text-lg sm:text-xl text-neutral-600 mb-8 leading-relaxed">
              {postData.excerpt}
            </p>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-neutral-500 mb-8">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium text-neutral-700">{postData.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={postData.date}>
                  {new Date(postData.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{postData.readTime}</span>
              </div>
            </div>

            {/* Tags + Share */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-neutral-200">
              {postData.tags && postData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {postData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-mono text-neutral-500 border border-neutral-200 bg-neutral-50 px-3 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                {shareLinks.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="p-2 rounded-full border border-neutral-200 bg-white text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </header>

          {/* Article Content */}
          <div className="relative rounded-2xl border border-neutral-200 bg-white p-6 sm:p-10 md:p-12 shadow-sm">
            <div
              className="prose-blog"
              dangerouslySetInnerHTML={{ __html: postData.content }}
            />
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <section className="max-w-4xl mx-auto px-6 sm:px-10 pb-24">
            <p className="text-xs font-mono tracking-widest uppercase text-orange-600 mb-4">
              // related
            </p>
            <h2
              className="text-neutral-900 leading-tight mb-8"
              style={{
                fontFamily: "'Bitstream Iowan Old Style Bold BT', Georgia, serif",
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              }}
            >
              Keep reading.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-2xl border border-neutral-200 bg-white hover:border-orange-500/40 hover:shadow-[0_0_24px_rgba(249,115,22,0.08)] transition-all duration-300 p-6"
                >
                  <span className="text-[11px] font-mono tracking-widest uppercase text-orange-600 mb-3">
                    {post.category}
                  </span>
                  <h3 className="font-semibold text-neutral-900 group-hover:text-orange-600 transition-colors mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed line-clamp-2 mb-4 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-100 pt-4">
                    <span>{post.author}</span>
                    <span className="flex items-center gap-1 text-orange-600 group-hover:text-orange-700 transition-colors">
                      Read
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </Layout>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllPostSlugs();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const postData = await getPostData(params?.slug as string);
  const relatedPosts = getRelatedPosts(params?.slug as string);

  return {
    props: {
      postData,
      relatedPosts,
    },
  };
};
