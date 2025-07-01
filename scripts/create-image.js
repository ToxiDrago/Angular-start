const fs = require("fs");
const path = require("path");

const assetsDir = path.join(__dirname, "..", "src", "assets", "images");

// Ensure directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
  console.log("✅ Created assets/images directory");
}

// Create placeholder SVG content
const createSVG = (
  width,
  height,
  text,
  color = "#667eea"
) => `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-${width}-${height}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:0.1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:0.2" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg-${width}-${height})"/>
  <circle cx="${width / 2}" cy="${
  height / 2 - 30
}" r="40" fill="${color}" opacity="0.3"/>
  <rect x="${width / 2 - 60}" y="${
  height / 2 + 20
}" width="120" height="8" rx="4" fill="${color}" opacity="0.4"/>
  <rect x="${width / 2 - 80}" y="${
  height / 2 + 35
}" width="160" height="6" rx="3" fill="${color}" opacity="0.3"/>
  <text x="${width / 2}" y="${
  height / 2 + 60
}" text-anchor="middle" fill="#333" font-family="Arial, sans-serif" font-size="14" font-weight="500">${text}</text>
</svg>`;

// Image files from your tours.json
const imageFiles = [
  "ocean.jpg",
  "pic1.jpg",
  "pic2.jpg",
  "pic3.jpg",
  "pic4.jpg",
  "pic5.jpg",
  "pic6.jpg",
  "pic7.jpg",
  "pic8.jpg",
  "pic9.jpg",
];

// Create SVG files for each image
imageFiles.forEach((filename, index) => {
  const svgContent = createSVG(400, 300, `Tour Image ${index + 1}`);

  // Create both .svg and original extension
  const svgPath = path.join(
    assetsDir,
    filename.replace(/\.(jpg|jpeg|png|gif)$/i, ".svg")
  );
  const originalPath = path.join(assetsDir, filename);

  fs.writeFileSync(svgPath, svgContent);
  fs.writeFileSync(originalPath, svgContent);

  console.log(`✅ Created ${filename}`);
});

// Create placeholder files
const placeholders = [
  {
    name: "placeholder.jpg",
    width: 400,
    height: 300,
    text: "Изображение недоступно",
  },
  {
    name: "placeholder.svg",
    width: 400,
    height: 300,
    text: "Изображение недоступно",
  },
  { name: "no-image.jpg", width: 400, height: 300, text: "Нет изображения" },
  { name: "tour-placeholder.jpg", width: 400, height: 300, text: "Фото тура" },
];

placeholders.forEach(({ name, width, height, text }) => {
  const content = createSVG(width, height, text, "#6c757d");
  fs.writeFileSync(path.join(assetsDir, name), content);
  console.log(`✅ Created ${name}`);
});

console.log("\n🎉 All image files created successfully!");
console.log(`📁 Images created in: ${assetsDir}`);
