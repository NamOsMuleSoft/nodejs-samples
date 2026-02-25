/**
 * generate-specs.js — Read OpenAPI YAML source files and write static YAML specs.
 * Run: npm run spec
 */

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const OPENAPI_DIR = path.join(__dirname, "..", "nodejs-openapi");
const SPECS = ["products", "orders", "customers"];

function generate() {
  for (const name of SPECS) {
    const yamlPath = path.join(OPENAPI_DIR, `${name}.yaml`);
    if (!fs.existsSync(yamlPath)) {
      console.error(`Missing source: ${yamlPath}`);
      process.exit(1);
    }
    const content = fs.readFileSync(yamlPath, "utf8");
    const spec = yaml.load(content);
    const out = yaml.dump(spec, { lineWidth: -1 });
    fs.writeFileSync(yamlPath, out, "utf8");
    console.log(`Wrote ${yamlPath}`);
  }
  console.log("Done.");
}

generate();
