import React, { useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { GetStaticProps } from "next";
import { Calendar, User, ArrowRight, Search, Clock } from "lucide-react";
import { getSortedPostsData, getCategories, BlogPostMeta } from "../lib/blog";
import Layout from "../components/Layout";
import { cn } from "@/lib/utils";

interface BlogPageProps {
  allPostsData: BlogPostMeta[];
  categories: string[];
}

export default function BlogPage({ allPostsData, categories }: BlogPageProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPosts = allPostsData.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Head>
        <title>
          Turbo Blog - Latest Updates, Tutorials & Technical Insights
        </title>
        <meta
          name="description"
          content="Stay updated with the latest news, tutorials, and technical insights from the Turbo decentralized bandwidth sharing network. Learn about node optimization, earnings strategies, and technical deep dives."
        />
        <meta
          name="keywords"
          content="turbo, bandwidth sharing, decentralized network, distributed system, cryptocurrency, passive income, tutorials"
        />
        <meta
          property="og:title"
          content="Turbo Blog - Latest Updates, Tutorials & Technical Insights"
        />
        <meta
          property="og:description"
          content="Stay updated with the latest news, tutorials, and technical insights from the Turbo ecosystem"
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://turbo.network/blog" />
      </Head>

      <Layout>
        {/* Hero */}
        <section className="px-6 sm:px-10 lg:px-14 pt-16 pb-12">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs font-mono tracking-widest uppercase text-orange-600 mb-4">
              // blog
            </p>
            <h1
              className="text-neutral-900 leading-tight mb-4 max-w-2xl"
              style={{
                fontFamily: "'Bitstream Iowan Old Style Bold BT', Georgia, serif",
                fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
              }}
            >
              Notes from the network.
            </h1>
            <p className="text-neutral-600 text-base sm:text-lg max-w-xl leading-relaxed">
              Updates, tutorials, and technical deep dives from the Turbo
              ecosystem.
            </p>
          </div>
        </section>

        {/* Search + categories */}
        <section className="px-6 sm:px-10 lg:px-14 mb-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2 order-2 md:order-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                    selectedCategory === category
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                      : "border border-neutral-200 bg-white text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="relative w-full md:max-w-xs order-1 md:order-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-full text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Posts */}
        <section className="px-6 sm:px-10 lg:px-14 pb-24">
          <div className="max-w-6xl mx-auto">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-20 rounded-2xl border border-neutral-200 bg-white">
                <p className="text-xs font-mono tracking-widest uppercase text-neutral-400 mb-3">
                  // no_results
                </p>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  No articles found
                </h3>
                <p className="text-sm text-neutral-500">
                  Try adjusting your search terms or category filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {filteredPosts.map((post) => (
                  <article key={post.slug} className="group h-full">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="flex flex-col h-full rounded-2xl border border-neutral-200 bg-white hover:border-orange-500/40 hover:shadow-[0_0_24px_rgba(249,115,22,0.08)] transition-all duration-300 overflow-hidden"
                    >
                      <div className="p-6 sm:p-7 flex-1 flex flex-col">
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <span className="text-[11px] font-mono tracking-widest uppercase text-orange-600">
                            {post.category}
                          </span>
                          <span className="flex items-center gap-1 text-neutral-400 text-xs shrink-0">
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </span>
                        </div>

                        <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
                          {post.title}
                        </h2>

                        <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3 mb-6 flex-1">
                          {post.excerpt}
                        </p>

                        <div className="mt-auto space-y-4">
                          <div className="flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-100 pt-4">
                            <span className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5" />
                              {post.author}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(post.date).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="flex items-center text-sm font-medium text-orange-600 group-hover:text-orange-700 transition-colors">
                              Read article
                              <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                            </span>
                            {post.tags && post.tags.length > 0 && (
                              <span className="hidden sm:flex gap-2 text-[11px] font-mono text-neutral-400">
                                {post.tags.slice(0, 2).map((tag) => (
                                  <span key={tag}>#{tag}</span>
                                ))}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const allPostsData = getSortedPostsData();
  const categories = getCategories();

  return {
    props: {
      allPostsData,
      categories,
    },
  };
};
