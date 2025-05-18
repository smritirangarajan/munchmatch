const fs = require("fs");
const path = require("path");

const TARGET_PATTERNS = [
  /http:\/\/localhost:5000/i,   // exact match to local backend
  /localhost/i,                 // any use of localhost
  /\/api\//i                    // relative API paths
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  lines.forEach((line, index) => {
    TARGET_PATTERNS.forEach((pattern) => {
      if (pattern.test(line)) {
        console.log(`⚠️  MATCH: ${filePath}:${index + 1}`);
        console.log(`    ${line.trim()}\n`);
      }
    });
  });
}

function scanDirectory(dirPath) {
  fs.readdirSync(dirPath).forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (
      file.endsWith(".js") ||
      file.endsWith(".jsx") ||
      file.endsWith(".ts") ||
      file.endsWith(".tsx")
    ) {
      scanFile(fullPath);
    }
  });
}

console.log("🔍 Scanning for localhost or relative /api/ URLs...\n");
scanDirectory(path.join(__dirname, "src"));
console.log("\n✅ Scan complete. Fix matches before deploying to Vercel.");
