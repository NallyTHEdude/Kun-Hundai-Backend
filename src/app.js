import express from 'express';
import cors from 'cors';
import { errorHandler } from './utils/global-error-handler.js';
import helmet from 'helmet';
import { ApiError } from './utils/api-error.js';
import { config } from './config/index.js';

const app = express();

app.use(helmet());
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));
app.use(
    express.urlencoded({
        extended: true,
        limit: '1mb',
    }),
);

app.use(
    cors({
        origin:
            config.CORS_ORIGIN?.split(',') ||
            `${config.BASE_URL}:${config.PORT}`,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }),
);

// ---------- Routers setup ----------
import healthCheckRouter from './routes/healthCheck.routes.js';
import authRouter from './routes/auth.routes.js';
import vehicleServiceRouter from './routes/serviceVisit.routes.js';

//routes
app.use('/api/health', healthCheckRouter);
app.use('/api/auth', authRouter);
app.use('/api/vehicleService', vehicleServiceRouter);

// BASE route
app.get('/', (req, res) => {
    res.send('Welcome to KUN HUNDAI BACKEND API');
});

//Non-existing routes
app.use((req, res, next) => {
    return next(
        new ApiError(
            404,
            `Cannot ${req.method} ${req.originalUrl} as endpoint does not exist!!!`,
        ),
    );
});

app.use(errorHandler);

export default app;
