'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BookingFormProps {
  consultantId: string;
}

export function BookingForm({ consultantId }: BookingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    // Collect preferred dates
    const preferredDates = [
      formData.get('date1'),
      formData.get('date2'),
      formData.get('date3'),
    ].filter(Boolean) as string[];

    const payload = {
      consultantId,
      clientName: formData.get('name') as string,
      clientEmail: formData.get('email') as string,
      preferredDates,
      message: formData.get('message') as string,
    };

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '予約の作成に失敗しました');
      }

      // Redirect to thanks page on success
      router.push('/bookings/thanks');
    } catch (err) {
      console.error('Error submitting booking:', err);
      setError(err instanceof Error ? err.message : '予約の作成に失敗しました');
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md'>
          {error}
        </div>
      )}

      {/* Client Name */}
      <div>
        <Label htmlFor='name'>お名前 *</Label>
        <Input
          id='name'
          name='name'
          type='text'
          required
          placeholder='山田 太郎'
          className='mt-1'
          disabled={isSubmitting}
        />
      </div>

      {/* Client Email */}
      <div>
        <Label htmlFor='email'>メールアドレス *</Label>
        <Input
          id='email'
          name='email'
          type='email'
          required
          placeholder='example@email.com'
          className='mt-1'
          disabled={isSubmitting}
        />
      </div>

      {/* Preferred Dates */}
      <div>
        <Label>希望日時（3つまで）*</Label>
        <p className='text-sm text-gray-600 mb-2'>
          例: 2024年2月15日 14:00-15:00
        </p>
        <div className='space-y-2'>
          <Input
            name='date1'
            type='text'
            required
            placeholder='第1希望'
            disabled={isSubmitting}
          />
          <Input
            name='date2'
            type='text'
            placeholder='第2希望'
            disabled={isSubmitting}
          />
          <Input
            name='date3'
            type='text'
            placeholder='第3希望'
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Message */}
      <div>
        <Label htmlFor='message'>相談内容 *</Label>
        <textarea
          id='message'
          name='message'
          required
          rows={6}
          placeholder='相談したい内容や背景を詳しくお書きください'
          className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed'
          disabled={isSubmitting}
        />
      </div>

      {/* Submit Button */}
      <Button
        type='submit'
        size='lg'
        className='w-full rounded-full'
        disabled={isSubmitting}
      >
        {isSubmitting ? '送信中...' : 'リクエストを送信'}
      </Button>

      <p className='text-xs text-gray-600 text-center'>
        送信後、コンサルタントから日程調整のご連絡をさせていただきます。
        <br />
        お問い合わせ:{' '}
        <a
          href='mailto:hi.moment@gmail.com'
          className='text-orange-600 hover:underline'
        >
          hi.moment@gmail.com
        </a>
      </p>
    </form>
  );
}
