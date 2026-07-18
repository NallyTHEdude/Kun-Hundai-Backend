import { createClient } from '@supabase/supabase-js';
import { config } from './index.js';

// supabase setup
const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY);
const recoveryClient = createClient(config.SUPABASE_URL,config.SUPABASE_ANON_KEY,);
export { supabase, recoveryClient };
