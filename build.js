const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT_DIR = __dirname;
const RELEASE_DIR = path.join(ROOT_DIR, "release");
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, "package.json"), "utf8"));
const zipName = `phenikaa-schedule-v${pkg.version}.zip`;
const zipPath = path.join(RELEASE_DIR, zipName);

if (!fs.existsSync(RELEASE_DIR)) {
  fs.mkdirSync(RELEASE_DIR, { recursive: true });
}

if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

console.log(`📦 Bắt đầu đóng gói bản phát hành v${pkg.version}...`);

// Tạo thư mục tạm thời để zip chỉ các file cần thiết của extension
const tempDist = path.join(ROOT_DIR, "dist");
if (fs.existsSync(tempDist)) {
  fs.rmSync(tempDist, { recursive: true, force: true });
}
fs.mkdirSync(tempDist, { recursive: true });

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy manifest.json và README.md
fs.copyFileSync(path.join(ROOT_DIR, "manifest.json"), path.join(tempDist, "manifest.json"));
if (fs.existsSync(path.join(ROOT_DIR, "README.md"))) {
  fs.copyFileSync(path.join(ROOT_DIR, "README.md"), path.join(tempDist, "README.md"));
}

// Copy thư mục src
copyRecursive(path.join(ROOT_DIR, "src"), path.join(tempDist, "src"));

// Sử dụng PowerShell Compress-Archive trên Windows
try {
  const psCmd = `powershell -Command "Compress-Archive -Path '${tempDist}\\*' -DestinationPath '${zipPath}' -Force"`;
  execSync(psCmd, { stdio: "inherit" });
  console.log(`✅ Bản phát hành đã tạo thành công tại:`);
  console.log(`👉 ${zipPath}`);
} catch (err) {
  console.error("❌ Lỗi khi đóng gói file zip:", err.message);
} finally {
  // Dọn dẹp thư mục tạm
  if (fs.existsSync(tempDist)) {
    fs.rmSync(tempDist, { recursive: true, force: true });
  }
}
