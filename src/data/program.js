// ─── 45-WORKOUT v2: program.js ───
// ─── PROGRAM DATA ─────────────────────────────────────────────────────────────
const LIFT_TO_RM={'Barbell Bench Press':'bench','DB Bench Press':'bench','Barbell Back Squat':'squat','Barbell Deadlift':'deadlift','Barbell Romanian Deadlift':'deadlift','DB Bulgarian Split Squat':'squat','Dumbbell Seated Shoulder Press':'ohp','DB Arnold Press':'ohp','Weighted Wide Grip Pull-Up':'pullup','Chest-Supported DB Row':'deadlift','Goblet Squat':'squat','Single Leg RDL (DB)':'deadlift','Standing Cable Chest Press':'bench'};

// Map every program exercise to a single primary muscle group. Unmapped exercises (e.g. new additions) fall into "Other".
const EX_TO_MUSCLE={
  // Chest
  'Barbell Bench Press':'Chest','DB Bench Press':'Chest','DB Incline Bench Press':'Chest','Standing Cable Chest Press':'Chest','DB Incline Chest Fly':'Chest',
  // Back
  'Single Arm Cable Row':'Back','Seated Cable Row (Full Stretch)':'Back','Seated Cable Row (Close Grip)':'Back','Wide Grip Pull-Up':'Back','Weighted Wide Grip Pull-Up':'Back','Single Arm Cable Lat Pulldown':'Back','Chest-Supported DB Row':'Back','Cable Rope Face Pull':'Back','Machine Seated Reverse Fly':'Back','Bar Hang + Scapular Depression':'Back','Prone IYTW':'Back',
  // Legs
  'Barbell Back Squat':'Legs','Barbell Deadlift':'Legs','Barbell Romanian Deadlift':'Legs','DB Bulgarian Split Squat':'Legs','Goblet Squat':'Legs','Single Leg RDL (DB)':'Legs','Single Leg Glute Bridge':'Legs',
  // Shoulders
  'Dumbbell Seated Shoulder Press':'Shoulders','DB Arnold Press':'Shoulders','DB Lateral Raise':'Shoulders','DB Front Raise':'Shoulders','Banded Serratus Press':'Shoulders','Scapular Push-Up':'Shoulders',
  // Arms
  'Cable Rope Tricep Extension':'Arms','Dip':'Arms',
  // Core
  'Plank Shoulder Taps':'Core','Banded Dead-Bug':'Core','Copenhagen Plank':'Core','Half Kneeling Anti-Rotation Press':'Core','Front Plank':'Core','Side Plank Rotation':'Core','Pallof Press':'Core',"Farmer's Walk (Suitcase Carry)":'Core',
};
const MUSCLE_GROUPS=[
  {name:'Chest',color:'#60a5fa'},
  {name:'Back',color:'#4ade80'},
  {name:'Legs',color:'#fb923c'},
  {name:'Shoulders',color:'#a78bfa'},
  {name:'Arms',color:'#fbbf24'},
  {name:'Core',color:'#f87171'},
  {name:'Other',color:'#7a7f96'},
];
function parsePct(s){const m=s.match(/(\d+)(?:–|-)(\d+)%/);if(m)return(parseInt(m[1])+parseInt(m[2]))/2/100;const m2=s.match(/(\d+)%/);if(m2)return parseInt(m2[1])/100;return null;}
const RM_LIFTS=[{id:'bench',name:'Bench Press',icon:'🏋️'},{id:'squat',name:'Back Squat',icon:'🦵'},{id:'deadlift',name:'Deadlift',icon:'⚡'},{id:'ohp',name:'Overhead Press',icon:'💪'},{id:'pullup',name:'Pull-Up (added load)',icon:'🔝'}];
const PHASE_CHANGE_WEEKS=[5,9,13];

const P={phases:[
  {name:"Phase 1 — Foundation",short:"Ph 1",weeks:"Wks 1–4",theme:"Build movement patterns, baseline strength",days:[
    {name:"Day 1 — Push & Pull (Horizontal)",est:"35 min",warmup:"3 min light cardio · arm circles · hip circles · 1 bench warm-up set at 50%×5",exercises:[
      {n:"Plank Shoulder Taps",sets:2,reps:"14 total",rest:30,load:"BW",note:"Keep back flat, core braced. Move slowly."},
      {n:"Banded Serratus Press",sets:2,reps:"10",rest:30,load:"Band",note:"Hands wider than elbows, core braced. Arms stay straight."},
      {n:"Cable Rope Face Pull",sets:2,reps:"12",rest:30,load:"67–70%",note:"Elbows at or above shoulder height at all times. Never skip this."},
      {n:"Barbell Bench Press",sets:4,reps:"8",rest:90,load:"70–75%",note:"Wks 1–2: 70–75%. Wks 3–4: build to 80%. Bar to mid-chest, feet flat, back neutral."},
      {n:"Single Arm Cable Row",sets:3,reps:"10/side",rest:60,load:"70–75%",note:"Full shoulder blade stretch at the front every rep."},
      {n:"DB Incline Bench Press",sets:3,reps:"10",rest:60,load:"70–75%",note:"Lower slowly — 3 seconds down."},
      {n:"Dip",sets:3,reps:"10",rest:60,load:"BW",note:"Wks 1–2: stop at 90° elbow bend. Full depth from Wk 3 if pain-free."},
    ]},
    {name:"Day 2 — Lower Body & Core",est:"38 min",warmup:"3 min light cardio · leg swings ×10 · banded clamshells ×15/side · 1 deadlift warm-up at 50%×5",exercises:[
      {n:"Banded Dead-Bug",sets:2,reps:"16 total",rest:30,load:"BW",note:"Press lower back firmly into the floor throughout."},
      {n:"Single Leg Glute Bridge",sets:2,reps:"10/side",rest:45,load:"BW",note:"Squeeze glute hard at the top. Hold 1–2 seconds. Hips level."},
      {n:"Barbell Back Squat",sets:3,reps:"8",rest:90,load:"67–70%",note:"Wks 1–2 at 67–70%, Wks 3–4 build to 80%. Sit back and down."},
      {n:"Barbell Deadlift",sets:3,reps:"8",rest:90,load:"70–75%",note:"Add warm-up set at 50%×5 first. Full reset at the bottom."},
      {n:"DB Bulgarian Split Squat",sets:3,reps:"10/side",rest:60,load:"70–75%",note:"Wks 1–2: rear foot on step, not bench. Full bench height from Wk 3."},
      {n:"Copenhagen Plank",sets:2,reps:"35 sec/side",rest:60,load:"BW",note:"Side-lying, top foot on bench, body in straight line."},
    ]},
    {name:"Day 3 — Push & Pull (Vertical)",est:"30 min",warmup:"3 min light cardio · bar hang 30 sec · shoulder circles ×10",exercises:[
      {n:"Bar Hang + Scapular Depression",sets:1,reps:"5 dep.",rest:0,load:"BW",note:"10 sec passive hang, then 5 scapular depressions."},
      {n:"Prone IYTW",sets:2,reps:"6 total",rest:30,load:"BW",note:"Face down, thumbs up. Only shoulder blades move."},
      {n:"Wide Grip Pull-Up",sets:3,reps:"AMRAP",rest:60,load:"BW / band",note:"Use band if you can't do 5 clean reps. Full dead hang between every rep."},
      {n:"Dumbbell Seated Shoulder Press",sets:3,reps:"10",rest:60,load:"70–75%",note:"Controlled throughout."},
      {n:"DB Lateral Raise",sets:3,reps:"12",rest:0,load:"67–70%",note:"Raise elbows (not hands) to shoulder height.",ss:true},
      {n:"DB Front Raise",sets:3,reps:"12",rest:60,load:"67–70%",note:"Superset with Lateral Raise. Rest 60 sec after completing both.",ss:true},
      {n:"Single Arm Cable Lat Pulldown",sets:2,reps:"12/side",rest:60,load:"67–70%",note:"Squeeze the lat hard at the bottom."},
    ]},
  ]},
  {name:"Phase 2 — Volume Accumulation",short:"Ph 2",weeks:"Wks 5–8",theme:"More sets, rotation work, joint-friendly loading",days:[
    {name:"Day 1 — Push & Pull (Horizontal)",est:"40 min",warmup:"3 min light cardio · arm circles · 1 bench warm-up at 50%×5",exercises:[
      {n:"Scapular Push-Up",sets:3,reps:"10",rest:90,load:"BW",note:"Arms stay completely straight. Retract then protract — blade movement only."},
      {n:"Cable Rope Face Pull",sets:2,reps:"12",rest:30,load:"67–70%",note:"Elbows at or above shoulder height. Zero body sway."},
      {n:"DB Bench Press",sets:3,reps:"8",rest:90,load:"75–80%",note:"More natural arm path — safer for the shoulder. Lower slowly."},
      {n:"Seated Cable Row (Full Stretch)",sets:3,reps:"10",rest:60,load:"70–75%",note:"Full shoulder blade separation at front, then pull back. No rib flare."},
      {n:"DB Incline Bench Press",sets:3,reps:"10",rest:60,load:"70–75%",note:"Controlled eccentric — 3 seconds down."},
      {n:"Dip",sets:3,reps:"10",rest:60,load:"BW",note:"Full depth appropriate now."},
      {n:"Cable Rope Tricep Extension",sets:3,reps:"12",rest:60,load:"67–70%",note:"Elbows tucked. Pause at full extension."},
    ]},
    {name:"Day 2 — Lower Body & Core",est:"37 min",warmup:"3 min light cardio · leg swings · 1 RDL warm-up at 50%×5",exercises:[
      {n:"Half Kneeling Anti-Rotation Press",sets:2,reps:"10/side",rest:45,load:"Light band",note:"Band anchored to side. Press forward — resist rotation. Hips square."},
      {n:"Single Leg Glute Bridge",sets:2,reps:"10/side",rest:45,load:"BW",note:"Glute activation before the heavy work."},
      {n:"Barbell Back Squat",sets:3,reps:"8",rest:90,load:"80%",note:"Load established at 80%."},
      {n:"Barbell Romanian Deadlift",sets:3,reps:"8",rest:90,load:"80%",note:"Push hips back, bar close to legs. Stop at strong hamstring stretch."},
      {n:"DB Bulgarian Split Squat",sets:3,reps:"10/side",rest:60,load:"75%",note:"Full bench height now. Lower hips straight down."},
      {n:"Front Plank",sets:3,reps:"50 sec",rest:0,load:"BW",note:"Superset with Side Plank Rotation.",ss:true},
      {n:"Side Plank Rotation",sets:3,reps:"10/side",rest:60,load:"BW",note:"3 seconds per rotation. Superset with Front Plank.",ss:true},
    ]},
    {name:"Day 3 — Push & Pull (Vertical)",est:"29 min",warmup:"3 min light cardio · bar hang 30 sec · shoulder circles",exercises:[
      {n:"Bar Hang + Scapular Depression",sets:1,reps:"5 dep.",rest:0,load:"BW",note:"10 sec hang then 5 depressions."},
      {n:"Prone IYTW",sets:2,reps:"6 total",rest:30,load:"BW",note:"Shoulder blades only. No momentum."},
      {n:"Wide Grip Pull-Up",sets:3,reps:"8",rest:60,load:"BW / band",note:"Use band if needed to hit 8 clean reps."},
      {n:"Dumbbell Seated Shoulder Press",sets:3,reps:"10",rest:60,load:"70–75%",note:"Controlled."},
      {n:"DB Lateral Raise",sets:3,reps:"12",rest:0,load:"67–70%",note:"Elbows to shoulder height.",ss:true},
      {n:"DB Front Raise",sets:3,reps:"12",rest:60,load:"67–70%",note:"Superset with Lateral Raise.",ss:true},
      {n:"Machine Seated Reverse Fly",sets:2,reps:"12",rest:60,load:"67–70%",note:"Chest against pad. Fly back, squeeze rear delts. Don't shrug."},
    ]},
  ]},
  {name:"Phase 3 — Hypertrophy",short:"Ph 3",weeks:"Wks 9–12",theme:"More volume, cable/DB focus, joint protection",days:[
    {name:"Day 1 — Push & Pull (Horizontal)",est:"43 min",warmup:"3 min light cardio · arm circles · 1 warm-up set at 50%×5",exercises:[
      {n:"Scapular Push-Up",sets:2,reps:"12",rest:60,load:"BW",note:"Protract/retract — blade movement only. Arms locked."},
      {n:"Cable Rope Face Pull",sets:3,reps:"12",rest:30,load:"67–70%",note:"Now 3 sets. Elbows at or above shoulders."},
      {n:"Standing Cable Chest Press",sets:4,reps:"8",rest:90,load:"75–80%",note:"Pulleys at chest height, stagger stance. Squeeze chest. Control return."},
      {n:"Seated Cable Row (Close Grip)",sets:3,reps:"10",rest:60,load:"70–75%",note:"Full stretch at front, squeeze mid-traps."},
      {n:"DB Incline Chest Fly",sets:3,reps:"12",rest:60,load:"65–70%",note:"Arms slightly bent always. Feel the deep chest stretch. Isolation only."},
      {n:"Dip",sets:3,reps:"10",rest:60,load:"BW",note:"Add weight only if 12 bodyweight reps feel easy."},
      {n:"Cable Rope Tricep Extension",sets:3,reps:"12",rest:60,load:"67–70%",note:"60 sec rest. Elbows tucked, pause at full extension."},
    ]},
    {name:"Day 2 — Lower Body & Core",est:"40 min",warmup:"3 min light cardio · leg swings · 1 squat warm-up at 50%×5",exercises:[
      {n:"Half Kneeling Anti-Rotation Press",sets:2,reps:"12/side",rest:45,load:"Light band",note:"Resist rotation — hips square."},
      {n:"Single Leg RDL (DB)",sets:3,reps:"8/side",rest:60,load:"65–70%",note:"DB in opposite hand. Spine neutral, back leg floats."},
      {n:"Goblet Squat",sets:3,reps:"10",rest:90,load:"70–75%",note:"Heavy DB at chest. Deep squat, upright torso. Elbows inside knees."},
      {n:"Barbell Romanian Deadlift",sets:3,reps:"10",rest:90,load:"75%",note:"Reps up from 8. Same load as Phase 2 to start."},
      {n:"DB Bulgarian Split Squat",sets:3,reps:"12/side",rest:60,load:"70%",note:"Reps up from Phase 2. Depth and control over load."},
      {n:"Front Plank",sets:3,reps:"60 sec",rest:0,load:"BW",note:"Superset with Pallof Press.",ss:true},
      {n:"Pallof Press",sets:3,reps:"12/side",rest:60,load:"Light cable",note:"Side-on to cable. Press out, resist rotation. Hold 1–2 sec. Superset with Front Plank.",ss:true},
    ]},
    {name:"Day 3 — Push & Pull (Vertical)",est:"32 min",warmup:"3 min light cardio · bar hang 30 sec · shoulder circles",exercises:[
      {n:"Bar Hang + Scapular Depression",sets:2,reps:"5 dep.",rest:0,load:"BW",note:"10 sec hang + 5 depressions. Set 2: 2 sec pause at bottom of each."},
      {n:"Prone IYTW",sets:2,reps:"8 total",rest:30,load:"BW",note:"Reps up from 6."},
      {n:"Wide Grip Pull-Up",sets:4,reps:"6",rest:90,load:"BW / band",note:"Use band for sets 3–4 if form breaks."},
      {n:"DB Arnold Press",sets:3,reps:"10",rest:60,load:"70–75%",note:"Palms facing you at chin, rotate to palms-forward at top. Slow."},
      {n:"DB Lateral Raise",sets:3,reps:"12",rest:0,load:"67–70%",note:"Elbows to shoulder height.",ss:true},
      {n:"DB Front Raise",sets:3,reps:"12",rest:60,load:"67–70%",note:"Superset with Lateral Raise.",ss:true},
      {n:"Single Arm Cable Lat Pulldown",sets:3,reps:"10/side",rest:60,load:"70–75%",note:"Squeeze lat. No shoulder shrug at top."},
    ]},
  ]},
  {name:"Phase 4 — Strength Peak",short:"Ph 4",weeks:"Wks 13–16",theme:"Near-max strength capped at 80% · Week 16 = full deload",days:[
    {name:"Day 1 — Push & Pull (Horizontal)",est:"43 min",warmup:"3 min light cardio · arm circles · bench warm-up: 50%×5, then 65%×3",exercises:[
      {n:"Cable Rope Face Pull",sets:3,reps:"15",rest:30,load:"67–70%",note:"Protect shoulder before heavy pressing."},
      {n:"Barbell Bench Press",sets:5,reps:"5",rest:120,load:"80%",note:"Cap at 80%. Full 2-min rest. Form perfect on set 5."},
      {n:"Chest-Supported DB Row",sets:4,reps:"6",rest:90,load:"80%",note:"Face-down on 45° incline bench. Row to hips, elbows close."},
      {n:"DB Incline Chest Fly",sets:3,reps:"10",rest:60,load:"70%",note:"Isolation only — don't go heavy. Protect the shoulder."},
      {n:"Dip",sets:4,reps:"6",rest:90,load:"BW",note:"Stay BW unless 12+ clean reps easy."},
      {n:"Cable Rope Tricep Extension",sets:3,reps:"10",rest:60,load:"70–75%",note:"Elbows tucked throughout."},
    ]},
    {name:"Day 2 — Lower Body & Core",est:"43 min",warmup:"3 min light cardio · leg swings · 50%×5 then 65%×3 on peak lift",note:"Wks 13 & 15: Squat peak — drop split squat. Wk 14: Deadlift peak — drop Farmer's Walk.",exercises:[
      {n:"Single Leg RDL (DB)",sets:3,reps:"8/side",rest:60,load:"70%",note:"DB opposite hand. Spine neutral."},
      {n:"Barbell Back Squat",sets:4,reps:"5",rest:120,load:"80%",note:"Cap at 80%. Wk 13 re-familiarise. Wk 15 push for best."},
      {n:"Barbell Deadlift",sets:4,reps:"5",rest:120,load:"80%",note:"Cap at 80%. Full reset every rep. Brace hard."},
      {n:"DB Bulgarian Split Squat",sets:3,reps:"8/side",rest:75,load:"75%",note:"DROP on squat peak weeks (13 & 15)."},
      {n:"Farmer's Walk (Suitcase Carry)",sets:3,reps:"30m/side",rest:90,load:"Heavy DB",note:"DROP on deadlift peak week (14). Torso perfectly upright."},
      {n:"Front Plank",sets:3,reps:"60 sec",rest:0,load:"BW",note:"Superset with Pallof Press.",ss:true},
      {n:"Pallof Press",sets:3,reps:"12/side",rest:60,load:"Moderate cable",note:"Superset with Front Plank.",ss:true},
    ]},
    {name:"Day 3 — Push & Pull (Vertical)",est:"35 min",warmup:"3 min light cardio · bar hang 30 sec · pull-up warm-up with band ×5",exercises:[
      {n:"Bar Hang + Scapular Depression",sets:2,reps:"8 dep.",rest:0,load:"BW",note:"10 sec hang + 8 depressions."},
      {n:"Prone IYTW",sets:2,reps:"8 total",rest:30,load:"BW",note:"Shoulder health — never skip."},
      {n:"Weighted Wide Grip Pull-Up",sets:5,reps:"5",rest:120,load:"+5–10 kg max",note:"Cap added weight. Exactly 5 clean reps per set."},
      {n:"DB Arnold Press",sets:4,reps:"5",rest:90,load:"80%",note:"Keep DB Arnold — do NOT switch to barbell OHP."},
      {n:"DB Lateral Raise",sets:3,reps:"12",rest:0,load:"67–70%",note:"Shoulder health work.",ss:true},
      {n:"DB Front Raise",sets:3,reps:"12",rest:60,load:"67–70%",note:"Superset with Lateral Raise.",ss:true},
      {n:"Single Arm Cable Lat Pulldown",sets:3,reps:"8/side",rest:60,load:"72–75%",note:"Squeeze lat, no shoulder shrug."},
    ]},
  ]},
]};

// ─── MOBILITY DATA ─────────────────────────────────────────────────────────────
// 3 rotating routines per phase. Routine auto-suggested by day of week but user can switch.
// A = Lower body focus | B = Upper body + thoracic focus | C = Full body flow
const MOB_DATA=[
  // ── PHASE 1 (Wks 1–4) ─ Foundation: static holds, establish baselines ─────────
  {
    phase:"Phase 1 (Wks 1–4)", phaseDur:"~14 min each",
    routineLabel:["A — Lower Body","B — Upper Body & Thoracic","C — Full Body Flow"],
    routineSuggest:["Best after leg days","Best after push/pull days","Best on any rest day"],
    routines:[
      // A — Lower Body
      {dur:"14 min", focus:"Hips · Hamstrings · Hip flexors · Ankles", items:[
        {n:"Wall Supported Hip Flexor Stretch",hold:"40 sec/side",sets:2,note:"Knee close to wall, posterior pelvic tilt. Tighter hip flexors = longer hold needed."},
        {n:"Adductor Rockback",hold:"40 sec/side",sets:2,note:"All fours, one knee out wide. Rock back slowly into the inner thigh stretch."},
        {n:"Frog Hip Internal Rotation",hold:"10 reps",sets:2,note:"Knees wide, toes out. Alternate rotating each leg inward. Trains internal rotation lost from sitting."},
        {n:"Half Kneeling Long Split",hold:"40 sec/side",sets:2,note:"Front foot flat, back knee on pad, tall spine. Squeeze rear glute to deepen."},
        {n:"Deep Squat Hold",hold:"30 sec",sets:2,note:"Feet shoulder-width, toes out. Hold onto a door frame if needed. Trains ankle, hip, and thoracic mobility simultaneously."},
        {n:"Ankle Circles",hold:"10 reps/side",sets:1,note:"Seated or standing. Full slow circles — clockwise and counter-clockwise. Directly supports squat depth and deadlift start position."},
      ]},
      // B — Upper Body & Thoracic
      {dur:"14 min", focus:"Thoracic spine · Shoulders · Chest · Lats", items:[
        {n:"Seated Upper Trap Stretch",hold:"30 sec/side",sets:2,note:"One hand on lower back, other gently pulls head to shoulder. Breathe deeply — the breath releases the muscle."},
        {n:"Cat-Cow",hold:"8 reps",sets:2,note:"Exhale fully into Cat (round up). Inhale fully into Cow (drop belly). Let the breath drive the movement."},
        {n:"Thread the Needle",hold:"20 sec/side",sets:2,note:"From all fours, reach one arm under your body. Let shoulder drop toward floor. Hold. Then reach arm to ceiling. Thoracic rotation — fills the gap in the current program."},
        {n:"Active Lats Stretch",hold:"6 reps",sets:2,note:"Knees on floor, hands on bench, elbows straight. Exhale and drop chest toward floor. Arms stay straight."},
        {n:"Bent Arm Chest Stretch",hold:"30 sec/side",sets:2,note:"Elbow at shoulder height against door frame. Keep elbow at or below shoulder — do not go into the high shoulder position."},
        {n:"Thoracic Extension (Towel Roll)",hold:"5 slow breaths",sets:2,note:"Roll up your yoga mat or a towel. Lean back over the roll at mid-back, hands behind head. Exhale and let the chest open. Move up 2 cm between sets. This directly unlocks overhead pressing range."},
      ]},
      // C — Full Body Flow
      {dur:"14 min", focus:"Whole body · Spinal mobility · Hip + shoulder combined", items:[
        {n:"Cat-Cow",hold:"8 reps",sets:2,note:"Exhale into Cat, inhale into Cow. Smooth and slow — feel every vertebra move."},
        {n:"Thread the Needle",hold:"20 sec/side",sets:2,note:"From all fours. Arm threads under body, shoulder drops to floor. Hold then reach to ceiling."},
        {n:"Wall Supported Hip Flexor Stretch",hold:"40 sec/side",sets:1,note:"Knee close to wall, posterior tilt. One set — part of a flow, not a focused stretch session."},
        {n:"Deep Squat Hold",hold:"30 sec",sets:2,note:"Hold a door frame for support if needed. Breathe. Let gravity do the work."},
        {n:"Active Lats Stretch",hold:"6 reps",sets:2,note:"Knees on floor, hands on bench, exhale and drop chest. Arms stay straight."},
        {n:"Adductor Rockback",hold:"30 sec/side",sets:1,note:"One set in the flow. Rock back slowly into the inner thigh."},
        {n:"Ankle Circles",hold:"10 reps/side",sets:1,note:"Full slow circles. Finish every rest day session with this — ankles are the most neglected joint in strength training."},
      ]},
    ],
  },

  // ── PHASE 2 (Wks 5–8) ─ Volume: longer holds, dynamic work introduced ─────────
  {
    phase:"Phase 2 (Wks 5–8)", phaseDur:"~16 min each",
    routineLabel:["A — Lower Body","B — Upper Body & Thoracic","C — Full Body Flow"],
    routineSuggest:["Best after leg days","Best after push/pull days","Best on any rest day"],
    routines:[
      // A — Lower Body
      {dur:"16 min", focus:"Hips · Hamstrings · Ankle · Hip rotation", items:[
        {n:"Wall Supported Hip Flexor Stretch",hold:"45 sec/side",sets:2,note:"Hold 5 sec longer than Phase 1. If you feel it immediately, your hip flexors are very tight — this is priority work."},
        {n:"Adductor Rockback",hold:"45 sec/side",sets:2,note:"Longer hold. Breathe into the inner thigh — let it release rather than forcing it."},
        {n:"Frog Hip Internal Rotation",hold:"12 reps",sets:2,note:"Up 2 reps from Phase 1. Move slowly — each rep should be deliberate."},
        {n:"90/90 Hip Switch",hold:"10 reps/side",sets:2,note:"Sit on floor, both knees at 90°. Rotate hips to switch legs both directions. Trains internal and external hip rotation together."},
        {n:"Deep Squat Hold",hold:"40 sec",sets:2,note:"Longer hold from Phase 1. If you can, release the door frame for the last 10 seconds."},
        {n:"Pigeon Pose",hold:"40 sec/side",sets:2,note:"From a lunge, bring front leg across so shin is roughly parallel to the front of the mat. Lower chest toward floor. Hip external rotation — complements the frog stretch."},
        {n:"Ankle Circles",hold:"12 reps/side",sets:1,note:"Up 2 reps. Full slow circles — feel the range improve over weeks."},
      ]},
      // B — Upper Body & Thoracic
      {dur:"16 min", focus:"Thoracic rotation · Shoulder CARs · Chest · Upper back", items:[
        {n:"Seated Upper Trap Stretch",hold:"30 sec/side",sets:2,note:"Keep from Phase 1. Now pair with slow exhales — breathe the neck looser."},
        {n:"Cat-Cow",hold:"10 reps",sets:2,note:"Up 2 reps. Focus on segmental movement — feel each vertebra individually rather than one big movement."},
        {n:"Thread the Needle",hold:"25 sec/side",sets:2,note:"Longer hold from Phase 1. At the end of each hold, try to reach just a little further. Never force — guide."},
        {n:"Thoracic Extension (Towel Roll)",hold:"5 slow breaths",sets:3,note:"Up to 3 sets. Work up the thoracic spine — start at mid-back, shift roll up 2–3 cm each set. Cover the full thoracic region."},
        {n:"Shoulder CARs",hold:"5 reps/side",sets:2,note:"Standing or seated. Move your arm through the largest possible circle in every direction — front, up, back, down. Slow and deliberate. Controlled articular rotation builds active shoulder range that stretching alone cannot."},
        {n:"Bent Arm Chest Stretch",hold:"35 sec/side",sets:2,note:"Longer hold. Elbow at or below shoulder height — do not force the arm above."},
        {n:"Active Lats Stretch",hold:"8 reps",sets:2,note:"Up 2 reps. On each rep, try to reach slightly further into the floor."},
      ]},
      // C — Full Body Flow
      {dur:"16 min", focus:"Full body · Introduce World's Greatest Stretch", items:[
        {n:"Cat-Cow",hold:"10 reps",sets:2,note:"Segmental movement — feel each vertebra. Let breath drive the rhythm."},
        {n:"Thread the Needle",hold:"25 sec/side",sets:2,note:"New addition from Phase 1 flow. Hold then reach to ceiling on each rep."},
        {n:"World's Greatest Stretch",hold:"5 reps/side",sets:2,note:"Start in a lunge. Place same-side hand on floor. Rotate upper body open — reach arm to ceiling. Pause. Return. Targets hip flexor, thoracic rotation, and hamstring in one movement. The most efficient mobility exercise in this program.",isNew:true},
        {n:"Deep Squat Hold",hold:"40 sec",sets:2,note:"Longer hold from Phase 1. No door frame if you can manage it."},
        {n:"90/90 Hip Switch",hold:"8 reps/side",sets:2,note:"Hip rotation flow. Smooth and controlled transitions."},
        {n:"Shoulder CARs",hold:"5 reps/side",sets:1,note:"One set in the flow. Full arm circle in every direction."},
        {n:"Ankle Circles",hold:"12 reps/side",sets:1,note:"Finish the session. Full slow circles."},
      ]},
    ],
  },

  // ── PHASE 3 (Wks 9–12) ─ Hypertrophy: active + dynamic mobility, more challenge ─
  {
    phase:"Phase 3 (Wks 9–12)", phaseDur:"~18 min each",
    routineLabel:["A — Lower Body","B — Upper Body & Thoracic","C — Full Body Flow"],
    routineSuggest:["Best after leg days","Best after push/pull days","Best on any rest day"],
    routines:[
      // A — Lower Body
      {dur:"18 min", focus:"Active hip mobility · Loaded end-range introduced · Ankle", items:[
        {n:"Wall Supported Hip Flexor Stretch",hold:"45 sec/side",sets:2,note:"Maintain from Phase 2. Focus on the quality of the posterior pelvic tilt — this is what creates the stretch."},
        {n:"Pigeon Pose",hold:"45 sec/side",sets:2,note:"Longer hold from Phase 2. Let the hip sink further — use your breath to release."},
        {n:"90/90 Hip Switch",hold:"12 reps/side",sets:2,note:"Up 2 reps. Add a 2-second pause in each position before switching."},
        {n:"Frog Hip Internal Rotation",hold:"12 reps",sets:2,note:"Maintain from Phase 2. Now try to hold the deepest position for 2 sec on each rep."},
        {n:"Deep Squat Hold",hold:"45 sec",sets:2,note:"Longer hold. If comfortable, add a small weight (2.5 kg) held at chest — this loaded stretch improves end-range squat strength not just flexibility."},
        {n:"Single Leg Calf Raise — slow",hold:"10 slow reps/side",sets:2,note:"Active ankle mobility. Stand on one foot, slow 3-second rise and 3-second lower. Directly trains the ankle range needed for deep squats and deadlift setup.",isNew:true},
        {n:"Adductor Rockback",hold:"45 sec/side",sets:2,note:"Maintain from Phase 2."},
      ]},
      // B — Upper Body & Thoracic
      {dur:"18 min", focus:"Active shoulder range · Thoracic strength + mobility · Rotator cuff", items:[
        {n:"Thoracic Extension (Towel Roll)",hold:"5 slow breaths",sets:3,note:"Maintain 3 sets. Now add arm reach overhead at the bottom of each extension — this actively loads the new thoracic range."},
        {n:"Thread the Needle",hold:"30 sec/side",sets:2,note:"Longest hold so far. At full rotation, actively push the floor away with your planted hand — this adds a strength element."},
        {n:"Shoulder CARs",hold:"6 reps/side",sets:2,note:"Up 1 rep. Move slower — the slower the circle, the more active control you develop."},
        {n:"Cat-Cow",hold:"12 reps",sets:2,note:"Up 2 reps from Phase 2. Focus on full spinal range — cervical (neck) to lumbar (lower back)."},
        {n:"Seated Upper Trap Stretch",hold:"30 sec/side",sets:2,note:"Maintain. Add a gentle ear-to-shoulder lean after the hold for 5 reps dynamic movement."},
        {n:"Bent Arm Chest Stretch",hold:"40 sec/side",sets:2,note:"Longest hold. Elbow stays at or below shoulder — explore the pec and anterior shoulder."},
        {n:"Active Lats Stretch",hold:"8 reps",sets:2,note:"Maintain. On each rep, pause at the deepest point for 2 seconds before returning."},
      ]},
      // C — Full Body Flow
      {dur:"18 min", focus:"Full body · World's Greatest Stretch progressed · Dynamic flow", items:[
        {n:"World's Greatest Stretch",hold:"6 reps/side",sets:2,note:"Up 1 rep. Now add a thoracic rotation pause at the top of each rep — hold the ceiling reach for 2 seconds."},
        {n:"Thread the Needle",hold:"30 sec/side",sets:2,note:"Full 30-second hold. Active push from the planted hand at end range."},
        {n:"90/90 Hip Switch",hold:"12 reps/side",sets:2,note:"Smooth and controlled. Pause 2 sec in each position."},
        {n:"Deep Squat Hold",hold:"45 sec",sets:2,note:"Loaded if comfortable — small weight at chest."},
        {n:"Shoulder CARs",hold:"6 reps/side",sets:2,note:"Full slow circles. Control is everything."},
        {n:"Cat-Cow",hold:"12 reps",sets:1,note:"One set to finish the flow. Focus on full range."},
        {n:"Ankle Circles",hold:"12 reps/side",sets:1,note:"Finish every session. Slow and full range."},
      ]},
    ],
  },

  // ── PHASE 4 (Wks 13–16) ─ Strength Peak + Deload: maintain range, active end-range ─
  {
    phase:"Phase 4 (Wks 13–16)", phaseDur:"~18 min each",
    routineLabel:["A — Lower Body","B — Upper Body & Thoracic","C — Full Body Flow"],
    routineSuggest:["Best after leg days","Best after push/pull days","Best on any rest day"],
    routines:[
      // A — Lower Body
      {dur:"18 min", focus:"Maintain hip range · Active loaded end-range · Deload week: extra session", items:[
        {n:"Wall Supported Hip Flexor Stretch",hold:"45 sec/side",sets:2,note:"Maintain. Especially important — squat and deadlift loads are at their highest. Tight hip flexors compromise both."},
        {n:"Pigeon Pose",hold:"45 sec/side",sets:2,note:"Maintain from Phase 3."},
        {n:"90/90 Hip Switch",hold:"12 reps/side",sets:2,note:"Add a 3-second pause each position. Strength peak phase — active mobility matters more than passive stretching."},
        {n:"Deep Squat Hold",hold:"45 sec",sets:2,note:"Keep the loaded version if using it. Heavy squat weeks especially benefit from this."},
        {n:"Single Leg Calf Raise — slow",hold:"12 slow reps/side",sets:2,note:"Up 2 reps from Phase 3. Ankle mobility directly supports heavy deadlift start position."},
        {n:"Adductor Rockback",hold:"45 sec/side",sets:2,note:"Maintain. Adductor tightness becomes more obvious under heavy squat loads."},
        {n:"Frog Hip Internal Rotation",hold:"12 reps",sets:2,note:"Hold deepest position 2 sec each rep. Internal rotation protects the hip joint under load."},
      ]},
      // B — Upper Body & Thoracic
      {dur:"18 min", focus:"Thoracic maintenance · Shoulder health at peak loads · Rotator cuff", items:[
        {n:"Thoracic Extension (Towel Roll)",hold:"5 slow breaths",sets:3,note:"Non-negotiable during Phase 4. Heavy bench and overhead pressing demands full thoracic extension. Do this before every upper body day if possible."},
        {n:"Thread the Needle",hold:"30 sec/side",sets:3,note:"Up to 3 sets in Phase 4. Thoracic rotation protects the shoulder under heavy pressing loads."},
        {n:"Shoulder CARs",hold:"6 reps/side",sets:2,note:"Maintain. At peak loads, active shoulder range is more protective than passive stretching."},
        {n:"Cat-Cow",hold:"12 reps",sets:2,note:"Maintain. Segmental spinal control — still valuable at strength peak."},
        {n:"Seated Upper Trap Stretch",hold:"30 sec/side",sets:2,note:"Maintain. Trap tightness builds with heavy pulling. Address it every rest day."},
        {n:"Bent Arm Chest Stretch",hold:"40 sec/side",sets:2,note:"Maintain. Elbow at or below shoulder — protect the AC joint."},
        {n:"Active Lats Stretch",hold:"8 reps",sets:2,note:"Maintain. 2-second pause at the deepest point each rep."},
      ]},
      // C — Full Body Flow
      {dur:"18 min", focus:"Full body maintenance · Deload week: double this session", items:[
        {n:"World's Greatest Stretch",hold:"6 reps/side",sets:2,note:"Maintain. During deload week (Wk 16), do this session twice — it's the best single maintenance investment."},
        {n:"Thread the Needle",hold:"30 sec/side",sets:2,note:"Maintain 3 sets from Phase 3 upper routine — use 2 sets in this flow."},
        {n:"90/90 Hip Switch",hold:"12 reps/side",sets:2,note:"3-second pause each position. Finish strong."},
        {n:"Thoracic Extension (Towel Roll)",hold:"5 slow breaths",sets:2,note:"Two sets in the flow. The thoracic work belongs in every rest day at this phase."},
        {n:"Shoulder CARs",hold:"6 reps/side",sets:2,note:"Full slow circles. Maintain active shoulder range through the peak."},
        {n:"Deep Squat Hold",hold:"45 sec",sets:1,note:"One set to finish. Hold it — let the accumulated tension from heavy training sessions release."},
        {n:"Ankle Circles",hold:"12 reps/side",sets:1,note:"Always finish with this. Ankles need consistent attention."},
      ]},
    ],
  },
];

