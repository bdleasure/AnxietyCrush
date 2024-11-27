import { LogBox } from 'react-native';
import { ExpoRoot } from 'expo-router';

LogBox.ignoreLogs([
  'Warning: Failed prop type',
  'Non-serializable values were found in the navigation state',
]);

export default function App() {
  return <ExpoRoot context={require.context('./app')} />;
}
