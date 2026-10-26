-- مِرقاة: المخطط الأولي
-- الفكرة: كل شيء يتبع مدرسة (school)، والمستخدم يرتبط بالمدرسة بدور محدد.
-- سياسات RLS تضمن أن كل مستخدم لا يرى إلا ما يخصه حتى لو أخطأ التطبيق.

create type public.member_role as enum ('principal', 'deputy', 'teacher', 'parent', 'student');
create type public.school_stage as enum ('primary', 'intermediate', 'secondary');

-- ============ المدارس ============
create table public.schools (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  ministry_code text unique,            -- الرقم الوزاري
  stage         public.school_stage,
  city          text,
  plan          text not null default 'free',
  created_at    timestamptz not null default now()
);

-- ============ الملفات الشخصية ============
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null default '',
  phone      text,
  created_at timestamptz not null default now()
);

-- إنشاء ملف شخصي تلقائياً عند التسجيل
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ عضوية المدرسة والأدوار ============
create table public.school_members (
  school_id  uuid not null references public.schools (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       public.member_role not null,
  created_at timestamptz not null default now(),
  primary key (school_id, user_id, role)
);
create index on public.school_members (user_id);

-- ============ الفصول ============
create table public.classes (
  id            uuid primary key default gen_random_uuid(),
  school_id     uuid not null references public.schools (id) on delete cascade,
  grade         text not null,         -- مثال: الأول متوسط
  section       text not null,         -- مثال: 1
  academic_year text not null,         -- مثال: 1448
  created_at    timestamptz not null default now(),
  unique (school_id, grade, section, academic_year)
);

-- إسناد معلم لمادة في فصل
create table public.teacher_assignments (
  class_id   uuid not null references public.classes (id) on delete cascade,
  teacher_id uuid not null references auth.users (id) on delete cascade,
  subject    text not null,
  primary key (class_id, teacher_id, subject)
);
create index on public.teacher_assignments (teacher_id);

-- ============ الطلاب ============
create table public.students (
  id             uuid primary key default gen_random_uuid(),
  school_id      uuid not null references public.schools (id) on delete cascade,
  class_id       uuid references public.classes (id) on delete set null,
  full_name      text not null,
  student_number text,                 -- رقم الطالب في نور
  created_at     timestamptz not null default now(),
  unique (school_id, student_number)
);
create index on public.students (class_id);

-- ============ دوال مساعدة للصلاحيات ============
create function public.has_school_role(target_school uuid, roles public.member_role[])
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.school_members
    where school_id = target_school and user_id = auth.uid() and role = any (roles)
  );
$$;

create function public.is_school_admin(target_school uuid)
returns boolean
language sql stable
as $$ select public.has_school_role(target_school, array['principal', 'deputy']::public.member_role[]); $$;

create function public.is_school_member(target_school uuid)
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.school_members
    where school_id = target_school and user_id = auth.uid()
  );
$$;

create function public.teaches_class(target_class uuid)
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.teacher_assignments
    where class_id = target_class and teacher_id = auth.uid()
  );
$$;

-- ============ سياسات الأمان (RLS) ============
alter table public.schools             enable row level security;
alter table public.profiles            enable row level security;
alter table public.school_members      enable row level security;
alter table public.classes             enable row level security;
alter table public.teacher_assignments enable row level security;
alter table public.students            enable row level security;

-- المدارس: يراها أعضاؤها، ويعدّلها المدير والوكيل
create policy "members read school" on public.schools
  for select using (public.is_school_member(id));
create policy "admins update school" on public.schools
  for update using (public.is_school_admin(id));

-- الملف الشخصي: كل مستخدم يقرأ ويعدّل ملفه فقط
create policy "own profile read" on public.profiles
  for select using (id = auth.uid());
create policy "own profile update" on public.profiles
  for update using (id = auth.uid());

-- العضويات: يرى المستخدم عضوياته، والإدارة ترى أعضاء مدرستها وتديرهم
create policy "read own or admin memberships" on public.school_members
  for select using (user_id = auth.uid() or public.is_school_admin(school_id));
create policy "admins manage memberships" on public.school_members
  for all using (public.is_school_admin(school_id))
  with check (public.is_school_admin(school_id));

-- الفصول: يراها أعضاء المدرسة، وتديرها الإدارة
create policy "members read classes" on public.classes
  for select using (public.is_school_member(school_id));
create policy "admins manage classes" on public.classes
  for all using (public.is_school_admin(school_id))
  with check (public.is_school_admin(school_id));

-- الإسناد: يراه المعلم المعني والإدارة
create policy "read assignments" on public.teacher_assignments
  for select using (
    teacher_id = auth.uid()
    or public.is_school_admin((select school_id from public.classes where id = class_id))
  );
create policy "admins manage assignments" on public.teacher_assignments
  for all using (public.is_school_admin((select school_id from public.classes where id = class_id)))
  with check (public.is_school_admin((select school_id from public.classes where id = class_id)));

-- الطلاب: الإدارة ترى كل طلاب المدرسة، والمعلم يرى طلاب فصوله فقط
create policy "read students" on public.students
  for select using (
    public.is_school_admin(school_id)
    or (class_id is not null and public.teaches_class(class_id))
  );
create policy "admins manage students" on public.students
  for all using (public.is_school_admin(school_id))
  with check (public.is_school_admin(school_id));
-- المعلم يستطيع إضافة وتحديث طلاب فصوله (استيراد الكشوف من نور)
create policy "teachers insert own class students" on public.students
  for insert with check (class_id is not null and public.teaches_class(class_id));
create policy "teachers update own class students" on public.students
  for update using (class_id is not null and public.teaches_class(class_id))
  with check (class_id is not null and public.teaches_class(class_id));
