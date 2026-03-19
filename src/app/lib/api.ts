import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const BASE_URL = `${supabaseUrl}/functions/v1/make-server-bf6aba98`;

// Singleton Supabase client for auth
let _supabase: ReturnType<typeof createClient> | null = null;
export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(supabaseUrl, publicAnonKey);
  }
  return _supabase;
}

// Get current access token (refreshes if expired)
async function getAccessToken(): Promise<string | null> {
  const supabase = getSupabase();
  const { data } = await supabase.auth.getSession();
  const session = data?.session;
  if (!session) return null;

  // Check if token is expired or about to expire (within 30s)
  try {
    const payload = JSON.parse(atob(session.access_token.split(".")[1]));
    const expiresAt = payload.exp * 1000;
    if (Date.now() >= expiresAt - 30000) {
      // Token expired or expiring soon — refresh it
      const { data: refreshData, error } = await supabase.auth.refreshSession();
      if (error || !refreshData.session) {
        console.warn("Session refresh failed:", error?.message);
        return null;
      }
      return refreshData.session.access_token;
    }
  } catch {
    // If we can't parse the token, try refreshing
    const { data: refreshData } = await supabase.auth.refreshSession();
    return refreshData.session?.access_token || null;
  }

  return session.access_token;
}

// API helper — public routes always use the anon key
async function apiFetch(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${publicAnonKey}`,
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    console.error(`API error [${res.status}] ${path}:`, err);
    const message = err.error || (err.errors ? err.errors.join("; ") : null) || `Request failed: ${res.status}`;
    throw new Error(message);
  }
  return res.json();
}

// Authenticated API helper (requires login)
// Always sends publicAnonKey in Authorization (for the Supabase gateway),
// and the user's access token in X-Auth-Token (for our server's requireAuth).
async function authFetch(path: string, options: RequestInit = {}) {
  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated");
  return apiFetch(path, {
    ...options,
    headers: {
      ...(options.headers as Record<string, string> || {}),
      "X-Auth-Token": token,
    },
  });
}

// ─── Auth ────────────────────────────────────────────────────────────────
export async function signUp(name: string, email: string, password: string) {
  const result = await apiFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  // Set the session in Supabase client
  if (result.session) {
    const supabase = getSupabase();
    await supabase.auth.setSession({
      access_token: result.session.access_token,
      refresh_token: result.session.refresh_token,
    });
  }
  return result;
}

export async function signIn(email: string, password: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Sign in failed: ${error.message}`);
  return { user: data.user, session: data.session };
}

export async function signOut() {
  const supabase = getSupabase();
  await supabase.auth.signOut();
}

export async function getSession() {
  const supabase = getSupabase();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ─── Seed ────────────────────────────────────────────────────────────────
export async function checkSeeded(): Promise<boolean> {
  const result = await apiFetch("/seed/status");
  return result.seeded;
}

export async function seedData(data: any) {
  return authFetch("/seed", { method: "POST", body: JSON.stringify(data) });
}

// ─── Stories ─────────────────────────────────────────────────────────────
export async function getStories() {
  return apiFetch("/stories");
}

export async function getStory(id: string) {
  return apiFetch(`/stories/${id}`);
}

export async function saveStory(story: any) {
  return authFetch("/stories", { method: "POST", body: JSON.stringify(story) });
}

export async function deleteStory(id: string) {
  return authFetch(`/stories/${id}`, { method: "DELETE" });
}

// ─── Partners ────────────────────────────────────────────────────────────
export async function getPartners() {
  return apiFetch("/partners");
}

export async function getPartner(id: string) {
  return apiFetch(`/partners/${id}`);
}

export async function savePartner(partner: any) {
  return authFetch("/partners", { method: "POST", body: JSON.stringify(partner) });
}

export async function deletePartner(id: string) {
  return authFetch(`/partners/${id}`, { method: "DELETE" });
}

// ─── Media ───────────────────────────────────────────────────────────────
export async function getMedia() {
  return apiFetch("/media");
}

export async function saveMedia(item: any) {
  return authFetch("/media", { method: "POST", body: JSON.stringify(item) });
}

export async function deleteMedia(id: string) {
  return authFetch(`/media/${id}`, { method: "DELETE" });
}

// ─── Donations ───────────────────────────────────────────────────────────
export async function getDonations() {
  return authFetch("/donations");
}

export async function saveDonation(donation: any) {
  return authFetch("/donations", { method: "POST", body: JSON.stringify(donation) });
}

export async function deleteDonation(id: string) {
  return authFetch(`/donations/${id}`, { method: "DELETE" });
}

// ─── Contacts ────────────────────────────────────────────────────────────
export async function getContacts() {
  return authFetch("/contacts");
}

export async function submitContact(msg: any) {
  return apiFetch("/contacts", { method: "POST", body: JSON.stringify(msg) });
}

// ─── Impact Stats ────────────────────────────────────────────────────────
export async function getImpactStats() {
  return apiFetch("/impact");
}

export async function saveImpactStats(stats: any) {
  return authFetch("/impact", { method: "POST", body: JSON.stringify(stats) });
}

// ─── Ministries (Supabase Table) ─────────────────────────────────────────
export async function getMinistries() {
  return apiFetch("/ministries");
}

export async function getMinistry(slug: string) {
  return apiFetch(`/ministries/${slug}`);
}

export async function saveMinistry(ministry: any) {
  return authFetch("/ministries", { method: "POST", body: JSON.stringify(ministry) });
}

export async function deleteMinistry(slug: string) {
  return authFetch(`/ministries/${slug}`, { method: "DELETE" });
}

// ─── Dashboard ───────────────────────────────────────────────────────────
export async function getDashboardStats() {
  return authFetch("/dashboard");
}

// ─── Image Assets (Storage) ──────────────────────────────────────────────
export async function listAssets() {
  return authFetch("/assets");
}

export async function uploadAsset(file: File, customName?: string) {
  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated");

  const formData = new FormData();
  formData.append("file", file);
  if (customName) formData.append("name", customName);

  const res = await fetch(`${BASE_URL}/assets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
      "X-Auth-Token": token,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    console.error(`Upload asset error [${res.status}]:`, err);
    throw new Error(err.error || `Upload failed: ${res.status}`);
  }
  return res.json();
}

export async function deleteAsset(path: string) {
  return authFetch("/assets", {
    method: "DELETE",
    body: JSON.stringify({ path }),
  });
}

// ─── Page Images (KV Store) ─────────────────────────────────────────────
export async function getPageImages() {
  return apiFetch("/page-images");
}

export async function savePageImages(images: Record<string, string>) {
  return authFetch("/page-images", { method: "POST", body: JSON.stringify(images) });
}

// ─── Subscribers ─────────────────────────────────────────────────────────
export async function subscribe(email: string) {
  return apiFetch("/subscribers", { method: "POST", body: JSON.stringify({ email }) });
}

export async function getSubscribers() {
  return authFetch("/subscribers");
}

export async function deleteSubscriber(email: string) {
  return authFetch(`/subscribers/${encodeURIComponent(email)}`, { method: "DELETE" });
}

// ─── Newsletter ──────────────────────────────────────────────────────────
export async function sendNewsletter(storyId: string) {
  return authFetch("/newsletter/send", { method: "POST", body: JSON.stringify({ story_id: storyId }) });
}

export async function getNewsletterLog(storyId: string) {
  return authFetch(`/newsletter/log/${storyId}`);
}

// ─── Story Revisions ─────────────────────────────────────────────────────
export async function saveRevision(storyId: string, data: any) {
  return authFetch(`/stories/${storyId}/revisions`, { method: "POST", body: JSON.stringify(data) });
}

export async function getRevisions(storyId: string) {
  return authFetch(`/stories/${storyId}/revisions`);
}

// ─── Team Members ────────────────────────────────────────────────────────
export async function getTeamMembers() {
  return apiFetch("/team");
}

export async function saveTeamMember(member: any) {
  return authFetch("/team", { method: "POST", body: JSON.stringify(member) });
}

export async function deleteTeamMember(id: string) {
  return authFetch(`/team/${id}`, { method: "DELETE" });
}

// ─── Site Settings (KV Store) ────────────────────────────────────────────
export async function getSiteSettings() {
  return apiFetch("/site-settings");
}

export async function saveSiteSettings(settings: Record<string, any>) {
  return authFetch("/site-settings", { method: "POST", body: JSON.stringify(settings) });
}

// ─── User Management ─────────────────────────────────────────────────────
export async function getMyProfile() {
  return authFetch("/users/me");
}

export async function getUsers() {
  return authFetch("/users");
}

export async function createUser(user: { email: string; password: string; name: string; role: string }) {
  return authFetch("/users", { method: "POST", body: JSON.stringify(user) });
}

export async function updateUser(id: string, updates: { name?: string; role?: string }) {
  return authFetch(`/users/${id}`, { method: "PUT", body: JSON.stringify(updates) });
}

export async function deleteUser(id: string) {
  return authFetch(`/users/${id}`, { method: "DELETE" });
}

