import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import SavedFilterService from '../services/savedFilter.service';

export const createSavedFilter = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id as string | undefined;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const filter = await SavedFilterService.createFilter(userId, req.body);
  res.status(201).json({ filter });
});

export const getSavedFilters = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id as string | undefined;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const filters = await SavedFilterService.getFilters(userId);
  res.json({ filters });
});

export const getSavedFilterById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id as string | undefined;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const filter = await SavedFilterService.getFilterById(req.params.id, userId);
  res.json({ filter });
});

export const updateSavedFilter = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id as string | undefined;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const filter = await SavedFilterService.updateFilter(req.params.id, userId, req.body);
  res.json({ filter });
});

export const deleteSavedFilter = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id as string | undefined;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  await SavedFilterService.deleteFilter(req.params.id, userId);
  res.status(204).send();
});
