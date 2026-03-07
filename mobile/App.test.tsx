import React from 'react';
import { render } from '@testing-library/react-native';
import App from './App';

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: any) => children,
}));
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: () => null,
  }),
}));
jest.mock('./screens/HomeScreen', () => () => null);
jest.mock('./screens/PropertiesScreen', () => () => null);
jest.mock('./screens/OwnersScreen', () => () => null);
jest.mock('./screens/GraphScreen', () => () => null);
jest.mock('./screens/RecommendScreen', () => () => null);

describe('App', () => {
  it('renders without crashing', () => {
    expect(() => render(<App />)).not.toThrow();
  });
});
