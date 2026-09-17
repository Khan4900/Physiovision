-- Physiovision seed data (safe to run multiple times)
-- Run AFTER running supabase/schema.sql

begin;

-- -----------------
-- Lookup tables
-- -----------------

-- Goals: IDs match the UI dummy options (1..3)
insert into public.goal (id, name, description) values
  (1, 'Lose Weight', 'Structured fat-loss focused workouts and recovery.'),
  (2, 'Build Muscle', 'Progressive resistance sessions to increase lean mass.'),
  (3, 'Improve Endurance', 'Cardio centric plan to enhance stamina & VO2.')
on conflict (id) do update
  set name = excluded.name,
      description = excluded.description;

select setval(pg_get_serial_sequence('public.goal','id'), (select coalesce(max(id), 1) from public.goal), true);

-- Intensity: IDs match the UI dummy options (1..4)
insert into public.intensity (id, description) values
  (1, 'Light'),
  (2, 'Moderate'),
  (3, 'Challenging'),
  (4, 'Intense')
on conflict (id) do update
  set description = excluded.description;

select setval(pg_get_serial_sequence('public.intensity','id'), (select coalesce(max(id), 1) from public.intensity), true);


insert into public.exercise (id, name, description, demo_video_url, score_factor, calories_per_rep) values
  ('013d2168-a5bb-448d-8a03-7456055a3e68', 'Push Ups', 'Push ups are a bodyweight exercise that targets the chest, arms, and shoulders. They build upper body strength and increase muscular endurance.', 'https://www.youtube.com/embed/IODxDxX7oi4', null, null),
  ('fb7180ab-f3e2-4a5d-b731-a2c0fc5de9fa', 'Squats', 'Squats are a fundamental exercise that strengthens the legs and glutes, while improving mobility and balance. They promote overall fitness and athletic performance.', 'https://www.youtube.com/embed/YaXPRqUwItQ', null, null),
  ('0cc22f75-7d4d-4d50-9cdd-4ae3c731c517', 'Jumping Jacks', 'Jumping Jacks are cardio exercise that engages the entire body, boosting heart rate and burning calories. They promote coordination during workout.', 'https://www.youtube.com/embed/iSSAk4XCsRA', null, null),
  ('7c12ed44-7dac-4b42-90c3-aa9a02dd251d', 'Plank', 'Plank is a core strengthening exercise that engages abs, back, and shoulders. They improve core stability, posture, and overall strength and balance.', 'https://www.youtube.com/embed/ASdvN_XEl_c', null, null),
  ('739c22c6-4dc7-434f-8434-7b851e6a37e6', 'Lunges', 'Lunges are an effective lower body exercise that targets the legs and glutes. They enhance your lower body muscle tone and overall functional fitness.', 'https://www.youtube.com/embed/QOVaHwm-Q6U', null, null),
  ('d2f2a53c-d882-4068-ad47-984e7742584e', 'Pull Ups', 'Pull-ups are a challenging upper body exercise that targets back, arms, and shoulders. They build strength, grip, and upper body stability for overall development.', 'https://www.youtube.com/embed/eGo4IYlbE5g', null, null),
  ('5adc2648-8c70-413b-ab66-fbb2f250104f', 'Bicep Curls', 'Bicep curls are a weightlifting exercise that target the biceps muscle. They increase muscle strength, and improve overall upper body aesthetics.', 'https://www.youtube.com/embed/ykJmrZ5v0Oo', null, null),
  ('dacd227d-ccca-4cf4-a1d4-d7ec84259ce7', 'Bicycle Crunches', 'Bicycle crunches target the abs, obliques, and hip flexors, strengthening the core and improving stability. They are effective for toning the midsection.', 'https://www.youtube.com/embed/9FGilxCbdz8', null, null),
  ('25e807c9-1a7b-440b-ab02-17b1b99d1430', 'Sit Ups', 'Sit-ups engage the abs, obliques, and hip flexors, strengthening the core and improving stability. They are very effective for achieving a well-defined midsection.', 'https://www.youtube.com/embed/1fbU_MkV7NE', null, null),
  ('63eb2273-c7bd-4477-bf92-43a8836eb05e', 'Pike Walk', 'Pike walk is a challenging plank variation that targets the core, abs, back, and shoulders. It improves stability, posture, and overall strength.', 'https://www.youtube.com/embed/iT8hLbjCbGc', null, null),
  ('1f102694-0d1d-417f-b987-7b0901791df1', 'Mountain Pose (Tadasana)', 'Mountain Pose is a foundational standing yoga posture that improves posture, balance, and calm focus.', 'https://www.youtube.com/embed/bEZq7vmP00w', null, null),
  ('adfe4fb5-ff55-4264-9fc5-11ec2a029f45', 'Warrior I Pose', 'Warrior I is a foundational standing pose that strengthens the legs and opens the hips and chest.', 'https://www.youtube.com/embed/YDJu4w8d6nE', null, null),
  ('098bc494-cb6b-48f2-898a-63fa2ad6c1fb', 'Warrior II Pose', 'Warrior II is a powerful standing pose that builds strength and stamina while opening the hips and chest.', 'https://www.youtube.com/embed/buVfAekQd_I', null, null),
  ('2cce3fbd-e7ac-429a-8b76-3c8c2fa097cc', 'Tree Pose (Vrikshasana)', 'Tree Pose is a balancing yoga posture that improves focus, strengthens legs, and enhances overall stability.', 'https://www.youtube.com/embed/vI9Y9_LsG5k', null, null),
  ('9b31ece0-e0ac-4c62-af23-65eca4b1bf4e', 'Chair Pose (Utkatasana)', 'Chair Pose is a standing yoga posture that strengthens the legs, core, and improves balance while building heat in the body.', 'https://www.youtube.com/embed/kp_RYI3LmOo', null, null),
  ('add14005-3df6-4676-beac-37c85043c13e', 'Eagle Pose', 'Eagle Pose is a balancing posture that improves concentration and strengthens the legs, ankles, and core.', 'https://www.youtube.com/embed/gZz0jJyP0rk', null, null),
  ('264138a6-48a7-4a87-a786-34323274a5d2', 'Garland Pose', 'Garland Pose is a deep squat that opens the hips and stretches the ankles, groin, and back.', 'https://www.youtube.com/embed/ey7WlOZHVYI', null, null),
  ('1d525b26-817e-458e-ab00-9009deaa3fc5', 'Half Moon Pose', 'Half Moon Pose is a balancing posture that strengthens the legs and core while improving coordination.', 'https://www.youtube.com/embed/qvHfm5zb2ik', null, null),
  ('831dba61-737d-4193-8c80-536c52d57156', 'Big Toe Pose', 'Big Toe Pose is a forward bend that stretches the hamstrings and calves while improving balance.', 'https://www.youtube.com/embed/Bsq3F3X7HzE', null, null),
  ('29a009f5-5b0f-40a4-847d-7fc11f3cbaa0', 'Gate Pose', 'Gate Pose is a kneeling side stretch that opens the side body and stretches the hamstrings.', 'https://www.youtube.com/embed/5LkTIwZoazI', null, null),
  ('ed20ba04-27bd-4c72-bc0d-074c17a01c70', 'Revolved Triangle Pose', 'Revolved Triangle is a twisting pose that improves balance, stretches the hamstrings, and detoxifies the body.', 'https://www.youtube.com/embed/5d1RqEzP2LU', null, null),
  ('2c1ea41f-d45d-4dda-aeec-5c9921048e62', 'Dancer Pose', 'Dancer Pose is an advanced balancing backbend that opens the chest and shoulders while strengthening the legs.', 'https://www.youtube.com/embed/rV6CQjdU2fM', null, null)
on conflict (id) do update
  set name = excluded.name,
      description = excluded.description,
      demo_video_url = excluded.demo_video_url,
      score_factor = excluded.score_factor,
      calories_per_rep = excluded.calories_per_rep;

commit;
