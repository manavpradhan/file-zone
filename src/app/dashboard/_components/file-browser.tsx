"use client";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { UploadButton } from "../_components/upload-button";
import { FileCard } from "../_components/file-card";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { SearchBar } from "../_components/search-bar";
import { useState } from "react";

export function FileBrowser({
  title,
  favorites,
  trash,
}: {
  title: string;
  favorites?: boolean;
  trash?: boolean;
}) {
  const organization = useOrganization();
  const user = useUser();
  const [query, setQuery] = useState("");

  let orgId: string | undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const files = useQuery(
    api.files.getFiles,
    orgId ? { orgId, query, favorites, trash } : "skip"
  );
  const myfavorites = useQuery(
    api.files.myFavorites,
    orgId ? { orgId } : "skip"
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Your {title}</h1>
        <SearchBar query={query} setQuery={setQuery} />
        {title === "Files" && <UploadButton orgId={orgId} />}
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
          {title === "Files" && (
            <div className="text-2xl mb-10">
              No files in your zone. Go ahead, and upload one now!
            </div>
          )}
          {title === "Favorites" && (
            <div className="text-2xl mb-10">
              Nothing here! Mark your files as favorite to find them easily
              later on.
            </div>
          )}
          {trash && <div className="text-2xl mb-10">Trash is empty!</div>}
        </div>
      )}

      {files && !query && files.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {files?.map((file) => {
            return (
              <FileCard
                key={file._id}
                file={file}
                myfavorites={myfavorites ?? []}
              />
            );
          })}
        </div>
      )}

      {files && query && files.length === 0 && (
        <div className="text-2xl mx-auto text-center my-[200px]">
          No such files found!
        </div>
      )}

      {files && query && files.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {files?.map((file) => {
            return (
              <FileCard
                key={file._id}
                file={file}
                myfavorites={myfavorites ?? []}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
