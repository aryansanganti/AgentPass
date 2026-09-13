import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentPass — AI-Powered DeFi Risk Agent",
  description:
    "An AI agent that checks your DeFi risk — verified human, paid per use, no API keys. Type a wallet address, and your agent pulls live lending data, computes risk, and pays for its own analysis.",
  keywords: [
    "DeFi",
    "risk analysis",
    "AI agent",
    "ENS",
    "Hedera",
    "The Graph",
    "World ID",
    "ETHOnline",
  ],
  openGraph: {
    title: "AgentPass — AI-Powered DeFi Risk Agent",
    description:
      "An AI agent that checks your DeFi risk — verified human, paid per use, no API keys.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">
        <div className="bg-mesh" />
        {children}
      </body>
    </html>
  );
}
