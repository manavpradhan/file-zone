import { Button } from "@/components/ui/button";
import {
  OrganizationSwitcher,
  SignInButton,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";

export function Header() {
  return (
    <div className="border-b py-4 bg-gray-50">
      <div className="container mx-auto justify-between flex items-center">
        <div className="flex items-center justify-between flex-1 mr-[100px]">
          <Link href={"/"} className="font-semibold text-lg">
            FileZone
          </Link>
          <Link href={"/dashboard/files"}>
            <Button variant={"outline"}>Your Files</Button>
          </Link>
        </div>
        <div className="flex gap-3 items-center">
          <OrganizationSwitcher />
          <UserButton />
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
