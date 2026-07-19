-- Industry outcomes (the create wizard's "IO" cards) were being absorbed into
-- the regular CO numbering on commit — the CO list showed them as CO5/CO6
-- while topic chips still said IO1. Persist the distinction so every surface
-- can label them IOn consistently.
alter table course_outcomes add column if not exists is_industry boolean not null default false;
