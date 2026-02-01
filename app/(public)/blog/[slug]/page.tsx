import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// This will be replaced with actual microCMS data fetching
async function getBlogPost(slug: string) {
  // TODO: Fetch from microCMS
  // const post = await fetch(`https://your-service.microcms.io/api/v1/blogs/${slug}`, {
  //   headers: { 'X-MICROCMS-API-KEY': process.env.MICROCMS_API_KEY! }
  // }).then(res => res.json());

  // Mock data for now
  return {
    id: slug,
    title: 'ブログ記事のタイトル',
    content:
      '<p>記事の本文がここに表示されます。microCMSから取得したHTMLコンテンツがレンダリングされます。</p>',
    thumbnail: { url: '' },
    publishedAt: '2024-01-01T00:00:00.000Z',
    category: 'ビジネス',
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
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
          <div className='mb-4'>
            <span className='inline-block px-3 py-1 text-sm font-medium text-orange-600 bg-orange-50 rounded-full'>
              {post.category}
            </span>
          </div>
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
        {post.thumbnail?.url && (
          <div className='aspect-video bg-gray-200 rounded-lg mb-8' />
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
          <div className='grid md:grid-cols-3 gap-6'>
            {[1, 2, 3].map((i) => (
              <Link
                key={i}
                href={`/blog/related-${i}`}
                className='block bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden'
              >
                <div className='aspect-video bg-gray-200' />
                <div className='p-4'>
                  <h3 className='font-semibold text-gray-900 mb-2'>
                    関連記事のタイトル {i}
                  </h3>
                  <time className='text-sm text-gray-600'>2024.01.0{i}</time>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
