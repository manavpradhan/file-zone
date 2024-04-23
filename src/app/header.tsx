"use client"
import { Button } from "@/components/ui/button";
import {
  OrganizationSwitcher,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  return (
    <div className={`border-b py-4  ${pathname === "/" || pathname === "/#" ? "bg-transparent z-10": "bg-gray-100"}`}>
      <div className="container mx-auto justify-between flex items-center">
        <div className="flex items-center justify-between flex-1 mr-[100px]">
     
          
          <Link href={"/"} className="font-semibold text-lg flex items-center gap-2">
          <Image alt="logo" src={"/logo.png"} width="50" height="50"/>
            FileZone
          </Link>
  
          <SignedIn>
            <Link href={"/dashboard/files"}>
              <Button variant={"outline"}>Your Files</Button>
            </Link>
          </SignedIn>
        </div>
        <div className="flex gap-3 items-center">
          <SignedIn>
            <OrganizationSwitcher />
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button>Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </div>
  );
}
