import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useSeedDemoData() {
  const [isSeeding, setIsSeeding] = useState(false);

  const seedDemoData = async (userId: string) => {
    if (!userId) {
      toast.error('No user ID provided');
      return false;
    }

    setIsSeeding(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('seed-demo-data', {
        body: { userId },
      });

      if (error) {
        console.error('Seed error:', error);
        toast.error('Failed to seed demo data');
        return false;
      }

      toast.success(`Demo data seeded successfully! ${data.seeded?.assessmentAttempts || 0} assessments, ${data.seeded?.scorePredictions || 0} score predictions created.`);
      return true;
    } catch (err) {
      console.error('Seed error:', err);
      toast.error('Failed to seed demo data');
      return false;
    } finally {
      setIsSeeding(false);
    }
  };

  return { seedDemoData, isSeeding };
}
