import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserAvatar = (userId: string | undefined) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadAvatar = async () => {
      try {
        // First try to get files from user's folder
        const { data } = await supabase.storage
          .from('avatars')
          .list(userId, { limit: 10 });
          
        if (data && data.length > 0) {
          // Sort by updated_at to get the most recent file
          const sortedFiles = data.sort((a, b) => 
            new Date(b.updated_at || b.created_at).getTime() - 
            new Date(a.updated_at || a.created_at).getTime()
          );
          
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(`${userId}/${sortedFiles[0].name}`);
          setAvatarUrl(publicUrl);
        }
      } catch (error) {
        console.error('Error loading avatar:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAvatar();
  }, [userId]);

  return { avatarUrl, loading };
};