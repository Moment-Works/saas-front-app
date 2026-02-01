import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getConsultantById } from '@/lib/db/queries';
import { BookingForm } from './booking-form';

export default async function ConsultantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const consultant = await getConsultantById(id);

  if (!consultant) {
    notFound();
  }

  return (
    <main className='flex-1 bg-gray-50'>
      {/* Breadcrumb */}
      <div className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <nav className='text-sm text-gray-600'>
            <Link href='/' className='hover:text-gray-900'>
              ホーム
            </Link>
            <span className='mx-2'>/</span>
            <Link href='/consultants' className='hover:text-gray-900'>
              コンサルタント一覧
            </Link>
            <span className='mx-2'>/</span>
            <span className='text-gray-900'>{consultant.name}</span>
          </nav>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid lg:grid-cols-3 gap-8'>
          {/* Left Column - Consultant Info */}
          <div className='lg:col-span-1'>
            <Card>
              <CardHeader>
                {/* Avatar Placeholder */}
                <div className='w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4' />
                <CardTitle className='text-center text-2xl'>
                  {consultant.name}
                </CardTitle>
                <p className='text-center text-gray-600'>{consultant.title}</p>
              </CardHeader>
              <CardContent>
                {/* Expertise Tags */}
                <div className='mb-6'>
                  <h3 className='font-semibold text-sm text-gray-700 mb-3'>
                    専門分野
                  </h3>
                  <div className='flex flex-wrap gap-2'>
                    {consultant.expertise?.map((skill, index) => (
                      <span
                        key={index}
                        className='px-3 py-1 text-sm font-medium text-orange-700 bg-orange-50 rounded-full'
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className='bg-gray-50 rounded-lg p-4 text-center'>
                  <p className='text-sm text-gray-600 mb-1'>相談料金</p>
                  <p className='text-3xl font-bold text-gray-900'>
                    ¥{consultant.price30min.toLocaleString()}
                  </p>
                  <p className='text-sm text-gray-600'>/ 30分セッション</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Bio & Booking Form */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Biography */}
            <Card>
              <CardHeader>
                <CardTitle>プロフィール</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-700 whitespace-pre-line leading-relaxed'>
                  {consultant.bio}
                </p>
              </CardContent>
            </Card>

            {/* Booking Request Form */}
            <Card>
              <CardHeader>
                <CardTitle>相談リクエストを送る</CardTitle>
                <p className='text-sm text-gray-600'>
                  ご希望の日時を3つまでお知らせください。コンサルタントから日程調整のご連絡をさせていただきます。
                </p>
              </CardHeader>
              <CardContent>
                <BookingForm consultantId={consultant.id} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
