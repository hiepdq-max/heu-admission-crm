-- Optional sample leads for local/manual testing.
-- Run after creating the first admin profile.

with admin_user as (
  select id
  from public.users_profile
  where email = 'admin@heuschool.edu.vn'
  limit 1
),
sources as (
  select source_code, id
  from public.lead_sources
),
campaign_fb as (
  select id
  from public.campaigns
  where campaign_code = 'TS2026-FB-Q3'
  limit 1
),
event_campaign as (
  select id
  from public.campaigns
  where campaign_code = 'TS2026-EVENT-SUMMER'
  limit 1
),
sample_partner as (
  select id
  from public.partners
  where partner_code = 'CTV-0001'
  limit 1
)
insert into public.leads (
  student_name,
  student_phone,
  student_dob,
  student_gender,
  parent_name,
  parent_phone,
  parent_relationship,
  current_school,
  current_grade,
  graduation_year,
  interested_program,
  interested_major,
  province,
  district,
  ward,
  source_id,
  campaign_id,
  partner_id,
  assigned_to,
  status,
  priority,
  lost_reason,
  next_followup_at,
  note,
  created_by
)
select
  v.student_name,
  v.student_phone,
  v.student_dob::date,
  v.student_gender,
  v.parent_name,
  v.parent_phone,
  v.parent_relationship,
  v.current_school,
  v.current_grade,
  v.graduation_year,
  v.interested_program,
  v.interested_major,
  v.province,
  v.district,
  v.ward,
  (select id from sources where source_code = v.source_code),
  case
    when v.campaign_key = 'FB' then (select id from campaign_fb)
    when v.campaign_key = 'EVENT' then (select id from event_campaign)
    else null
  end,
  case when v.use_partner then (select id from sample_partner) else null end,
  (select id from admin_user),
  v.status::public.lead_status,
  v.priority::public.lead_priority,
  v.lost_reason,
  v.next_followup_at::timestamptz,
  v.note,
  (select id from admin_user)
from (
  values
    (
      'Nguyen Minh Anh',
      '0901000001',
      '2009-05-12',
      'FEMALE',
      'Nguyen Thi Hoa',
      '0911000001',
      'Me',
      'THCS Minh Khai',
      '9',
      2026,
      'He 9+',
      'Cham soc sac dep',
      'Ha Noi',
      'Cau Giay',
      'Dich Vong',
      'FB_ADS',
      'FB',
      false,
      'FOLLOW_UP',
      'HIGH',
      null,
      now() + interval '2 hours',
      'Phu huynh muon tu van hoc phi va lich hoc.'
    ),
    (
      'Tran Quoc Bao',
      '0901000002',
      '2008-09-20',
      'MALE',
      'Tran Van Hung',
      '0911000002',
      'Bo',
      'THCS Nguyen Trai',
      '9',
      2026,
      'He 9+',
      'Cong nghe o to',
      'Ha Noi',
      'Nam Tu Liem',
      'My Dinh',
      'HOTLINE',
      null,
      false,
      'CONTACTED',
      'NORMAL',
      null,
      null,
      'Da goi lan 1, hoc sinh quan tam nganh o to.'
    ),
    (
      'Le Phuong Thao',
      '0901000003',
      '2009-01-03',
      'FEMALE',
      'Le Thi Mai',
      '0911000003',
      'Me',
      'THCS Tran Phu',
      '9',
      2026,
      'He 9+',
      'Ke toan doanh nghiep',
      'Vinh Phuc',
      'Vinh Yen',
      'Lien Bao',
      'CTV',
      null,
      true,
      'INTERESTED',
      'HIGH',
      null,
      now() + interval '1 day',
      'CTV gioi thieu, can hen phu huynh den truong.'
    ),
    (
      'Pham Gia Huy',
      '0901000004',
      '2008-12-18',
      'MALE',
      'Pham Van Nam',
      '0911000004',
      'Bo',
      'THCS Kim Chung',
      '9',
      2026,
      'He 9+',
      'Dien cong nghiep',
      'Ha Noi',
      'Dong Anh',
      'Kim Chung',
      'EVENT',
      'EVENT',
      false,
      'DOCUMENT_PENDING',
      'NORMAL',
      null,
      now() + interval '3 days',
      'Da tham gia su kien tu van, dang bo sung hoc ba.'
    ),
    (
      'Do Khanh Linh',
      '0901000005',
      '2009-07-30',
      'FEMALE',
      'Do Thi Hanh',
      '0911000005',
      'Me',
      'THCS Dich Vong',
      '9',
      2026,
      'He 9+',
      'Nghiep vu nha hang',
      'Ha Noi',
      'Cau Giay',
      'Mai Dich',
      'ZALO',
      null,
      false,
      'NEW',
      'URGENT',
      null,
      null,
      'Lead moi tu Zalo, can goi trong 24h.'
    ),
    (
      'Hoang Duc Manh',
      '0901000006',
      '2008-03-14',
      'MALE',
      'Hoang Van Tuan',
      '0911000006',
      'Bo',
      'THCS Xuan Dinh',
      '9',
      2026,
      'He 9+',
      'Cong nghe thong tin',
      'Ha Noi',
      'Bac Tu Liem',
      'Xuan Dinh',
      'WEBSITE',
      null,
      false,
      'LOST',
      'LOW',
      'CHOSE_OTHER_SCHOOL',
      null,
      'Gia dinh da chon truong khac.'
    )
) as v(
  student_name,
  student_phone,
  student_dob,
  student_gender,
  parent_name,
  parent_phone,
  parent_relationship,
  current_school,
  current_grade,
  graduation_year,
  interested_program,
  interested_major,
  province,
  district,
  ward,
  source_code,
  campaign_key,
  use_partner,
  status,
  priority,
  lost_reason,
  next_followup_at,
  note
)
where exists (select 1 from admin_user)
  and not exists (
    select 1
    from public.leads existing
    where existing.student_phone in (
      '0901000001',
      '0901000002',
      '0901000003',
      '0901000004',
      '0901000005',
      '0901000006'
    )
  );
