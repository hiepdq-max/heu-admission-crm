import Link from "next/link";
import { redirect } from "next/navigation";
import { FileSearch, RefreshCcw } from "lucide-react";

import { KhoaGiangVienGapPack } from "@/components/khoa/khoa-giang-vien-gap-pack";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function KhoaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell
      active="khoa"
      title="Khoa / Giang vien"
      description="M08 PASS_LOCAL foundation for faculty scope, teacher profile privacy, class delivery and teaching-evidence controls."
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/khoa">
              <RefreshCcw className="size-4" />
              Tai lai
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search?q=KHOA-GV">
              <FileSearch className="size-4" />
              Tim KHOA-GV
            </Link>
          </Button>
        </>
      }
    >
      <KhoaGiangVienGapPack />
    </AppShell>
  );
}
