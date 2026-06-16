import { Route } from "lucide-react";

import { setAdmissionWorkspaceAction } from "@/app/workspace/actions";
import { Button } from "@/components/ui/button";
import type { AdmissionWorkspaceOption } from "@/lib/workspace";

type AdmissionWorkspaceSwitcherProps = {
  options: AdmissionWorkspaceOption[];
  activeSegmentId: string | null;
  canSeeAllSegments: boolean;
  returnTo: string;
};

export function AdmissionWorkspaceSwitcher({
  options,
  activeSegmentId,
  canSeeAllSegments,
  returnTo,
}: AdmissionWorkspaceSwitcherProps) {
  if (options.length === 0) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        Chưa được phân đối tượng tuyển sinh
      </div>
    );
  }

  return (
    <form action={setAdmissionWorkspaceAction} className="flex items-center gap-2">
      <input type="hidden" name="return_to" value={returnTo} />
      <div className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-2 py-1.5">
        <Route className="size-4 text-zinc-500" />
        <select
          name="segment_id"
          defaultValue={activeSegmentId ?? ""}
          className="max-w-64 bg-transparent text-sm text-zinc-700 outline-none"
          aria-label="Đối tượng tuyển sinh đang làm việc"
        >
          {canSeeAllSegments ? (
            <option value="">Tất cả đối tượng</option>
          ) : (
            <option value="">Chọn đối tượng</option>
          )}
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" variant="outline" size="sm">
        Áp dụng
      </Button>
    </form>
  );
}
