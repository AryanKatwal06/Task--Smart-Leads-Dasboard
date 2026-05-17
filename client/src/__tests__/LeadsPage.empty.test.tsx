import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('../services/leads', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn()
  }
}));

import leadsService from '../services/leads';
import LeadsPage from '../pages/LeadsPage';

describe('LeadsPage empty state', () => {
  beforeEach(() => jest.clearAllMocks());

  test('hides pagination when no results', async () => {
    (leadsService.getAll as jest.Mock).mockResolvedValue({ leads: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });

    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={["/leads"]}>
          <Routes>
            <Route path="/leads" element={<LeadsPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => expect(leadsService.getAll).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText('No leads found yet.')).toBeInTheDocument());
    // pagination text 'Page' should not be present
    expect(screen.queryByText(/Page\s+/)).not.toBeInTheDocument();
  });
});
