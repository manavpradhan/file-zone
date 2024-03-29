"use client";

import { Button } from "@/components/ui/button";
import { SignOutButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { SignInButton, useSession } from "@clerk/nextjs";

export default function Home() {
  const session = useSession();
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <SignedOut>
        <SignInButton mode="modal">
        <Button>Let's get you signed in!</Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <SignOutButton>
          <Button>Sign out</Button>
        </SignOutButton>
      </SignedIn>
    </main>
  );
}
