import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('../services/leads', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn()
  }
}));

jest.mock('../services/filters', () => ({
  __esModule: true,
  savedFiltersService: {
    getAll: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    delete: jest.fn()
  }
}));

import leadsService from '../services/leads';
import LeadsPage from '../pages/LeadsPage';

describe('LeadsPage', () => {
  beforeEach(() => jest.clearAllMocks());

  test('renders list and responds to search input', async () => {
    (leadsService.getAll as jest.Mock).mockResolvedValue({
      leads: [
        { _id: '1', name: 'Alice', email: 'a@example.com', status: 'New', source: 'Website', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 }
    });

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
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());

    // type into search and ensure getAll is called again via URL change
    const input = screen.getByPlaceholderText('Search name or email');
    await act(async () => {
      await userEvent.type(input, 'Alice');
    });
    await waitFor(() => expect(leadsService.getAll).toHaveBeenCalled());
  });
});
