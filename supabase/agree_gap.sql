-- Agreement Gap. Already applied on Supabase project we-almost-agree
-- (ref xcedcymypsrafknfzxxz, eu-west-2) as migrations agree_gap and
-- agree_gap_deny_policies. Safe to re-run only on an empty database.

create table public.agree_topics (
  id text primary key,
  title text not null,
  blurb text not null,
  approved boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.agree_statements (
  id text primary key,
  topic_id text not null references public.agree_topics (id) on delete cascade,
  position smallint not null check (position between 1 and 3),
  body text not null,
  unique (topic_id, position)
);

create index agree_statements_topic_id_idx on public.agree_statements (topic_id);

create table public.agree_comparisons (
  code text primary key,
  topic_id text not null references public.agree_topics (id),
  origin_answers smallint[] not null,
  friend_answers smallint[],
  origin_token_hash text not null,
  friend_token_hash text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days'),
  friend_completed_at timestamptz,
  share_count integer not null default 0,
  constraint agree_origin_answers_ok check (
    cardinality(origin_answers) = 3
    and origin_answers[1] between -1 and 1
    and origin_answers[2] between -1 and 1
    and origin_answers[3] between -1 and 1
  ),
  constraint agree_friend_answers_ok check (
    friend_answers is null
    or (
      cardinality(friend_answers) = 3
      and friend_answers[1] between -1 and 1
      and friend_answers[2] between -1 and 1
      and friend_answers[3] between -1 and 1
    )
  )
);

create index agree_comparisons_topic_id_idx on public.agree_comparisons (topic_id);

create table public.agree_events (
  id bigint generated always as identity primary key,
  name text not null check (name in ('started', 'completed', 'shared')),
  topic_id text,
  comparison_code text,
  created_at timestamptz not null default now()
);

create index agree_events_started_recent_idx
  on public.agree_events (created_at)
  where name = 'started';

alter table public.agree_topics enable row level security;
alter table public.agree_statements enable row level security;
alter table public.agree_comparisons enable row level security;
alter table public.agree_events enable row level security;

revoke all on table public.agree_topics from anon, authenticated;
revoke all on table public.agree_statements from anon, authenticated;
revoke all on table public.agree_comparisons from anon, authenticated;
revoke all on table public.agree_events from anon, authenticated;

grant select, insert, update, delete on table public.agree_topics to service_role;
grant select, insert, update, delete on table public.agree_statements to service_role;
grant select, insert, update, delete on table public.agree_comparisons to service_role;
grant select, insert, update, delete on table public.agree_events to service_role;
grant usage, select on sequence public.agree_events_id_seq to service_role;

-- Explicit deny for the public API roles. The service role bypasses RLS.
create policy agree_topics_no_client on public.agree_topics
  for all to anon, authenticated using (false) with check (false);
create policy agree_statements_no_client on public.agree_statements
  for all to anon, authenticated using (false) with check (false);
create policy agree_comparisons_no_client on public.agree_comparisons
  for all to anon, authenticated using (false) with check (false);
create policy agree_events_no_client on public.agree_events
  for all to anon, authenticated using (false) with check (false);

insert into public.agree_topics (id, title, blurb, approved, sort_order) values
  ('working-from-home', 'Working from home', 'Where the work happens, and who decides.', true, 1),
  ('electric-cars', 'Electric cars', 'Practical today, and the UK timeline.', true, 2),
  ('four-day-week', '4-day week', 'Fewer days, and whether the work still gets done.', true, 3),
  ('phones-in-schools', 'Phones in schools', 'Bans, age, and who sets the rule.', true, 4),
  ('tipping', 'Tipping', 'Service charges, a fair percent, and pay.', true, 5),
  ('cash-vs-card', 'Cash vs card', 'Notes and coins, and who gets left out.', true, 6);

insert into public.agree_statements (id, topic_id, position, body) values
  ('working-from-home-1', 'working-from-home', 1, 'Most office workers do their job as well at home.'),
  ('working-from-home-2', 'working-from-home', 2, 'Two office days a week is a fair balance.'),
  ('working-from-home-3', 'working-from-home', 3, 'Employers should decide where staff work.'),
  ('electric-cars-1', 'electric-cars', 1, 'EVs are practical for most UK drivers today.'),
  ('electric-cars-2', 'electric-cars', 2, 'The UK plan to end new petrol and diesel car sales in 2030, and hybrids in 2035, is realistic.'),
  ('electric-cars-3', 'electric-cars', 3, 'Public charging is good enough where I live.'),
  ('four-day-week-1', 'four-day-week', 1, 'A 4-day week would work in my type of job.'),
  ('four-day-week-2', 'four-day-week', 2, 'Productivity would stay the same on four days.'),
  ('four-day-week-3', 'four-day-week', 3, 'It should be trialled more widely in the UK.'),
  ('phones-in-schools-1', 'phones-in-schools', 1, 'Phones should be banned during the school day.'),
  ('phones-in-schools-2', 'phones-in-schools', 2, 'Under-14s are better off without a smartphone.'),
  ('phones-in-schools-3', 'phones-in-schools', 3, 'Parents, not schools, should set phone rules.'),
  ('tipping-1', 'tipping', 1, 'Service charges should be optional, not added by default.'),
  ('tipping-2', 'tipping', 2, '10–12.5% is a fair tip in restaurants.'),
  ('tipping-3', 'tipping', 3, 'Staff should be paid enough that tips are a bonus.'),
  ('cash-vs-card-1', 'cash-vs-card', 1, 'Shops should always accept cash.'),
  ('cash-vs-card-2', 'cash-vs-card', 2, 'I would be fine with a cashless UK.'),
  ('cash-vs-card-3', 'cash-vs-card', 3, 'Card-only places put some people at a disadvantage.');
