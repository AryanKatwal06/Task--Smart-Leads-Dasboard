import React from 'react';
import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
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

describe('LeadsPage API params', () => {
  beforeEach(() => jest.clearAllMocks());

  test('builds query params correctly from URL', async () => {
    (leadsService.getAll as jest.Mock).mockResolvedValue({ leads: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });

    const qc = new QueryClient();
    const initial = '/leads?status=New&source=Website&search=Alice&page=2&limit=20&sortBy=name&sortOrder=asc';
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={[initial]}>
          <Routes>
            <Route path="/leads" element={<LeadsPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => expect(leadsService.getAll).toHaveBeenCalled());

    const calledWith = (leadsService.getAll as jest.Mock).mock.calls[0][0];
    expect(calledWith.status).toBe('New');
    expect(calledWith.source).toBe('Website');
    expect(calledWith.search).toBe('Alice');
    expect(calledWith.page).toBe(2);
    expect(calledWith.limit).toBe(20);
    expect(calledWith.sortBy).toBe('name');
    expect(calledWith.sortOrder).toBe('asc');
  });
});
