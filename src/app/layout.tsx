import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Obria · desenho que chega na obra", description: "Demo determinística de planejamento de interiores." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body>{children}</body></html>; }
