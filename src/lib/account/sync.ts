import type { SupabaseClient } from '@supabase/supabase-js';
import { mergeProgress, progressSnapshot } from './progress';
import { useLearningStore } from '@/stores/learning-store';

export type SyncStatus = 'local'|'syncing'|'synced'|'offline'|'error';

/** A stopped coordinator never reads or updates the next account's store. */
export function startAccountSync(client: SupabaseClient, userId: string, status: (value:SyncStatus)=>void) {
  let stopped=false, busy=false, applying=false, revision=0, initialized=false;
  let lastSaved='', timer:ReturnType<typeof setTimeout>|undefined;
  async function sync() {
    if (stopped || busy) return;
    if (!navigator.onLine) {status('offline');return;}
    busy=true; status('syncing');
    try {
      // Read remote on each pass: handles concurrent devices without losing edits.
      const {data,error}=await client.from('react_mentor_progress').select('data,revision').eq('user_id',userId).maybeSingle();
      if (stopped) return;
      if (error) throw error;
      if (!initialized || data?.revision !== revision) {
        const remote=progressSnapshot(data?.data || {});
        const local=progressSnapshot(useLearningStore.getState());
        const merged=data ? mergeProgress(remote,local):local;
        applying=true; useLearningStore.setState(merged); applying=false;
        revision=data?.revision || 0; lastSaved=JSON.stringify(remote); initialized=true;
      }
      const snapshot=progressSnapshot(useLearningStore.getState());
      const serialized=JSON.stringify(snapshot);
      if (serialized!==lastSaved) {
        const {data:saved,error:writeError}=await client.rpc('react_mentor_save_progress',{expected_revision:revision,progress_data:snapshot});
        if (stopped) return;
        if (writeError?.code==='40001') {timer=setTimeout(sync,200);return;}
        if (writeError || !saved?.[0]) throw writeError || new Error('Missing sync response');
        revision=saved[0].revision;lastSaved=serialized;
      }
      status('synced');
    } catch {if (!stopped) status(navigator.onLine ? 'error':'offline');}
    finally {busy=false;}
  }
  const unsubscribe=useLearningStore.subscribe(()=>{
    if (stopped || applying) return;
    clearTimeout(timer);timer=setTimeout(sync,1500);
  });
  const interval=setInterval(sync,30000);
  const visible=()=>{if (!document.hidden) void sync();};
  window.addEventListener('online',sync);document.addEventListener('visibilitychange',visible);
  void sync();
  return {sync,stop(){stopped=true;clearTimeout(timer);clearInterval(interval);unsubscribe();window.removeEventListener('online',sync);document.removeEventListener('visibilitychange',visible);}};
}
