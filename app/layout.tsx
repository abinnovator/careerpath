import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";

const monaSans = Mona_Sans({
  variable: "--font-mona_sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CareerPath",
  description:
    "An ai platform for students to plan tasks, take mock inteviews and take notes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${monaSans.className} antialiased`}>
        {children} <ToastContainer />
      </body>
    </html>
  );
}
