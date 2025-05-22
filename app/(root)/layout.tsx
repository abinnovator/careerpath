import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { isAuthenticated } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated) redirect("/sign-in");

  return (
    <div className="root-layout">
      <nav className="justify-between flex flex-row">
        <Link href="/" className="flex items-center gap-2">
          {/* <Image src="/logo.svg" alt="Logo" width={38} height={32} /> */}
          {/* <Image src="/logo.png" alt="Logo" width={50} height={50} /> */}
          <Image src="/logo-2.svg" alt="Logo" width={50} height={50} />
          <h2 className="text-primary-100">CareerPath</h2>
        </Link>
        <div className="flex flex-row gap-8">
          <Link href="/" className="flex items-center gap-2">
            <p className="text-primary-100">Home</p>
          </Link>
          <Link href="/calendar" className="flex items-center gap-2">
            <p className="text-primary-100">Calender</p>
          </Link>
          <Link href="/notes" className="flex items-center gap-2">
            <p className="text-primary-100">Notes</p>
          </Link>
          <Image
            src="/Profile_Picture-removebg-preview.png"
            alt="profile pic"
            width={50}
            height={50}
            className="rounded-full"
          />
        </div>
      </nav>

      {children}
    </div>
  );
};
export default RootLayout;
