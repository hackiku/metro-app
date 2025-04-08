import { createClient } from '@supabase/supabase-js';
import { env } from '~/env';

// Create a single supabase client for interacting with your database
export const supabase = createClient(
	env.NEXT_PUBLIC_SUPABASE_URL,
	env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// You can use this client specifically for the gasunie schema
export const gasunieClient = createClient(
	env.NEXT_PUBLIC_SUPABASE_URL,
	env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
	{ db: { schema: 'gasunie' } }
);