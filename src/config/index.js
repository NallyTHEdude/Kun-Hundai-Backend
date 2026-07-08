import dotenv from 'dotenv';

// configuring dotenv
dotenv.config({
    path: '.env',
});

const config = {
    NODE_ENV: process.env.NODE_ENV || 'dev',
    BASE_URL: process.env.BASE_URL || 'localhost',
    PORT: process.env.PORT || 3000,
    CORS_ORIGIN: process.env.CORS_ORIGIN,


    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_DATABASE_URL: process.env.SUPABASE_DATABASE_URL,
};

export { config };
