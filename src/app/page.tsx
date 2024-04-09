"use client";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UploadButton } from "./upload-button";
import { FileCard } from "./file-card";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function Home() {
  const organization = useOrganization();
  const user = useUser();

  let orgId: string | undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");

  return (
    <main className="container mx-auto pt-12">
      {files === undefined && (
        <div className="flex flex-col mx-auto items-center gap-4 w-full mt-60">
          <Loader2 className="mr-2 h-32 w-32 animate-spin" />
          <div>Loading...</div>
        </div>
      )}

      {files && files?.length === 0 && (
        <div className="flex flex-col mx-auto items-center gap-4 w-full mt-40">
          <Image
            alt="Image of doc folder"
            width="300"
            height="300"
            src="/empty.svg"
          />
          <div className="text-2xl mb-10">
            No files in your zone. Go ahead, and upload one now!
          </div>
          <UploadButton orgId={orgId} />
        </div>
      )}

      {files && files.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Your Files</h1>
            <UploadButton orgId={orgId} />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {files?.map((file) => {
              return <FileCard key={file._id} file={file} />;
            })}
          </div>
        </>
      )}
    </main>
  );
}
