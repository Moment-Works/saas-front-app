import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function BookingThanksPage() {
  return (
    <main className='flex-1 bg-gray-50'>
      <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        <Card>
          <CardHeader className='text-center'>
            <div className='flex justify-center mb-4'>
              <CheckCircle2 className='w-16 h-16 text-green-500' />
            </div>
            <CardTitle className='text-3xl'>
              リクエストを受け付けました
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='text-center space-y-4'>
              <p className='text-gray-700'>
                ご相談リクエストありがとうございます。
              </p>
              <p className='text-gray-700'>
                コンサルタントから日程調整のご連絡をメールでお送りいたします。
                通常、24時間以内にご返信させていただきます。
              </p>
            </div>

            {/* What's Next */}
            <div className='bg-gray-50 rounded-lg p-6 space-y-4'>
              <h3 className='font-semibold text-lg text-gray-900'>
                次のステップ
              </h3>
              <ol className='space-y-3 text-sm text-gray-700'>
                <li className='flex items-start'>
                  <span className='flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-semibold mr-3'>
                    1
                  </span>
                  <span>コンサルタントから日程調整のメールが届きます</span>
                </li>
                <li className='flex items-start'>
                  <span className='flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-semibold mr-3'>
                    2
                  </span>
                  <span>日程確定後、決済用のリンクをお送りします</span>
                </li>
                <li className='flex items-start'>
                  <span className='flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-semibold mr-3'>
                    3
                  </span>
                  <span>決済完了後、Google MeetのURLをお送りします</span>
                </li>
                <li className='flex items-start'>
                  <span className='flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-semibold mr-3'>
                    4
                  </span>
                  <span>当日、Google Meetでセッションを実施します</span>
                </li>
              </ol>
            </div>

            {/* Contact Info */}
            <div className='border-t pt-6 text-center text-sm text-gray-600'>
              <p>メールが届かない場合や、お急ぎの場合は</p>
              <p className='mt-2'>
                <a
                  href='mailto:hi.moment@gmail.com'
                  className='text-orange-600 hover:text-orange-700 font-medium'
                >
                  hi.moment@gmail.com
                </a>{' '}
                までお問い合わせください
              </p>
            </div>

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row gap-3 pt-4'>
              <Button asChild variant='outline' className='flex-1 rounded-full'>
                <Link href='/consultants'>他のコンサルタントを見る</Link>
              </Button>
              <Button asChild className='flex-1 rounded-full'>
                <Link href='/'>トップページに戻る</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
