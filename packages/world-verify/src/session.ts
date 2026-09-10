import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { dirname, resolve } from "path";
import type { WorldCredential } from "./types";
import { newSessionId } from "./gate";

const STORE_PATH = resolve(
  process.cwd(),
  process.env.WORLD_SESSION_STORE || ".data/world-sessions.json"
);

type StoreFile = Record<string, WorldCredential>;

function load(): StoreFile {
  try {
    if (!existsSync(STORE_PATH)) return {};
    return JSON.parse(readFileSync(STORE_PATH, "utf8")) as StoreFile;
  } catch {
    return {};
  }
}

function save(store: StoreFile): void {
  mkdirSync(dirname(STORE_PATH), { recursive: true });
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

/** In-memory cache layered over a small JSON file for hackathon demos. */
const memory = new Map<string, WorldCredential>();

export function createSession(credential: Omit<WorldCredential, "sessionId">): WorldCredential {
  const sessionId = newSessionId();
  const full: WorldCredential = { ...credential, sessionId };
  memory.set(sessionId, full);
  const store = load();
  store[sessionId] = full;
  save(store);
  return full;
}

export function getSession(sessionId: string | undefined | null): WorldCredential | null {
  if (!sessionId) return null;
  const mem = memory.get(sessionId);
  if (mem) return mem;
  const store = load();
  const found = store[sessionId];
  if (found) {
    memory.set(sessionId, found);
    return found;
  }
  return null;
}

export function clearSession(sessionId: string): void {
  memory.delete(sessionId);
  const store = load();
  delete store[sessionId];
  save(store);
}

export function listNullifiers(): Set<string> {
  const store = load();
  const set = new Set<string>();
  for (const c of Object.values(store)) {
    if (c.nullifier) set.add(c.nullifier.toLowerCase());
  }
  return set;
}
