import fs from 'fs';
import path from 'path';

const STATS_FILE = path.join(process.cwd(), '.cmit-stats.json');

export type Stats = Record<string, number>;

export function loadStats(): Stats {
  try {
    const raw = fs.readFileSync(STATS_FILE, 'utf8');
    return JSON.parse(raw) as Stats;
  } catch {
    return {};
  }
}

export function saveStats(stats: Stats) {
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf8');
}

export function incrementType(type: string) {
  const s = loadStats();
  s[type] = (s[type] || 0) + 1;
  saveStats(s);
}
