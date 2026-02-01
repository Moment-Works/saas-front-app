import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getRecentBlogs } from '@/lib/microcms/client';
import { Blog } from '@/lib/microcms/types';

export default async function HomePage() {
  // Fetch recent blog posts from microCMS
  let recentBlogs: Blog[] = [];
  try {
    recentBlogs = await getRecentBlogs(3);
  } catch (error) {
    console.error('Failed to fetch blogs:', error);
    // Continue with empty array if fetch fails
  }

  return (
    <main className='flex-1'>
      {/* Hero Section */}
      <section className='bg-gradient-to-b from-gray-50 to-white py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <h1 className='text-4xl md:text-6xl font-bold text-gray-900 mb-6'>
              あなたの課題に寄り添う
              <br />
              プロフェッショナルとつながる
            </h1>
            <p className='text-xl text-gray-600 mb-8 max-w-2xl mx-auto'>
              経験豊富なコンサルタントが、あなたのビジネスの成長をサポートします。
              30分から気軽に相談できます。
            </p>
            <Button asChild size='lg' className='rounded-full'>
              <Link href='/consultants'>コンサルタントを探す</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-16 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <h2 className='text-3xl font-bold text-center text-gray-900 mb-12'>
            サービスの特徴
          </h2>
          <div className='grid md:grid-cols-3 gap-8'>
            <Card>
              <CardHeader>
                <CardTitle>簡単予約</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  希望日時を選んで送信するだけ。コンサルタントが日程調整を行います。
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>オンラインで完結</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Google
                  Meetを使ったオンラインセッション。場所を選ばず相談できます。
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>安心の決済</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Stripeによる安全な決済システム。明確な料金体系で安心してご利用いただけます。
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className='py-16 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center mb-8'>
            <h2 className='text-3xl font-bold text-gray-900'>最新記事</h2>
            <Link
              href='/blog'
              className='text-orange-600 hover:text-orange-700 font-medium'
            >
              すべての記事を見る →
            </Link>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            {recentBlogs.length > 0 ? (
              recentBlogs.map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.id}`} className='block'>
                  <Card className='hover:shadow-lg transition-shadow h-full'>
                    <CardHeader>
                      {blog.eyecatch?.url ? (
                        <div className='aspect-video relative bg-gray-200 rounded-lg mb-4 overflow-hidden'>
                          <Image
                            src={blog.eyecatch.url}
                            alt={blog.title}
                            fill
                            className='object-cover'
                          />
                        </div>
                      ) : (
                        <div className='aspect-video bg-gray-200 rounded-lg mb-4' />
                      )}
                      <CardTitle className='text-lg'>{blog.title}</CardTitle>
                      <CardDescription>
                        {new Date(blog.publishedAt).toLocaleDateString(
                          'ja-JP',
                          {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                          },
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {blog.categories && blog.categories.length > 0 && (
                        <div className='flex flex-wrap gap-2 mb-2'>
                          {blog.categories.map((cat) => (
                            <span
                              key={cat.id}
                              className='inline-block px-2 py-1 text-xs font-medium text-orange-600 bg-orange-50 rounded'
                            >
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className='text-sm text-gray-600 line-clamp-3'>
                        {blog.content.replace(/<[^>]*>/g, '').substring(0, 100)}
                        ...
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              // Fallback if no blogs are available
              <div className='col-span-3 text-center py-8 text-gray-500'>
                記事はまだ公開されていません
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-16 bg-orange-600'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-3xl font-bold text-white mb-4'>
            まずは気軽に相談してみませんか？
          </h2>
          <p className='text-xl text-orange-100 mb-8'>
            経験豊富なコンサルタントがあなたの課題解決をサポートします
          </p>
          <Button
            asChild
            size='lg'
            variant='secondary'
            className='rounded-full'
          >
            <Link href='/consultants'>コンサルタント一覧を見る</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
