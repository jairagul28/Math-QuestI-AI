import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { usersAPI } from '../services/api';

export function useAvatarRewards() {
  const { isAuthenticated } = useAuth();
  const [avatarRewards, setAvatarRewards] = useState(null);

  useEffect(() => {
    let active = true;
    if (!isAuthenticated) {
      setAvatarRewards(null);
      return undefined;
    }

    usersAPI.getAvatarRewards()
      .then((response) => {
        if (active) setAvatarRewards(response.data.data);
      })
      .catch((error) => {
        console.error('[useAvatarRewards] Could not load avatar rewards:', error);
      });

    const onEquipped = (event) => setAvatarRewards(event.detail);
    window.addEventListener('mq:avatar-equipped', onEquipped);
    return () => {
      active = false;
      window.removeEventListener('mq:avatar-equipped', onEquipped);
    };
  }, [isAuthenticated]);

  return avatarRewards;
}
