-- Validator telemetry (pipeline doc §6): one row per code-validator check
-- outcome, written best-effort by generation_service.log_check_outcomes.
-- A check that fails systematically across jobs is a prompt defect, not
-- generation noise — prompt_version lets pass-rate regressions attribute to
-- the prompt edit that caused them.

create table if not exists validator_outcomes (
  id uuid primary key default gen_random_uuid(),
  job_id uuid,
  node text not null,              -- e.g. 'topic_plan', 'notes:C2', 'quiz:C1'
  check_name text not null,        -- e.g. 'scope:in_covered', 'quiz:answer_format'
  passed boolean not null,
  blocking boolean not null default true,
  detail text,
  prompt_version text,
  model text,                      -- generating model — attributes pass rates in model A/B canaries
  created_at timestamptz not null default now()
);

-- Idempotent guard for databases that ran an earlier draft of this file.
alter table validator_outcomes add column if not exists model text;

create index if not exists idx_validator_outcomes_check
  on validator_outcomes (check_name, passed, created_at desc);
create index if not exists idx_validator_outcomes_job
  on validator_outcomes (job_id);

-- Aggregate view: pass rate per check per prompt version per model (the
-- numbers to watch after any prompt edit or model switch).
create or replace view validator_pass_rates as
select check_name,
       prompt_version,
       model,
       count(*)                                   as runs,
       round(avg(case when passed then 1 else 0 end)::numeric, 3) as pass_rate,
       max(created_at)                            as last_seen
from validator_outcomes
group by check_name, prompt_version, model
order by pass_rate asc, runs desc;
