import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Obra Clara — do desejo ao próximo passo',
    template: '%s · Obra Clara',
  },
  description:
    'Transforme uma ideia para o seu ambiente em caminhos visuais, escopo confirmável e uma conversa mais clara com profissionais.',
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
