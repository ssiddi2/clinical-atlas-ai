import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Specialty IDs from the database
const SPECIALTIES = {
  internalMedicine: "3ef7bb88-6d0c-49b7-86a8-414177636baf",
  surgery: "709365a7-de8e-49b3-a10d-00414511203c",
  emergencyMedicine: "eadcecc4-f34b-4671-8512-3316151546bc",
  cardiology: "2f3cdd02-f060-4377-a9a1-8951e6bdb179",
  pulmonology: "1676f0da-bba5-4207-b314-156e33dc6778",
  neurology: "5c88a103-202b-4831-b05a-4d486b4ad563",
  gastroenterology: "8d4179b5-7840-44e8-94ad-ffd4bbe61223",
  nephrology: "367ee43b-d928-4cae-a8f8-4a74c88a4134",
  endocrinology: "35a83c14-d269-4733-9d1a-7d419e241334",
};

// Module IDs from the database
const MODULES = [
  { id: "42a16ab9-175e-448a-b1ec-91c74970d316", title: "COPD" },
  { id: "5b8c12f1-6d59-4e4a-b93e-6560fdcf3a6d", title: "Heart Failure: Pathophysiology" },
  { id: "546c23d5-69c2-458c-b3d0-44eec40eccc3", title: "Diabetes Mellitus: Pathophysiology" },
  { id: "e2ff8555-1732-417e-bde1-fea0b1134842", title: "Stroke: Ischemic" },
  { id: "52ee60c3-17e1-4dfe-a453-c808701faec9", title: "Heart Failure: Diagnosis" },
  { id: "fa47adcd-80d5-4dbf-823a-a7fa1c0e93e5", title: "Diabetes Management" },
  { id: "59e5dd04-804f-49f2-8da2-81f5296af7ef", title: "Asthma" },
  { id: "eaf4b96f-89f6-479b-aacc-4d96d0c3c896", title: "Stroke: Hemorrhagic" },
  { id: "c115c4d5-fcfd-42f8-ab9c-ab29c8927a1e", title: "Pneumonia" },
  { id: "937425da-b427-48e8-a696-29c223939cc6", title: "Diabetic Complications" },
  { id: "8458b09c-31d9-404e-90d1-8d336a17ea05", title: "Heart Failure: Management" },
  { id: "cc334520-0d8f-4cd7-b4c4-2219c8ed718d", title: "Seizures and Epilepsy" },
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function generateTopicPerformance(): Record<string, number> {
  return {
    "Cardiovascular": randomInt(65, 90),
    "Respiratory": randomInt(60, 85),
    "Gastrointestinal": randomInt(55, 80),
    "Neurology": randomInt(50, 75),
    "Endocrine": randomInt(60, 85),
    "Renal": randomInt(55, 80),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's auth to get user ID
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Seeding demo data for user: ${userId}`);

    // Clear existing demo data for this user (idempotent)
    await Promise.all([
      supabaseClient.from("assessment_attempts").delete().eq("user_id", userId),
      supabaseClient.from("usmle_score_predictions").delete().eq("user_id", userId),
      supabaseClient.from("user_module_progress").delete().eq("user_id", userId),
      supabaseClient.from("competency_scores").delete().eq("user_id", userId),
    ]);

    console.log("Cleared existing demo data");

    // 1. Update profile to demo state
    const { error: profileError } = await supabaseClient
      .from("profiles")
      .update({
        first_name: "Demo",
        last_name: "Student",
        institution: "Sample Medical University",
        year_of_study: 3,
        target_specialty: "Internal Medicine",
        medical_school_type: "international",
        onboarding_completed: true,
        verification_status: "verified",
        program_level: "clinical",
        weak_areas: ["Nephrology", "Endocrinology"],
        study_hours_per_week: 25,
        learning_style: "visual",
      })
      .eq("user_id", userId);

    if (profileError) {
      console.error("Profile update error:", profileError);
    }

    // 2. Create assessment attempts (15-18 over 30 days)
    const assessmentAttempts = [];
    const specialtyList = [
      { id: SPECIALTIES.cardiology, name: "Cardiology", count: 4 },
      { id: SPECIALTIES.internalMedicine, name: "Internal Medicine", count: 4 },
      { id: SPECIALTIES.pulmonology, name: "Pulmonology", count: 3 },
      { id: SPECIALTIES.neurology, name: "Neurology", count: 3 },
      { id: SPECIALTIES.emergencyMedicine, name: "Emergency Medicine", count: 2 },
      { id: SPECIALTIES.gastroenterology, name: "Gastroenterology", count: 2 },
    ];

    let attemptDay = 30;
    for (const specialty of specialtyList) {
      for (let i = 0; i < specialty.count; i++) {
        const totalQuestions = randomInt(10, 20);
        const accuracy = randomFloat(0.65, 0.88);
        const correctAnswers = Math.round(totalQuestions * accuracy);
        const timePerQuestion = randomInt(45, 90);

        assessmentAttempts.push({
          user_id: userId,
          specialty_id: specialty.id,
          assessment_type: i === 0 ? "diagnostic" : "practice",
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          time_taken_seconds: totalQuestions * timePerQuestion,
          topic_performance: generateTopicPerformance(),
          difficulty_distribution: {
            easy: randomInt(3, 6),
            medium: randomInt(4, 8),
            hard: randomInt(2, 5),
          },
          predicted_score: randomInt(210, 245),
          percentile: randomInt(55, 85),
          created_at: daysAgo(attemptDay),
        });

        attemptDay = Math.max(0, attemptDay - randomInt(1, 3));
      }
    }

    const { error: attemptError } = await supabaseClient
      .from("assessment_attempts")
      .insert(assessmentAttempts);

    if (attemptError) {
      console.error("Assessment attempts error:", attemptError);
    }

    // 3. Create score prediction history (progressive improvement)
    const scorePredictions = [
      {
        user_id: userId,
        predicted_step1_score: 218,
        predicted_step2_score: 220,
        pass_probability_step1: 82,
        pass_probability_step2: 84,
        match_probability: 65,
        contributing_factors: {
          questionAccuracy: 68,
          clinicalReasoning: 65,
          knowledgeCoverage: 62,
          speedEfficiency: 70,
          performanceTrend: 72,
        },
        confidence_interval: { low: 208, high: 228 },
        prediction_date: daysAgo(28).split("T")[0],
        created_at: daysAgo(28),
      },
      {
        user_id: userId,
        predicted_step1_score: 222,
        predicted_step2_score: 224,
        pass_probability_step1: 85,
        pass_probability_step2: 87,
        match_probability: 70,
        contributing_factors: {
          questionAccuracy: 71,
          clinicalReasoning: 68,
          knowledgeCoverage: 65,
          speedEfficiency: 72,
          performanceTrend: 75,
        },
        confidence_interval: { low: 212, high: 232 },
        prediction_date: daysAgo(21).split("T")[0],
        created_at: daysAgo(21),
      },
      {
        user_id: userId,
        predicted_step1_score: 227,
        predicted_step2_score: 229,
        pass_probability_step1: 88,
        pass_probability_step2: 90,
        match_probability: 75,
        contributing_factors: {
          questionAccuracy: 74,
          clinicalReasoning: 70,
          knowledgeCoverage: 67,
          speedEfficiency: 73,
          performanceTrend: 78,
        },
        confidence_interval: { low: 217, high: 237 },
        prediction_date: daysAgo(14).split("T")[0],
        created_at: daysAgo(14),
      },
      {
        user_id: userId,
        predicted_step1_score: 231,
        predicted_step2_score: 233,
        pass_probability_step1: 91,
        pass_probability_step2: 92,
        match_probability: 78,
        contributing_factors: {
          questionAccuracy: 75,
          clinicalReasoning: 72,
          knowledgeCoverage: 68,
          speedEfficiency: 74,
          performanceTrend: 80,
        },
        confidence_interval: { low: 221, high: 241 },
        prediction_date: daysAgo(7).split("T")[0],
        created_at: daysAgo(7),
      },
      {
        user_id: userId,
        predicted_step1_score: 235,
        predicted_step2_score: 238,
        pass_probability_step1: 94,
        pass_probability_step2: 95,
        match_probability: 82,
        contributing_factors: {
          questionAccuracy: 76,
          clinicalReasoning: 72,
          knowledgeCoverage: 68,
          speedEfficiency: 74,
          performanceTrend: 80,
        },
        confidence_interval: { low: 225, high: 245 },
        prediction_date: daysAgo(0).split("T")[0],
        created_at: daysAgo(0),
      },
    ];

    const { error: predictionError } = await supabaseClient
      .from("usmle_score_predictions")
      .insert(scorePredictions);

    if (predictionError) {
      console.error("Score predictions error:", predictionError);
    }

    // 4. Create module progress (mixed completion states)
    const moduleProgress = MODULES.map((module, index) => {
      let progress: number;
      let completedAt: string | null = null;
      const startedDaysAgo = randomInt(5, 25);

      if (index < 5) {
        // First 5 modules: completed
        progress = 100;
        completedAt = daysAgo(randomInt(1, 10));
      } else if (index < 9) {
        // Next 4 modules: in progress (50-80%)
        progress = randomInt(50, 80);
      } else {
        // Remaining modules: just started (10-30%)
        progress = randomInt(10, 30);
      }

      return {
        user_id: userId,
        module_id: module.id,
        progress_percent: progress,
        started_at: daysAgo(startedDaysAgo),
        last_accessed_at: daysAgo(randomInt(0, 5)),
        completed_at: completedAt,
      };
    });

    const { error: progressError } = await supabaseClient
      .from("user_module_progress")
      .insert(moduleProgress);

    if (progressError) {
      console.error("Module progress error:", progressError);
    }

    // 5. Create competency scores
    const competencyScores = [
      { user_id: userId, competency_type: "question_accuracy", score: 76, assessment_count: 18 },
      { user_id: userId, competency_type: "clinical_reasoning", score: 72, assessment_count: 18 },
      { user_id: userId, competency_type: "knowledge_coverage", score: 68, assessment_count: 18 },
      { user_id: userId, competency_type: "speed_efficiency", score: 74, assessment_count: 18 },
      { user_id: userId, competency_type: "performance_trend", score: 80, assessment_count: 18 },
    ];

    const { error: competencyError } = await supabaseClient
      .from("competency_scores")
      .insert(competencyScores);

    if (competencyError) {
      console.error("Competency scores error:", competencyError);
    }

    console.log("Demo data seeding complete!");

    return new Response(
      JSON.stringify({
        success: true,
        seeded: {
          profile: 1,
          assessmentAttempts: assessmentAttempts.length,
          scorePredictions: scorePredictions.length,
          moduleProgress: moduleProgress.length,
          competencyScores: competencyScores.length,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Seed demo data error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
