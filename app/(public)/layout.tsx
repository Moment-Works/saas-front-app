'use client';

import Link from 'next/link';
import { CircleIcon } from 'lucide-react';

function Header() {
  return (
    <header className='border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center'>
        <Link href='/' className='flex items-center'>
          <CircleIcon className='h-6 w-6 text-orange-500' />
          <span className='ml-2 text-xl font-semibold text-gray-900'>
            Moment Works
          </span>
        </Link>
        <nav className='flex items-center space-x-6'>
          <Link
            href='/consultants'
            className='text-sm font-medium text-gray-700 hover:text-gray-900'
          >
            コンサルタント一覧
          </Link>
          <Link
            href='/blog'
            className='text-sm font-medium text-gray-700 hover:text-gray-900'
          >
            ブログ
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className='border-t border-gray-200 mt-auto'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex flex-col md:flex-row justify-between items-center'>
          <div className='flex items-center mb-4 md:mb-0'>
            <CircleIcon className='h-5 w-5 text-orange-500' />
            <span className='ml-2 text-sm text-gray-600'>
              © 2024 Moment Works
            </span>
          </div>
          <div className='flex space-x-6'>
            <a
              href='mailto:hi.moment@gmail.com'
              className='text-sm text-gray-600 hover:text-gray-900'
            >
              お問い合わせ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className='flex flex-col min-h-screen'>
      <Header />
      {children}
      <Footer />
    </section>
  );
}
