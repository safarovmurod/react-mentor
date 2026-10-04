import { localDb } from './dexie-db';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type {
  UserProfile,
  ResumeSession,
  StudyEvent,
  NoteItem,
  DataMode,
} from '@/types';

/**
 * Unified Repository managing Local (IndexedDB) and Global (Supabase) data isolation
 */
export class MentorRepository {
  /**
   * Records a study event with idempotency protection
   */
  static async recordEvent(event: StudyEvent, mode: DataMode): Promise<void> {
    // 1. Always record in local IndexedDB for immediate offline availability
    const existing = await localDb.events
      .where('idempotencyKey')
      .equals(event.idempotencyKey)
      .first();

    if (!existing) {
      await localDb.events.put(event);
    }

    // 2. If Global mode, write to Supabase or queue if offline
    if (mode === 'global') {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          const { error } = await supabase.from('study_events').insert({
            id: event.id,
            workspace_id: event.workspaceId,
            user_id: event.userId,
            device_id: event.deviceId || null,
            source_id: event.sourceId || null,
            topic_id: event.topicId || null,
            lesson_id: event.lessonId || null,
            task_id: event.taskId || null,
            event_type: event.eventType,
            score: event.score ?? null,
            correct: event.correct ?? null,
            duration_seconds: event.durationSeconds,
            idempotency_key: event.idempotencyKey,
            created_at: event.createdAt,
          });

          if (error && error.code !== '23505') {
            // Queue for retry if not unique constraint
            await localDb.syncQueue.put({
              id: `evt_${event.idempotencyKey}`,
              action: 'insert_event',
              payload: event,
              createdAt: new Date().toISOString(),
              retryCount: 0,
            });
          }
        } catch {
          await localDb.syncQueue.put({
            id: `evt_${event.idempotencyKey}`,
            action: 'insert_event',
            payload: event,
            createdAt: new Date().toISOString(),
            retryCount: 0,
          });
        }
      }
    }
  }

  /**
   * Fetches all recorded events
   */
  static async getEvents(workspaceId: string, mode: DataMode): Promise<StudyEvent[]> {
    if (mode === 'global') {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('study_events')
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('created_at', { ascending: true });

        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            workspaceId: d.workspace_id,
            userId: d.user_id,
            deviceId: d.device_id,
            sourceId: d.source_id,
            topicId: d.topic_id,
            lessonId: d.lesson_id,
            taskId: d.task_id,
            eventType: d.event_type,
            score: d.score,
            correct: d.correct,
            durationSeconds: d.duration_seconds,
            idempotencyKey: d.idempotency_key,
            createdAt: d.created_at,
          }));
        }
      }
    }

    // Default to local Dexie
    return await localDb.events.toArray();
  }

  /**
   * Profile storage
   */
  static async getProfile(): Promise<UserProfile | null> {
    const list = await localDb.profiles.toArray();
    return list[0] || null;
  }

  static async saveProfile(profile: UserProfile): Promise<void> {
    await localDb.profiles.put(profile);
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.from('profiles').upsert({
        id: profile.id,
        user_id: profile.userId,
        workspace_id: profile.workspaceId,
        display_name: profile.displayName,
        daily_time_minutes: profile.dailyTimeMinutes,
        updated_at: new Date().toISOString(),
      });
    }
  }

  /**
   * Resume session storage
   */
  static async getResumeSession(): Promise<ResumeSession | null> {
    const rec = await localDb.sessions.get('current_session');
    return rec || null;
  }

  static async saveResumeSession(session: ResumeSession): Promise<void> {
    await localDb.sessions.put({ ...session, id: 'current_session' });
  }

  /**
   * Notes storage
   */
  static async getNotes(workspaceId: string, mode: DataMode): Promise<NoteItem[]> {
    if (mode === 'global') {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('updated_at', { ascending: false });

        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            workspaceId: d.workspace_id,
            userId: d.user_id,
            topicId: d.topic_id,
            title: d.title,
            content: d.content,
            updatedAt: d.updated_at,
            createdAt: d.created_at,
          }));
        }
      }
    }
    return await localDb.notes.toArray();
  }

  static async saveNote(note: NoteItem, mode: DataMode): Promise<void> {
    await localDb.notes.put(note);
    if (mode === 'global') {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        await supabase.from('notes').upsert({
          id: note.id,
          workspace_id: note.workspaceId,
          user_id: note.userId,
          topic_id: note.topicId || null,
          title: note.title,
          content: note.content,
          updated_at: note.updatedAt,
          created_at: note.createdAt,
        });
      }
    }
  }

  static async deleteNote(id: string, mode: DataMode): Promise<void> {
    await localDb.notes.delete(id);
    if (mode === 'global') {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        await supabase.from('notes').delete().eq('id', id);
      }
    }
  }

  /**
   * Idempotent migration from Local to Global
   * Merges without duplicate events, duplicate XP, or repeated completions
   */
  static async migrateLocalToGlobal(workspaceId: string, userId: string): Promise<{ migratedCount: number }> {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      throw new Error('Supabase танзим нашудааст');
    }

    const localEvents = await localDb.events.toArray();
    let migratedCount = 0;

    for (const evt of localEvents) {
      const { error } = await supabase.from('study_events').upsert(
        {
          id: evt.id,
          workspace_id: workspaceId,
          user_id: userId,
          device_id: evt.deviceId || null,
          source_id: evt.sourceId || null,
          topic_id: evt.topicId || null,
          lesson_id: evt.lessonId || null,
          task_id: evt.taskId || null,
          event_type: evt.eventType,
          score: evt.score ?? null,
          correct: evt.correct ?? null,
          duration_seconds: evt.durationSeconds,
          idempotency_key: evt.idempotencyKey,
          created_at: evt.createdAt,
        },
        { onConflict: 'idempotency_key' }
      );

      if (!error) {
        migratedCount++;
      }
    }

    return { migratedCount };
  }
}
