# HEU Admission CRM database

This folder contains the first Supabase/PostgreSQL database foundation for the CRM.

Run order:

1. `schema.sql`
2. `seed.sql`
3. `policies.sql`
4. `triggers.sql`
5. Create the first Supabase Auth user in the dashboard.
6. Run `create_first_admin_profile.sql` after replacing `REPLACE_WITH_ADMIN_EMAIL`.
7. Optional: run `seed_sample_leads.sql` to create demo leads.

File purpose:

- `schema.sql`: tables, enum types, constraints, indexes.
- `seed.sql`: starter master data for roles, permissions, lead sources, campaigns, partners, and document checklist.
- `policies.sql`: Supabase Row Level Security helper functions and policies.
- `triggers.sql`: auto codes, updated timestamps, audit logs, status validation, and lead activity logging.
- `create_first_admin_profile.sql`: helper query for linking the first Auth user to the CRM `ADMIN` role.
- `seed_sample_leads.sql`: optional demo leads for testing the `/leads` page.

Important notes:

- These files are written for Supabase PostgreSQL.
- Do not run these on a production database before testing in a new Supabase project.
- The application UI is not connected to Supabase yet. That is the next phase after project setup and environment variables.
