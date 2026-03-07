import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import GraphScreen from './GraphScreen';

jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ goBack: jest.fn() }) }));
global.fetch = jest.fn();

describe('GraphScreen', () => {
  it('renders title and input', () => {
    const { getByText, getByTestId } = render(<GraphScreen />);
    expect(getByText('Graph Explorer')).toBeTruthy();
    expect(getByTestId('bbl-input')).toBeTruthy();
  });
  it('shows nodes and edges on successful traverse', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        bbl: '1008350041',
        nodes: [
          { id: '1', labels: ['BBL'], properties: { bbl: '1008350041', address: '5 AVENUE' } },
          { id: '2', labels: ['OWNER'], properties: { name: 'ESRT EMPIRE STATE BUILDING, L.L.C.' } },
        ],
        edges: [{ id: '1', type: 'TAX_ASSESSOR_OWNER', start: '2', end: '1' }],
      }),
    });
    const { getByTestId, getByText } = render(<GraphScreen />);
    fireEvent.changeText(getByTestId('bbl-input'), '1008350041');
    fireEvent.press(getByTestId('traverse-btn'));
    await waitFor(() => expect(getByTestId('result')).toBeTruthy());
    expect(getByText('ESRT EMPIRE STATE BUILDING, L.L.C.')).toBeTruthy();
  });
  it('shows error on failed traverse', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    const { getByTestId } = render(<GraphScreen />);
    fireEvent.changeText(getByTestId('bbl-input'), 'bad');
    fireEvent.press(getByTestId('traverse-btn'));
    await waitFor(() => expect(getByTestId('error-msg')).toBeTruthy());
  });
  it('navigates back on press', () => {
    const goBack = jest.fn();
    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({ goBack });
    const { getByTestId } = render(<GraphScreen />);
    fireEvent.press(getByTestId('back-btn'));
    expect(goBack).toHaveBeenCalled();
  });
});
