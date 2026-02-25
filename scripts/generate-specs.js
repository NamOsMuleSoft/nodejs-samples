/**
 * generate-specs.js — Read OpenAPI YAML source files and write static JSON specs.
 * Run: npm run spec
 */

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const OPENAPI_DIR = path.join(__dirname, "..", "openapi-nodejs");
const SPECS = ["products", "orders", "customers"];

function generate() {
  for (const name of SPECS) {
    const yamlPath = path.join(OPENAPI_DIR, `${name}.yaml`);
    const jsonPath = path.join(OPENAPI_DIR, `${name}.json`);
    if (!fs.existsSync(yamlPath)) {
      console.error(`Missing source: ${yamlPath}`);
      process.exit(1);
    }
    const content = fs.readFileSync(yamlPath, "utf8");
    const spec = yaml.load(content);
    fs.writeFileSync(jsonPath, JSON.stringify(spec, null, 2), "utf8");
    console.log(`Wrote ${jsonPath}`);
  }
  console.log("Done.");
}

generate();
