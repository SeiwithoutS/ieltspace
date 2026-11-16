import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { env } from "../../config.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { asyncHandler, HttpError } from "../../utils/http.js";

const audioSchema = z.array(z.object({ phonetics: z.array(z.object({ audio: z.string().optional() })).optional() }));
const mwSchema = z.array(z.union([z.string(), z.object({
  meta: z.object({ id: z.string() }).optional(),
  hwi: z.object({ prs: z.array(z.object({ sound: z.object({ audio: z.string() }).optional() })).optional() }).optional(),
})]));
const pixabaySchema = z.object({ hits: z.array(z.object({ id: z.number(), webformatURL: z.string().url(), pageURL: z.string().url(), user: z.string() })) });
const unsplashPhoto = z.object({ id: z.string(), urls: z.object({ small: z.string().url() }), user: z.object({ name: z.string(), links: z.object({ html: z.string().url() }) }), links: z.object({ download_location: z.string().url() }) });
type Audio = { url: string; source: string; accent?: "US" | "UK" | "AU" };
type Picture = { id: string; url: string; source: "Wikipedia" | "Pixabay" | "Unsplash"; credit: string; creditUrl: string; download?: string };
const cache = new Map<string, { expires: number; value: unknown }>();
const pictures = new Map<string, Picture>();
class ProviderError extends Error {
  constructor(readonly status: number) { super("Provider request failed"); }
}
function providerFailure(error: unknown) {
  if (error instanceof ProviderError) {
    if (error.status === 429) return "HTTP 429: nhà cung cấp đang giới hạn yêu cầu. Chờ rồi thử lại.";
    if (error.status === 401 || error.status === 403) return `HTTP ${error.status}: kiểm tra key, quyền ứng dụng hoặc hạn chế truy cập của nhà cung cấp.`;
    if (error.status === 404) return "không tìm thấy mục từ.";
    return `nhà cung cấp trả HTTP ${error.status}.`;
  }
  return "chưa kết nối được hoặc phản hồi không đúng định dạng.";
}
async function json(url: string, headers?: Record<string, string>): Promise<unknown> {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new ProviderError(response.status);
  return response.json();
}
async function cached(key: string, load: () => Promise<unknown>): Promise<unknown> {
  const old = cache.get(key);
  if (old && old.expires > Date.now()) return old.value;
  const value = await load();
  if (cache.size >= 2000) cache.delete(cache.keys().next().value!);
  cache.set(key, { expires: Date.now() + 86_400_000, value });
  return value;
}
export function merriamAudioUrl(name: string): string {
  const folder = name.startsWith("bix") ? "bix" : name.startsWith("gg") ? "gg" : /^[^a-z]/i.test(name) ? "number" : name[0];
  return `https://media.merriam-webster.com/audio/prons/en/us/mp3/${folder}/${encodeURIComponent(name)}.mp3`;
}
export async function lookupAudio(word: string) {
  const warnings: string[] = [];
  const jobs: Promise<Audio[]>[] = [];
  async function run(source: string, load: () => Promise<Audio[]>) {
    try { return await load(); } catch (error) { warnings.push(`${source}: ${providerFailure(error)}`); return []; }
  }
  jobs.push(run("Free Dictionary", async () => {
    const data = audioSchema.parse(await cached(`free:${word}`, () => json(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)));
    return data.flatMap(item => item.phonetics ?? []).flatMap(p => {
      const url = p.audio?.startsWith("//") ? `https:${p.audio}` : p.audio;
      if (!url?.startsWith("https://")) return [];
      const accent = /(?:-us[.]mp3|_us_)/i.test(url) ? "US" : /(?:-(uk|gb)[.]mp3|_gb_)/i.test(url) ? "UK" : /(?:-au[.]mp3|_au_)/i.test(url) ? "AU" : undefined;
      return [{ url, source: "Free Dictionary", accent }];
    });
  }));
  for (const [product, key, source] of [
    ["learners", env.MW_LEARNERS_KEY, "Merriam Learner’s"],
    [env.MW_DICTIONARY_PRODUCT, env.MW_DICTIONARY_KEY, "Merriam Dictionary"],
  ]) {
    if (!key || !product) { warnings.push(`${source}: ${!key ? "tiến trình backend chưa nạp key; kiểm tra backend/.env và khởi động lại backend" : "đã có key nhưng chưa đặt MW_DICTIONARY_PRODUCT; chỉ đặt collegiate nếu key thuộc sản phẩm này"}.`); continue; }
    jobs.push(run(source!, async () => {
      const data = mwSchema.parse(await cached(`mw:${product}:${word}`, () => json(`https://dictionaryapi.com/api/v3/references/${product}/json/${encodeURIComponent(word)}?key=${encodeURIComponent(key)}`)));
      return data.flatMap(item => typeof item === "string" || item.meta?.id.replace(/:\d+$/, "").toLowerCase() !== word ? [] :
        (item.hwi?.prs ?? []).flatMap(p => p.sound ? [{ url: merriamAudioUrl(p.sound.audio), source: source!, accent: "US" as const }] : []));
    }));
  }
  const all = (await Promise.all(jobs)).flat();
  return { candidates: all.filter((item, index) => all.findIndex(other => other.url === item.url) === index), warnings };
}
export async function lookupImages(word: string) {
  const warnings: string[] = [];
  async function run(source: string, key: string | undefined, load: () => Promise<Picture[]>) {
    if (!key) { warnings.push(`${source}: tiến trình backend chưa nạp key; kiểm tra backend/.env và khởi động lại backend.`); return []; }
    try { return await load(); } catch (error) { warnings.push(`${source}: ${providerFailure(error)}`); return []; }
  }
  let candidates = await run("Wikipedia", "public", async () => {
    const data = z.object({ type: z.string().optional(), title: z.string(), thumbnail: z.object({ source: z.string().url() }).optional(),
      content_urls: z.object({ desktop: z.object({ page: z.string().url() }) }).optional(),
    }).parse(await cached(`wikipedia:${word}`, () => json(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`, { "User-Agent": "IELTSpace/0.1 (vocabulary image lookup)" })));
    if (data.type === "disambiguation" || !data.thumbnail?.source.startsWith("https://")) return [];
    return [{ id: `wikipedia:${word}`, url: data.thumbnail.source, source: "Wikipedia", credit: data.title,
      creditUrl: data.content_urls?.desktop.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(word)}` }];
  });
  if (!candidates.length) candidates = await run("Unsplash", env.UNSPLASH_ACCESS_KEY, async () => {
      const data = z.object({ results: z.array(unsplashPhoto) }).parse(await cached(`unsplash:${word}`, () => json(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(word)}&per_page=3&content_filter=high`, { Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}` })));
      return data.results.map(p => ({ id: `unsplash:${p.id}`, url: p.urls.small, source: "Unsplash" as const, credit: p.user.name, creditUrl: `${p.user.links.html}?utm_source=ieltspace&utm_medium=referral`, download: p.links.download_location }));
    });
  if (!candidates.length) candidates = await run("Pixabay", env.PIXABAY_API_KEY, async () => {
      const data = pixabaySchema.parse(await cached(`pixabay:${word}`, () => json(`https://pixabay.com/api/?key=${encodeURIComponent(env.PIXABAY_API_KEY!)}&q=${encodeURIComponent(word)}&safesearch=true&image_type=photo&per_page=3`)));
      return data.hits.map(p => ({ id: `pixabay:${p.id}`, url: p.webformatURL, source: "Pixabay" as const, credit: p.user, creditUrl: p.pageURL }));
    });
  for (const item of candidates) {
    if (pictures.size >= 6000) pictures.delete(pictures.keys().next().value!);
    pictures.set(item.id, item);
  }
  return { candidates: candidates.map(({ download: _download, ...item }) => item), warnings };
}

export const vocabularyMediaRouter = Router();
vocabularyMediaRouter.use(requireAuth, requireRole("ADMIN"), rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: "draft-7", legacyHeaders: false }));
vocabularyMediaRouter.get("/", asyncHandler(async (req, res) => {
  const query = z.object({ word: z.string().trim().min(1).max(100), type: z.enum(["audio", "image"]) }).safeParse(req.query);
  if (!query.success) throw new HttpError(400, "INVALID_QUERY", "Nhập từ cần tìm, tối đa 100 ký tự.");
  const word = query.data.word.toLowerCase();
  res.json(await (query.data.type === "audio" ? lookupAudio(word) : lookupImages(word)));
}));
vocabularyMediaRouter.post("/image", asyncHandler(async (req, res) => {
  const id = z.object({ id: z.string().max(100) }).safeParse(req.body);
  const picture = id.success ? pictures.get(id.data.id) : undefined;
  if (!picture) throw new HttpError(400, "IMAGE_EXPIRED", "Hãy tìm lại ảnh trước khi chọn.");
  try {
    let url = picture.url;
    if (picture.source === "Unsplash") {
      if (new URL(picture.download!).hostname !== "api.unsplash.com") throw new Error();
      await json(picture.download!, { Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}` });
    } else if (picture.source === "Pixabay") {
      // Pixabay allows preview hotlinks only; keep a local copy for the current local draft.
      const host = new URL(url).hostname;
      if (host !== "pixabay.com" && !host.endsWith(".pixabay.com")) throw new Error();
      const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(8000) });
      const mime = response.headers.get("content-type")?.split(";")[0];
      if (!response.ok || !mime || !["image/jpeg", "image/png", "image/webp"].includes(mime) || !response.body) throw new Error();
      const chunks: Uint8Array[] = []; let size = 0;
      for await (const chunk of response.body) {
        size += chunk.length;
        if (size > 1024 * 1024) throw new Error();
        chunks.push(chunk);
      }
      url = `data:${mime};base64,${Buffer.concat(chunks).toString("base64")}`;
    }
    res.json({ image: url, imageCredit: { source: picture.source, name: picture.credit, url: picture.creditUrl } });
  } catch { throw new HttpError(502, "IMAGE_UNAVAILABLE", "Chưa lấy được ảnh. Hãy chọn ảnh khác hoặc tải ảnh từ máy."); }
}));
