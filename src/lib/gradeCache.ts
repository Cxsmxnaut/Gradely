import { supabase } from '@/lib/supabase';
import { Course } from '@/types';

export interface CachedGrades {
  id: string;
  gradely_user_id: string;
  linked_account_id?: string;
  cached_grades: Course[];
  last_sync_timestamp: string;
  created_at: string;
  updated_at: string;
}

export interface GradeCacheInput {
  gradely_user_id: string;
  linked_account_id?: string;
  cached_grades: Course[];
}

// Cache duration in milliseconds (5 minutes for fallback, but primary logic is login-based)
const CACHE_DURATION = 5 * 60 * 1000;

// Fallback localStorage keys (used when Supabase is not configured)
const FALLBACK_CACHE_KEY = 'gradely_fallback_cache';
const FALLBACK_TIMESTAMP_KEY = 'gradely_fallback_timestamp';

/**
 * Check if Supabase is properly configured
 */
function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return !!(url && key && 
         !url.includes('your-project-id') && 
         !key.includes('your-anon-key'));
}

/**
 * Save grades to cache for a user
 */
export async function cacheGradesForUser(input: GradeCacheInput): Promise<CachedGrades | null> {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase not configured, using localStorage fallback');
    return cacheGradesToFallback(input);
  }

  try {
    // First try to update existing record
    const { data: updateData, error: updateError } = await supabase
      .from('grade_cache')
      .update({
        linked_account_id: input.linked_account_id,
        cached_grades: input.cached_grades,
        last_sync_timestamp: new Date().toISOString(),
      })
      .eq('gradely_user_id', input.gradely_user_id)
      .select()
      .single();

    // If update succeeded, return the data
    if (!updateError && updateData) {
      return updateData;
    }

    // If update failed because record doesn't exist, insert new record
    if (updateError?.code === 'PGRST116') {
      const { data: insertData, error: insertError } = await supabase
        .from('grade_cache')
        .insert({
          gradely_user_id: input.gradely_user_id,
          linked_account_id: input.linked_account_id,
          cached_grades: input.cached_grades,
          last_sync_timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting cached grades:', insertError);
        // Fallback to localStorage if Supabase fails
        return cacheGradesToFallback(input);
      }

      return insertData;
    }

    // For any other update error, fallback to localStorage
    console.error('Error updating cached grades:', updateError);
    return cacheGradesToFallback(input);
  } catch (error) {
    console.error('Error in cacheGradesForUser:', error);
    // Fallback to localStorage if Supabase fails
    return cacheGradesToFallback(input);
  }
}

/**
 * Get cached grades for a user
 */
export async function getCachedGradesForUser(gradelyUserId: string): Promise<CachedGrades | null> {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase not configured, using localStorage fallback');
    return getCachedGradesFromFallback(gradelyUserId);
  }

  try {
    const { data, error } = await supabase
      .from('grade_cache')
      .select('*')
      .eq('gradely_user_id', gradelyUserId)
      .single();

    if (error) {
      // If no cached grades found, return null
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching cached grades:', error);
      // Fallback to localStorage if Supabase fails
      return getCachedGradesFromFallback(gradelyUserId);
    }

    return data;
  } catch (error) {
    console.error('Error in getCachedGradesForUser:', error);
    // Fallback to localStorage if Supabase fails
    return getCachedGradesFromFallback(gradelyUserId);
  }
}

/**
 * Check if cached grades are expired
 */
export function isCacheExpired(lastSyncTimestamp: string): boolean {
  const lastSync = new Date(lastSyncTimestamp);
  const now = new Date();
  return (now.getTime() - lastSync.getTime()) > CACHE_DURATION;
}

/**
 * Get cached grades if they exist (login-based caching, not time-based)
 */
export async function getValidCachedGrades(gradelyUserId: string): Promise<Course[] | null> {
  try {
    const cachedData = await getCachedGradesForUser(gradelyUserId);
    
    if (!cachedData) {
      return null;
    }

    // For login-based caching, we only check if cache exists
    // Cache is refreshed when user logs in with StudentVUE credentials
    console.log('Using cached grades from:', cachedData.last_sync_timestamp);
    return cachedData.cached_grades;
  } catch (error) {
    console.error('Error getting valid cached grades:', error);
    return null;
  }
}

/**
 * Check if we should refresh cache (only when user has StudentVUE credentials)
 */
export function shouldRefreshCache(hasCredentials: boolean, lastSyncTimestamp?: string): boolean {
  if (!hasCredentials) {
    return false; // Don't refresh if no credentials available
  }
  
  if (!lastSyncTimestamp) {
    return true; // No cache exists, fetch fresh data
  }
  
  // Only refresh if cache is older than 5 minutes AND user has credentials
  const lastSync = new Date(lastSyncTimestamp);
  const now = new Date();
  return (now.getTime() - lastSync.getTime()) > CACHE_DURATION;
}

/**
 * Delete cached grades for a user
 */
export async function deleteCachedGradesForUser(gradelyUserId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase not configured, using localStorage fallback');
    return deleteCachedGradesFromFallback(gradelyUserId);
  }

  try {
    const { error } = await supabase
      .from('grade_cache')
      .delete()
      .eq('gradely_user_id', gradelyUserId);

    if (error) {
      console.error('Error deleting cached grades:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteCachedGradesForUser:', error);
    return false;
  }
}

/**
 * Update the last sync timestamp without changing grades
 */
export async function updateCacheTimestamp(gradelyUserId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase not configured, using localStorage fallback');
    return updateCacheTimestampFallback(gradelyUserId);
  }

  try {
    const { error } = await supabase
      .from('grade_cache')
      .update({
        last_sync_timestamp: new Date().toISOString(),
      })
      .eq('gradely_user_id', gradelyUserId);

    if (error) {
      console.error('Error updating cache timestamp:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateCacheTimestamp:', error);
    return false;
  }
}

// ===== FALLBACK LOCALSTORAGE IMPLEMENTATIONS =====

/**
 * Fallback: Save grades to localStorage
 */
function cacheGradesToFallback(input: GradeCacheInput): CachedGrades | null {
  try {
    const cacheData = {
      gradely_user_id: input.gradely_user_id,
      linked_account_id: input.linked_account_id,
      cached_grades: input.cached_grades,
      last_sync_timestamp: new Date().toISOString(),
    };
    
    localStorage.setItem(FALLBACK_CACHE_KEY, JSON.stringify(cacheData));
    localStorage.setItem(FALLBACK_TIMESTAMP_KEY, Date.now().toString());
    
    return {
      ...cacheData,
      id: 'fallback',
      created_at: cacheData.last_sync_timestamp,
      updated_at: cacheData.last_sync_timestamp,
    };
  } catch (error) {
    console.error('Error in fallback cache:', error);
    return null;
  }
}

/**
 * Fallback: Get cached grades from localStorage
 */
function getCachedGradesFromFallback(gradelyUserId: string): CachedGrades | null {
  try {
    const cachedData = localStorage.getItem(FALLBACK_CACHE_KEY);
    if (!cachedData) return null;
    
    const parsed = JSON.parse(cachedData);
    if (parsed.gradely_user_id !== gradelyUserId) return null;
    
    return {
      ...parsed,
      id: 'fallback',
      created_at: parsed.last_sync_timestamp,
      updated_at: parsed.last_sync_timestamp,
    };
  } catch (error) {
    console.error('Error in fallback get:', error);
    return null;
  }
}

/**
 * Fallback: Delete cached grades from localStorage
 */
function deleteCachedGradesFromFallback(_gradelyUserId: string): boolean {
  try {
    localStorage.removeItem(FALLBACK_CACHE_KEY);
    localStorage.removeItem(FALLBACK_TIMESTAMP_KEY);
    return true;
  } catch (error) {
    console.error('Error in fallback delete:', error);
    return false;
  }
}

/**
 * Fallback: Update cache timestamp in localStorage
 */
function updateCacheTimestampFallback(_gradelyUserId: string): boolean {
  try {
    localStorage.setItem(FALLBACK_TIMESTAMP_KEY, Date.now().toString());
    return true;
  } catch (error) {
    console.error('Error in fallback timestamp update:', error);
    return false;
  }
}
