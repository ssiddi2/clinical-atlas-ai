import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type MembershipTier = 'learner' | 'clinical';

export interface FeatureAccess {
  tier: MembershipTier;
  loading: boolean;
  // Features available to all tiers
  canAccessCurriculum: boolean;
  canAccessAssessments: boolean;
  canAccessAtlas: boolean;
  canAccessScorePredictor: boolean;
  // Features requiring clinical tier
  canAccessVirtualRounds: boolean;
  canAccessRotationExperience: boolean;
  canAccessResidencyPrep: boolean;
  canRequestLOR: boolean;
  // Atlas limitations
  atlasMessageLimit: number | null; // null = unlimited
}

const LEARNER_ATLAS_LIMIT = 5; // Messages per day

export function useFeatureAccess(userId: string | null) {
  const [tier, setTier] = useState<MembershipTier>('learner');
  const [loading, setLoading] = useState(true);

  const fetchTier = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('membership_tier')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching membership tier:', error);
        setTier('learner');
      } else {
        setTier((data?.membership_tier as MembershipTier) || 'learner');
      }
    } catch (error) {
      console.error('Error fetching membership tier:', error);
      setTier('learner');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTier();
  }, [fetchTier]);

  const isClinical = tier === 'clinical';

  const access: FeatureAccess = {
    tier,
    loading,
    // All users can access
    canAccessCurriculum: true,
    canAccessAssessments: true,
    canAccessAtlas: true,
    canAccessScorePredictor: true,
    // Clinical tier only
    canAccessVirtualRounds: isClinical,
    canAccessRotationExperience: isClinical,
    canAccessResidencyPrep: isClinical,
    canRequestLOR: isClinical,
    // Atlas limitations
    atlasMessageLimit: isClinical ? null : LEARNER_ATLAS_LIMIT,
  };

  return access;
}

// Helper component for feature gating UI
export function getUpgradeMessage(feature: string): string {
  const messages: Record<string, string> = {
    virtualRounds: 'Live Virtual Rounds with US physicians require Clinical tier access.',
    rotationExperience: 'Virtual rotation experiences require Clinical tier access.',
    residencyPrep: 'Full residency readiness program requires Clinical tier access.',
    lor: 'Letter of recommendation support requires Clinical tier access.',
    atlasUnlimited: 'Unlimited ATLAS™ conversations require Clinical tier access.',
  };
  return messages[feature] || 'This feature requires Clinical tier access.';
}
