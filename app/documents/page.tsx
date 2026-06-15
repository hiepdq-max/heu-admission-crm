import { AppShell } from "@/components/layout/app-shell";
import { ModulePage } from "@/components/layout/module-page";

export default function DocumentsPage() {
  return (
    <AppShell
      active="documents"
      title="Hồ sơ nhập học"
      description="Theo dõi checklist hồ sơ bắt buộc trước khi xác nhận đủ điều kiện."
    >
      <ModulePage
        summary="Module hồ sơ kiểm tra từng giấy tờ của học sinh như phiếu đăng ký, CCCD, học bạ, bằng tốt nghiệp, giấy khai sinh, ảnh và giấy tờ ưu tiên nếu có."
        priorities={[
          "Checklist hồ sơ theo từng lead",
          "Trạng thái thiếu, đã nhận, đã kiểm tra",
          "File đính kèm hoặc link Google Drive/Supabase Storage",
          "Chặn chuyển ELIGIBLE nếu thiếu giấy tờ bắt buộc",
        ]}
        nextMilestone="Sau khi có bảng lead_documents và master checklist, ta sẽ làm tab hồ sơ trong trang chi tiết lead."
      />
    </AppShell>
  );
}
