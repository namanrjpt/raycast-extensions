import os from "node:os";
import { Cache, environment } from "@raycast/api";
import Parser from "rss-parser";
import { CacheEntry, Topic } from "./types";

// The HNRSS service caches responses for 5 minutes: https://github.com/hnrss/hnrss/issues/71
const CACHE_DURATION_IN_MS = 5 * 60 * 1_000;

const cache = new Cache();
const parser = new Parser({
  headers: {
    "User-Agent": `UX News Extension, v1.0 (${os.type()} ${os.release()})`,
  },
});

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getStories(topic: Topic | null) {
  if (!topic) {
    return [];
  }

  const cachedResponse = cache.get(topic);
  if (cachedResponse) {
    const parsed: CacheEntry = JSON.parse(cachedResponse);

    const elapsed = Date.now() - parsed.timestamp;
    console.log(`${topic} cache age: ${elapsed / 1000} seconds`);

    if (elapsed <= CACHE_DURATION_IN_MS) {
      return parsed.items;
    } else {
      console.log(`Cache expired for ${topic}`);
    }
  }

  let feed = null;
  if(topic == 'Smashing Magazine')
    feed = await parser.parseURL(`https://www.smashingmagazine.com/feed/`);
  else if (topic == 'UX Design') {
    // await sleep(2000);
    feed = await parser.parseURL(`https://uxdesign.cc/feed`);
  }
  else
    feed = await parser.parseURL(`https://rss.app/feeds/dDRkpg8r6nFby69n.xml`);

  feed.items = feed.items.slice(0, 20)

  cache.set(topic, JSON.stringify({ timestamp: Date.now(), items: feed.items }));

  return feed.items;
}
