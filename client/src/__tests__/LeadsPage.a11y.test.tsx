import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import LeadsPage from '../pages/LeadsPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock leadsService to prevent real network calls
jest.mock('../services/leads', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn().mockResolvedValue({ leads: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } })
  }
}));

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={["/leads"]}>
        <Routes>
          <Route path="/leads" element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('LeadsPage accessibility', () => {
  it('has no detectable accessibility violations', async () => {
    const { container } = renderWithQuery(<LeadsPage />);
    // Wait for any loading states to settle
    await waitFor(() => expect(screen.getByText(/Lead list/i)).toBeInTheDocument());
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});
