import { db } from './drizzle';
import { consultants } from './schema';

async function seedConsultants() {
  console.log('Creating consultants...');

  await db.insert(consultants).values([
    {
      name: '山田 太郎',
      title: 'ビジネス戦略コンサルタント',
      bio: '大手コンサルティングファームで10年以上の経験。スタートアップから大企業まで幅広い支援実績があります。\n\n戦略立案から実行支援まで、クライアントの成長を全面的にサポート。特に新規事業開発とマーケティング戦略に強みを持っています。データに基づいた意思決定と、実践的なアプローチで結果を出すことを重視しています。',
      expertise: ['事業戦略', '新規事業開発', 'マーケティング', 'グロース戦略'],
      price30min: 10000,
      imageUrl: '',
      paymentLink: 'https://buy.stripe.com/test_xxxxx1',
      meetUrl: 'https://meet.google.com/abc-defg-hij',
      email: 'yamada@example.com',
    },
    {
      name: '佐藤 花子',
      title: 'デジタルマーケティング専門家',
      bio: 'SNSマーケティングとコンテンツ戦略が得意。ROIを重視した実践的なアドバイスを提供します。\n\n元大手広告代理店のデジタルマーケティング部門責任者。Instagram、Twitter、TikTokなど各SNSプラットフォームの特性を活かした戦略立案と運用支援が得意です。数値に基づいた改善提案で、多くのクライアントの売上向上に貢献してきました。',
      expertise: [
        'SNSマーケティング',
        'コンテンツ戦略',
        'SEO',
        'インフルエンサーマーケティング',
      ],
      price30min: 8000,
      imageUrl: '',
      paymentLink: 'https://buy.stripe.com/test_xxxxx2',
      meetUrl: 'https://meet.google.com/klm-nopq-rst',
      email: 'sato@example.com',
    },
    {
      name: '鈴木 一郎',
      title: 'テクノロジーコンサルタント',
      bio: 'システム開発とDX推進の専門家。技術選定から実装まで包括的にサポートします。\n\nシリコンバレーのスタートアップでCTOを経験後、日本企業のDX支援に従事。クラウドネイティブなシステム設計、マイクロサービスアーキテクチャ、CI/CDパイプラインの構築など、モダンな開発手法の導入をサポートします。ビジネス視点を持った技術コンサルティングが強みです。',
      expertise: [
        'システム開発',
        'DX推進',
        'クラウド導入',
        'アーキテクチャ設計',
      ],
      price30min: 12000,
      imageUrl: '',
      paymentLink: 'https://buy.stripe.com/test_xxxxx3',
      meetUrl: 'https://meet.google.com/uvw-xyz-abc',
      email: 'suzuki@example.com',
    },
  ]);

  console.log('✓ 3 consultants created successfully.');
}

seedConsultants()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
