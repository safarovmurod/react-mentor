import {defineConfig} from '@playwright/test';
import base from './playwright.config';
export default defineConfig({...base,testMatch:'auth.spec.ts',testIgnore:[],use:{...base.use,baseURL:'http://127.0.0.1:3101'},webServer:{command:'npm run dev -- --hostname 127.0.0.1 --port 3101',url:'http://127.0.0.1:3101/login',reuseExistingServer:false,timeout:120000,env:{AI_TUTOR_ENABLED:'false',NEXT_PUBLIC_SUPABASE_URL:'https://auth-test.supabase.co',NEXT_PUBLIC_SUPABASE_ANON_KEY:'public-test-placeholder-not-a-real-key',SUPABASE_SERVICE_ROLE_KEY:''}}});
