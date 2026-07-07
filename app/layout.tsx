import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/auth-context";
import Header from "./components/Header";
import Footer from "./components/Footer";

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MerchantNavyJobs",
  description: "Find your next job at sea.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${workSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
