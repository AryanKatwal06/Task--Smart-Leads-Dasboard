import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import applySecurity from './middlewares/security';

dotenv.config();
import authRoute from './routes/v1/auth.route';
import leadRoute from './routes/v1/lead.route';
import errorHandler from './middlewares/errorHandler';
import v1HealthRoute from './routes/v1/health.route';
import savedFilterRoute from './routes/v1/savedFilter.route';
import bulkImportRoute from './routes/v1/bulkImport.route';

const app = express();

app.use(express.json());
app.use(cookieParser());

applySecurity(app);

app.get('/', (_req, res) => {
	res.json({ status: 'ok', service: 'smart-leads-dashboard-api' });
});

app.use('/api/v1', v1HealthRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/leads', leadRoute);
app.use('/api/v1/saved-filters', savedFilterRoute);
app.use('/api/v1/bulk-import', bulkImportRoute);

app.use(errorHandler);

export default app;