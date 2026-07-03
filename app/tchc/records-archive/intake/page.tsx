import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { TchcRecordsArchiveIntakeTemplate } from "@/components/tchc/tchc-records-archive-intake-template";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

type TchcRecordsArchiveIntakePageProps = {
  searchParams?: Promise<{
    document_created?: string;
    archive_created?: string;
    handover_created?: string;
    error?: string;
  }>;
};

function messageFromParams(
  params: Awaited<NonNullable<TchcRecordsArchiveIntakePageProps["searchParams"]>>,
) {
  if (params.document_created) {
    return "Da luu metadata nhap cho van ban.";
  }

  if (params.archive_created) {
    return "Da luu metadata nhap cho ho so luu tru.";
  }

  if (params.handover_created) {
    return "Da luu metadata nhap cho ban giao/xu ly.";
  }

  return null;
}

export default async function TchcRecordsArchiveIntakePage({
  searchParams,
}: TchcRecordsArchiveIntakePageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const params = searchParams ? await searchParams : {};

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell
      active="tchc-records-archive"
      title="Mau nhap van thu luu tru"
      description="Template-only cho metadata van ban, ho so luu tru va ban giao xu ly. Chua ghi du lieu that."
      actions={
        <Button asChild variant="outline" size="sm">
          <a href="/tchc/records-archive" aria-label="Quay lai TCHC van thu luu tru">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Quay lai
          </a>
        </Button>
      }
    >
      <TchcRecordsArchiveIntakeTemplate
        message={messageFromParams(params)}
        error={params.error}
      />
    </AppShell>
  );
}
