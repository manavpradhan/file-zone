"use client";

import { FileBrowser } from "../_components/file-browser";

export default function TrashPage() {
  return (
    <>
      <FileBrowser title={"Deleted Files"} trash={true} />
    </>
  );
}
