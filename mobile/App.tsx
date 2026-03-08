import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import PropertiesScreen from './screens/PropertiesScreen';
import OwnersScreen from './screens/OwnersScreen';
import GraphScreen from './screens/GraphScreen';
import RecommendScreen from './screens/RecommendScreen';

export type RootStackParamList = {
  Home: undefined;
  Properties: undefined;
  Owners: undefined;
  Graph: undefined;
  Recommend: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Properties" component={PropertiesScreen} />
        <Stack.Screen name="Owners" component={OwnersScreen} />
        <Stack.Screen name="Graph" component={GraphScreen} />
        <Stack.Screen name="Recommend" component={RecommendScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
