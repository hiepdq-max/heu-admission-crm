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
        summary="AI chỉ hỗ trợ nhân sự tuyển sinh soạn nháp, tóm tắt lịch sử tư vấn, gợi ý bước tiếp theo và phát hiện thiếu thông tin. AI không được tự gửi tin, tự duyệt, tự xóa hoặc tự xác nhận nhập học."
        priorities={[
          "Gợi ý kịch bản gọi điện",
          "Tóm tắt lịch sử tư vấn",
          "Soạn tin nhắn Zalo nháp",
          "Phát hiện thiếu hồ sơ",
        ]}
        nextMilestone="AI sẽ để sau MVP. Trước mắt cần hoàn thiện database, workflow, phân quyền và audit log."
      />
    </AppShell>
  );
}
