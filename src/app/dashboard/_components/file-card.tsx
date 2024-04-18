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
import { useMutation, useQuery } from "convex/react";
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
  trash,
}: {
  file: Doc<"files">;
  isFavorited: boolean;
  trash: boolean;
}) {
  const [open, setOpen] = useState(false);
  const deleteFile = useMutation(api.files.deleteFile);
  const restoreFile = useMutation(api.files.restoreFile);
  const toggleFavorite = useMutation(api.files.toggleFavorite);
  const { toast } = useToast();

  return (
    <>
      <AlertDialog open={open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            {trash ? (
              <AlertDialogDescription>
                This operation will restore your file.
              </AlertDialogDescription>
            ) : (
              <AlertDialogDescription>
                This file will get moved to trash. You can restore it from
                there, if you want.
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpen(false)}>
              Cancel
            </AlertDialogCancel>
            {!trash ? (
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
                Trash
              </AlertDialogAction>
            ) : (
              <AlertDialogAction
                onClick={async () => {
                  await restoreFile({
                    fileId: file._id,
                    // storageId: file.fileId,
                    // markAsDelete: true,
                  });
                  toast({
                    variant: "success",
                    title: "File restored successfully!",
                    description:
                      "You can view it in all files section.",
                  });
                  setOpen(false);
                }}
              >
                Restore
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {!trash && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={async () => {
                await toggleFavorite({ fileId: file._id });
              }}
            >
              {isFavorited ? (
                <div className="flex gap-3 text-blue-800 items-center">
                  <StarOffIcon className="h-5 w-5" />
                  Unfavorite
                </div>
              ) : (
                <div className="flex gap-3 text-green-500 items-center">
                  <StarIcon className="h-5 w-5" />
                  Favorite
                </div>
              )}
            </DropdownMenuItem>
          )}

          <Protect role="org:admin" fallback={<></>}>
            {!trash && <DropdownMenuSeparator />}
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setOpen(true)}
            >
              {file.markAsDelete ? (
                <div className="flex gap-3 text-green-500 items-center">
                  <Undo className="h-5 w-5" />
                  Restore
                </div>
              ) : (
                <div className="flex gap-3 text-red-500 items-center">
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
  trash,
}: {
  file: Doc<"files">;
  myfavorites: Doc<"favorites">[];
  trash: boolean;
}) {
  const typeIcons = {
    txt: <FileTextIcon />,
    csv: <GanttChartIcon />,
    pdf: <FileTextIcon />,
    image: <ImageIcon />,
  } as Record<Doc<"files">["type"], ReactNode>;

  const userProfile = useQuery(api.users.getUserProfile, {userId: file.userId})
  const isFavorited = myfavorites.some((fav) => fav.fileId === file._id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-3 items-center">
          <p>{typeIcons[file.type]}</p>
          <div className="flex items-center w-full justify-between">
            <p>{file.name}</p>
            <FileCardActions
              file={file}
              isFavorited={isFavorited}
              trash={trash}
            />
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
