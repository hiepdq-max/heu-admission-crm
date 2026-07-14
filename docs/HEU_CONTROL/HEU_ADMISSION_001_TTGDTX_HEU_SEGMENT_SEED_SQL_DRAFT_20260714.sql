-- HEU-ADMISSION-001 - DRAFT ONLY
-- This is a minimal seed proposal for the HEU/TTGDTX pilot.
-- Do not execute from Codex/chat. Do not use as a migration.
-- Preconditions: IT_DATA confirms schema, backup/restore evidence, and owner approval.
-- This file intentionally does not touch HOU or short-course segments.

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
  sort_order,
  status
) values
  (
    'TC9_TTGDTX_LINKED',
    'Trung cap 9+ lien ket TTGDTX',
    'Trung cap 9+',
    'Hoc sinh hoc van hoa tai TTGDTX va hoc trung cap tai HEU',
    'Lien ket TTGDTX',
    'TTGDTX la don vi phoi hop nguon hoc sinh',
    'Chi ap dung khi co chinh sach hoac hop dong duoc duyet',
    'Can hop dong hoac van ban lien ket hop le',
    'Thieu can cu phap ly hoac doi soat sai doi tuong',
    'Tuyen sinh',
    10,
    'ACTIVE'
  ),
  (
    'TC9_ONSITE_HEU',
    'Trung cap 9+ tuyen sinh tai cho HEU',
    'Trung cap 9+',
    'Hoc sinh hoac phu huynh dang ky truc tiep voi HEU',
    'Tai HEU',
    'Khong bat buoc co doi tac',
    'Chi ap dung theo chinh sach noi bo duoc duyet',
    'Theo quy che tuyen sinh va ho so nhap hoc HEU',
    'Thieu ho so, tu van sai nganh hoac sai chinh sach',
    'Tuyen sinh',
    20,
    'ACTIVE'
  )
-- Do not overwrite an existing catalog row. If a code already exists,
-- IT_DATA must compare the row and approve any separate controlled update.
on conflict (segment_code) do nothing;

-- Post-execution verification proposal (run only in an approved test environment):
-- select segment_code, status
-- from public.admission_segments
-- where segment_code in ('TC9_TTGDTX_LINKED', 'TC9_ONSITE_HEU')
-- order by sort_order;
