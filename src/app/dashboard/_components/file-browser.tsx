"use client";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { UploadButton } from "../_components/upload-button";
import { FileCard } from "../_components/file-card";
import Image from "next/image";
import { FilterIcon, GridIcon, Loader2, RowsIcon } from "lucide-react";
import { SearchBar } from "../_components/search-bar";
import { useState } from "react";
import { columns } from "./columns";
import { FileTable } from "./file-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Doc } from "../../../../convex/_generated/dataModel";
import { Label } from "@/components/ui/label";

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
  const [type, setType] = useState<Doc<"files">["type"] | "all">("all");

  let orgId: string | undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const files = useQuery(
    api.files.getFiles,
    orgId
      ? {
          orgId,
          query,
          type: type === "all" ? undefined : type,
          favorites,
          trash,
        }
      : "skip"
  );
  const myfavorites = useQuery(
    api.files.myFavorites,
    orgId ? { orgId } : "skip"
  );

  const modifiedFiles =
    files?.map((file) => ({
      ...file,
      isFavorited: (myfavorites ?? []).some((fav) => fav.fileId === file._id),
      isTrash: trash,
    })) ?? [];

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold">Your {title}</h1>
        <SearchBar query={query} setQuery={setQuery} />
        {title === "Files" && <UploadButton orgId={orgId} />}
      </div>

      <Tabs defaultValue="grid">
        <div className="flex items-center justify-between">
          <TabsList className="mb-8">
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <GridIcon />
              Grid
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <RowsIcon />
              Table
            </TabsTrigger>
          </TabsList>
          <div className="mb-8 flex items-center gap-2">
            <Label
              htmlFor="type-select"
              className="text-gray-600 flex items-center gap-2"
            >
              <FilterIcon size={"20px"} />
              Filter by file types
            </Label>
            <Select
              value={type}
              onValueChange={(newType) => {
                setType(newType as any);
              }}
            >
              <SelectTrigger className="w-[180px]" id="type-select">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="txt">Text</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="image">Image</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {files === undefined && (
          <div className="flex flex-col mx-auto items-center gap-4 w-full mt-[10%]">
            <Loader2 className="mr-2 h-32 w-32 animate-spin" />
            <div>Loading...</div>
          </div>
        )}
        {files && !query && type === "all" && files?.length === 0 && (
          <div className="flex flex-col mx-auto items-center gap-4 w-full mt-[5%]">
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
        {files && query && files.length === 0 && (
          <div className="text-2xl mx-auto text-center my-[200px]">
            No such files found!
          </div>
        )}
        {files && type !== "all" && files.length === 0 && (
          <div className="text-2xl mx-auto text-center my-[200px]">
            No "{type}" files found!
          </div>
        )}
        <TabsContent value="grid">
          {files && !query && files.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {files?.map((file) => {
                return (
                  <FileCard
                    key={file._id}
                    file={file}
                    myfavorites={myfavorites ?? []}
                    trash={trash || false}
                  />
                );
              })}
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
                    trash={trash || false}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>
        <TabsContent value="table">
          {files && !query && files.length > 0 && (
            <FileTable columns={columns} data={modifiedFiles} />
          )}
          {files && query && files.length > 0 && (
            <FileTable columns={columns} data={modifiedFiles} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
