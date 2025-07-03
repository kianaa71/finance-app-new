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
        console.log('Loading avatar for user:', userId);
        
        // Get all files in user's avatar folder
        const { data, error } = await supabase.storage
          .from('avatars')
          .list(userId, { limit: 10 });
          
        console.log('Avatar files found:', data, 'Error:', error);
          
        if (data && data.length > 0) {
          // Sort by updated_at to get the most recent file
          const sortedFiles = data.sort((a, b) => 
            new Date(b.updated_at || b.created_at).getTime() - 
            new Date(a.updated_at || a.created_at).getTime()
          );
          
          const filePath = `${userId}/${sortedFiles[0].name}`;
          console.log('Getting public URL for:', filePath);
          
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
            
          console.log('Avatar public URL:', publicUrl);
          setAvatarUrl(publicUrl);
        } else {
          console.log('No avatar files found for user:', userId);
          setAvatarUrl(null);
        }
      } catch (error) {
        console.error('Error loading avatar:', error);
        setAvatarUrl(null);
      } finally {
        setLoading(false);
      }
    };

    loadAvatar();
  }, [userId]);

  return { avatarUrl, loading };
};