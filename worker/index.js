const MAX_BYTES = 8 * 1024 * 1024;
const ID_RE = /^[a-z0-9]+-[a-z0-9]+$/i;
const TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    try {
      if (path === "/api/photos" && request.method === "GET") {
        const list = await listPhotos(env);
        const cb = String(url.searchParams.get("callback") || "");
        if (/^[A-Za-z_$][\w$]*$/.test(cb)) {
          const headers = corsHeaders(request, env);
          headers.set("Content-Type", "text/javascript; charset=utf-8");
          headers.set("Cache-Control", "no-store");
          return new Response(`${cb}(${JSON.stringify(list)})`, { headers });
        }
        return json(request, env, list);
      }

      if (path === "/api/auth" && request.method === "GET") {
        if (!isOwner(request, env)) return text(request, env, "unauthorized", 401);
        return new Response(null, { status: 204, headers: corsHeaders(request, env) });
      }

      if (path === "/api/photos" && request.method === "POST") {
        return uploadPhoto(request, env);
      }

      const photoMatch = path.match(/^\/api\/photos\/([^/]+)$/);
      if (photoMatch && request.method === "DELETE") {
        return removePhoto(request, env, photoMatch[1]);
      }

      const imgMatch = path.match(/^\/img\/([^/]+)$/);
      if (imgMatch && request.method === "GET") {
        return servePhoto(request, env, imgMatch[1]);
      }

      return text(request, env, "not found", 404);
    } catch {
      return text(request, env, "error", 500);
    }
  },
};

function corsHeaders(request, env) {
  const headers = new Headers();
  const origin = request.headers.get("Origin") || "";
  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  } else {
    headers.set("Access-Control-Allow-Origin", "*");
  }
  headers.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Photo-Name");
  headers.set("Access-Control-Max-Age", "86400");
  return headers;
}

function json(request, env, data, status = 200) {
  const headers = corsHeaders(request, env);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { status, headers });
}

function text(request, env, body, status) {
  const headers = corsHeaders(request, env);
  headers.set("Content-Type", "text/plain; charset=utf-8");
  return new Response(body, { status, headers });
}

function safeEqual(left, right) {
  if (typeof left !== "string" || typeof right !== "string") return false;
  const encoder = new TextEncoder();
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  const len = Math.max(a.byteLength, b.byteLength);
  let diff = a.byteLength === b.byteLength ? 0 : 1;
  for (let i = 0; i < len; i++) diff |= (a[i] || 0) ^ (b[i] || 0);
  return diff === 0;
}

function isOwner(request, env) {
  const secret = env.UPLOAD_TOKEN;
  if (!secret) return false;
  const auth = request.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return false;
  return safeEqual(auth.slice(7), secret);
}

function photoName(request) {
  const raw = request.headers.get("X-Photo-Name") || "foto";
  const base = raw.replace(/[/\\]/g, "").replace(/[^\w.\- äöüÄÖÜß-]/g, "").trim();
  return (base || "foto").slice(0, 180);
}

async function listPhotos(env) {
  const photos = [];
  let cursor;
  do {
    const page = await env.PHOTOS.list({
      cursor,
      include: ["customMetadata"],
    });
    for (const object of page.objects) {
      if (!ID_RE.test(object.key)) continue;
      const meta = object.customMetadata || {};
      photos.push({
        id: object.key,
        name: meta.name || "foto",
        added: Number(meta.added) || Date.parse(object.uploaded) || 0,
      });
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  photos.sort((a, b) => b.added - a.added);
  return photos;
}

async function uploadPhoto(request, env) {
  if (!isOwner(request, env)) return text(request, env, "unauthorized", 401);

  const type = (request.headers.get("Content-Type") || "").split(";")[0].trim().toLowerCase();
  if (!TYPES.has(type)) return text(request, env, "unsupported type", 415);

  const body = await request.arrayBuffer();
  if (!body.byteLength || body.byteLength > MAX_BYTES) {
    return text(request, env, "too large", 413);
  }

  const id = `${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
  const name = photoName(request);
  const added = Date.now();

  await env.PHOTOS.put(id, body, {
    httpMetadata: { contentType: type },
    customMetadata: { name, added: String(added) },
  });

  return json(request, env, { id, name, added }, 201);
}

async function removePhoto(request, env, id) {
  if (!isOwner(request, env)) return text(request, env, "unauthorized", 401);
  if (!ID_RE.test(id)) return text(request, env, "not found", 404);
  await env.PHOTOS.delete(id);
  return new Response(null, { status: 204, headers: corsHeaders(request, env) });
}

async function servePhoto(request, env, id) {
  if (!ID_RE.test(id)) return text(request, env, "not found", 404);
  const object = await env.PHOTOS.get(id);
  if (!object) return text(request, env, "not found", 404);

  const headers = corsHeaders(request, env);
  headers.set("Content-Type", object.httpMetadata?.contentType || "image/jpeg");
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("ETag", object.httpEtag);
  return new Response(object.body, { headers });
}
