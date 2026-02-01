import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { getBlogBySlug, getBlogs } from '@/lib/microcms/client';
import { Blog } from '@/lib/microcms/types';

// Generate static params for blog posts
export async function generateStaticParams() {
  try {
    const response = await getBlogs({ limit: 100 });
    return response.contents.map((blog) => ({
      slug: blog.id,
    }));
  } catch (error) {
    console.error('Failed to generate static params:', error);
    return [];
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post: Blog | null = null;
  try {
    post = await getBlogBySlug(slug);
  } catch (error) {
    console.error('Failed to fetch blog post:', error);
  }

  if (!post) {
    notFound();
  }

  // Fetch related blogs (same category if available)
  let relatedBlogs: Blog[] = [];
  try {
    const categoryId = post.categories?.[0]?.id;
    if (categoryId) {
      const response = await getBlogs({
        limit: 3,
        filters: `categories[contains]${categoryId}[and]id[not_equals]${post.id}`,
      });
      relatedBlogs = response.contents;
    } else {
      // If no category, just get recent posts
      const response = await getBlogs({
        limit: 3,
        filters: `id[not_equals]${post.id}`,
        orders: '-publishedAt',
      });
      relatedBlogs = response.contents;
    }
  } catch (error) {
    console.error('Failed to fetch related blogs:', error);
  }

  return (
    <main className='flex-1 bg-white'>
      <article className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Breadcrumb */}
        <nav className='mb-8 text-sm text-gray-600'>
          <Link href='/' className='hover:text-gray-900'>
            ホーム
          </Link>
          <span className='mx-2'>/</span>
          <Link href='/blog' className='hover:text-gray-900'>
            ブログ
          </Link>
          <span className='mx-2'>/</span>
          <span className='text-gray-900'>{post.title}</span>
        </nav>

        {/* Article Header */}
        <header className='mb-8'>
          {post.categories && post.categories.length > 0 && (
            <div className='mb-4 flex flex-wrap gap-2'>
              {post.categories.map((category) => (
                <span
                  key={category.id}
                  className='inline-block px-3 py-1 text-sm font-medium text-orange-600 bg-orange-50 rounded-full'
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>
            {post.title}
          </h1>
          <time className='text-gray-600'>
            {new Date(post.publishedAt).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </header>

        {/* Featured Image */}
        {post.eyecatch?.url && (
          <div className='aspect-video relative bg-gray-200 rounded-lg mb-8 overflow-hidden'>
            <Image
              src={post.eyecatch.url}
              alt={post.title}
              fill
              className='object-cover'
            />
          </div>
        )}

        {/* Article Content */}
        <div
          className='prose prose-lg max-w-none mb-12'
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA Section */}
        <div className='border-t border-gray-200 pt-8'>
          <div className='bg-gray-50 rounded-lg p-8 text-center'>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>
              専門家に相談してみませんか？
            </h2>
            <p className='text-gray-600 mb-6'>
              経験豊富なコンサルタントがあなたの課題解決をサポートします
            </p>
            <Button asChild size='lg' className='rounded-full'>
              <Link href='/consultants'>コンサルタント一覧を見る</Link>
            </Button>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      <section className='bg-gray-50 py-12'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-8'>関連記事</h2>
          {relatedBlogs.length > 0 ? (
            <div className='grid md:grid-cols-3 gap-6'>
              {relatedBlogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.id}`}
                  className='block bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden'
                >
                  {blog.eyecatch?.url ? (
                    <div className='aspect-video relative bg-gray-200'>
                      <Image
                        src={blog.eyecatch.url}
                        alt={blog.title}
                        fill
                        className='object-cover'
                      />
                    </div>
                  ) : (
                    <div className='aspect-video bg-gray-200' />
                  )}
                  <div className='p-4'>
                    <h3 className='font-semibold text-gray-900 mb-2'>
                      {blog.title}
                    </h3>
                    <time className='text-sm text-gray-600'>
                      {new Date(blog.publishedAt).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </time>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className='text-gray-500 text-center py-8'>
              関連記事はありません
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
