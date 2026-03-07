import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PropertiesScreen from './PropertiesScreen';

jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ goBack: jest.fn() }) }));
global.fetch = jest.fn();

describe('PropertiesScreen', () => {
  it('renders title and input', () => {
    const { getByText, getByTestId } = render(<PropertiesScreen />);
    expect(getByText('Property Search')).toBeTruthy();
    expect(getByTestId('bbl-input')).toBeTruthy();
  });
  it('shows result with address and owner on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ bbl: '1008350041', address: '5 AVENUE', owners: [{ name: 'ESRT EMPIRE STATE BUILDING, L.L.C.', relationship: 'TAX_ASSESSOR_OWNER' }] }),
    });
    const { getByTestId, getByText } = render(<PropertiesScreen />);
    fireEvent.changeText(getByTestId('bbl-input'), '1008350041');
    fireEvent.press(getByTestId('search-btn'));
    await waitFor(() => expect(getByTestId('result')).toBeTruthy());
    expect(getByText('ESRT EMPIRE STATE BUILDING, L.L.C.')).toBeTruthy();
  });
  it('shows error on failed fetch', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    const { getByTestId } = render(<PropertiesScreen />);
    fireEvent.changeText(getByTestId('bbl-input'), 'bad');
    fireEvent.press(getByTestId('search-btn'));
    await waitFor(() => expect(getByTestId('error-msg')).toBeTruthy());
  });
  it('navigates back on back button press', () => {
    const goBack = jest.fn();
    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({ goBack });
    const { getByTestId } = render(<PropertiesScreen />);
    fireEvent.press(getByTestId('back-btn'));
    expect(goBack).toHaveBeenCalled();
  });
});
