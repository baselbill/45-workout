// ─── 45-WORKOUT v2: away-subs.js ───
// ─── AWAY MODE: SUBSTITUTION TABLE ───────────────────────────────────────────
// Each entry: { n, muscle, pattern, subs: [{n, tempo, note}] }
// pattern: push_h, push_v, pull_h, pull_v, hinge, squat, core, isolation
const AWAY_SUBS = {
  // PUSH HORIZONTAL
  "Barbell Bench Press":       {pattern:"push_h", subs:[{n:"Push-Up",note:"Standard push-up. Control the descent — 3 seconds down."},{n:"Archer Push-Up",note:"One arm wide, one arm tucked. Harder variation for strong pushers."},{n:"Deficit Push-Up",note:"Hands on books/bags, deeper range of motion. Closest to bench press feel."}]},
  "DB Bench Press":            {pattern:"push_h", subs:[{n:"Push-Up",note:"Standard push-up. Control the descent — 3 seconds down."},{n:"Archer Push-Up",note:"One arm wide, one arm tucked. Harder variation."},{n:"Slow Eccentric Push-Up",note:"5 seconds down, explosive up. Builds strength without load."}]},
  "DB Incline Bench Press":    {pattern:"push_h", subs:[{n:"Incline Push-Up (feet elevated)",note:"Feet on a bed or chair. Targets upper chest like incline bench."},{n:"Pike Push-Up",note:"Hips high, head toward floor. Bridges push and vertical press."}]},
  "DB Incline Chest Fly":      {pattern:"push_h", subs:[{n:"Slow Push-Up with Pause",note:"Pause 3 seconds at the bottom of each rep to create stretch. Isolation focus."},{n:"Chest Squeeze Hold",note:"Press palms together at chest height, squeeze maximally. 5 sec hold × 10 reps."}]},
  "Standing Cable Chest Press":{pattern:"push_h", subs:[{n:"Push-Up",note:"Standard push-up. Focus on squeezing the chest at the top."},{n:"Slow Eccentric Push-Up",note:"5 seconds down, pause, explosive up. Mimics cable constant tension."}]},
  // PUSH VERTICAL
  "Dumbbell Seated Shoulder Press":{pattern:"push_v", subs:[{n:"Pike Push-Up",note:"Hips high in an inverted V. Press your head toward the floor. Targets shoulders."},{n:"Wall Handstand Hold",note:"Kick up against a wall. Hold position, building shoulder stability."}]},
  "DB Arnold Press":           {pattern:"push_v", subs:[{n:"Pike Push-Up with Rotation",note:"At the top of each pike push-up, rotate one arm out. Mimics Arnold rotation."},{n:"Pike Push-Up",note:"Standard pike push-up. Focus on slow, controlled movement."}]},
  // PULL HORIZONTAL
  "Single Arm Cable Row":      {pattern:"pull_h", subs:[{n:"Table/Desk Row",note:"Lie under a sturdy table, grip the edge, pull your chest to the table. One of the best bodyweight rows."},{n:"Towel Door Row",note:"Loop a towel around a door handle, lean back, row yourself toward the door."}]},
  "Seated Cable Row (Full Stretch)":{pattern:"pull_h", subs:[{n:"Table/Desk Row",note:"Lie under a table. Allow full shoulder blade spread at the bottom — replicate the full stretch cue."},{n:"Towel Door Row",note:"Loop towel around door handle. Lean back and row. Use slow tempo."}]},
  "Seated Cable Row (Close Grip)":{pattern:"pull_h", subs:[{n:"Table/Desk Row (narrow grip)",note:"Grip the table edge with hands close together. Targets the same lower trap and lat emphasis."},{n:"Towel Door Row",note:"Hands close together on the towel. Row slowly."}]},
  "Chest-Supported DB Row":    {pattern:"pull_h", subs:[{n:"Table/Desk Row",note:"Lie under a sturdy table and row yourself up. Closest bodyweight equivalent to a supported row."},{n:"Prone Superman Row",note:"Lie face down on the floor, arms in row position, lift and squeeze shoulder blades. Light but effective."}]},
  "Machine Seated Reverse Fly":{pattern:"pull_h", subs:[{n:"Prone Y Raise",note:"Lie face down, arms in a Y shape, lift using shoulder blades only. Rear delt focus."},{n:"Prone IYTW",note:"Full IYTW sequence. Maintains rotator cuff health on the road."}]},
  // PULL VERTICAL
  "Wide Grip Pull-Up":         {pattern:"pull_v", subs:[{n:"Towel Door Row (vertical)",note:"No bar available: door frame row with maximum body lean to increase difficulty. Not a true pull-up but the best available."},{n:"Find a bar",note:"A park bar, jungle gym, or sturdy horizontal surface. Even a ledge works. Prioritise finding one."}]},
  "Weighted Wide Grip Pull-Up":{pattern:"pull_v", subs:[{n:"Slow Eccentric Door Row",note:"5 second pull, 5 second lower. Maximum tension without load."},{n:"Find a bar",note:"Weighted pull-ups require a bar. Prioritise finding one — parks, playgrounds, hotel gym."}]},
  "Single Arm Cable Lat Pulldown":{pattern:"pull_v", subs:[{n:"Towel Door Row (single arm)",note:"One arm on the towel over the door, lean back and pull. Mimics single arm pulldown angle."},{n:"Prone I Raise",note:"Face down, one arm extended. Lift and hold 2 sec. Lat and rear delt engagement."}]},
  // HINGE
  "Barbell Deadlift":          {pattern:"hinge", subs:[{n:"Single Leg RDL (bodyweight)",note:"Hinge on one leg, arms forward for counterbalance. 3-second descent. The best bodyweight hinge."},{n:"Good Morning (bodyweight)",note:"Hands behind head, hinge at hips, strong hamstring stretch. Slow and controlled."}]},
  "Barbell Romanian Deadlift": {pattern:"hinge", subs:[{n:"Single Leg RDL (bodyweight)",note:"Hinge on one leg. 3 seconds down, drive through heel to stand. Strong hamstring focus."},{n:"Good Morning (bodyweight)",note:"Hands behind head, hinge at hips. Hamstring stretch at bottom."}]},
  "Single Leg RDL (DB)":       {pattern:"hinge", subs:[{n:"Single Leg RDL (bodyweight)",note:"Same movement without the dumbbell. Slow tempo compensates for lack of load — 4 seconds down."},{n:"Slow Good Morning",note:"Hands behind head. 4 second descent, pause at bottom, drive up."}]},
  "Farmer's Walk (Suitcase Carry)":{pattern:"hinge", subs:[{n:"Suitcase Walk (with luggage)",note:"Use your travel bag as the weight. Exactly the same exercise. Walk 30m, torso upright."},{n:"Single Leg Balance Hold",note:"Stand on one leg, hold for 30 sec. Trains the lateral stability the farmer's walk builds."}]},
  // SQUAT
  "Barbell Back Squat":        {pattern:"squat", subs:[{n:"Bulgarian Split Squat (bodyweight)",note:"Rear foot on a chair or bed. Lower straight down. The best bodyweight squat substitute."},{n:"Slow Bodyweight Squat",note:"5 seconds down, 2 second pause at bottom, 1 second up. Depth and control over speed."},{n:"Pistol Squat Progression",note:"Use a door frame for balance. Work toward single leg squat. Serious challenge for stronger lifters."}]},
  "Goblet Squat":              {pattern:"squat", subs:[{n:"Slow Bodyweight Squat",note:"5 seconds down, pause at bottom. Mimics the upright torso position of goblet squat."},{n:"Bulgarian Split Squat (bodyweight)",note:"More challenging unilateral option. Rear foot on chair or bed."}]},
  "DB Bulgarian Split Squat":  {pattern:"squat", subs:[{n:"Bulgarian Split Squat (bodyweight)",note:"Same movement without dumbbells. Increase reps to compensate — use calibrated target below."},{n:"Rear Foot Elevated Split Squat with Pause",note:"Add a 3-second pause at the bottom of each rep for extra time under tension."}]},
  // CORE
  "Front Plank":               {pattern:"core", subs:[{n:"Front Plank",note:"No equipment needed. Squeeze glutes, core, and quads. Hold the prescribed time."}]},
  "Side Plank Rotation":       {pattern:"core", subs:[{n:"Side Plank Rotation",note:"No equipment needed. 3 seconds per rotation. Same exercise as gym version."}]},
  "Pallof Press":              {pattern:"core", subs:[{n:"Dead Bug",note:"Lie on back, press lower back into floor, alternate extending opposite arm and leg. Anti-rotation core focus."},{n:"Hollow Body Hold",note:"Lie on back, arms overhead, legs raised, lower back pressed flat. Hold 30 sec."}]},
  "Half Kneeling Anti-Rotation Press":{pattern:"core", subs:[{n:"Dead Bug",note:"Best bodyweight anti-rotation substitute. Press lower back into floor, slow controlled movement."},{n:"Bird Dog",note:"All fours, extend opposite arm and leg simultaneously. Hold 2 sec at full extension."}]},
  "Banded Dead-Bug":           {pattern:"core", subs:[{n:"Dead Bug",note:"Same exercise without the band. Press lower back into floor harder to compensate."}]},
  "Single Leg Glute Bridge":   {pattern:"core", subs:[{n:"Single Leg Glute Bridge",note:"No equipment needed. Same exercise. Squeeze glute hard at top for 2 seconds."}]},
  "Copenhagen Plank":          {pattern:"core", subs:[{n:"Side Plank",note:"Standard side plank. Squeeze inner thighs together. Targets similar adductor/core area."},{n:"Lateral Lunge",note:"Step wide to one side, sit into the hip. Builds adductor strength through range."}]},
  // ISOLATION / ACCESSORY
  "Cable Rope Face Pull":      {pattern:"isolation", subs:[{n:"Prone IYTW",note:"Best bodyweight rotator cuff and rear delt substitute. Do this every session — it's the face pull equivalent."},{n:"Band Pull-Apart (with towel)",note:"Hold a towel shoulder-width, pull both ends apart as far as possible. 15 reps."}]},
  "Cable Rope Tricep Extension":{pattern:"isolation", subs:[{n:"Diamond Push-Up",note:"Hands in a diamond shape under your chest. Tricep focused push-up variation."},{n:"Close Grip Push-Up",note:"Hands narrower than normal. More tricep activation than standard push-up."}]},
  "DB Lateral Raise":          {pattern:"isolation", subs:[{n:"Lateral Raise (water bottles)",note:"Use filled water bottles or a small bag. Same movement — elbows to shoulder height."},{n:"Prone T Raise",note:"Lie face down, raise arms to T position. Targets medial delt without equipment."}]},
  "DB Front Raise":            {pattern:"isolation", subs:[{n:"Front Raise (water bottles)",note:"Use filled water bottles. Same movement to shoulder height."},{n:"Pike Push-Up",note:"Targets the anterior delt through a larger range of motion."}]},
  "Scapular Push-Up":          {pattern:"isolation", subs:[{n:"Scapular Push-Up",note:"No equipment needed. Same exercise — arms straight, retract and protract blades only."}]},
  "Bar Hang + Scapular Depression":{pattern:"isolation", subs:[{n:"Wall Scapular Depression",note:"Stand with arms overhead against a wall. Press shoulder blades down without bending elbows. 5 reps."},{n:"Find a bar",note:"A park bar, tree branch, or door frame ledge. Even 10 seconds of hanging is worth doing."}]},
  "Prone IYTW":                {pattern:"isolation", subs:[{n:"Prone IYTW",note:"No equipment needed. Same exercise. Do it every session."}]},
  "Banded Serratus Press":     {pattern:"isolation", subs:[{n:"Scapular Push-Up",note:"Arms locked straight, protract shoulder blades forward. Same serratus activation."},{n:"Wall Slide",note:"Forearms on a wall, slide arms up. Serratus and shoulder health focus."}]},
  "Plank Shoulder Taps":       {pattern:"core", subs:[{n:"Plank Shoulder Taps",note:"No equipment needed. Same exercise."}]},
};

// ─── AWAY MODE: REP CALIBRATION ───────────────────────────────────────────────
// Given relative strength ratio (1RM / bodyweight), return rep targets
function getAwayReps(pattern, ratio) {
  // ratio buckets: <0.75=building, 0.75-1.0=intermediate, 1.0-1.25=strong, >1.25=very strong
  const targets = {
    push_h:    [[10,3],[15,3],[20,4],[25,4]],  // [reps, sets]
    push_v:    [[8,3], [12,3],[15,3],[18,3]],
    pull_h:    [[10,3],[12,3],[15,3],[20,4]],
    pull_v:    [[8,3], [10,3],[12,3],[15,4]],
    hinge:     [[10,3],[15,3],[20,3],[25,3]],
    squat:     [[12,3],[15,3],[20,4],[25,4]],
    core:      [[12,3],[15,3],[20,3],[20,3]],
    isolation: [[15,3],[20,3],[25,3],[30,3]],
  };
  const t = targets[pattern] || targets.core;
  if (ratio < 0.75) return t[0];
  if (ratio < 1.0)  return t[1];
  if (ratio < 1.25) return t[2];
  return t[3];
}

function getStrengthLevel(ratio) {
  if (ratio < 0.75) return {label:'Building',color:'var(--blue)'};
  if (ratio < 1.0)  return {label:'Intermediate',color:'var(--accent)'};
  if (ratio < 1.25) return {label:'Strong',color:'var(--amber)'};
  return {label:'Very strong',color:'var(--accent)'};
}

// Get the best 1RM ratio for a given exercise pattern
function getRatioForPattern(pattern) {
  const bw = getLatestBW();
  if (!bw) return null;
  const rmMap = {
    push_h: 'bench', push_v: 'ohp',
    // E1-7: pull_h maps to 'bench' not 'deadlift' — horizontal pulling strength
    // correlates with bench press, not the hip-hinge deadlift pattern.
    pull_h: 'bench', pull_v: 'pullup',
    hinge: 'deadlift', squat: 'squat',
    core: null, isolation: null,
  };
  const rmId = rmMap[pattern];
  if (!rmId) return null;
  const rm = getRM(rmId);
  if (!rm) return null;
  return rm / bw;
}

function getAwayExercise(ex) {
  const sub = AWAY_SUBS[ex.n];
  if (!sub) return null;
  const ratio = getRatioForPattern(sub.pattern);
  const [reps, sets] = ratio ? getAwayReps(sub.pattern, ratio) : [15, 3];
  const chosenSub = sub.subs[0]; // primary substitution
  return {
    n: chosenSub.n,
    sets,
    reps: `${reps}`,
    rest: 60,
    load: 'BW',
    note: chosenSub.note,
    alts: sub.subs.slice(1),
    pattern: sub.pattern,
    ratio,
    original: ex.n,
    isAway: true,
  };
}
