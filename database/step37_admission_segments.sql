-- Step 37 - Admission segment catalog.
-- Purpose: separate recruitment objects from program/flow so each segment can
-- carry its own partner, contract, commission, finance and risk model.

create table if not exists public.admission_segments (
  id uuid primary key default gen_random_uuid(),
  segment_code text not null unique,
  segment_name text not null,
  program_group text not null,
  admission_object text not null,
  delivery_context text not null,
  partner_model text not null,
  commission_model text not null,
  contract_model text not null,
  finance_risk text not null,
  owner_department text not null default 'Tuyển sinh',
  sort_order int not null default 0,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leads
add column if not exists admission_segment_id uuid
references public.admission_segments(id);

create index if not exists idx_leads_admission_segment_id
on public.leads(admission_segment_id)
where is_deleted = false;

alter table public.admission_segments enable row level security;

drop policy if exists "admission_segments_select_authenticated"
on public.admission_segments;
create policy "admission_segments_select_authenticated"
on public.admission_segments for select
to authenticated
using (true);

drop policy if exists "admission_segments_admin_write"
on public.admission_segments;
create policy "admission_segments_admin_write"
on public.admission_segments for all
to authenticated
using (public.is_admin() or public.has_permission('settings.manage'))
with check (public.is_admin() or public.has_permission('settings.manage'));

drop trigger if exists trg_admission_segments_updated_at
on public.admission_segments;
create trigger trg_admission_segments_updated_at
before update on public.admission_segments
for each row execute function public.set_updated_at();

drop trigger if exists trg_admission_segments_audit
on public.admission_segments;
create trigger trg_admission_segments_audit
after insert or update or delete on public.admission_segments
for each row execute function public.write_audit_log();

insert into public.admission_segments (
  segment_code,
  segment_name,
  program_group,
  admission_object,
  delivery_context,
  partner_model,
  commission_model,
  contract_model,
  finance_risk,
  owner_department,
  sort_order
) values
  (
    'TC9_TTGDTX_LINKED',
    'Trung cấp 9+ liên kết TTGDTX',
    'Trung cấp 9+',
    'Học sinh học văn hóa tại TTGDTX và học trung cấp tại HEU',
    'Liên kết TTGDTX',
    'TTGDTX là đơn vị phối hợp nguồn học sinh và/hoặc tổ chức học văn hóa',
    'Có thể có COM/chính sách cho TTGDTX, nhân viên trường hoặc người giới thiệu theo hợp đồng',
    'Cần hợp đồng hoặc văn bản liên kết, đúng thẩm quyền và đúng mô hình pháp lý',
    'Sai mô hình liên kết, thiếu hồ sơ pháp lý, chi COM sai đối tượng hoặc sai kỳ',
    'Tuyển sinh + Pháp chế + Đào tạo + KHTC',
    10
  ),
  (
    'TC9_ONSITE_HEU',
    'Trung cấp 9+ tuyển sinh tại chỗ HEU',
    'Trung cấp 9+',
    'Học sinh/phụ huynh đăng ký trực tiếp với HEU',
    'Tại HEU',
    'Không bắt buộc có đối tác',
    'Có thể áp dụng cơ chế tuyển sinh cho nhân viên theo chính sách nội bộ',
    'Theo quy chế tuyển sinh và hồ sơ nhập học của HEU',
    'Không log tư vấn, thiếu hồ sơ, tư vấn sai ngành/chính sách',
    'Tuyển sinh + CTHSSV + KHTC',
    20
  ),
  (
    'UNIVERSITY_TRANSFER_HOU',
    'Liên thông đại học - HOU',
    'Liên thông đại học',
    'Người học liên thông/chuyển tiếp chương trình đại học từ xa HOU',
    'HEU phối hợp tuyển sinh với HOU',
    'HOU là trường đại học liên kết; HEU phối hợp tuyển sinh/hồ sơ/địa điểm',
    'Có COM cho CTV/nhân viên và cơ chế hợp tác HEU-HOU theo chính sách hiệu lực từng thời điểm',
    'Cần hợp đồng HEU-HOU, quyết định/trạng thái HOU, minh chứng học phí và hồ sơ',
    'Chi COM trùng, học viên bỏ học, sai tỷ lệ hiệu lực, thiếu chứng từ kế toán',
    'Tuyển sinh + Pháp chế + KHTC',
    30
  ),
  (
    'UNIVERSITY_TRANSFER_OTHER',
    'Liên thông đại học - đại học khác',
    'Liên thông đại học',
    'Người học liên thông/chuyển tiếp với đối tác đại học ngoài HOU',
    'Theo từng trường đại học liên kết',
    'Mỗi trường đại học có hợp đồng, học phí và quy trình riêng',
    'Cơ chế COM/hoa hồng phải cấu hình theo từng hợp đồng và thời điểm hiệu lực',
    'Cần hợp đồng liên kết, phụ lục học phí, điều kiện tuyển sinh và chứng từ đối soát',
    'Áp sai cơ chế của HOU cho trường khác, thiếu chứng từ hoặc sai công nợ',
    'Tuyển sinh + Pháp chế + KHTC',
    40
  ),
  (
    'SHORT_UNEMPLOYMENT_SUPPORT',
    'Ngắn hạn theo diện trợ cấp thất nghiệp',
    'Ngắn hạn',
    'Người học đăng ký học nghề ngắn hạn có liên quan chính sách trợ cấp thất nghiệp',
    'Theo chính sách hỗ trợ học nghề',
    'Có thể liên quan trung tâm dịch vụ việc làm hoặc đơn vị giới thiệu',
    'COM nếu có phải tách khỏi khoản hỗ trợ/chứng từ chính sách',
    'Cần hồ sơ chính sách, xác nhận đủ điều kiện, chứng từ thu/chi theo quy định',
    'Sai điều kiện hưởng hỗ trợ, thiếu hồ sơ chính sách, ghi nhận tài chính sai nguồn',
    'Tuyển sinh + Đào tạo + KHTC',
    50
  ),
  (
    'SHORT_ONSITE_HEU',
    'Ngắn hạn tuyển sinh tại chỗ HEU',
    'Ngắn hạn',
    'Người học đăng ký khóa ngắn hạn trực tiếp tại HEU',
    'Tại HEU',
    'Không bắt buộc có đối tác',
    'Có thể áp dụng cơ chế tuyển sinh nội bộ hoặc CTV theo từng khóa',
    'Theo thông báo tuyển sinh, học phí, lịch khai giảng và hồ sơ khóa ngắn hạn',
    'Không theo dõi đủ học phí, lịch học, chứng chỉ hoặc nguồn giới thiệu',
    'Tuyển sinh + Đào tạo + KHTC',
    60
  )
on conflict (segment_code) do update set
  segment_name = excluded.segment_name,
  program_group = excluded.program_group,
  admission_object = excluded.admission_object,
  delivery_context = excluded.delivery_context,
  partner_model = excluded.partner_model,
  commission_model = excluded.commission_model,
  contract_model = excluded.contract_model,
  finance_risk = excluded.finance_risk,
  owner_department = excluded.owner_department,
  sort_order = excluded.sort_order,
  status = 'ACTIVE',
  updated_at = now();
