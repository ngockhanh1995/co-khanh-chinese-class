begin;
alter table public.student_results add column if not exists writing_score integer;
alter table public.student_results add column if not exists writing_correct integer;
alter table public.student_results drop constraint if exists student_results_writing_score_check;
alter table public.student_results add constraint student_results_writing_score_check check (writing_score is null or writing_score between 0 and 100);
alter table public.student_results drop constraint if exists student_results_writing_correct_check;
alter table public.student_results add constraint student_results_writing_correct_check check (writing_correct is null or writing_correct between 0 and 10);
alter table public.student_results drop constraint student_results_lesson_number_range;
alter table public.student_results add constraint student_results_lesson_number_range check (lesson_number is null or lesson_number between 1 and case when hsk_level=3 then 20 else 15 end);
alter table public.student_results drop constraint student_results_listening_correct_check;
alter table public.student_results add constraint student_results_listening_correct_check check (listening_correct is null or listening_correct between 0 and case when hsk_level=3 then 40 when hsk_level=2 then 35 else 20 end);
alter table public.student_results drop constraint student_results_reading_correct_check;
alter table public.student_results add constraint student_results_reading_correct_check check (reading_correct is null or reading_correct between 0 and case when hsk_level=3 then 30 when hsk_level=2 then 25 else 20 end);
alter table public.student_review_state drop constraint student_review_state_hsk_level_check;
alter table public.student_review_state add constraint student_review_state_hsk_level_check check (hsk_level in (1,2,3));
do $$declare s text;begin
 select pg_get_functiondef(oid) into s from pg_proc where pronamespace='public'::regnamespace and proname='sync_hsk2_practice';
 s:=replace(s,'public.sync_hsk2_practice','public.sync_hsk3_practice');s:=replace(s,'between 1 and 15','between 1 and 20');s:=replace(s,'values(auth.uid(),2,','values(auth.uid(),3,');s:=replace(s,'level=2','level=3');execute s;
 select pg_get_functiondef(oid) into s from pg_proc where pronamespace='public'::regnamespace and proname='sync_review_event';
 s:=replace(s,'p_level not in (1,2)','p_level not in (1,2,3)');execute s;
end$$;
revoke all on function public.sync_hsk3_practice(integer,integer[],integer[],integer[],integer[],boolean) from public,anon;
grant execute on function public.sync_hsk3_practice(integer,integer[],integer[],integer[],integer[],boolean) to authenticated;
update public.learning_level_catalog set available=true,lesson_count=20,assessments=(
 select jsonb_agg(a) from (
 select jsonb_build_object('key','mini:'||n,'title','Mini Test HSK3 Bài '||n,'type','mini_test','lesson',n) a from generate_series(1,20) n
 union all select jsonb_build_object('key','combined:'||r,'title','Kiểm tra chặng HSK3 Bài '||r,'type','combined_test','activity','Kiểm tra chặng HSK3 Bài '||r) from unnest(array['1-5','6-10','11-15','16-20']) r
 union all select jsonb_build_object('key','final','title','Đề cuối khóa HSK3','type','final_test','activity','Đề cuối khóa HSK3')
 union all select jsonb_build_object('key','quick:'||n,'title','Kiểm tra nhanh HSK3 · '||n,'type','quick_test','activity','Kiểm tra nhanh HSK3 · '||n) from unnest(array['Từ vựng','Ngữ pháp','Nghe','Đọc','Tổng hợp']) n
 ) items
) where level=3;
commit;
