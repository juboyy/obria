import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ObrIA — uma prancheta de obra no bolso',
    template: '%s · ObrIA',
  },
  description:
    'Um único input coordena ideação do ambiente, procurement, sourcing e fornecedores.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
