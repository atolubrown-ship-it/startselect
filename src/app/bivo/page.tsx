import { redirect } from "next/navigation";

// The /bivo page was removed. This stub only sends old links to /signin.
// It can be deleted from the repo at any time.
export default function BivoRemoved() {
  redirect("/signin");
}
