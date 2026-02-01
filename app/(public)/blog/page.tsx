import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getBlogs } from '@/lib/microcms/client';
import { Blog } from '@/lib/microcms/types';

export default async function BlogListPage() {
  let blogs: Blog[] = [];
  try {
    const response = await getBlogs({
      limit: 100,
      orders: '-publishedAt',
    });
    blogs = response.contents;
  } catch (error) {
    console.error('Failed to fetch blogs:', error);
  }

  return (
    <main className='flex-1 bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Breadcrumb */}
        <nav className='mb-8 text-sm text-gray-600'>
          <Link href='/' className='hover:text-gray-900'>
            ホーム
          </Link>
          <span className='mx-2'>/</span>
          <span className='text-gray-900'>ブログ</span>
        </nav>

        {/* Page Header */}
        <div className='mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>ブログ</h1>
          <p className='text-xl text-gray-600'>
            ビジネスやコンサルティングに関する記事をお届けします
          </p>
        </div>

        {/* Blog Grid */}
        {blogs.length > 0 ? (
          <div className='grid md:grid-cols-3 gap-8'>
            {blogs.map((blog) => (
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
                      {new Date(blog.publishedAt).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {blog.categories && blog.categories.length > 0 && (
                      <div className='flex flex-wrap gap-2 mb-3'>
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
                      {blog.content.replace(/<[^>]*>/g, '').substring(0, 150)}
                      ...
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className='text-center py-16'>
            <p className='text-gray-500 text-lg'>
              記事はまだ公開されていません
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
