import { MongoClient } from "mongodb";

// Get the connection string from Netlify's environment
const MONGO_URI = 'mongodb+srv://frssat-app-user:M2UP1uFW2UoKC6sl@frssat-cluster.7itdjsk.mongodb.net/frssat-event-prod?appName=frssat-cluster';
export const client = new MongoClient(MONGO_URI);

// --- Our In-Memory Cache ---
// We store the data and a timestamp of when we fetched it.
let configCache = {
	timestamp: 0,
	data: null,
};

// Set our cache "freshness" duration. 5 minutes is a good balance.
const CACHE_TTL_MS = 5 * 60 * 1000; // 10 minutes

/**
 * A cached function to get the global config.
 * It will only hit the database if the cache is older than 10 minutes.
 */
export async function getActiveConfig() {
	const now = Date.now();

	// 1. CHECK THE CACHE
	// Is the cache fresh? If yes, return the cached data instantly.
	if (configCache.data && (now - configCache.timestamp < CACHE_TTL_MS)) {
		console.log("Serving config from CACHE"); // Good for debugging
		return configCache.data;
	}

	// 2. CACHE IS STALE OR EMPTY. FETCH FROM DB.
	// console.log("Cache stale. Fetching config from DB."); // Good for debugging
	try {
		await client.connect();

		const database = client.db(); // DB name is in the URI

		const configCollection = database.collection("config");
		const eventsCollection = database.collection("events");

		const globalConfig = await configCollection.findOne({ _id: "global_config" });

		if (!globalConfig) {
			throw new Error("Global config document not found!");
		}

		const activeEventKey = globalConfig.current_event_key;

		const activeEvent = await eventsCollection.findOne({ _id: activeEventKey });

		if (!activeEvent) {
			throw new Error(`Active event "${activeEventKey}" not found in events collection!`);
		}

		const data = { activeEvent, globalConfig }

		// 3. SAVE TO CACHE and return
		configCache = {
			timestamp: now,
			data,
		};

		return data;

	} catch (err) {
		console.error("Failed to fetch active config:", err);
		throw err; // Let the calling function know something went wrong
	} finally {
		// We don't close the client here anymore,
		// as it's shared by all functions using this helper.
		// MongoDB's driver is designed to handle this.
	}
}