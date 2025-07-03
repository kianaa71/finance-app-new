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
        const { data } = await supabase.storage
          .from('avatars')
          .list(userId, { limit: 1 });
          
        if (data && data.length > 0) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(`${userId}/${data[0].name}`);
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