-- Step 35F - HOU learning location management and evidence links.
-- Run after step35a_hou_foundation.sql.
--
-- This step keeps HOU locations configurable in the system. Future learning
-- sites should be inserted as new rows instead of hard-coded in the app.

alter table public.hou_locations
add column if not exists location_type text not null default 'LEARNING_SITE',
add column if not exists approval_file_url text,
add column if not exists evidence_image_url text,
add column if not exists evidence_note text;

do $$ begin
  alter table public.hou_locations
  add constraint hou_locations_location_type_valid check (
    location_type in ('MAIN_CAMPUS', 'LEARNING_SITE', 'PRACTICE_SITE', 'OTHER')
  );
exception when duplicate_object then null;
end $$;

insert into public.hou_locations (
  location_code,
  location_name,
  location_type,
  address_line,
  ward,
  district_legacy,
  province,
  valid_from,
  source_document,
  approval_file_url,
  evidence_image_url,
  evidence_note,
  notes
) values
  (
    'HOU_HEU_786_KIM_GIANG',
    'HEU - 786 Kim Giang',
    'LEARNING_SITE',
    '786 Kim Giang',
    null,
    null,
    'Thành phố Hà Nội',
    current_date,
    'Bổ sung theo thông tin vận hành HEU; cần cập nhật quyết định/file minh chứng khi có.',
    null,
    null,
    'Có thể bổ sung link file quyết định, biên bản, ảnh cơ sở hoặc minh chứng liên quan trong phần Cấu hình.',
    'Địa điểm học bổ sung. Thông tin phường/quận/huyện cũ để trống cho đến khi có hồ sơ chính thức.'
  )
on conflict (location_code) do update set
  location_name = excluded.location_name,
  location_type = excluded.location_type,
  address_line = excluded.address_line,
  ward = excluded.ward,
  district_legacy = excluded.district_legacy,
  province = excluded.province,
  valid_from = excluded.valid_from,
  source_document = excluded.source_document,
  evidence_note = excluded.evidence_note,
  notes = excluded.notes,
  status = 'ACTIVE',
  updated_at = now();
