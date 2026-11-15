-- IELTSpace · 06: quy tắc chấm Writing/Speaking bản 1 (cần có để đăng kỹ năng W/S trong editor).
-- Chạy sau 05_danh_muc_bo_de.sql. Chạy cả tệp trong một lần. Chạy lần hai sẽ dừng ở bước kiểm tra, không đổi gì.
-- Tiêu chí theo band descriptors công khai của IELTS. Điểm tiêu chí 0–9 bước 1 (giáo viên chấm số nguyên),
-- điểm tổng làm tròn về bội 0,5 gần nhất, .25 lên .5 và .75 lên số nguyên kế tiếp.
begin;
do $$
begin
 if to_regclass('public.exam_set_categories') is null then
  raise exception 'Chưa chạy 05_danh_muc_bo_de.sql.';
 end if;
 if exists(select from public.grading_rules
   where skill in ('WRITING','SPEAKING') and version=1) then
  raise exception '06 đã chạy trên database này (đã có quy tắc chấm W/S bản 1).';
 end if;
end $$;

with r as (
 insert into public.grading_rules(name,skill,assessment_scope,version,aggregation_rules,rounding_rules) values
 ('Writing · cả kỹ năng','WRITING','FULL_SKILL',1,
  '{"criteria":"MEAN","tasks":[{"order":1,"weight":1},{"order":2,"weight":2}]}',
  '{"criteria_step":1,"overall":"IELTS_HALF_BAND"}'),
 ('Writing · một Task','WRITING','SECTION',1,
  '{"criteria":"MEAN"}',
  '{"criteria_step":1,"overall":"IELTS_HALF_BAND"}'),
 ('Speaking · cả kỹ năng','SPEAKING','FULL_SKILL',1,
  '{"criteria":"MEAN","parts":"WHOLE_SKILL"}',
  '{"criteria_step":1,"overall":"IELTS_HALF_BAND"}'),
 ('Speaking · một Part','SPEAKING','SECTION',1,
  '{"criteria":"MEAN"}',
  '{"criteria_step":1,"overall":"IELTS_HALF_BAND"}')
 returning id,skill
)
insert into public.rubric_criteria(grading_rule_id,name,description,weight,min_score,max_score,score_step,order_no)
select r.id,c.name,c.description,1,0,9,1,c.order_no
from r join (values
 ('WRITING','Task Achievement / Task Response','Task 1: Task Achievement. Task 2: Task Response.',1),
 ('WRITING','Coherence and Cohesion',null,2),
 ('WRITING','Lexical Resource',null,3),
 ('WRITING','Grammatical Range and Accuracy',null,4),
 ('SPEAKING','Fluency and Coherence',null,1),
 ('SPEAKING','Lexical Resource',null,2),
 ('SPEAKING','Grammatical Range and Accuracy',null,3),
 ('SPEAKING','Pronunciation',null,4)
) as c(skill,name,description,order_no) on c.skill=r.skill;
commit;
