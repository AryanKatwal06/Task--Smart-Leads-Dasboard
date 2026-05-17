import dotenv from 'dotenv';
import type { Server } from 'http';
import { connectDB, disconnectDB } from './config/db';
import { logger } from './utils/logger';
import app from './app';
import { initEmailService } from './utils/email';
import validateEnv from './config/env';

let server: Server | undefined;

async function start() {
	try {
		// Load env at runtime (avoid validating during install/build steps)
		dotenv.config();
		// log the active MONGO_URI early so we can verify which DB the container uses
		console.log('ACTIVE_MONGO_URI:', process.env.MONGO_URI);

		const env = validateEnv(process.env);
		const PORT = Number(env.PORT) || 5000;

		const uri = env.MONGO_URI;
		await connectDB(uri);

		await initEmailService();

		server = app.listen(PORT, () => logger.info(`Server listening on ${PORT}`));

		if (process.env.ENABLE_SCHEDULER === 'true' || env.ENABLE_SCHEDULER === 'true') {
			const { default: startExportScheduler } = await import('./jobs/exportScheduler');
			startExportScheduler();
		}
	} catch (err) {
		logger.error('Failed to start server', err);
		await shutdown(1);
	}
}

async function shutdown(code = 0) {
	try {
		logger.info('Shutting down server');
		const currentServer = server;
		if (currentServer && typeof currentServer.close === 'function') {
			await new Promise<void>((resolve) => currentServer.close(() => resolve()));
		}
		await disconnectDB();
	} catch (err) {
		logger.error('Error during shutdown', err);
	} finally {
		process.exit(code);
	}
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

start();