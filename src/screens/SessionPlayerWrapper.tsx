import { useRouter, usePathname } from 'expo-router';
import { useEffect, useCallback } from 'react';
import SessionPlayer from './SessionPlayer';

export default function SessionPlayerWrapper() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Create a navigation prop that matches what SessionPlayer expects
  const navigation = {
    navigate: (name: string, params?: any) => router.push(name as any),
    goBack: () => router.back(),
    addListener: (event: string, callback: () => void) => {
      if (event === 'focus') {
        // Call the callback immediately since we're already focused
        callback();
        
        // Return a dummy unsubscribe function
        return () => {};
      }
      return () => {};
    }
  };

  return <SessionPlayer navigation={navigation} />;
}
