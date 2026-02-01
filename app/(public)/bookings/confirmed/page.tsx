import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Calendar, Video, Mail } from 'lucide-react';

export default function BookingConfirmedPage() {
  // In production, this data will come from URL params or session
  // TODO: Get booking details from URL searchParams
  const bookingDetails = {
    consultantName: '山田 太郎',
    confirmedDate: '2024年2月15日（木）14:00-14:30',
    meetUrl: 'https://meet.google.com/xxx-yyyy-zzz',
    clientEmail: 'client@example.com',
  };

  return (
    <main className='flex-1 bg-gray-50'>
      <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        <Card>
          <CardHeader className='text-center'>
            <div className='flex justify-center mb-4'>
              <CheckCircle2 className='w-16 h-16 text-green-500' />
            </div>
            <CardTitle className='text-3xl'>予約が確定しました</CardTitle>
            <p className='text-gray-600 mt-2'>
              決済が完了し、セッションが確定いたしました
            </p>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Booking Details */}
            <div className='bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6 space-y-4'>
              <div className='flex items-start'>
                <Calendar className='w-5 h-5 text-orange-600 mr-3 mt-1' />
                <div>
                  <p className='text-sm text-gray-600'>セッション日時</p>
                  <p className='text-lg font-semibold text-gray-900'>
                    {bookingDetails.confirmedDate}
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <Video className='w-5 h-5 text-orange-600 mr-3 mt-1' />
                <div className='flex-1'>
                  <p className='text-sm text-gray-600 mb-2'>Google Meet URL</p>
                  <a
                    href={bookingDetails.meetUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-orange-600 hover:text-orange-700 font-medium break-all'
                  >
                    {bookingDetails.meetUrl}
                  </a>
                  <p className='text-xs text-gray-600 mt-2'>
                    ※ 当日はこちらのURLからご参加ください
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <Mail className='w-5 h-5 text-orange-600 mr-3 mt-1' />
                <div>
                  <p className='text-sm text-gray-600'>確認メール送信先</p>
                  <p className='text-gray-900'>{bookingDetails.clientEmail}</p>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className='border border-gray-200 rounded-lg p-6 space-y-3'>
              <h3 className='font-semibold text-gray-900'>重要事項</h3>
              <ul className='space-y-2 text-sm text-gray-700'>
                <li className='flex items-start'>
                  <span className='text-orange-600 mr-2'>•</span>
                  <span>
                    セッション開始の5分前にはGoogle Meetに接続してお待ちください
                  </span>
                </li>
                <li className='flex items-start'>
                  <span className='text-orange-600 mr-2'>•</span>
                  <span>
                    カメラとマイクの動作確認を事前に行っておくことをおすすめします
                  </span>
                </li>
                <li className='flex items-start'>
                  <span className='text-orange-600 mr-2'>•</span>
                  <span>
                    相談したい内容を事前にまとめておくと、より充実したセッションになります
                  </span>
                </li>
                <li className='flex items-start'>
                  <span className='text-orange-600 mr-2'>•</span>
                  <span>
                    キャンセルや日程変更が必要な場合は、お早めにご連絡ください
                  </span>
                </li>
              </ul>
            </div>

            {/* Email Confirmation */}
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900'>
              <p className='font-medium mb-1'>📧 確認メールを送信しました</p>
              <p>
                {bookingDetails.clientEmail}{' '}
                宛に予約確定メールをお送りしました。
                メールにも同じ内容が記載されていますので、ご確認ください。
              </p>
            </div>

            {/* Calendar Add Instructions */}
            <div className='text-center space-y-3'>
              <p className='text-sm text-gray-600'>
                セッション日時をカレンダーに追加しておくことをおすすめします
              </p>
              <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                <Button variant='outline' size='sm' className='rounded-full'>
                  Googleカレンダーに追加
                </Button>
                <Button variant='outline' size='sm' className='rounded-full'>
                  iCalendarに追加
                </Button>
              </div>
            </div>

            {/* Contact Info */}
            <div className='border-t pt-6 text-center text-sm text-gray-600'>
              <p>ご不明な点やお困りのことがございましたら</p>
              <p className='mt-2'>
                <a
                  href='mailto:hi.moment@gmail.com'
                  className='text-orange-600 hover:text-orange-700 font-medium'
                >
                  hi.moment@gmail.com
                </a>{' '}
                までお気軽にお問い合わせください
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

        {/* Additional Info */}
        <div className='mt-8 text-center'>
          <p className='text-sm text-gray-600'>
            セッションを有意義なものにするために、準備をしっかりと行いましょう
            🚀
          </p>
        </div>
      </div>
    </main>
  );
}
