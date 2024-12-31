import { saveGroupMetadata } from '#sql';

/**
 * Configuration for rate limiting and queue processing
 * @typedef {Object} Config
 * @property {number} INITIAL_DELAY - Initial delay between updates (10 minutes)
 * @property {number} PROCESS_DELAY - Delay between processing groups (5 seconds)
 * @property {number} RATE_LIMIT_DELAY - Delay after hitting rate limit (15 minutes)
 * @property {number} MAX_CONCURRENT - Maximum concurrent processes
 * @property {number} RETRY_DELAY - Delay between retries (3 minutes)
 * @property {number} MAX_RETRIES - Maximum retry attempts
 */
const CONFIG = {
	INITIAL_DELAY: 600000,
	PROCESS_DELAY: 5000,
	RATE_LIMIT_DELAY: 900000,
	MAX_CONCURRENT: 1,
	RETRY_DELAY: 180000,
	MAX_RETRIES: 3,
};

/**
 * Handles rate limiting and queue management for group metadata updates
 */
class RateLimitHandler {
	constructor() {
		this.queue = new Map();
		this.processing = false;
		this.retryCount = 0;
		this.lastProcessTime = 0;
	}

	/**
	 * Delays execution for specified milliseconds
	 * @param {number} ms - Milliseconds to delay
	 */
	async delay(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	/**
	 * Processes a single group's metadata
	 * @param {string} jid - Group JID
	 * @param {Object} conn - Connection object
	 */
	async processGroup(jid, conn) {
		try {
			const now = Date.now();
			const timeSinceLastProcess = now - this.lastProcessTime;

			if (timeSinceLastProcess < CONFIG.PROCESS_DELAY) {
				await this.delay(CONFIG.PROCESS_DELAY - timeSinceLastProcess);
			}

			console.log(`Processing group: ${jid}`);
			await saveGroupMetadata(jid, conn);
			this.lastProcessTime = Date.now();
			console.log(`Successfully processed group: ${jid}`);

			return true;
		} catch (error) {
			if (error?.data === 429) {
				console.log(`Rate limit hit for group: ${jid}`);
				throw error;
			}
			console.log(`Error processing group ${jid}: ${error.message}`);
			return false;
		}
	}

	/**
	 * Processes the queue of groups
	 * @param {Object} conn - Connection object
	 */
	async processQueue(conn) {
		if (this.processing) {
			console.log('Queue is already being processed');
			return;
		}

		this.processing = true;
		console.log('Starting queue processing');

		try {
			for (const [jid, retries] of this.queue.entries()) {
				if (retries >= CONFIG.MAX_RETRIES) {
					console.log(`Max retries reached for group: ${jid}`);
					this.queue.delete(jid);
					continue;
				}

				try {
					await this.processGroup(jid, conn);
					this.queue.delete(jid);
				} catch (error) {
					if (error?.data === 429) {
						console.log(`Rate limit encountered, pausing for ${CONFIG.RATE_LIMIT_DELAY / 1000}s`);
						await this.delay(CONFIG.RATE_LIMIT_DELAY);
						this.queue.set(jid, retries + 1);
						break;
					}
				}

				await this.delay(CONFIG.PROCESS_DELAY);
			}
		} finally {
			this.processing = false;
			console.log('Queue processing completed');
		}
	}
}

/**
 * Updates group metadata with rate limiting
 * @param {Object} msg - Message object
 */
export const updateGroupMetadata = async msg => {
	const conn = msg.client;
	const handler = new RateLimitHandler();

	const updateGroups = async () => {
		try {
			console.log('Fetching participating groups');
			const groups = await conn.groupFetchAllParticipating();

			if (!groups) {
				console.log('No groups found');
				return;
			}

			const groupIds = Object.keys(groups);
			console.log(`Found ${groupIds.length} groups`);

			for (const jid of groupIds) {
				if (!handler.queue.has(jid)) {
					handler.queue.set(jid, 0);
				}
			}

			await handler.processQueue(conn);
		} catch (error) {
			console.log(`Error in updateGroups: ${error.message}`);
			if (error?.data === 429) {
				await handler.delay(CONFIG.RATE_LIMIT_DELAY);
			}
		}
	};

	await handler.delay(CONFIG.INITIAL_DELAY);
	await updateGroups();
	setInterval(updateGroups, CONFIG.INITIAL_DELAY);
};
