import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getConsultants } from '@/lib/db/queries';

export default async function ConsultantsPage() {
  const consultants = await getConsultants();

  return (
    <main className='flex-1 bg-gray-50'>
      {/* Page Header */}
      <section className='bg-white border-b border-gray-200 py-12'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>
            コンサルタント一覧
          </h1>
          <p className='text-xl text-gray-600'>
            経験豊富な専門家があなたの課題解決をサポートします
          </p>
        </div>
      </section>

      {/* Consultants Grid */}
      <section className='py-12'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {consultants.map((consultant) => (
              <Card
                key={consultant.id}
                className='hover:shadow-lg transition-shadow'
              >
                <CardHeader>
                  {/* Avatar Placeholder */}
                  <div className='w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4' />
                  <CardTitle className='text-center'>
                    {consultant.name}
                  </CardTitle>
                  <CardDescription className='text-center'>
                    {consultant.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className='text-sm text-gray-600 mb-4 line-clamp-3'>
                    {consultant.bio}
                  </p>

                  {/* Expertise Tags */}
                  <div className='flex flex-wrap gap-2 mb-4'>
                    {consultant.expertise?.map((skill, index) => (
                      <span
                        key={index}
                        className='px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded'
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Price */}
                  <div className='mb-4 text-center'>
                    <span className='text-2xl font-bold text-gray-900'>
                      ¥{consultant.price30min.toLocaleString()}
                    </span>
                    <span className='text-sm text-gray-600'> / 30分</span>
                  </div>

                  {/* CTA Button */}
                  <Button asChild className='w-full rounded-full'>
                    <Link href={`/consultants/${consultant.id}`}>
                      詳細を見る・予約する
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className='bg-white py-12 border-t border-gray-200'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6 text-center'>
            ご利用の流れ
          </h2>
          <div className='grid md:grid-cols-4 gap-6'>
            <div className='text-center'>
              <div className='w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg'>
                1
              </div>
              <h3 className='font-semibold mb-2'>コンサルタント選択</h3>
              <p className='text-sm text-gray-600'>
                専門分野や経験から最適なコンサルタントを選びます
              </p>
            </div>
            <div className='text-center'>
              <div className='w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg'>
                2
              </div>
              <h3 className='font-semibold mb-2'>リクエスト送信</h3>
              <p className='text-sm text-gray-600'>
                希望日時と相談内容を送信します
              </p>
            </div>
            <div className='text-center'>
              <div className='w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg'>
                3
              </div>
              <h3 className='font-semibold mb-2'>日程調整</h3>
              <p className='text-sm text-gray-600'>
                コンサルタントから日程調整のご連絡が届きます
              </p>
            </div>
            <div className='text-center'>
              <div className='w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg'>
                4
              </div>
              <h3 className='font-semibold mb-2'>セッション実施</h3>
              <p className='text-sm text-gray-600'>
                決済後、Google Meetで相談を実施します
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
