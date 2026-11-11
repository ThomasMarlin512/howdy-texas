import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { createHandler } from './login-core.mjs';
const url=Deno.env.get('SUPABASE_URL')!;
const serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const options={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
Deno.serve(createHandler(createClient(url,serviceKey,options),()=>createClient(url,serviceKey,options)));
