"use client";
import { SideNav } from "./_components/side-nav";
import "./../globals.css";

// export const metadata: Metadata = {
//   title: "Create Next App",
//   description: "Generated by create next app",
// };

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="container mx-auto pt-5">
      <div className="flex gap-7 ">
        <SideNav />
        <div className="w-full">{children}</div>
      </div>
    </main>
  );
}
