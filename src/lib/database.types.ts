export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Language = 'fr' | 'en';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type Goal =
  | 'weight_loss'
  | 'strength'
  | 'flexibility'
  | 'posture'
  | 'rehabilitation'
  | 'relaxation';
export type FocusArea = 'core' | 'legs' | 'arms' | 'back' | 'full_body';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          avatar_url: string | null;
          language: Language;
          date_of_birth: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          language?: Language;
          date_of_birth?: string | null;
        };
        Update: {
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          language?: Language;
          date_of_birth?: string | null;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          user_id: string;
          goals: Goal[];
          experience_level: Difficulty | null;
          weekly_frequency: number;
          focus_areas: FocusArea[];
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          goals?: Goal[];
          experience_level?: Difficulty | null;
          weekly_frequency?: number;
          focus_areas?: FocusArea[];
          onboarding_completed?: boolean;
        };
        Update: {
          goals?: Goal[];
          experience_level?: Difficulty | null;
          weekly_frequency?: number;
          focus_areas?: FocusArea[];
          onboarding_completed?: boolean;
          updated_at?: string;
        };
      };
      measurements: {
        Row: {
          id: string;
          user_id: string;
          measured_at: string;
          weight_kg: number | null;
          waist_cm: number | null;
          hips_cm: number | null;
          chest_cm: number | null;
          thigh_cm: number | null;
          arm_cm: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          measured_at?: string;
          weight_kg?: number | null;
          waist_cm?: number | null;
          hips_cm?: number | null;
          chest_cm?: number | null;
          thigh_cm?: number | null;
          arm_cm?: number | null;
          notes?: string | null;
        };
        Update: {
          measured_at?: string;
          weight_kg?: number | null;
          waist_cm?: number | null;
          hips_cm?: number | null;
          chest_cm?: number | null;
          thigh_cm?: number | null;
          arm_cm?: number | null;
          notes?: string | null;
        };
      };
      workouts: {
        Row: {
          id: string;
          slug: string;
          name_fr: string;
          name_en: string;
          description_fr: string | null;
          description_en: string | null;
          duration_minutes: number;
          difficulty: Difficulty;
          category: string | null;
          estimated_calories: number | null;
          thumbnail_url: string | null;
          video_url: string | null;
          is_premium: boolean;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_fr: string;
          name_en: string;
          description_fr?: string | null;
          description_en?: string | null;
          duration_minutes: number;
          difficulty: Difficulty;
          category?: string | null;
          estimated_calories?: number | null;
          thumbnail_url?: string | null;
          video_url?: string | null;
          is_premium?: boolean;
          is_published?: boolean;
        };
        Update: {
          slug?: string;
          name_fr?: string;
          name_en?: string;
          description_fr?: string | null;
          description_en?: string | null;
          duration_minutes?: number;
          difficulty?: Difficulty;
          category?: string | null;
          estimated_calories?: number | null;
          thumbnail_url?: string | null;
          video_url?: string | null;
          is_premium?: boolean;
          is_published?: boolean;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          workout_id: string | null;
          completed_at: string;
          duration_minutes: number | null;
          calories_burned: number | null;
          notes: string | null;
          rating: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workout_id?: string | null;
          completed_at?: string;
          duration_minutes?: number | null;
          calories_burned?: number | null;
          notes?: string | null;
          rating?: number | null;
        };
        Update: {
          workout_id?: string | null;
          completed_at?: string;
          duration_minutes?: number | null;
          calories_burned?: number | null;
          notes?: string | null;
          rating?: number | null;
        };
      };
      favorites: {
        Row: { user_id: string; workout_id: string; created_at: string };
        Insert: { user_id: string; workout_id: string; created_at?: string };
        Update: Record<string, never>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Shorthand helpers
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Insertable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type Updatable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Profile        = Tables<'profiles'>;
export type UserPrefs      = Tables<'user_preferences'>;
export type Measurement    = Tables<'measurements'>;
export type Workout        = Tables<'workouts'>;
export type WorkoutSession = Tables<'sessions'>;
export type Favorite       = Tables<'favorites'>;
