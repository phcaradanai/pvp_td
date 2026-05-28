// load_json.mjs
import { promises as fs } from "fs";
import path from "path";

/**
 * Load and parse a JSON file.
 * @param {string} filePath Absolute path to the JSON file.
 * @returns {Promise<any>} Parsed JSON content.
 * @throws {Error} If the file does not exist or JSON is invalid.
 */
export async function loadJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    try {
      return JSON.parse(data);
    } catch (parseErr) {
      throw new Error(`Invalid JSON in file ${filePath}: ${parseErr.message}`);
    }
  } catch (err) {
    if (err.code === "ENOENT") {
      throw new Error(`File not found: ${filePath}`);
    }
    throw err;
  }
}

export default { loadJsonFile };
