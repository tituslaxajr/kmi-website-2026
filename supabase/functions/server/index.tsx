import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";

const app = new Hono();
const PREFIX = "/make-server-bf6aba98";

// ─── Supabase clients ────────────────────────────────────────────────────
const supabaseAdmin = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

const supabaseAnon = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

// Logger
app.use("*", logger(console.log));

// CORS
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Auth-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

// ─── Auth helpers ────────────────────────────────────────────────────────
async function requireAuth(c: any): Promise<string | null> {
  const token = c.req.header("X-Auth-Token") || c.req.header("Authorization")?.split(" ")[1];
  if (!token) return null;
  try {
    const supabase = supabaseAdmin();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user?.id) return null;
    return data.user.id;
  } catch (e) {
    console.log("Auth error:", e);
    return null;
  }
}

// Require admin role — returns userId or null
async function requireAdmin(c: any): Promise<string | null> {
  const userId = await requireAuth(c);
  if (!userId) return null;
  try {
    const supabase = supabaseAdmin();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profile?.role === "admin") return userId;

    // If no profile exists, check if this is the only user (auto-admin)
    if (!profile) {
      const { data: authData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 2 });
      if (authData?.users?.length === 1) {
        const user = authData.users[0];
        await supabase.from("profiles").upsert({
          id: user.id,
          full_name: user.user_metadata?.name || user.email || "",
          role: "admin",
        });
        return userId;
      }
    }
    return null;
  } catch (e) {
    console.log("requireAdmin error:", e);
    return null;
  }
}

// Helper: get admin client for DB operations
function db() {
  return supabaseAdmin();
}


// Add a helper to query KV with keys (getByPrefix strips keys)
async function kvGetByPrefixWithKeys(prefix: string): Promise<{ key: string; value: any }[]> {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("kv_store_bf6aba98")
    .select("key, value")
    .like("key", prefix + "%");
  if (error) throw new Error(error.message);
  return (data || []).map((d: any) => ({ key: d.key, value: d.value }));
}

// ─── Storage: Idempotent bucket creation ─────────────────────────────────
const ASSETS_BUCKET = "make-bf6aba98-assets";

async function ensureAssetsBucket() {
  try {
    const supabase = supabaseAdmin();
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((bucket: any) => bucket.name === ASSETS_BUCKET);
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(ASSETS_BUCKET, { public: true });
      if (error) console.log("Create assets bucket error:", error);
      else console.log("Created assets bucket:", ASSETS_BUCKET);
    }
  } catch (e) {
    console.log("ensureAssetsBucket error:", e);
  }
}

// Create bucket on server startup
ensureAssetsBucket();

// Impact stats field mapping (DB snake_case <-> frontend camelCase)
const impactFieldMap: Record<string, string> = {
  children_supported: "childrenSupported",
  churches_partnered: "churchesPartnered",
  communities_reached: "communitiesReached",
  years_of_ministry: "yearsOfMinistry",
};
const impactFieldMapReverse: Record<string, string> = Object.fromEntries(
  Object.entries(impactFieldMap).map(([k, v]) => [v, k])
);

// Normalize impact stats from DB (snake_case) to camelCase for frontend
function normalizeImpactStats(row: any): any {
  if (!row) return null;
  const result: any = {};
  for (const [key, value] of Object.entries(row)) {
    const mapped = impactFieldMap[key];
    result[mapped || key] = value;
  }
  return result;
}

// Convert camelCase impact stats to snake_case for DB
function denormalizeImpactStats(data: any): any {
  const result: any = {};
  for (const [key, value] of Object.entries(data)) {
    const mapped = impactFieldMapReverse[key];
    result[mapped || key] = value;
  }
  return result;
}

// Strip fields not in the DB table for donations
// Known donation columns: id, donor_name, amount, date
function cleanDonation(d: any): any {
  const { fund, ...rest } = d;
  return rest;
}

// ─── Drop valid_role constraint if it exists ─────────────────────────────
async function dropRoleConstraint() {
  try {
    const dbUrl = Deno.env.get("SUPABASE_DB_URL");
    if (!dbUrl) return;
    const { Client } = await import("https://deno.land/x/postgres@v0.19.3/mod.ts");
    const client = new Client(dbUrl);
    await client.connect();
    await client.queryObject(`ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_role`);
    await client.end();
    console.log("Dropped valid_role constraint (if it existed)");
  } catch (e: any) {
    console.log("Could not drop valid_role constraint:", e.message);
  }
}
dropRoleConstraint();

// ─── Health ──────────────────────────────────────────────────────────────
app.get(`${PREFIX}/health`, (c) => c.json({ status: "ok" }));

// ─── Auth: Signup ────────────────────────────────────────────────────────
app.post(`${PREFIX}/auth/signup`, async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required for signup" }, 400);
    }
    const supabase = supabaseAdmin();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm since no email server configured
      email_confirm: true,
    });
    if (error) {
      console.log("Signup error:", error);
      return c.json({ error: `Signup failed: ${error.message}` }, 400);
    }
    // Sign in immediately to get session
    const { data: signInData, error: signInError } = await supabaseAnon().auth.signInWithPassword({ email, password });
    if (signInError) {
      console.log("Post-signup sign-in error:", signInError);
      return c.json({ error: `Account created but sign-in failed: ${signInError.message}` }, 400);
    }
    return c.json({
      user: { id: data.user?.id, email, name },
      session: signInData.session,
    });
  } catch (e: any) {
    console.log("Signup exception:", e);
    return c.json({ error: `Signup exception: ${e.message}` }, 500);
  }
});

// ─── Seed initial data into real tables ──────────────────────────────────
app.post(`${PREFIX}/seed`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized: must be logged in to seed data" }, 401);

    const { stories, partners, mediaItems, impactStats, donations } = await c.req.json();
    const supabase = db();
    const errors: string[] = [];

    // Helper: ensure each row has a valid UUID id
    function ensureUUIDs(rows: any[]): any[] {
      return rows.map((row: any) => {
        // If id is missing or is a short non-UUID string, generate a new UUID
        if (!row.id || (typeof row.id === "string" && row.id.length < 20)) {
          return { ...row, id: crypto.randomUUID() };
        }
        return row;
      });
    }

    // Seed partners first (stories may reference partner_id)
    if (partners?.length) {
      const prepared = ensureUUIDs(partners);
      const { error } = await supabase.from("partners").upsert(prepared, { onConflict: "id" });
      if (error) {
        console.log("Seed partners error:", JSON.stringify(error));
        errors.push(`partners: ${error.message} (code: ${error.code}, details: ${error.details})`);
      } else {
        console.log(`Seeded ${prepared.length} partners`);
      }
    }

    // Seed stories — also remap partner_id if partners got new UUIDs
    if (stories?.length) {
      const prepared = ensureUUIDs(stories);
      // Remove partner_id foreign key reference if it would cause issues
      const cleaned = prepared.map((s: any) => {
        const row = { ...s };
        // If partner_id is a short non-UUID string, remove it to avoid FK violation
        if (row.partner_id && typeof row.partner_id === "string" && row.partner_id.length < 20) {
          delete row.partner_id;
        }
        return row;
      });
      const { error } = await supabase.from("stories").upsert(cleaned, { onConflict: "id" });
      if (error) {
        console.log("Seed stories error:", JSON.stringify(error));
        errors.push(`stories: ${error.message} (code: ${error.code}, details: ${error.details})`);
      } else {
        console.log(`Seeded ${cleaned.length} stories`);
      }
    }

    // Seed media
    if (mediaItems?.length) {
      const prepared = ensureUUIDs(mediaItems);
      const { error } = await supabase.from("media_items").upsert(prepared, { onConflict: "id" });
      if (error) {
        console.log("Seed media error:", JSON.stringify(error));
        errors.push(`media_items: ${error.message} (code: ${error.code}, details: ${error.details})`);
      } else {
        console.log(`Seeded ${prepared.length} media items`);
      }
    }

    // Seed impact stats (single-row table)
    if (impactStats) {
      const row = { id: crypto.randomUUID(), ...denormalizeImpactStats(impactStats) };
      // Try to get existing row first
      const { data: existing } = await supabase.from("impact_stats").select("id").limit(1).maybeSingle();
      if (existing?.id) row.id = existing.id;
      const { error } = await supabase.from("impact_stats").upsert(row, { onConflict: "id" });
      if (error) {
        console.log("Seed impact error:", JSON.stringify(error));
        errors.push(`impact_stats: ${error.message} (code: ${error.code}, details: ${error.details})`);
      } else {
        console.log("Seeded impact stats");
      }
    }

    // Seed donations
    if (donations?.length) {
      const prepared = ensureUUIDs(donations).map(cleanDonation);
      const { error } = await supabase.from("donations").upsert(prepared, { onConflict: "id" });
      if (error) {
        console.log("Seed donations error:", JSON.stringify(error));
        errors.push(`donations: ${error.message} (code: ${error.code}, details: ${error.details})`);
      } else {
        console.log(`Seeded ${prepared.length} donations`);
      }
    }

    if (errors.length > 0) {
      console.log("Seed completed with errors:", errors);
      return c.json({ success: false, errors }, 400);
    }

    return c.json({ success: true });
  } catch (e: any) {
    console.log("Seed error:", e);
    return c.json({ error: `Seed error: ${e.message}` }, 500);
  }
});

// Check if seeded (simply check if stories table has any rows)
app.get(`${PREFIX}/seed/status`, async (c) => {
  try {
    const { count, error } = await db()
      .from("stories")
      .select("id", { count: "exact", head: true });
    return c.json({ seeded: !error && (count ?? 0) > 0 });
  } catch (e: any) {
    console.log("Seed status error:", e);
    return c.json({ seeded: false });
  }
});

// ─── Stories CRUD ────────────────────────────────────────────────────────
app.get(`${PREFIX}/stories`, async (c) => {
  try {
    const { data, error } = await db()
      .from("stories")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.log("Get stories DB error:", error);
      return c.json({ error: `Failed to fetch stories: ${error.message}` }, 500);
    }
    return c.json(data || []);
  } catch (e: any) {
    console.log("Get stories error:", e);
    return c.json({ error: `Failed to fetch stories: ${e.message}` }, 500);
  }
});

app.get(`${PREFIX}/stories/:id`, async (c) => {
  try {
    const id = c.req.param("id");
    const { data, error } = await db()
      .from("stories")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) {
      console.log("Get story DB error:", error);
      return c.json({ error: "Story not found" }, 404);
    }
    return c.json(data);
  } catch (e: any) {
    console.log("Get story error:", e);
    return c.json({ error: `Failed to fetch story: ${e.message}` }, 500);
  }
});

app.post(`${PREFIX}/stories`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const body = await c.req.json();

    // Build a clean row with only the columns that exist in the stories table
    const story: Record<string, any> = {
      id: body.id || crypto.randomUUID(),
      title: body.title || "",
      slug: body.slug || "",
      summary: body.summary || "",
      featured_image: body.featured_image || "",
      category: body.category || "Community",
      published: body.published ?? false,
      created_at: body.created_at || new Date().toISOString().split("T")[0],
    };

    // Handle content — ensure it is always stored as a valid JSON string
    // so it works whether the column is text or jsonb.
    if (body.content !== undefined && body.content !== null) {
      if (typeof body.content === "string") {
        story.content = body.content;
      } else {
        // Array of blocks or any object → serialize to JSON string
        story.content = JSON.stringify(body.content);
      }
    } else {
      story.content = "";
    }

    // Handle partner_id — null if empty to avoid FK violations
    if (body.partner_id && typeof body.partner_id === "string" && body.partner_id.trim().length > 0) {
      story.partner_id = body.partner_id.trim();
    } else {
      story.partner_id = null;
    }

    console.log("Saving story:", story.id, "title:", story.title, "content type:", typeof story.content, "content length:", story.content?.length);

    const { data, error } = await db()
      .from("stories")
      .upsert(story, { onConflict: "id" })
      .select()
      .single();
    if (error) {
      console.log("Save story DB error:", JSON.stringify(error));
      return c.json({ error: `Failed to save story: ${error.message}` }, 500);
    }
    return c.json(data || story);
  } catch (e: any) {
    console.log("Save story error:", e);
    return c.json({ error: `Failed to save story: ${e.message}` }, 500);
  }
});

app.delete(`${PREFIX}/stories/:id`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const id = c.req.param("id");
    const { error } = await db().from("stories").delete().eq("id", id);
    if (error) {
      console.log("Delete story DB error:", error);
      return c.json({ error: `Failed to delete story: ${error.message}` }, 500);
    }
    // Also clean up revisions
    try {
      const revisionItems = await kvGetByPrefixWithKeys(`story-revision:${id}:`);
      if (revisionItems?.length) {
        await kv.mdel(revisionItems.map((r: any) => r.key));
      }
    } catch { /* ignore revision cleanup errors */ }
    return c.json({ success: true });
  } catch (e: any) {
    console.log("Delete story error:", e);
    return c.json({ error: `Failed to delete story: ${e.message}` }, 500);
  }
});

// ─── Story Revisions (KV Store) ──────────────────────────────────────────
// Key pattern: "story-revision:{storyId}:{timestamp}"
// Value: { title, summary, content, saved_at, published }

// Save a revision snapshot
app.post(`${PREFIX}/stories/:id/revisions`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const storyId = c.req.param("id");
    const body = await c.req.json();
    const timestamp = Date.now();
    const revision = {
      title: body.title || "",
      summary: body.summary || "",
      content: body.content,
      saved_at: new Date().toISOString(),
      published: body.published ?? false,
    };
    await kv.set(`story-revision:${storyId}:${timestamp}`, revision);

    // Prune old revisions — keep max 20
    try {
      const allRevisions = await kvGetByPrefixWithKeys(`story-revision:${storyId}:`);
      if (allRevisions && allRevisions.length > 20) {
        const sorted = allRevisions.sort((a: any, b: any) => a.key.localeCompare(b.key));
        const toDelete = sorted.slice(0, sorted.length - 20).map((r: any) => r.key);
        if (toDelete.length > 0) {
          await kv.mdel(toDelete);
        }
      }
    } catch { /* ignore prune errors */ }

    return c.json({ success: true, revision });
  } catch (e: any) {
    console.log("Save revision error:", e);
    return c.json({ error: `Failed to save revision: ${e.message}` }, 500);
  }
});

// List revisions for a story
app.get(`${PREFIX}/stories/:id/revisions`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const storyId = c.req.param("id");
    const items = await kvGetByPrefixWithKeys(`story-revision:${storyId}:`);
    const revisions = (items || [])
      .map((item: any) => ({ key: item.key, ...item.value }))
      .sort((a: any, b: any) => (b.saved_at || "").localeCompare(a.saved_at || ""));
    return c.json(revisions);
  } catch (e: any) {
    console.log("Get revisions error:", e);
    return c.json({ error: `Failed to fetch revisions: ${e.message}` }, 500);
  }
});

// ─── Partners CRUD ───────────────────────────────────────────────────────
app.get(`${PREFIX}/partners`, async (c) => {
  try {
    const { data, error } = await db()
      .from("partners")
      .select("*")
      .order("church_name", { ascending: true });
    if (error) {
      console.log("Get partners DB error:", error);
      return c.json({ error: `Failed to fetch partners: ${error.message}` }, 500);
    }
    return c.json(data || []);
  } catch (e: any) {
    console.log("Get partners error:", e);
    return c.json({ error: `Failed to fetch partners: ${e.message}` }, 500);
  }
});

app.get(`${PREFIX}/partners/:id`, async (c) => {
  try {
    const id = c.req.param("id");
    const { data, error } = await db()
      .from("partners")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) {
      console.log("Get partner DB error:", error);
      return c.json({ error: "Partner not found" }, 404);
    }
    return c.json(data);
  } catch (e: any) {
    console.log("Get partner error:", e);
    return c.json({ error: `Failed to fetch partner: ${e.message}` }, 500);
  }
});

app.post(`${PREFIX}/partners`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const partner = await c.req.json();
    if (!partner.id) partner.id = crypto.randomUUID();

    const { data, error } = await db()
      .from("partners")
      .upsert(partner, { onConflict: "id" })
      .select()
      .single();
    if (error) {
      console.log("Save partner DB error:", error);
      return c.json({ error: `Failed to save partner: ${error.message}` }, 500);
    }
    return c.json(data || partner);
  } catch (e: any) {
    console.log("Save partner error:", e);
    return c.json({ error: `Failed to save partner: ${e.message}` }, 500);
  }
});

app.delete(`${PREFIX}/partners/:id`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const id = c.req.param("id");
    const { error } = await db().from("partners").delete().eq("id", id);
    if (error) {
      console.log("Delete partner DB error:", error);
      return c.json({ error: `Failed to delete partner: ${error.message}` }, 500);
    }
    return c.json({ success: true });
  } catch (e: any) {
    console.log("Delete partner error:", e);
    return c.json({ error: `Failed to delete partner: ${e.message}` }, 500);
  }
});

// ─── Media CRUD ──────────────────────────────────────────────────────────
app.get(`${PREFIX}/media`, async (c) => {
  try {
    const { data, error } = await db()
      .from("media_items")
      .select("*")
      .order("title", { ascending: true });
    if (error) {
      console.log("Get media DB error:", error);
      return c.json({ error: `Failed to fetch media: ${error.message}` }, 500);
    }
    return c.json(data || []);
  } catch (e: any) {
    console.log("Get media error:", e);
    return c.json({ error: `Failed to fetch media: ${e.message}` }, 500);
  }
});

app.post(`${PREFIX}/media`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const item = await c.req.json();
    if (!item.id) item.id = crypto.randomUUID();

    const { data, error } = await db()
      .from("media_items")
      .upsert(item, { onConflict: "id" })
      .select()
      .single();
    if (error) {
      console.log("Save media DB error:", error);
      return c.json({ error: `Failed to save media: ${error.message}` }, 500);
    }
    return c.json(data || item);
  } catch (e: any) {
    console.log("Save media error:", e);
    return c.json({ error: `Failed to save media: ${e.message}` }, 500);
  }
});

app.delete(`${PREFIX}/media/:id`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const id = c.req.param("id");
    const { error } = await db().from("media_items").delete().eq("id", id);
    if (error) {
      console.log("Delete media DB error:", error);
      return c.json({ error: `Failed to delete media: ${error.message}` }, 500);
    }
    return c.json({ success: true });
  } catch (e: any) {
    console.log("Delete media error:", e);
    return c.json({ error: `Failed to delete media: ${e.message}` }, 500);
  }
});

// ─── Donations CRUD ─────────────────────────────────────────────────────
app.get(`${PREFIX}/donations`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { data, error } = await db()
      .from("donations")
      .select("*")
      .order("date", { ascending: false });
    if (error) {
      console.log("Get donations DB error:", error);
      return c.json({ error: `Failed to fetch donations: ${error.message}` }, 500);
    }
    return c.json(data || []);
  } catch (e: any) {
    console.log("Get donations error:", e);
    return c.json({ error: `Failed to fetch donations: ${e.message}` }, 500);
  }
});

app.post(`${PREFIX}/donations`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const donation = await c.req.json();
    if (!donation.id) donation.id = crypto.randomUUID();
    if (!donation.date) donation.date = new Date().toISOString();

    const { data, error } = await db()
      .from("donations")
      .upsert(cleanDonation(donation), { onConflict: "id" })
      .select()
      .single();
    if (error) {
      console.log("Save donation DB error:", error);
      return c.json({ error: `Failed to save donation: ${error.message}` }, 500);
    }
    return c.json(data || donation);
  } catch (e: any) {
    console.log("Save donation error:", e);
    return c.json({ error: `Failed to save donation: ${e.message}` }, 500);
  }
});

app.delete(`${PREFIX}/donations/:id`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const id = c.req.param("id");
    const { error } = await db().from("donations").delete().eq("id", id);
    if (error) {
      console.log("Delete donation DB error:", error);
      return c.json({ error: `Failed to delete donation: ${error.message}` }, 500);
    }
    return c.json({ success: true });
  } catch (e: any) {
    console.log("Delete donation error:", e);
    return c.json({ error: `Failed to delete donation: ${e.message}` }, 500);
  }
});

// ─── Contact submissions ─────────────────────────────────────────────────
app.get(`${PREFIX}/contacts`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { data, error } = await db()
      .from("contact_submissions")
      .select("*")
      .order("date", { ascending: false });
    if (error) {
      console.log("Get contacts DB error:", error);
      return c.json({ error: `Failed to fetch contacts: ${error.message}` }, 500);
    }
    return c.json(data || []);
  } catch (e: any) {
    console.log("Get contacts error:", e);
    return c.json({ error: `Failed to fetch contacts: ${e.message}` }, 500);
  }
});

app.post(`${PREFIX}/contacts`, async (c) => {
  try {
    const msg = await c.req.json();
    if (!msg.id) msg.id = crypto.randomUUID();
    if (!msg.date) msg.date = new Date().toISOString();
    msg.read = false;

    const { error } = await db().from("contact_submissions").insert(msg);
    if (error) {
      console.log("Save contact DB error:", error);
      return c.json({ error: `Failed to save contact: ${error.message}` }, 500);
    }
    return c.json({ success: true });
  } catch (e: any) {
    console.log("Save contact error:", e);
    return c.json({ error: `Failed to save contact: ${e.message}` }, 500);
  }
});

// ─── Impact Stats ────────────────────────────────────────────────────────
app.get(`${PREFIX}/impact`, async (c) => {
  try {
    const { data, error } = await db()
      .from("impact_stats")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error) {
      console.log("Get impact DB error:", error);
      return c.json({ error: `Failed to fetch impact: ${error.message}` }, 500);
    }
    return c.json(normalizeImpactStats(data) || null);
  } catch (e: any) {
    console.log("Get impact error:", e);
    return c.json({ error: `Failed to fetch impact: ${e.message}` }, 500);
  }
});

app.post(`${PREFIX}/impact`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const stats = await c.req.json();
    if (!stats.id) stats.id = "main";

    const { data, error } = await db()
      .from("impact_stats")
      .upsert(denormalizeImpactStats(stats), { onConflict: "id" })
      .select()
      .single();
    if (error) {
      console.log("Save impact DB error:", error);
      return c.json({ error: `Failed to save impact: ${error.message}` }, 500);
    }
    return c.json(normalizeImpactStats(data) || stats);
  } catch (e: any) {
    console.log("Save impact error:", e);
    return c.json({ error: `Failed to save impact: ${e.message}` }, 500);
  }
});

// ─── Dashboard stats ─────────────────────────────────────────────────────
app.get(`${PREFIX}/dashboard`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const supabase = db();

    const [storiesRes, partnersRes, mediaRes, donationsRes, contactsRes] = await Promise.all([
      supabase.from("stories").select("id", { count: "exact", head: true }),
      supabase.from("partners").select("id", { count: "exact", head: true }),
      supabase.from("media_items").select("id", { count: "exact", head: true }),
      supabase.from("donations").select("*").order("date", { ascending: false }),
      supabase.from("contact_submissions").select("id", { count: "exact", head: true }),
    ]);

    const donations = donationsRes.data || [];
    const totalDonations = donations.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
    const recentDonations = donations.slice(0, 5);

    return c.json({
      storiesCount: storiesRes.count ?? 0,
      partnersCount: partnersRes.count ?? 0,
      mediaCount: mediaRes.count ?? 0,
      donationsCount: donations.length,
      contactsCount: contactsRes.count ?? 0,
      totalDonations,
      recentDonations,
    });
  } catch (e: any) {
    console.log("Dashboard error:", e);
    return c.json({ error: `Failed to fetch dashboard: ${e.message}` }, 500);
  }
});

// ─── Image Assets (Storage) ──────────────────────────────────────────────

// List all assets in the bucket
app.get(`${PREFIX}/assets`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const supabase = supabaseAdmin();
    const { data, error } = await supabase.storage
      .from(ASSETS_BUCKET)
      .list("images", { limit: 500, sortBy: { column: "created_at", order: "desc" } });

    if (error) {
      console.log("List assets error:", error);
      return c.json({ error: `Failed to list assets: ${error.message}` }, 500);
    }

    // Filter out .emptyFolderPlaceholder and build response with public URLs
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const files = (data || [])
      .filter((f: any) => f.name !== ".emptyFolderPlaceholder")
      .map((f: any) => {
        const path = `images/${f.name}`;
        const { data: urlData } = supabase.storage
          .from(ASSETS_BUCKET)
          .getPublicUrl(path);
        return {
          name: f.name,
          path,
          size: f.metadata?.size || 0,
          mimetype: f.metadata?.mimetype || "",
          created_at: f.created_at,
          updated_at: f.updated_at,
          public_url: urlData?.publicUrl || "",
        };
      });

    return c.json(files);
  } catch (e: any) {
    console.log("List assets error:", e);
    return c.json({ error: `Failed to list assets: ${e.message}` }, 500);
  }
});

// Upload an asset (accepts multipart form data)
app.post(`${PREFIX}/assets`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;
    const customName = formData.get("name") as string | null;

    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    const timestamp = Date.now();
    const originalName = customName?.trim() || file.name;
    // Sanitize filename: keep extension, replace spaces with hyphens
    const sanitized = originalName.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
    const storagePath = `images/${timestamp}-${sanitized}`;

    const supabase = supabaseAdmin();
    const arrayBuffer = await file.arrayBuffer();
    const { data, error } = await supabase.storage
      .from(ASSETS_BUCKET)
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.log("Upload asset error:", error);
      return c.json({ error: `Upload failed: ${error.message}` }, 500);
    }

    const { data: urlData } = supabase.storage
      .from(ASSETS_BUCKET)
      .getPublicUrl(storagePath);

    return c.json({
      name: sanitized,
      path: storagePath,
      size: file.size,
      mimetype: file.type,
      created_at: new Date().toISOString(),
      public_url: urlData?.publicUrl || "",
    });
  } catch (e: any) {
    console.log("Upload asset error:", e);
    return c.json({ error: `Upload failed: ${e.message}` }, 500);
  }
});

// Delete an asset
app.delete(`${PREFIX}/assets`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { path } = await c.req.json();
    if (!path) return c.json({ error: "Path is required" }, 400);

    const supabase = supabaseAdmin();
    const { error } = await supabase.storage
      .from(ASSETS_BUCKET)
      .remove([path]);

    if (error) {
      console.log("Delete asset error:", error);
      return c.json({ error: `Delete failed: ${error.message}` }, 500);
    }

    return c.json({ success: true });
  } catch (e: any) {
    console.log("Delete asset error:", e);
    return c.json({ error: `Delete failed: ${e.message}` }, 500);
  }
});

// ─── Ministries CRUD (Supabase Table with KV fallback) ───────────────────
// Ministries stored in public.ministries table; falls back to KV if table errors

function ministryRowToFrontend(row: any) {
  if (!row) return null;
  return {
    slug: row.slug || "",
    title: row.title || "",
    tagline: row.tagline || "",
    heroImage: row.hero_image || "",
    cardImage: row.card_image || "",
    icon: row.icon || "",
    color: row.color || "",
    goalText: row.goal_text || "",
    description: row.description || "",
    subPrograms: row.sub_programs || [],
    howToSupport: row.how_to_support || {},
    sponsorshipTiers: row.sponsorship_tiers || null,
    scripture: {
      text: row.scripture_text || "",
      reference: row.scripture_reference || "",
    },
    giveFundId: row.give_fund_id || "",
    sortOrder: row.sort_order ?? 0,
    isPublished: row.is_published !== false,
    id: row.id || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

function ministryFrontendToRow(m: any): Record<string, any> {
  const row: Record<string, any> = {};
  if (m.slug != null) row.slug = m.slug;
  if (m.title != null) row.title = m.title;
  if (m.tagline != null) row.tagline = m.tagline;
  if (m.heroImage != null) row.hero_image = m.heroImage;
  if (m.cardImage != null) row.card_image = m.cardImage;
  if (m.icon != null) row.icon = m.icon;
  if (m.color != null) row.color = m.color;
  if (m.goalText != null) row.goal_text = m.goalText;
  if (m.description != null) row.description = m.description;
  if (m.subPrograms != null) row.sub_programs = m.subPrograms;
  if (m.howToSupport != null) row.how_to_support = m.howToSupport;
  if (m.sponsorshipTiers != null) row.sponsorship_tiers = m.sponsorshipTiers;
  if (m.scripture != null) {
    row.scripture_text = (m.scripture && m.scripture.text) || "";
    row.scripture_reference = (m.scripture && m.scripture.reference) || "";
  }
  if (m.giveFundId != null) row.give_fund_id = m.giveFundId;
  if (m.sortOrder != null) row.sort_order = m.sortOrder;
  if (m.isPublished != null) row.is_published = m.isPublished;
  row.updated_at = new Date().toISOString();
  return row;
}

app.get(`${PREFIX}/ministries`, async (c) => {
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("ministries")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true });

    if (error) {
      console.log("Ministries table query failed, falling back to KV:", error.message);
      const items = await kv.getByPrefix("ministry:");
      const list = (items || []).filter((i: any) => i != null)
        .sort((a: any, b: any) => (a.title || "").localeCompare(b.title || ""));
      return c.json(list);
    }

    return c.json((data || []).map(ministryRowToFrontend).filter(Boolean));
  } catch (e: any) {
    console.log("Get ministries error:", e);
    return c.json({ error: `Failed to fetch ministries: ${e.message}` }, 500);
  }
});

app.get(`${PREFIX}/ministries/:slug`, async (c) => {
  try {
    const slug = c.req.param("slug");
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("ministries")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.log("Ministry slug query failed, falling back to KV:", error.message);
      const val = await kv.get(`ministry:${slug}`);
      if (!val) return c.json({ error: "Ministry not found" }, 404);
      return c.json(val);
    }

    if (!data) return c.json({ error: "Ministry not found" }, 404);
    return c.json(ministryRowToFrontend(data));
  } catch (e: any) {
    console.log("Get ministry error:", e);
    return c.json({ error: `Failed to fetch ministry: ${e.message}` }, 500);
  }
});

app.post(`${PREFIX}/ministries`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const ministry = await c.req.json();
    if (!ministry.slug) {
      ministry.slug = (ministry.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }
    if (!ministry.slug) return c.json({ error: "Ministry must have a title or slug" }, 400);

    const row = ministryFrontendToRow(ministry);
    const sb = supabaseAdmin();

    const { data, error } = await sb
      .from("ministries")
      .upsert(row, { onConflict: "slug" })
      .select()
      .maybeSingle();

    if (error) {
      console.log("Save ministry table error, falling back to KV:", error.message);
      await kv.set(`ministry:${ministry.slug}`, ministry);
      return c.json(ministry);
    }

    return c.json(data ? ministryRowToFrontend(data) : ministry);
  } catch (e: any) {
    console.log("Save ministry error:", e);
    return c.json({ error: `Failed to save ministry: ${e.message}` }, 500);
  }
});

app.delete(`${PREFIX}/ministries/:slug`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const slug = c.req.param("slug");
    const sb = supabaseAdmin();
    const { error } = await sb.from("ministries").delete().eq("slug", slug);

    if (error) {
      console.log("Delete ministry table error, falling back to KV:", error.message);
      await kv.del(`ministry:${slug}`);
    }

    return c.json({ success: true });
  } catch (e: any) {
    console.log("Delete ministry error:", e);
    return c.json({ error: `Failed to delete ministry: ${e.message}` }, 500);
  }
});

// ─── Page Images (KV Store) ─────────────────────────────────────────────
// All page image overrides stored as a single KV entry "site-images"
// Value is { [imageKey]: url } — e.g. { hero: "https://...", children: "https://..." }

app.get(`${PREFIX}/page-images`, async (c) => {
  try {
    const value = await kv.get("site-images");
    return c.json(value || {});
  } catch (e: any) {
    console.log("Get page-images error:", e);
    return c.json({ error: `Failed to fetch page images: ${e.message}` }, 500);
  }
});

app.post(`${PREFIX}/page-images`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const images = await c.req.json();
    await kv.set("site-images", images);
    return c.json(images);
  } catch (e: any) {
    console.log("Save page-images error:", e);
    return c.json({ error: `Failed to save page images: ${e.message}` }, 500);
  }
});

// ─── Subscribers (KV Store) ──────────────────────────────────────────────
// Subscribers stored with key pattern "subscriber:{email}"
// Value: { email, confirmed, created_at }

// Public: Subscribe
app.post(`${PREFIX}/subscribers`, async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return c.json({ error: "A valid email is required to subscribe" }, 400);
    }
    const normalizedEmail = email.trim().toLowerCase();
    // Check if already subscribed
    const existing = await kv.get(`subscriber:${normalizedEmail}`);
    if (existing) {
      return c.json({ message: "You are already subscribed. Thank you!" });
    }
    await kv.set(`subscriber:${normalizedEmail}`, {
      email: normalizedEmail,
      confirmed: true, // Auto-confirm for now (double opt-in later)
      created_at: new Date().toISOString(),
    });
    return c.json({ message: "Thank you for subscribing!" });
  } catch (e: any) {
    console.log("Subscribe error:", e);
    return c.json({ error: `Failed to subscribe: ${e.message}` }, 500);
  }
});

// Public: Unsubscribe (via token in email link)
app.get(`${PREFIX}/unsubscribe`, async (c) => {
  try {
    const email = c.req.query("email");
    if (!email) {
      return c.html("<html><body><h2>Invalid unsubscribe link.</h2></body></html>");
    }
    const normalizedEmail = email.trim().toLowerCase();
    await kv.del(`subscriber:${normalizedEmail}`);
    return c.html(`
      <html><body style="font-family:sans-serif;text-align:center;padding:60px 20px;">
        <h2>You have been unsubscribed.</h2>
        <p>You will no longer receive newsletters from Kapatid Ministry.</p>
      </body></html>
    `);
  } catch (e: any) {
    console.log("Unsubscribe error:", e);
    return c.html("<html><body><h2>Something went wrong. Please try again.</h2></body></html>");
  }
});

// Auth: List all subscribers
app.get(`${PREFIX}/subscribers`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const items = await kv.getByPrefix("subscriber:");
    // getByPrefix returns values directly, not {key,value} objects
    const subscribers = (items || [])
      .filter((item: any) => item != null)
      .sort((a: any, b: any) => (b.created_at || "").localeCompare(a.created_at || ""));
    return c.json(subscribers);
  } catch (e: any) {
    console.log("Get subscribers error:", e);
    return c.json({ error: `Failed to fetch subscribers: ${e.message}` }, 500);
  }
});

// Auth: Delete subscriber
app.delete(`${PREFIX}/subscribers/:email`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const email = decodeURIComponent(c.req.param("email"));
    await kv.del(`subscriber:${email}`);
    return c.json({ success: true });
  } catch (e: any) {
    console.log("Delete subscriber error:", e);
    return c.json({ error: `Failed to delete subscriber: ${e.message}` }, 500);
  }
});

// ─── Newsletter Sending ──────────────────────────────────────────────────
// Logs stored with key pattern "newsletter-log:{story_id}"
// Value: { story_id, sent_at, recipient_count }

// Auth: Send newsletter for a story
app.post(`${PREFIX}/newsletter/send`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { story_id } = await c.req.json();
    if (!story_id) return c.json({ error: "story_id is required" }, 400);

    // Idempotency check
    const existingLog = await kv.get(`newsletter-log:${story_id}`);
    if (existingLog) {
      return c.json({
        message: "Newsletter already sent for this story",
        already_sent: true,
        log: existingLog,
      });
    }

    // Fetch the story
    const { data: story, error: storyError } = await db()
      .from("stories")
      .select("*")
      .eq("id", story_id)
      .single();
    if (storyError || !story) {
      return c.json({ error: "Story not found" }, 404);
    }

    // Fetch confirmed subscribers - getByPrefix returns values directly
    const subItems = await kv.getByPrefix("subscriber:");
    const subscribers = (subItems || [])
      .filter((s: any) => s != null && s.confirmed && s.email);

    if (subscribers.length === 0) {
      return c.json({ message: "No subscribers to send to", sent: 0 });
    }

    // Build the story URL
    const siteUrl = Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", "") || "";
    const storyUrl = `https://kapatidministry.org/stories/${story.slug}`;
    const unsubscribeBase = `${Deno.env.get("SUPABASE_URL")}/functions/v1/make-server-bf6aba98/unsubscribe`;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return c.json({ error: "RESEND_API_KEY not configured on server" }, 500);
    }

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    // Send emails in batches
    for (const sub of subscribers) {
      try {
        const unsubscribeUrl = `${unsubscribeBase}?email=${encodeURIComponent(sub.email)}`;
        const htmlBody = buildNewsletterHtml(story, storyUrl, unsubscribeUrl);

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Kapatid Ministry <newsletter@kapatidministry.org>",
            to: [sub.email],
            subject: `New Story: ${story.title}`,
            html: htmlBody,
          }),
        });

        if (res.ok) {
          successCount++;
        } else {
          const errData = await res.json().catch(() => ({}));
          console.log(`Resend error for ${sub.email}:`, errData);
          failCount++;
          errors.push(`${sub.email}: ${errData.message || res.status}`);
        }
      } catch (emailErr: any) {
        console.log(`Email send error for ${sub.email}:`, emailErr);
        failCount++;
        errors.push(`${sub.email}: ${emailErr.message}`);
      }
    }

    // Log the send
    const logEntry = {
      story_id,
      story_title: story.title,
      sent_at: new Date().toISOString(),
      recipient_count: successCount,
      failed_count: failCount,
    };
    await kv.set(`newsletter-log:${story_id}`, logEntry);

    return c.json({
      message: `Newsletter sent to ${successCount} subscriber(s)`,
      sent: successCount,
      failed: failCount,
      errors: errors.length > 0 ? errors : undefined,
      log: logEntry,
    });
  } catch (e: any) {
    console.log("Newsletter send error:", e);
    return c.json({ error: `Failed to send newsletter: ${e.message}` }, 500);
  }
});

// Auth: Get newsletter log for a story
app.get(`${PREFIX}/newsletter/log/:story_id`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const storyId = c.req.param("story_id");
    const log = await kv.get(`newsletter-log:${storyId}`);
    return c.json(log || null);
  } catch (e: any) {
    console.log("Get newsletter log error:", e);
    return c.json({ error: `Failed to fetch newsletter log: ${e.message}` }, 500);
  }
});

// HTML email template builder
function buildNewsletterHtml(story: any, storyUrl: string, unsubscribeUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F5;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
  <!-- Header -->
  <tr><td style="background:#1B2A4A;padding:24px 32px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.02em;">Kapatid Ministry</h1>
    <p style="margin:4px 0 0;color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Field Report</p>
  </td></tr>
  <!-- Hero Image -->
  ${story.featured_image ? `<tr><td><img src="${story.featured_image}" alt="${story.title}" style="width:100%;height:auto;display:block;" /></td></tr>` : ""}
  <!-- Content -->
  <tr><td style="padding:32px;">
    <p style="margin:0 0 8px;color:#C7963D;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">${story.category || "Story"}</p>
    <h2 style="margin:0 0 16px;color:#1B2A4A;font-size:24px;font-weight:800;line-height:1.2;letter-spacing:-0.02em;">${story.title}</h2>
    <p style="margin:0 0 24px;color:#4A5568;font-size:15px;line-height:1.7;">${story.summary || ""}</p>
    <a href="${storyUrl}" style="display:inline-block;background:#C7963D;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:50px;font-size:14px;font-weight:700;">Read the Full Story &rarr;</a>
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#F7F5F2;padding:24px 32px;border-top:1px solid #E8E4DF;">
    <p style="margin:0 0 8px;color:#8B7E74;font-size:12px;font-style:italic;text-align:center;">"And let us not grow weary of doing good, for in due season we will reap, if we do not give up." — Galatians 6:9</p>
    <p style="margin:12px 0 0;color:#A09890;font-size:11px;text-align:center;">
      Kapatid Ministry &middot; 4 Acacia St., Silanganan Subd. Llano, Caloocan City, Philippines<br/>
      <a href="${unsubscribeUrl}" style="color:#A09890;text-decoration:underline;">Unsubscribe</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// ─── Public Donation Screenshot Upload ────────────────────────────────────
// Donors upload their payment proof screenshot. Stored in the assets bucket
// under donations/{refCode}-{timestamp}.{ext}. Returns a public URL.

app.post(`${PREFIX}/donations/upload-screenshot`, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;
    const refCode = formData.get("refCode") as string | null;

    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    // Validate file type (images only)
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: "Only image files are accepted (JPG, PNG, WebP, GIF, HEIC)" }, 400);
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return c.json({ error: "File size must be under 10 MB" }, 400);
    }

    const timestamp = Date.now();
    const ext = file.name.split(".").pop() || "jpg";
    const safeName = (refCode || "unknown").replace(/[^a-zA-Z0-9_-]/g, "");
    const storagePath = `donations/${safeName}-${timestamp}.${ext}`;

    const supabase = supabaseAdmin();
    const arrayBuffer = await file.arrayBuffer();
    const { data, error } = await supabase.storage
      .from(ASSETS_BUCKET)
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.log("Upload donation screenshot error:", error);
      return c.json({ error: `Upload failed: ${error.message}` }, 500);
    }

    const { data: urlData } = supabase.storage
      .from(ASSETS_BUCKET)
      .getPublicUrl(storagePath);

    console.log(`Donation screenshot uploaded: ${storagePath} for ref ${refCode}`);

    return c.json({
      path: storagePath,
      public_url: urlData?.publicUrl || "",
    });
  } catch (e: any) {
    console.log("Upload donation screenshot error:", e);
    return c.json({ error: `Upload failed: ${e.message}` }, 500);
  }
});

// ─── Public Donation Submission ──────────────────────────────────────────
// Public endpoint: donors submit their info after payment so the ministry
// gets notified automatically. Stored in KV as "donation-submission:{refCode}"
// Also sends email notifications via Resend.

app.post(`${PREFIX}/donations/submit`, async (c) => {
  try {
    const body = await c.req.json();
    const { donorName, donorEmail, amount, fund, frequency, method, refCode, message, screenshotUrl } = body;

    if (!donorName || !donorEmail || !amount || !refCode) {
      return c.json({ error: "Donor name, email, amount, and reference code are required" }, 400);
    }

    // Store in KV
    const submission = {
      donorName,
      donorEmail: donorEmail.trim().toLowerCase(),
      amount,
      fund: fund || "General Fund",
      frequency: frequency || "one-time",
      method: method || "unknown",
      refCode,
      message: message || "",
      screenshotUrl: screenshotUrl || "",
      submittedAt: new Date().toISOString(),
    };
    await kv.set(`donation-submission:${refCode}`, submission);
    console.log(`Donation submission saved: ${refCode} from ${donorName} (${donorEmail}) - ₱${amount}${screenshotUrl ? " [has screenshot]" : ""}`);

    // Send emails via Resend
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      const methodLabel =
        method === "gcash" ? "GCash" : method === "maya" ? "Maya" : method === "bank" ? "Bank Transfer" : method;
      const freqLabel = frequency === "monthly" ? "Monthly" : "One-time";

      // 1) Email to ministry — notification
      try {
        const ministryHtml = buildDonationNotificationHtml(submission, methodLabel, freqLabel);
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Kapatid Ministry <donations@kapatidministry.org>",
            to: ["kapatidministry@gmail.com"],
            subject: `New Donation: ₱${Number(amount).toLocaleString()} from ${donorName} (${refCode})`,
            html: ministryHtml,
          }),
        });
        console.log(`Ministry notification email sent for ${refCode}`);
      } catch (emailErr: any) {
        console.log(`Failed to send ministry notification email: ${emailErr.message}`);
      }

      // 2) Email to donor — receipt/thank you
      try {
        const donorHtml = buildDonorReceiptHtml(submission, methodLabel, freqLabel);
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Kapatid Ministry <donations@kapatidministry.org>",
            to: [donorEmail.trim().toLowerCase()],
            subject: `Salamat! Your gift of ₱${Number(amount).toLocaleString()} to Kapatid Ministry`,
            html: donorHtml,
          }),
        });
        console.log(`Donor receipt email sent to ${donorEmail} for ${refCode}`);
      } catch (emailErr: any) {
        console.log(`Failed to send donor receipt email: ${emailErr.message}`);
      }
    } else {
      console.log("RESEND_API_KEY not configured — skipping donation emails");
    }

    return c.json({ success: true, refCode });
  } catch (e: any) {
    console.log("Donation submission error:", e);
    return c.json({ error: `Failed to submit donation: ${e.message}` }, 500);
  }
});

// Admin: List all donation submissions
app.get(`${PREFIX}/donations/submissions`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const items = await kvGetByPrefixWithKeys("donation-submission:");
    const submissions = (items || [])
      .map((item: any) => item.value)
      .filter((s: any) => s != null)
      .sort((a: any, b: any) => (b.submittedAt || "").localeCompare(a.submittedAt || ""));
    return c.json(submissions);
  } catch (e: any) {
    console.log("Get donation submissions error:", e);
    return c.json({ error: `Failed to fetch submissions: ${e.message}` }, 500);
  }
});

// Donation notification email to ministry
function buildDonationNotificationHtml(sub: any, methodLabel: string, freqLabel: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F5;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
  <tr><td style="background:#1B2A4A;padding:24px 32px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:800;">New Donation Received</h1>
    <p style="margin:4px 0 0;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Kapatid Ministry</p>
  </td></tr>
  <tr><td style="padding:32px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:8px 0;border-bottom:1px solid #E8E4DF;">
        <span style="color:#8B7E74;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Amount</span><br/>
        <span style="color:#1B2A4A;font-size:28px;font-weight:800;">₱${Number(sub.amount).toLocaleString()}</span>
      </td></tr>
      <tr><td style="padding:12px 0;border-bottom:1px solid #E8E4DF;">
        <span style="color:#8B7E74;font-size:12px;font-weight:600;text-transform:uppercase;">Donor</span><br/>
        <span style="color:#1B2A4A;font-size:15px;font-weight:700;">${sub.donorName}</span>
        <span style="color:#4A5568;font-size:13px;"> — ${sub.donorEmail}</span>
      </td></tr>
      <tr><td style="padding:12px 0;border-bottom:1px solid #E8E4DF;">
        <span style="color:#8B7E74;font-size:12px;font-weight:600;text-transform:uppercase;">Reference</span><br/>
        <span style="color:#C7963D;font-size:15px;font-weight:800;font-family:monospace;">${sub.refCode}</span>
      </td></tr>
      <tr><td style="padding:12px 0;border-bottom:1px solid #E8E4DF;">
        <span style="color:#8B7E74;font-size:12px;font-weight:600;text-transform:uppercase;">Fund</span><br/>
        <span style="color:#1B2A4A;font-size:14px;font-weight:600;">${sub.fund}</span>
      </td></tr>
      <tr><td style="padding:12px 0;border-bottom:1px solid #E8E4DF;">
        <span style="color:#8B7E74;font-size:12px;font-weight:600;text-transform:uppercase;">Method</span><br/>
        <span style="color:#1B2A4A;font-size:14px;font-weight:600;">${methodLabel} · ${freqLabel}</span>
      </td></tr>
      ${sub.message ? `<tr><td style="padding:12px 0;border-bottom:1px solid #E8E4DF;">
        <span style="color:#8B7E74;font-size:12px;font-weight:600;text-transform:uppercase;">Message</span><br/>
        <span style="color:#4A5568;font-size:14px;font-style:italic;">"${sub.message}"</span>
      </td></tr>` : ""}
    </table>
  </td></tr>
  ${sub.screenshotUrl ? `<tr><td style="padding:24px 32px;border-top:1px solid #E8E4DF;">
    <p style="margin:0 0 12px;color:#8B7E74;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Payment Proof Screenshot</p>
    <a href="${sub.screenshotUrl}" target="_blank" style="display:block;">
      <img src="${sub.screenshotUrl}" alt="Payment proof" style="max-width:100%;height:auto;border-radius:8px;border:1px solid #E8E4DF;" />
    </a>
    <p style="margin:8px 0 0;"><a href="${sub.screenshotUrl}" target="_blank" style="color:#C7963D;font-size:12px;font-weight:600;">View full-size image &rarr;</a></p>
  </td></tr>` : ""}
  <tr><td style="background:#F7F5F2;padding:20px 32px;border-top:1px solid #E8E4DF;text-align:center;">
    <p style="margin:0;color:#A09890;font-size:11px;">Submitted ${new Date(sub.submittedAt).toLocaleString("en-PH", { timeZone: "Asia/Manila" })}</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// Donor receipt/thank you email
function buildDonorReceiptHtml(sub: any, methodLabel: string, freqLabel: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F5;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
  <tr><td style="background:#1B2A4A;padding:24px 32px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:800;">Salamat, ${sub.donorName}!</h1>
    <p style="margin:4px 0 0;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Your gift makes a difference</p>
  </td></tr>
  <tr><td style="padding:32px;">
    <p style="margin:0 0 20px;color:#4A5568;font-size:15px;line-height:1.7;">
      Thank you for your generous gift to Kapatid Ministry. Your faithfulness in giving helps us continue to serve Filipino families and communities in need.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F5F2;border-radius:12px;padding:20px;">
      <tr><td style="padding:8px 20px;">
        <span style="color:#8B7E74;font-size:11px;font-weight:600;text-transform:uppercase;">Amount</span><br/>
        <span style="color:#1B2A4A;font-size:24px;font-weight:800;">₱${Number(sub.amount).toLocaleString()}</span>
      </td></tr>
      <tr><td style="padding:8px 20px;">
        <span style="color:#8B7E74;font-size:11px;font-weight:600;text-transform:uppercase;">Reference Code</span><br/>
        <span style="color:#C7963D;font-size:15px;font-weight:800;font-family:monospace;">${sub.refCode}</span>
      </td></tr>
      <tr><td style="padding:8px 20px;">
        <span style="color:#8B7E74;font-size:11px;font-weight:600;text-transform:uppercase;">Details</span><br/>
        <span style="color:#1B2A4A;font-size:14px;">${sub.fund} · ${methodLabel} · ${freqLabel}</span>
      </td></tr>
    </table>
    <p style="margin:24px 0 0;color:#4A5568;font-size:14px;line-height:1.7;">
      <strong style="color:#1B2A4A;">Please keep this email as your donation receipt.</strong> If you sent your payment via ${methodLabel}, our team will verify the transaction and you will be credited accordingly.
    </p>
    <p style="margin:16px 0 0;color:#4A5568;font-size:14px;line-height:1.7;">
      If you have any questions, feel free to reach out to us at <a href="mailto:kapatidministry@gmail.com" style="color:#C7963D;font-weight:600;">kapatidministry@gmail.com</a>.
    </p>
  </td></tr>
  <tr><td style="background:#F7F5F2;padding:24px 32px;border-top:1px solid #E8E4DF;text-align:center;">
    <p style="margin:0 0 8px;color:#8B7E74;font-size:12px;font-style:italic;">"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." — 2 Corinthians 9:7</p>
    <p style="margin:12px 0 0;color:#A09890;font-size:11px;">
      Kapatid Ministry &middot; 4 Acacia St., Silanganan Subd. Llano, Caloocan City, Philippines
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// ─── Team Members (KV Store) ────────────────────────────────────────────
// Each team member stored as "team:<id>" with value { id, name, role, image, bio, type, badge, death_year, order }
// type: "memorial" | "founder" | "leadership"

app.get(`${PREFIX}/team`, async (c) => {
  try {
    const items = await kv.getByPrefix("team:");
    // getByPrefix returns values directly, not {key,value} objects
    const members = (items || []).filter((item: any) => item != null).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    return c.json(members);
  } catch (e: any) {
    console.log("Get team error:", e);
    return c.json({ error: `Failed to fetch team members: ${e.message}` }, 500);
  }
});

app.post(`${PREFIX}/team`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const member = await c.req.json();
    if (!member.name?.trim()) return c.json({ error: "Name is required" }, 400);
    if (!member.id) member.id = crypto.randomUUID();
    await kv.set(`team:${member.id}`, member);
    return c.json(member);
  } catch (e: any) {
    console.log("Save team member error:", e);
    return c.json({ error: `Failed to save team member: ${e.message}` }, 500);
  }
});

app.delete(`${PREFIX}/team/:id`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const id = c.req.param("id");
    await kv.del(`team:${id}`);
    return c.json({ success: true });
  } catch (e: any) {
    console.log("Delete team member error:", e);
    return c.json({ error: `Failed to delete team member: ${e.message}` }, 500);
  }
});

// ─── Site Settings (KV Store) ──────────────────────────────────────────
// Global site settings stored as a single KV entry "site-settings"
// Value: { homepage_video_url, homepage_video_thumbnail, ... }

app.get(`${PREFIX}/site-settings`, async (c) => {
  try {
    const value = await kv.get("site-settings");
    return c.json(value || {});
  } catch (e: any) {
    console.log("Get site-settings error:", e);
    return c.json({ error: `Failed to fetch site settings: ${e.message}` }, 500);
  }
});

app.post(`${PREFIX}/site-settings`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const settings = await c.req.json();
    // Merge with existing settings so partial updates work
    const existing = (await kv.get("site-settings")) || {};
    const merged = { ...existing, ...settings };
    await kv.set("site-settings", merged);
    return c.json(merged);
  } catch (e: any) {
    console.log("Save site-settings error:", e);
    return c.json({ error: `Failed to save site settings: ${e.message}` }, 500);
  }
});

// ─── User Management (KV Store + Supabase Auth Admin) ────────────────────
// Profiles stored with key pattern "profile:{user_id}"
// Value: { id, email, name, role, created_at }
// Roles: "admin" | "editor" | "viewer"

// Get current user's profile (auto-creates in profiles table if missing)
app.get(`${PREFIX}/users/me`, async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const supabase = supabaseAdmin();

    // Get auth user info (for email, metadata)
    const { data: authData } = await supabase.auth.admin.getUserById(userId);
    const authUser = authData?.user;
    if (!authUser) return c.json({ error: "User not found in auth" }, 404);

    // Check profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profile) {
      return c.json({
        id: profile.id,
        email: authUser.email || "",
        name: profile.full_name || authUser.user_metadata?.name || authUser.email || "",
        role: profile.role,
        created_at: profile.created_at || authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at || null,
        email_confirmed_at: authUser.email_confirmed_at || null,
      });
    }

    // No profile — auto-create one
    const { data: allUsers } = await supabase.auth.admin.listUsers({ page: 1, perPage: 2 });
    const isOnlyUser = allUsers?.users?.length === 1;
    const newRole = isOnlyUser ? "admin" : "viewer";
    const fullName = authUser.user_metadata?.name || authUser.email || "";

    const { data: inserted, error: insertErr } = await supabase
      .from("profiles")
      .upsert({ id: userId, full_name: fullName, role: newRole })
      .select()
      .single();

    if (insertErr) {
      console.log("Auto-create profile error:", insertErr);
      return c.json({ error: `Failed to create profile: ${insertErr.message}` }, 500);
    }

    return c.json({
      id: inserted.id,
      email: authUser.email || "",
      name: inserted.full_name || fullName,
      role: inserted.role,
      created_at: inserted.created_at || authUser.created_at,
      last_sign_in_at: authUser.last_sign_in_at || null,
      email_confirmed_at: authUser.email_confirmed_at || null,
    });
  } catch (e: any) {
    console.log("Get my profile error:", e);
    return c.json({ error: `Failed to fetch profile: ${e.message}` }, 500);
  }
});

// Admin: List all users (auth users merged with profiles table)
app.get(`${PREFIX}/users`, async (c) => {
  try {
    const adminId = await requireAdmin(c);
    if (!adminId) return c.json({ error: "Forbidden: admin role required" }, 403);

    const supabase = supabaseAdmin();
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (authError) {
      console.log("List auth users error:", authError);
      return c.json({ error: `Failed to list users: ${authError.message}` }, 500);
    }
    const authUsers = authData?.users || [];

    // Get all profiles from profiles table
    const { data: profiles } = await supabase.from("profiles").select("*");
    const profileMap: Record<string, any> = {};
    for (const p of (profiles || [])) {
      if (p?.id) profileMap[p.id] = p;
    }

    const merged = authUsers.map((u: any) => {
      const dbProfile = profileMap[u.id];
      return {
        id: u.id,
        email: u.email || "",
        name: dbProfile?.full_name || u.user_metadata?.name || u.email || "",
        role: dbProfile?.role || "viewer",
        created_at: dbProfile?.created_at || u.created_at,
        last_sign_in_at: u.last_sign_in_at || null,
        email_confirmed_at: u.email_confirmed_at || null,
      };
    });

    const roleOrder: Record<string, number> = { admin: 0, editor: 1, viewer: 2 };
    merged.sort((a: any, b: any) => {
      const ra = roleOrder[a.role] ?? 9;
      const rb = roleOrder[b.role] ?? 9;
      if (ra !== rb) return ra - rb;
      return (a.name || "").localeCompare(b.name || "");
    });

    return c.json(merged);
  } catch (e: any) {
    console.log("List users error:", e);
    return c.json({ error: `Failed to list users: ${e.message}` }, 500);
  }
});

// Admin: Create a new user (auth + profiles table)
app.post(`${PREFIX}/users`, async (c) => {
  try {
    const adminId = await requireAdmin(c);
    if (!adminId) return c.json({ error: "Forbidden: admin role required" }, 403);

    const { email, password, name, role } = await c.req.json();
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }
    const validRoles = ["admin", "editor", "viewer"];
    const assignedRole = validRoles.includes(role) ? role : "viewer";

    const supabase = supabaseAdmin();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || email },
      email_confirm: true,
    });
    if (error) {
      console.log("Create user auth error:", error);
      return c.json({ error: `Failed to create user: ${error.message}` }, 400);
    }

    const userId = data.user?.id;
    if (!userId) {
      return c.json({ error: "User created but no ID returned" }, 500);
    }

    // Insert into profiles table
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        full_name: (name || email).trim(),
        role: assignedRole,
      })
      .select()
      .single();

    if (profileErr) {
      console.log("Create profile row error:", profileErr);
      // Auth user was created, try to clean up or just warn
      return c.json({ error: `User created in auth but profile insert failed: ${profileErr.message}` }, 500);
    }

    return c.json({
      id: userId,
      email: email.trim().toLowerCase(),
      name: profile.full_name || (name || email).trim(),
      role: profile.role,
      created_at: profile.created_at || data.user?.created_at,
      last_sign_in_at: null,
      email_confirmed_at: data.user?.email_confirmed_at || null,
    });
  } catch (e: any) {
    console.log("Create user error:", e);
    return c.json({ error: `Failed to create user: ${e.message}` }, 500);
  }
});

// Admin: Update a user's profile (role, name) via profiles table
app.put(`${PREFIX}/users/:id`, async (c) => {
  try {
    const adminId = await requireAdmin(c);
    if (!adminId) return c.json({ error: "Forbidden: admin role required" }, 403);

    const targetId = c.req.param("id");
    const updates = await c.req.json();
    const supabase = supabaseAdmin();

    // Safety: prevent removing the last admin
    if (updates.role && updates.role !== "admin") {
      const { data: admins } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin");
      const adminIds = (admins || []).map((a: any) => a.id);
      if (adminIds.length <= 1 && adminIds.includes(targetId)) {
        return c.json({ error: "Cannot remove the last admin. Assign another admin first." }, 400);
      }
    }

    // Get existing profile (or create one on the fly)
    let { data: existing } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", targetId)
      .single();

    if (!existing) {
      // Profile row doesn't exist yet — auto-create
      const { data: authData } = await supabase.auth.admin.getUserById(targetId);
      const user = authData?.user;
      const { data: created } = await supabase
        .from("profiles")
        .upsert({
          id: targetId,
          full_name: user?.user_metadata?.name || user?.email || "",
          role: "viewer",
        })
        .select()
        .single();
      existing = created;
    }

    const validRoles = ["admin", "editor", "viewer"];
    const newName = updates.name !== undefined ? updates.name.trim() : existing?.full_name;
    const newRole = updates.role && validRoles.includes(updates.role) ? updates.role : existing?.role;

    // Update profiles table
    const { data: updated, error: updateErr } = await supabase
      .from("profiles")
      .update({ full_name: newName, role: newRole })
      .eq("id", targetId)
      .select()
      .single();

    if (updateErr) {
      console.log("Update profile error:", updateErr);
      return c.json({ error: `Failed to update profile: ${updateErr.message}` }, 500);
    }

    // Also sync name to auth user_metadata
    if (updates.name !== undefined) {
      await supabase.auth.admin.updateUserById(targetId, {
        user_metadata: { name: newName },
      });
    }

    // Get auth info for response
    const { data: authInfo } = await supabase.auth.admin.getUserById(targetId);
    return c.json({
      id: targetId,
      email: authInfo?.user?.email || "",
      name: updated.full_name || "",
      role: updated.role,
      created_at: updated.created_at,
      last_sign_in_at: authInfo?.user?.last_sign_in_at || null,
      email_confirmed_at: authInfo?.user?.email_confirmed_at || null,
    });
  } catch (e: any) {
    console.log("Update user error:", e);
    return c.json({ error: `Failed to update user: ${e.message}` }, 500);
  }
});

// Admin: Delete a user (auth + profiles table)
app.delete(`${PREFIX}/users/:id`, async (c) => {
  try {
    const adminId = await requireAdmin(c);
    if (!adminId) return c.json({ error: "Forbidden: admin role required" }, 403);

    const targetId = c.req.param("id");

    if (targetId === adminId) {
      return c.json({ error: "You cannot delete your own account." }, 400);
    }

    const supabase = supabaseAdmin();

    // Safety: check if target is the last admin
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", targetId)
      .single();

    if (targetProfile?.role === "admin") {
      const { data: admins } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin");
      if ((admins || []).length <= 1) {
        return c.json({ error: "Cannot delete the last admin." }, 400);
      }
    }

    // Delete from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(targetId);
    if (authError) {
      console.log("Delete auth user error:", authError);
      return c.json({ error: `Failed to delete user: ${authError.message}` }, 500);
    }

    // Delete from profiles table
    await supabase.from("profiles").delete().eq("id", targetId);

    return c.json({ success: true });
  } catch (e: any) {
    console.log("Delete user error:", e);
    return c.json({ error: `Failed to delete user: ${e.message}` }, 500);
  }
});

Deno.serve(app.fetch);