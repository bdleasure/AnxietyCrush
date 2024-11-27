import { useRouter } from 'expo-router';
import { UpgradeScreen } from './UpgradeScreen';

export const UpgradeScreenWrapper = () => {
  const router = useRouter();
  
  // Create a navigation prop that matches what UpgradeScreen expects
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

  return <UpgradeScreen navigation={navigation} />;
}
