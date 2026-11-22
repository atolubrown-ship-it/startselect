import { redirect } from "next/navigation";

// The /bivo/admin page was removed; the admin now lives at /signin/admin.
// This stub only sends old links there. It can be deleted from the repo at any time.
export default function BivoAdminRemoved() {
  redirect("/signin/admin");
}
