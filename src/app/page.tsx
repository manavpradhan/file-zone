"use client";

import { Button } from "@/components/ui/button";
import { SignOutButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { SignInButton, useSession } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const session = useSession();
  const createFile = useMutation(api.files.createFile);
  const files = useQuery(api.files.getFiles);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <SignedOut>
        <SignInButton mode="modal">
        <Button>Let's get you signed in!</Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <SignOutButton>
          <Button>Sign Out</Button>
        </SignOutButton>
      </SignedIn>

      {files?.length === 0 && <p>no records</p>}

      {files?.map((file)=>{
        return <div key={file._id}>{file.name}</div>
      })}

      <Button onClick={()=>{createFile({
        name: "hello world"
      })}}>hit me</Button>
    </main>
  );
}
