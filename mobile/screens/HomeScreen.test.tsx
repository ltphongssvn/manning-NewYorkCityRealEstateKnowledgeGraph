import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from './HomeScreen';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

describe('HomeScreen', () => {
  it('renders title', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('NYC Real Estate Knowledge Graph')).toBeTruthy();
  });
  it('renders all 4 nav buttons', () => {
    const { getByTestId } = render(<HomeScreen />);
    expect(getByTestId('nav-properties')).toBeTruthy();
    expect(getByTestId('nav-owners')).toBeTruthy();
    expect(getByTestId('nav-graph')).toBeTruthy();
    expect(getByTestId('nav-recommend')).toBeTruthy();
  });
  it('navigates to Properties on press', () => {
    const { getByTestId } = render(<HomeScreen />);
    fireEvent.press(getByTestId('nav-properties'));
    expect(mockNavigate).toHaveBeenCalledWith('Properties');
  });
  it('navigates to Owners on press', () => {
    const { getByTestId } = render(<HomeScreen />);
    fireEvent.press(getByTestId('nav-owners'));
    expect(mockNavigate).toHaveBeenCalledWith('Owners');
  });
});
