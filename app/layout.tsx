import type { Metadata } from "next";
import { Work_Sans, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/auth-context";


const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
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
    <html
      lang="en"
      className={`${workSans.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>

          {children}

        </AuthProvider>
      </body>
    </html>
  );
}
