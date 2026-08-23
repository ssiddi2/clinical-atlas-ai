export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      assessment_attempts: {
        Row: {
          assessment_type: string
          correct_answers: number
          created_at: string
          difficulty_distribution: Json | null
          id: string
          percentile: number | null
          predicted_score: number | null
          specialty_id: string | null
          time_taken_seconds: number
          topic_performance: Json | null
          total_questions: number
          user_id: string
        }
        Insert: {
          assessment_type?: string
          correct_answers?: number
          created_at?: string
          difficulty_distribution?: Json | null
          id?: string
          percentile?: number | null
          predicted_score?: number | null
          specialty_id?: string | null
          time_taken_seconds?: number
          topic_performance?: Json | null
          total_questions?: number
          user_id: string
        }
        Update: {
          assessment_type?: string
          correct_answers?: number
          created_at?: string
          difficulty_distribution?: Json | null
          id?: string
          percentile?: number | null
          predicted_score?: number | null
          specialty_id?: string | null
          time_taken_seconds?: number
          topic_performance?: Json | null
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_attempts_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      classroom_enrollments: {
        Row: {
          attended: boolean
          classroom_id: string
          enrolled_at: string
          id: string
          student_id: string
        }
        Insert: {
          attended?: boolean
          classroom_id: string
          enrolled_at?: string
          id?: string
          student_id: string
        }
        Update: {
          attended?: boolean
          classroom_id?: string
          enrolled_at?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "classroom_enrollments_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "virtual_classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      classroom_presence: {
        Row: {
          accumulated_seconds: number
          called_on_count: number
          classroom_id: string
          connection_quality: string | null
          hand_raised_at: string | null
          id: string
          is_online: boolean
          joined_at: string
          last_seen_at: string
          user_id: string
        }
        Insert: {
          accumulated_seconds?: number
          called_on_count?: number
          classroom_id: string
          connection_quality?: string | null
          hand_raised_at?: string | null
          id?: string
          is_online?: boolean
          joined_at?: string
          last_seen_at?: string
          user_id: string
        }
        Update: {
          accumulated_seconds?: number
          called_on_count?: number
          classroom_id?: string
          connection_quality?: string | null
          hand_raised_at?: string | null
          id?: string
          is_online?: boolean
          joined_at?: string
          last_seen_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "classroom_presence_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "virtual_classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      classroom_stage: {
        Row: {
          classroom_id: string
          mode: string
          payload: Json
          updated_at: string
        }
        Insert: {
          classroom_id: string
          mode?: string
          payload?: Json
          updated_at?: string
        }
        Update: {
          classroom_id?: string
          mode?: string
          payload?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classroom_stage_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: true
            referencedRelation: "virtual_classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      competency_scores: {
        Row: {
          assessment_count: number
          competency_type: string
          created_at: string
          id: string
          last_updated: string
          score: number
          user_id: string
        }
        Insert: {
          assessment_count?: number
          competency_type: string
          created_at?: string
          id?: string
          last_updated?: string
          score?: number
          user_id: string
        }
        Update: {
          assessment_count?: number
          competency_type?: string
          created_at?: string
          id?: string
          last_updated?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      contact_inquiries: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          inquiry_type: string
          message: string
          organization: string | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          inquiry_type: string
          message: string
          organization?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          inquiry_type?: string
          message?: string
          organization?: string | null
          role?: string | null
        }
        Relationships: []
      }
      content_reviews: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          id: string
          notes: string | null
          reason: string | null
          reviewed_via: string
          reviewer_id: string
          severity: string
          sources_checked: string[]
          updated_at: string
          verdict: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          notes?: string | null
          reason?: string | null
          reviewed_via?: string
          reviewer_id: string
          severity?: string
          sources_checked?: string[]
          updated_at?: string
          verdict: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          notes?: string | null
          reason?: string | null
          reviewed_via?: string
          reviewer_id?: string
          severity?: string
          sources_checked?: string[]
          updated_at?: string
          verdict?: string
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          approved_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          status: string
          student_id: string
        }
        Insert: {
          approved_at?: string | null
          course_id: string
          enrolled_at?: string
          id?: string
          status?: string
          student_id: string
        }
        Update: {
          approved_at?: string | null
          course_id?: string
          enrolled_at?: string
          id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_materials: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          file_name: string
          file_type: string
          file_url: string
          id: string
          material_type: string
          topic_id: string | null
          uploaded_by: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          file_name: string
          file_type?: string
          file_url: string
          id?: string
          material_type?: string
          topic_id?: string | null
          uploaded_by: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
          material_type?: string
          topic_id?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_materials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_materials_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "course_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      course_quiz_attempts: {
        Row: {
          answers: Json
          created_at: string
          id: string
          quiz_id: string
          score: number
          student_id: string
          time_taken_seconds: number
          total_questions: number
        }
        Insert: {
          answers?: Json
          created_at?: string
          id?: string
          quiz_id: string
          score?: number
          student_id: string
          time_taken_seconds?: number
          total_questions?: number
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          quiz_id?: string
          score?: number
          student_id?: string
          time_taken_seconds?: number
          total_questions?: number
        }
        Relationships: [
          {
            foreignKeyName: "course_quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "course_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      course_quizzes: {
        Row: {
          course_id: string
          created_at: string
          created_by: string
          id: string
          questions: Json
          status: string
          title: string
          topic_id: string | null
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          created_by: string
          id?: string
          questions?: Json
          status?: string
          title: string
          topic_id?: string | null
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          created_by?: string
          id?: string
          questions?: Json
          status?: string
          title?: string
          topic_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_quizzes_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "course_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      course_topics: {
        Row: {
          course_id: string
          created_at: string
          id: string
          is_high_yield: boolean
          parent_topic_id: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          is_high_yield?: boolean
          parent_topic_id?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          is_high_yield?: boolean
          parent_topic_id?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_topics_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_topics_parent_topic_id_fkey"
            columns: ["parent_topic_id"]
            isOneToOne: false
            referencedRelation: "course_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          instructor_id: string
          max_students: number
          specialty_id: string | null
          start_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          instructor_id: string
          max_students?: number
          specialty_id?: string | null
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          instructor_id?: string
          max_students?: number
          specialty_id?: string | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      eli_conversations: {
        Row: {
          created_at: string
          id: string
          module_id: string | null
          specialty_id: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          module_id?: string | null
          specialty_id?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          module_id?: string | null
          specialty_id?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eli_conversations_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eli_conversations_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      eli_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "eli_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "eli_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollment_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          course_id: string
          created_at: string
          enrollment_id: string | null
          id: string
          metadata: Json
          new_status: string | null
          previous_status: string | null
          student_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          course_id: string
          created_at?: string
          enrollment_id?: string | null
          id?: string
          metadata?: Json
          new_status?: string | null
          previous_status?: string | null
          student_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          course_id?: string
          created_at?: string
          enrollment_id?: string | null
          id?: string
          metadata?: Json
          new_status?: string | null
          previous_status?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_audit_log_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "course_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_unit_content: {
        Row: {
          allow_retry: boolean | null
          created_at: string | null
          exam_traps: string | null
          explanation: string | null
          id: string
          instructor_note: string | null
          is_exam_focus: boolean | null
          is_high_yield: boolean | null
          is_important: boolean | null
          passing_score: number | null
          quick_notes: string | null
          require_quiz_before_next: boolean | null
          status: string | null
          topic_id: string
          updated_at: string | null
        }
        Insert: {
          allow_retry?: boolean | null
          created_at?: string | null
          exam_traps?: string | null
          explanation?: string | null
          id?: string
          instructor_note?: string | null
          is_exam_focus?: boolean | null
          is_high_yield?: boolean | null
          is_important?: boolean | null
          passing_score?: number | null
          quick_notes?: string | null
          require_quiz_before_next?: boolean | null
          status?: string | null
          topic_id: string
          updated_at?: string | null
        }
        Update: {
          allow_retry?: boolean | null
          created_at?: string | null
          exam_traps?: string | null
          explanation?: string | null
          id?: string
          instructor_note?: string | null
          is_exam_focus?: boolean | null
          is_high_yield?: boolean | null
          is_important?: boolean | null
          passing_score?: number | null
          quick_notes?: string | null
          require_quiz_before_next?: boolean | null
          status?: string | null
          topic_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_unit_content_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: true
            referencedRelation: "course_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_unit_progress: {
        Row: {
          attempts: number | null
          completed: boolean | null
          created_at: string | null
          id: string
          last_attempt_at: string | null
          quiz_answers: Json | null
          quiz_score: number | null
          student_id: string
          time_spent_seconds: number | null
          topic_id: string
          updated_at: string | null
        }
        Insert: {
          attempts?: number | null
          completed?: boolean | null
          created_at?: string | null
          id?: string
          last_attempt_at?: string | null
          quiz_answers?: Json | null
          quiz_score?: number | null
          student_id: string
          time_spent_seconds?: number | null
          topic_id: string
          updated_at?: string | null
        }
        Update: {
          attempts?: number | null
          completed?: boolean | null
          created_at?: string | null
          id?: string
          last_attempt_at?: string | null
          quiz_answers?: Json | null
          quiz_score?: number | null
          student_id?: string
          time_spent_seconds?: number | null
          topic_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_unit_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "course_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_unit_questions: {
        Row: {
          body_region: string | null
          concept_tag: string | null
          correct_answer_index: number
          created_at: string | null
          created_by: string
          difficulty: string | null
          exam_relevance: string | null
          explanation: string | null
          findings: string | null
          id: string
          image_url: string | null
          modality: string | null
          options: Json
          sort_order: number | null
          stem: string
          topic_id: string
        }
        Insert: {
          body_region?: string | null
          concept_tag?: string | null
          correct_answer_index?: number
          created_at?: string | null
          created_by: string
          difficulty?: string | null
          exam_relevance?: string | null
          explanation?: string | null
          findings?: string | null
          id?: string
          image_url?: string | null
          modality?: string | null
          options?: Json
          sort_order?: number | null
          stem: string
          topic_id: string
        }
        Update: {
          body_region?: string | null
          concept_tag?: string | null
          correct_answer_index?: number
          created_at?: string | null
          created_by?: string
          difficulty?: string | null
          exam_relevance?: string | null
          explanation?: string | null
          findings?: string | null
          id?: string
          image_url?: string | null
          modality?: string | null
          options?: Json
          sort_order?: number | null
          stem?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_unit_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "course_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      lecture_copilot_questions: {
        Row: {
          answer: string | null
          answered_at: string | null
          classroom_id: string
          created_at: string
          id: string
          question: string
          status: string
          student_id: string
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          classroom_id: string
          created_at?: string
          id?: string
          question: string
          status?: string
          student_id: string
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          classroom_id?: string
          created_at?: string
          id?: string
          question?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lecture_copilot_questions_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "virtual_classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_content: {
        Row: {
          content_text: string | null
          content_type: string
          created_at: string
          id: string
          media_caption: string | null
          media_url: string | null
          module_id: string
          section_order: number
          section_title: string
          updated_at: string
        }
        Insert: {
          content_text?: string | null
          content_type: string
          created_at?: string
          id?: string
          media_caption?: string | null
          media_url?: string | null
          module_id: string
          section_order?: number
          section_title: string
          updated_at?: string
        }
        Update: {
          content_text?: string | null
          content_type?: string
          created_at?: string
          id?: string
          media_caption?: string | null
          media_url?: string | null
          module_id?: string
          section_order?: number
          section_title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_content_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      live_case_votes: {
        Row: {
          case_id: string
          created_at: string
          id: string
          option_index: number
          step_index: number
          student_id: string
        }
        Insert: {
          case_id: string
          created_at?: string
          id?: string
          option_index: number
          step_index: number
          student_id: string
        }
        Update: {
          case_id?: string
          created_at?: string
          id?: string
          option_index?: number
          step_index?: number
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_case_votes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "live_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      live_cases: {
        Row: {
          classroom_id: string
          created_at: string
          current_step_index: number
          id: string
          instructor_id: string
          revealed: boolean
          status: string
          steps: Json
          title: string
          updated_at: string
          vignette: string
        }
        Insert: {
          classroom_id: string
          created_at?: string
          current_step_index?: number
          id?: string
          instructor_id: string
          revealed?: boolean
          status?: string
          steps?: Json
          title: string
          updated_at?: string
          vignette: string
        }
        Update: {
          classroom_id?: string
          created_at?: string
          current_step_index?: number
          id?: string
          instructor_id?: string
          revealed?: boolean
          status?: string
          steps?: Json
          title?: string
          updated_at?: string
          vignette?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_cases_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "virtual_classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      live_quiz_responses: {
        Row: {
          confidence_percent: number | null
          created_at: string
          id: string
          is_correct: boolean
          question_index: number
          quiz_id: string
          selected_index: number
          student_id: string
          time_taken_seconds: number
        }
        Insert: {
          confidence_percent?: number | null
          created_at?: string
          id?: string
          is_correct?: boolean
          question_index: number
          quiz_id: string
          selected_index: number
          student_id: string
          time_taken_seconds?: number
        }
        Update: {
          confidence_percent?: number | null
          created_at?: string
          id?: string
          is_correct?: boolean
          question_index?: number
          quiz_id?: string
          selected_index?: number
          student_id?: string
          time_taken_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "live_quiz_responses_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "live_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      live_quizzes: {
        Row: {
          classroom_id: string
          closed_at: string | null
          created_at: string
          id: string
          instructor_id: string
          launched_at: string | null
          questions: Json
          status: string
          title: string
          topic_hint: string | null
          updated_at: string
        }
        Insert: {
          classroom_id: string
          closed_at?: string | null
          created_at?: string
          id?: string
          instructor_id: string
          launched_at?: string | null
          questions?: Json
          status?: string
          title: string
          topic_hint?: string | null
          updated_at?: string
        }
        Update: {
          classroom_id?: string
          closed_at?: string | null
          created_at?: string
          id?: string
          instructor_id?: string
          launched_at?: string | null
          questions?: Json
          status?: string
          title?: string
          topic_hint?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_quizzes_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "virtual_classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      live_reactions: {
        Row: {
          classroom_id: string
          created_at: string
          id: string
          reaction: string
          student_id: string
        }
        Insert: {
          classroom_id: string
          created_at?: string
          id?: string
          reaction: string
          student_id: string
        }
        Update: {
          classroom_id?: string
          created_at?: string
          id?: string
          reaction?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_reactions_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "virtual_classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          content_type: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_published: boolean | null
          program_level: Database["public"]["Enums"]["program_level"]
          sort_order: number | null
          specialty_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          program_level: Database["public"]["Enums"]["program_level"]
          sort_order?: number | null
          specialty_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content_type?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          program_level?: Database["public"]["Enums"]["program_level"]
          sort_order?: number | null
          specialty_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_conversations: {
        Row: {
          created_at: string
          current_step: string | null
          extracted_data: Json | null
          id: string
          messages: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_step?: string | null
          extracted_data?: Json | null
          id?: string
          messages?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_step?: string | null
          extracted_data?: Json | null
          id?: string
          messages?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string | null
          address_line1: string | null
          address_line2: string | null
          avatar_url: string | null
          career_goals: string | null
          city: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          expected_graduation: string | null
          first_name: string | null
          hobbies: string[] | null
          id: string
          institution: string | null
          languages_spoken: string[] | null
          last_name: string | null
          learning_assessment_completed: boolean
          learning_profile: Json | null
          learning_style: string | null
          medical_school_type: string | null
          membership_tier: string
          onboarding_completed: boolean | null
          phone_number: string | null
          postal_code: string | null
          program_level: Database["public"]["Enums"]["program_level"] | null
          state_province: string | null
          study_hours_per_week: number | null
          target_specialty: string | null
          updated_at: string
          user_id: string
          usmle_step1_score: number | null
          usmle_step1_status: string | null
          usmle_step2_score: number | null
          usmle_step2_status: string | null
          verification_status: string | null
          weak_areas: string[] | null
          why_medicine: string | null
          year_of_study: number | null
        }
        Insert: {
          account_status?: string | null
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          career_goals?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          expected_graduation?: string | null
          first_name?: string | null
          hobbies?: string[] | null
          id?: string
          institution?: string | null
          languages_spoken?: string[] | null
          last_name?: string | null
          learning_assessment_completed?: boolean
          learning_profile?: Json | null
          learning_style?: string | null
          medical_school_type?: string | null
          membership_tier?: string
          onboarding_completed?: boolean | null
          phone_number?: string | null
          postal_code?: string | null
          program_level?: Database["public"]["Enums"]["program_level"] | null
          state_province?: string | null
          study_hours_per_week?: number | null
          target_specialty?: string | null
          updated_at?: string
          user_id: string
          usmle_step1_score?: number | null
          usmle_step1_status?: string | null
          usmle_step2_score?: number | null
          usmle_step2_status?: string | null
          verification_status?: string | null
          weak_areas?: string[] | null
          why_medicine?: string | null
          year_of_study?: number | null
        }
        Update: {
          account_status?: string | null
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          career_goals?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          expected_graduation?: string | null
          first_name?: string | null
          hobbies?: string[] | null
          id?: string
          institution?: string | null
          languages_spoken?: string[] | null
          last_name?: string | null
          learning_assessment_completed?: boolean
          learning_profile?: Json | null
          learning_style?: string | null
          medical_school_type?: string | null
          membership_tier?: string
          onboarding_completed?: boolean | null
          phone_number?: string | null
          postal_code?: string | null
          program_level?: Database["public"]["Enums"]["program_level"] | null
          state_province?: string | null
          study_hours_per_week?: number | null
          target_specialty?: string | null
          updated_at?: string
          user_id?: string
          usmle_step1_score?: number | null
          usmle_step1_status?: string | null
          usmle_step2_score?: number | null
          usmle_step2_status?: string | null
          verification_status?: string | null
          weak_areas?: string[] | null
          why_medicine?: string | null
          year_of_study?: number | null
        }
        Relationships: []
      }
      qbank_flagged_questions: {
        Row: {
          created_at: string
          flag_type: Database["public"]["Enums"]["qbank_flag_type"]
          id: string
          notes: string | null
          question_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          flag_type?: Database["public"]["Enums"]["qbank_flag_type"]
          id?: string
          notes?: string | null
          question_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          flag_type?: Database["public"]["Enums"]["qbank_flag_type"]
          id?: string
          notes?: string | null
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qbank_flagged_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "qbank_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      qbank_questions: {
        Row: {
          board_yield: Database["public"]["Enums"]["qbank_board_yield"]
          correct_answer_index: number
          created_at: string
          difficulty: Database["public"]["Enums"]["qbank_difficulty"]
          explanation: string
          explanation_image_url: string | null
          first_aid_reference: string | null
          id: string
          is_active: boolean
          keywords: string[] | null
          options: Json
          question_id: string
          question_image_url: string | null
          question_type: string
          specialty_id: string | null
          stem: string
          subject: string
          system: string
          topic: string | null
          updated_at: string
        }
        Insert: {
          board_yield?: Database["public"]["Enums"]["qbank_board_yield"]
          correct_answer_index: number
          created_at?: string
          difficulty?: Database["public"]["Enums"]["qbank_difficulty"]
          explanation: string
          explanation_image_url?: string | null
          first_aid_reference?: string | null
          id?: string
          is_active?: boolean
          keywords?: string[] | null
          options?: Json
          question_id: string
          question_image_url?: string | null
          question_type?: string
          specialty_id?: string | null
          stem: string
          subject: string
          system: string
          topic?: string | null
          updated_at?: string
        }
        Update: {
          board_yield?: Database["public"]["Enums"]["qbank_board_yield"]
          correct_answer_index?: number
          created_at?: string
          difficulty?: Database["public"]["Enums"]["qbank_difficulty"]
          explanation?: string
          explanation_image_url?: string | null
          first_aid_reference?: string | null
          id?: string
          is_active?: boolean
          keywords?: string[] | null
          options?: Json
          question_id?: string
          question_image_url?: string | null
          question_type?: string
          specialty_id?: string | null
          stem?: string
          subject?: string
          system?: string
          topic?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qbank_questions_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      qbank_test_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          current_question_index: number | null
          filters_applied: Json | null
          id: string
          mode: Database["public"]["Enums"]["qbank_mode"]
          question_count: number
          question_order: string[] | null
          score_percent: number | null
          started_at: string
          status: Database["public"]["Enums"]["qbank_session_status"]
          time_limit_minutes: number | null
          time_remaining_seconds: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_question_index?: number | null
          filters_applied?: Json | null
          id?: string
          mode?: Database["public"]["Enums"]["qbank_mode"]
          question_count?: number
          question_order?: string[] | null
          score_percent?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["qbank_session_status"]
          time_limit_minutes?: number | null
          time_remaining_seconds?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_question_index?: number | null
          filters_applied?: Json | null
          id?: string
          mode?: Database["public"]["Enums"]["qbank_mode"]
          question_count?: number
          question_order?: string[] | null
          score_percent?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["qbank_session_status"]
          time_limit_minutes?: number | null
          time_remaining_seconds?: number | null
          user_id?: string
        }
        Relationships: []
      }
      qbank_user_progress: {
        Row: {
          attempt_number: number
          confidence_level:
            | Database["public"]["Enums"]["qbank_confidence_level"]
            | null
          created_at: string
          highlights: Json | null
          id: string
          is_correct: boolean | null
          question_id: string
          selected_answer: number | null
          session_id: string | null
          strikethroughs: number[] | null
          time_spent_seconds: number | null
          user_id: string
          was_flagged: boolean | null
        }
        Insert: {
          attempt_number?: number
          confidence_level?:
            | Database["public"]["Enums"]["qbank_confidence_level"]
            | null
          created_at?: string
          highlights?: Json | null
          id?: string
          is_correct?: boolean | null
          question_id: string
          selected_answer?: number | null
          session_id?: string | null
          strikethroughs?: number[] | null
          time_spent_seconds?: number | null
          user_id: string
          was_flagged?: boolean | null
        }
        Update: {
          attempt_number?: number
          confidence_level?:
            | Database["public"]["Enums"]["qbank_confidence_level"]
            | null
          created_at?: string
          highlights?: Json | null
          id?: string
          is_correct?: boolean | null
          question_id?: string
          selected_answer?: number | null
          session_id?: string | null
          strikethroughs?: number[] | null
          time_spent_seconds?: number | null
          user_id?: string
          was_flagged?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "qbank_user_progress_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "qbank_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qbank_user_progress_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "qbank_test_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer_index: number
          created_at: string
          difficulty: string
          explanation: string
          id: string
          module_id: string
          options: Json
          question_image_url: string | null
          question_text: string
          sort_order: number
        }
        Insert: {
          correct_answer_index: number
          created_at?: string
          difficulty?: string
          explanation: string
          id?: string
          module_id: string
          options?: Json
          question_image_url?: string | null
          question_text: string
          sort_order?: number
        }
        Update: {
          correct_answer_index?: number
          created_at?: string
          difficulty?: string
          explanation?: string
          id?: string
          module_id?: string
          options?: Json
          question_image_url?: string | null
          question_text?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      rotation_case_notes: {
        Row: {
          assessment: string | null
          chief_complaint: string | null
          created_at: string
          id: string
          learning_points: string | null
          plan: string | null
          session_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment?: string | null
          chief_complaint?: string | null
          created_at?: string
          id?: string
          learning_points?: string | null
          plan?: string | null
          session_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment?: string | null
          chief_complaint?: string | null
          created_at?: string
          id?: string
          learning_points?: string | null
          plan?: string | null
          session_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rotation_case_notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "rotation_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rotation_case_notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "rotation_sessions_public"
            referencedColumns: ["id"]
          },
        ]
      }
      rotation_enrollments: {
        Row: {
          application_reason: string | null
          attendance_minutes: number | null
          attended: boolean | null
          credential_verified: boolean
          credential_verified_at: string | null
          credential_verified_by: string | null
          cv_url: string | null
          enrolled_at: string
          evaluation_score: number | null
          feedback: string | null
          id: string
          physician_comments: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          session_id: string
          status: string
          transcript_url: string | null
          user_id: string
        }
        Insert: {
          application_reason?: string | null
          attendance_minutes?: number | null
          attended?: boolean | null
          credential_verified?: boolean
          credential_verified_at?: string | null
          credential_verified_by?: string | null
          cv_url?: string | null
          enrolled_at?: string
          evaluation_score?: number | null
          feedback?: string | null
          id?: string
          physician_comments?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          session_id: string
          status?: string
          transcript_url?: string | null
          user_id: string
        }
        Update: {
          application_reason?: string | null
          attendance_minutes?: number | null
          attended?: boolean | null
          credential_verified?: boolean
          credential_verified_at?: string | null
          credential_verified_by?: string | null
          cv_url?: string | null
          enrolled_at?: string
          evaluation_score?: number | null
          feedback?: string | null
          id?: string
          physician_comments?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          session_id?: string
          status?: string
          transcript_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rotation_enrollments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "rotation_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rotation_enrollments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "rotation_sessions_public"
            referencedColumns: ["id"]
          },
        ]
      }
      rotation_sessions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          max_participants: number | null
          meeting_url: string | null
          physician_avatar_url: string | null
          physician_credentials: string | null
          physician_institution: string | null
          physician_name: string
          scheduled_end: string
          scheduled_start: string
          specialty_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          max_participants?: number | null
          meeting_url?: string | null
          physician_avatar_url?: string | null
          physician_credentials?: string | null
          physician_institution?: string | null
          physician_name: string
          scheduled_end: string
          scheduled_start: string
          specialty_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          max_participants?: number | null
          meeting_url?: string | null
          physician_avatar_url?: string | null
          physician_credentials?: string | null
          physician_institution?: string | null
          physician_name?: string
          scheduled_end?: string
          scheduled_start?: string
          specialty_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rotation_sessions_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      specialties: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      student_documents: {
        Row: {
          document_type: string
          file_name: string
          file_url: string
          id: string
          rejection_reason: string | null
          status: string
          uploaded_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          document_type: string
          file_name: string
          file_url: string
          id?: string
          rejection_reason?: string | null
          status?: string
          uploaded_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          document_type?: string
          file_name?: string
          file_url?: string
          id?: string
          rejection_reason?: string | null
          status?: string
          uploaded_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      study_plans: {
        Row: {
          created_at: string
          generated_from: Json | null
          id: string
          plan_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          generated_from?: Json | null
          id?: string
          plan_data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          generated_from?: Json | null
          id?: string
          plan_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_module_progress: {
        Row: {
          completed_at: string | null
          id: string
          last_accessed_at: string | null
          module_id: string
          progress_percent: number | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          last_accessed_at?: string | null
          module_id: string
          progress_percent?: number | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          last_accessed_at?: string | null
          module_id?: string
          progress_percent?: number | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_module_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      usmle_score_predictions: {
        Row: {
          confidence_interval: Json | null
          contributing_factors: Json | null
          created_at: string
          id: string
          match_probability: number | null
          pass_probability_step1: number | null
          pass_probability_step2: number | null
          predicted_step1_score: number | null
          predicted_step2_score: number | null
          prediction_date: string
          user_id: string
        }
        Insert: {
          confidence_interval?: Json | null
          contributing_factors?: Json | null
          created_at?: string
          id?: string
          match_probability?: number | null
          pass_probability_step1?: number | null
          pass_probability_step2?: number | null
          predicted_step1_score?: number | null
          predicted_step2_score?: number | null
          prediction_date?: string
          user_id: string
        }
        Update: {
          confidence_interval?: Json | null
          contributing_factors?: Json | null
          created_at?: string
          id?: string
          match_probability?: number | null
          pass_probability_step1?: number | null
          pass_probability_step2?: number | null
          predicted_step1_score?: number | null
          predicted_step2_score?: number | null
          prediction_date?: string
          user_id?: string
        }
        Relationships: []
      }
      virtual_classrooms: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          id: string
          instructor_id: string
          max_students: number
          meeting_url: string | null
          recording_url: string | null
          scheduled_end: string
          scheduled_start: string
          specialty_id: string | null
          status: string
          title: string
          topic_id: string | null
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          instructor_id: string
          max_students?: number
          meeting_url?: string | null
          recording_url?: string | null
          scheduled_end: string
          scheduled_start: string
          specialty_id?: string | null
          status?: string
          title: string
          topic_id?: string | null
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          instructor_id?: string
          max_students?: number
          meeting_url?: string | null
          recording_url?: string | null
          scheduled_end?: string
          scheduled_start?: string
          specialty_id?: string | null
          status?: string
          title?: string
          topic_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "virtual_classrooms_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "virtual_classrooms_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "virtual_classrooms_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "course_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      whiteboard_snapshots: {
        Row: {
          background_url: string | null
          classroom_id: string
          strokes: Json
          updated_at: string
        }
        Insert: {
          background_url?: string | null
          classroom_id: string
          strokes?: Json
          updated_at?: string
        }
        Update: {
          background_url?: string | null
          classroom_id?: string
          strokes?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whiteboard_snapshots_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: true
            referencedRelation: "virtual_classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      rotation_sessions_public: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          max_participants: number | null
          physician_avatar_url: string | null
          physician_credentials: string | null
          physician_institution: string | null
          physician_name: string | null
          scheduled_end: string | null
          scheduled_start: string | null
          specialty_id: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          max_participants?: number | null
          physician_avatar_url?: string | null
          physician_credentials?: string | null
          physician_institution?: string | null
          physician_name?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          specialty_id?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          max_participants?: number | null
          physician_avatar_url?: string | null
          physician_credentials?: string | null
          physician_institution?: string | null
          physician_name?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          specialty_id?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rotation_sessions_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      finalize_classroom_attendance: {
        Args: { _classroom_id: string; _min_seconds?: number }
        Returns: number
      }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_case_instructor: {
        Args: { _case_id: string; _user_id: string }
        Returns: boolean
      }
      is_case_participant: {
        Args: { _case_id: string; _user_id: string }
        Returns: boolean
      }
      is_classroom_enrolled: {
        Args: { _classroom_id: string; _user_id: string }
        Returns: boolean
      }
      is_classroom_instructor: {
        Args: { _classroom_id: string; _user_id: string }
        Returns: boolean
      }
      is_course_enrolled: {
        Args: { _course_id: string; _user_id: string }
        Returns: boolean
      }
      is_course_instructor: {
        Args: { _course_id: string; _user_id: string }
        Returns: boolean
      }
      list_rotation_sessions_public: {
        Args: never
        Returns: {
          created_at: string
          description: string
          id: string
          max_participants: number
          physician_avatar_url: string
          physician_credentials: string
          physician_institution: string
          physician_name: string
          scheduled_end: string
          scheduled_start: string
          specialty_id: string
          status: string
          title: string
          updated_at: string
        }[]
      }
      notify_course_enrollees: {
        Args: {
          _course_id: string
          _link: string
          _message: string
          _title: string
          _type: string
        }
        Returns: undefined
      }
      profile_self_update_safe: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "student"
        | "physician"
        | "faculty"
        | "institutional_admin"
        | "platform_admin"
      program_level: "pre_clinical" | "clinical" | "residency_prep" | "cme"
      qbank_board_yield: "low" | "medium" | "high"
      qbank_confidence_level: "guessing" | "unsure" | "confident"
      qbank_difficulty: "easy" | "medium" | "hard"
      qbank_flag_type: "review_later" | "difficult" | "bookmark"
      qbank_mode: "tutor" | "timed"
      qbank_session_status: "in_progress" | "completed" | "abandoned"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "student",
        "physician",
        "faculty",
        "institutional_admin",
        "platform_admin",
      ],
      program_level: ["pre_clinical", "clinical", "residency_prep", "cme"],
      qbank_board_yield: ["low", "medium", "high"],
      qbank_confidence_level: ["guessing", "unsure", "confident"],
      qbank_difficulty: ["easy", "medium", "hard"],
      qbank_flag_type: ["review_later", "difficult", "bookmark"],
      qbank_mode: ["tutor", "timed"],
      qbank_session_status: ["in_progress", "completed", "abandoned"],
    },
  },
} as const
