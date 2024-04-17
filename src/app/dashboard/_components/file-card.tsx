"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  FileTextIcon,
  GanttChartIcon,
  ImageIcon,
  MoreVertical,
  StarIcon,
  StarOffIcon,
  TrashIcon,
  Undo,
} from "lucide-react";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { Protect } from "@clerk/nextjs";

function GetImage({ storageId }: { storageId: string }) {
  const imageUrl = new URL(`${process.env.NEXT_PUBLIC_CONVEX_URL}/getImage`);
  imageUrl.searchParams.set("storageId", storageId);

  return <img src={imageUrl.href} height="100px" width="200px" />;
}

function getFileUrl(fileId: Id<"_storage">): string {
  return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${fileId}`;
}

function FileCardActions({
  file,
  isFavorited,
}: {
  file: Doc<"files">;
  isFavorited: boolean;
}) {
  const [open, setOpen] = useState(false);
  const deleteFile = useMutation(api.files.deleteFile);
  const toggleFavorite = useMutation(api.files.toggleFavorite);
  const { toast } = useToast();

  return (
    <>
      <AlertDialog open={open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This file will get moved to trash. You can either restore it or
              delete permanantly from there.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await deleteFile({
                  fileId: file._id,
                  // storageId: file.fileId,
                  // markAsDelete: true,
                });
                toast({
                  variant: "default",
                  title: "File deleted successfully",
                  description:
                    "The file is moved to trash! You can restore it in the trash.",
                });
                if (isFavorited) {
                  await toggleFavorite({ fileId: file._id });
                }
                setOpen(false);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {!isFavorited && (
            <DropdownMenuItem
              className="flex gap-3 items-center text-green-500 cursor-pointer"
              onClick={async () => {
                await toggleFavorite({ fileId: file._id });
              }}
            >
              <StarIcon className="h-5 w-5" />
              Favorite
            </DropdownMenuItem>
          )}

          {isFavorited && (
            <DropdownMenuItem
              className="flex gap-3 items-center text-blue-800 cursor-pointer"
              onClick={async () => {
                await toggleFavorite({ fileId: file._id });
              }}
            >
              <StarOffIcon className="h-5 w-5" />
              Unfavorite
            </DropdownMenuItem>
          )}
          <Protect role="org:admin" fallback={<></>}>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className=" text-red-500 cursor-pointer"
              onClick={() => setOpen(true)}
            >
              {file.markAsDelete ? (
                <div className="flex gap-3 items-center">
                  <Undo className="h-5 w-5" />
                  Restore
                </div>
              ) : (
                <div className="flex gap-3 items-center">
                  <TrashIcon className="h-5 w-5" />
                  Delete
                </div>
              )}
            </DropdownMenuItem>
          </Protect>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export function FileCard({
  file,
  myfavorites,
}: {
  file: Doc<"files">;
  myfavorites: Doc<"favorites">[];
}) {
  const typeIcons = {
    txt: <FileTextIcon />,
    csv: <GanttChartIcon />,
    pdf: <FileTextIcon />,
    image: <ImageIcon />,
  } as Record<Doc<"files">["type"], ReactNode>;

  const isFavorited = myfavorites.some((fav) => fav.fileId === file._id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-3 items-center">
          <p>{typeIcons[file.type]}</p>
          <div className="flex items-center w-full justify-between">
            <p>{file.name}</p>
            <FileCardActions file={file} isFavorited={isFavorited} />
          </div>
        </CardTitle>
        {/* <CardDescription>Card Description</CardDescription> */}
      </CardHeader>
      <CardContent className="h-[200px] flex justify-center items-center">
        {file.type === "image" && (
          // <GetImage storageId={file.fileId.toString()} />
          <Image
            src={getFileUrl(file.fileId)}
            alt="image file"
            height={75}
            width={150}
            className="mx-auto"
          />
        )}
        {file.type === "pdf" && (
          <Image
            src={"/pdf.png"}
            alt="pdf file"
            height={75}
            width={150}
            className="mx-auto"
          />
        )}
        {file.type === "csv" && (
          <Image
            src={"/csv.png"}
            alt="csv file"
            height={75}
            width={150}
            className="mx-auto"
          />
        )}
        {file.type === "txt" && (
          <Image
            src={"/txt.jpg"}
            alt="text file"
            height={75}
            width={150}
            className="mx-auto"
          />
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        {/* <p>{file._creationTime}</p> */}
        <Button
          onClick={() => {
            window.open(getFileUrl(file.fileId), "_blank");
          }}
        >
          Download
        </Button>
        <div className="flex items-center gap-2">
          {isFavorited && <StarIcon className="text-green-500" />}
          <p>{file.type}</p>
        </div>
      </CardFooter>
    </Card>
  );
}
