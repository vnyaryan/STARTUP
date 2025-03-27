import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL, // e.g., redis://localhost:6379
});

redis.on("error", (err) => console.error("Redis Client Error", err));

if (!redis.isOpen) {
  redis.connect();
}

export { redis };
