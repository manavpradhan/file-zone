"use client";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UploadButton } from "./dashboard/_components/upload-button";
import { FileCard } from "./dashboard/_components/file-card";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { SearchBar } from "./dashboard/_components/search-bar";
import { useState } from "react";
import { SideNav } from "./dashboard/_components/side-nav";

export default function Home() {
  const organization = useOrganization();
  const user = useUser();
  const [query, setQuery] = useState("");

  let orgId: string | undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const files = useQuery(api.files.getFiles, orgId ? { orgId, query } : "skip");

  return (
    <main className="container mx-auto pt-5">
      <div className="flex gap-7">
        <SideNav />
        <div className="w-full">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Your Files</h1>
            <SearchBar query={query} setQuery={setQuery} />
            <UploadButton orgId={orgId} />
          </div>
          {files === undefined && (
            <div className="flex flex-col mx-auto items-center gap-4 w-full mt-60">
              <Loader2 className="mr-2 h-32 w-32 animate-spin" />
              <div>Loading...</div>
            </div>
          )}

          {files && !query && files?.length === 0 && (
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
            </div>
          )}

          {/* {files && !query && files.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {files?.map((file) => {
                return <FileCard key={file._id} file={file} myfavorites={}/>;
              })}
            </div>
          )} */}

          {files && query && files.length === 0 && (
            <div className="text-2xl mx-auto text-center my-[200px]">
              No such files found!
            </div>
          )}

          {/* {files && query && files.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {files?.map((file) => {
                return <FileCard key={file._id} file={file} />;
              })}
            </div>
          )} */}
        </div>
      </div>
    </main>
  );
}
