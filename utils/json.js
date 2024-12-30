import fs from 'fs';

class JSONMANAGER {
	constructor(jsonFile) {
		this.jsonFile = jsonFile;
		this.jsonData = this.loadData();
	}

	/**
	 * Loads the JSON data from a file if it exists, otherwise initializes an empty object.
	 * @returns {Object} - The loaded or empty JSON object.
	 */
	loadData() {
		if (fs.existsSync(this.jsonFile)) {
			const fileData = fs.readFileSync(this.jsonFile, 'utf-8');
			return JSONMANAGER.parseJSON(fileData);
		}
		this.createFile();
		return {};
	}

	/**
	 * Creates an empty JSON file if it does not exist.
	 */
	createFile() {
		fs.writeFileSync(this.jsonFile, JSON.stringify({}, null, 2));
	}

	/**
	 * Safely parses a JSON string.
	 * @param {string} jsonString - The JSON string to parse.
	 * @returns {Object} - The parsed JSON object or an error object if invalid.
	 */
	static parseJSON(jsonString) {
		try {
			return JSON.parse(jsonString);
		} catch (error) {
			return { error: 'Invalid JSON string' };
		}
	}

	/**
	 * Converts an object to a JSON string.
	 * @param {Object} obj - The object to stringify.
	 * @param {boolean} [pretty=false] - Whether to pretty-print the JSON.
	 * @returns {string} - The JSON string.
	 */
	static stringifyJSON(obj, pretty = false) {
		return pretty ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);
	}

	/**
	 * Creates data in the JSON file and adds sub-data with their values.
	 * @param {Object} initialData - The initial data to set.
	 * @param {Object} subData - The sub-data to add under initial data.
	 * @returns {Object} - The updated JSON data.
	 */
	createData(initialData, subData = {}) {
		this.jsonData = { ...initialData, ...subData };
		this.saveData();
		return this.jsonData;
	}

	/**
	 * Saves the updated JSON data to the file.
	 */
	saveData() {
		fs.writeFileSync(this.jsonFile, JSON.stringify(this.jsonData, null, 2));
	}

	/**
	 * Deletes a specific key or path from the JSON data.
	 * @param {string} path - The path of the key to delete (dot notation).
	 * @returns {Object} - The updated JSON object.
	 */
	delData(path) {
		const keys = path.split('.');
		let current = this.jsonData;
		for (let i = 0; i < keys.length - 1; i++) {
			current = current[keys[i]];
		}
		delete current[keys[keys.length - 1]];
		this.saveData();
		return this.jsonData;
	}

	/**
	 * Adds a key-value pair or object to the JSON data.
	 * @param {string|Object} key - The key or object to add.
	 * @param {*} value - The value to add if key is provided.
	 * @returns {Object} - The updated JSON object.
	 */
	add(key, value) {
		if (typeof key === 'object') {
			Object.assign(this.jsonData, key);
		} else {
			this.jsonData[key] = value;
		}
		this.saveData();
		return this.jsonData;
	}

	/**
	 * Re-adds data to the JSON object, optionally overwriting existing data.
	 * @param {string|Object} key - The key or object to re-add.
	 * @param {*} value - The value to add if key is provided.
	 * @param {boolean} [overwrite=false] - Whether to overwrite existing data.
	 * @returns {Object} - The updated JSON object.
	 */
	reAddData(key, value, overwrite = false) {
		if (typeof key === 'object') {
			Object.assign(this.jsonData, key);
		} else {
			if (overwrite || !this.jsonData.hasOwnProperty(key)) {
				this.jsonData[key] = value;
			}
		}
		this.saveData();
		return this.jsonData;
	}

	/**
	 * Searches for data within the JSON object based on a key.
	 * @param {string} key - The key to search for.
	 * @returns {*} - The value associated with the key or undefined if not found.
	 */
	searchData(key) {
		return this.jsonData.hasOwnProperty(key) ? this.jsonData[key] : undefined;
	}

	/**
	 * Compares two JSON objects for equality.
	 * @param {Object} obj1 - The first JSON object.
	 * @param {Object} obj2 - The second JSON object.
	 * @returns {boolean} - Whether the objects are deeply equal.
	 */
	static compareData(obj1, obj2) {
		return JSON.stringify(obj1) === JSON.stringify(obj2);
	}
}

export default JSONMANAGER;
