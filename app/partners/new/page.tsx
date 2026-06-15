import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { PartnerForm } from "@/components/partners/partner-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewPartnerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell
      active="partners"
      title="Tạo đối tác / CTV / TTGDTX"
      description="Nhập thông tin đối tác mang lead về cho tuyển sinh."
    >
      <PartnerForm />
    </AppShell>
  );
}
