import { AppShell } from "@/components/layout/app-shell";
import { ModulePage } from "@/components/layout/module-page";

export default function AiAssistantPage() {
  return (
    <AppShell
      active="ai-assistant"
      title="AI Assistant"
      description="Vùng thử nghiệm AI an toàn, chỉ hỗ trợ nháp và gợi ý."
    >
      <ModulePage
        summary="AI chỉ hỗ trợ soạn nháp, tóm tắt, gợi ý bước tiếp theo và phát hiện thiếu thông tin. AI không được tự gửi tin, tự duyệt, tự xóa, tự xác nhận nhập học, phê duyệt tài chính, chi tiền, ghi nhận doanh thu, phong tỏa/giải tỏa tài khoản hoặc mở production."
        priorities={[
          "Gợi ý kịch bản gọi điện",
          "Tóm tắt lịch sử tư vấn",
          "Soạn tin nhắn Zalo nháp",
          "Phát hiện thiếu hồ sơ",
          "Cảnh báo rủi ro nhưng không thay người duyệt",
        ]}
        nextMilestone="AI sẽ để sau MVP. Trước mắt cần hoàn thiện database, workflow, phân quyền và audit log."
      />
    </AppShell>
  );
}
