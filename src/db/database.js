import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

// prisma setup with supabase database
const databaseConnectionString = `${config.SUPABASE_DATABASE_URL}`;
const postgresAdapter = new PrismaPg({
    connectionString: databaseConnectionString,
});
const prisma = new PrismaClient({ adapter: postgresAdapter });

const connectDB = async () => {
    try {
        await prisma.$connect();
        logger.info('Connected to the database successfully.');
    } catch (error) {
        logger.error('Error connecting to the database:', error);
        process.exit(1); // Exit the process with an error code
    }
};

// ctrl+c dev quit
process.on('SIGINT', async () => {
    try {
        await prisma.$disconnect();
        logger.info('Disconnected from the database due to app termination.');
        process.exit(0);
    } catch (error) {
        logger.error('Error disconnecting from the database:', error);
        process.exit(1);
    }
});

// deployment shutdown
process.on('SIGTERM', async () => {
    try {
        await prisma.$disconnect();
        logger.info('Disconnected from the database due to SIGTERM.');
        process.exit(0);
    } catch (error) {
        logger.error('Error disconnecting from the database:', error);
        process.exit(1);
    }
});
export { prisma, connectDB };
