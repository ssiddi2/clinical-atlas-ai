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
          id: string
          institution: string | null
          last_name: string | null
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
          id?: string
          institution?: string | null
          last_name?: string | null
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
          id?: string
          institution?: string | null
          last_name?: string | null
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
        ]
      }
      rotation_enrollments: {
        Row: {
          attendance_minutes: number | null
          attended: boolean | null
          enrolled_at: string
          evaluation_score: number | null
          feedback: string | null
          id: string
          physician_comments: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          attendance_minutes?: number | null
          attended?: boolean | null
          enrolled_at?: string
          evaluation_score?: number | null
          feedback?: string | null
          id?: string
          physician_comments?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          attendance_minutes?: number | null
          attended?: boolean | null
          enrolled_at?: string
          evaluation_score?: number | null
          feedback?: string | null
          id?: string
          physician_comments?: string | null
          session_id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
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
