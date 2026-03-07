import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RecommendScreen from './RecommendScreen';

jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ goBack: jest.fn() }) }));
global.fetch = jest.fn();

describe('RecommendScreen', () => {
  it('renders title and input', () => {
    const { getByText, getByTestId } = render(<RecommendScreen />);
    expect(getByText('Similar Property Recommendations')).toBeTruthy();
    expect(getByTestId('bbl-input')).toBeTruthy();
  });
  it('shows ranked recommendations on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        bbl: '1008350041',
        recommendations: [
          { bbl: '1008597501', distance: 0.2755 },
          { bbl: '1010431132', distance: 0.2866 },
        ],
      }),
    });
    const { getByTestId, getByText } = render(<RecommendScreen />);
    fireEvent.changeText(getByTestId('bbl-input'), '1008350041');
    fireEvent.press(getByTestId('recommend-btn'));
    await waitFor(() => expect(getByTestId('result')).toBeTruthy());
    expect(getByText('1008597501')).toBeTruthy();
  });
  it('shows error on failed fetch', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    const { getByTestId } = render(<RecommendScreen />);
    fireEvent.changeText(getByTestId('bbl-input'), 'bad');
    fireEvent.press(getByTestId('recommend-btn'));
    await waitFor(() => expect(getByTestId('error-msg')).toBeTruthy());
  });
  it('navigates back on press', () => {
    const goBack = jest.fn();
    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({ goBack });
    const { getByTestId } = render(<RecommendScreen />);
    fireEvent.press(getByTestId('back-btn'));
    expect(goBack).toHaveBeenCalled();
  });
});
