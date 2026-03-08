import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import OwnersScreen from './OwnersScreen';

jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ goBack: jest.fn() }) }));
global.fetch = jest.fn();

describe('OwnersScreen', () => {
  it('renders title and input', () => {
    const { getByText, getByTestId } = render(<OwnersScreen />);
    expect(getByText('Owner Search')).toBeTruthy();
    expect(getByTestId('owner-input')).toBeTruthy();
  });
  it('shows properties on successful fetch', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ name: 'ESRT EMPIRE STATE BUILDING, L.L.C.', properties: [{ bbl: '1008350041', address: '5 AVENUE', relationship: 'TAX_ASSESSOR_OWNER' }] }),
    });
    const { getByTestId, getByText } = render(<OwnersScreen />);
    fireEvent.changeText(getByTestId('owner-input'), 'ESRT EMPIRE STATE BUILDING, L.L.C.');
    fireEvent.press(getByTestId('search-btn'));
    await waitFor(() => expect(getByTestId('result')).toBeTruthy());
    expect(getByText('1008350041')).toBeTruthy();
  });
  it('shows error on failed fetch', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    const { getByTestId } = render(<OwnersScreen />);
    fireEvent.changeText(getByTestId('owner-input'), 'UNKNOWN');
    fireEvent.press(getByTestId('search-btn'));
    await waitFor(() => expect(getByTestId('error-msg')).toBeTruthy());
  });
  it('navigates back on press', () => {
    const goBack = jest.fn();
    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({ goBack });
    const { getByTestId } = render(<OwnersScreen />);
    fireEvent.press(getByTestId('back-btn'));
    expect(goBack).toHaveBeenCalled();
  });
});
