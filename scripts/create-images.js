const fs = require("fs");
const path = require("path");

console.log("🚀 Starting image creation process...");

const assetsDir = path.join(__dirname, "..", "src", "assets", "images");

// Ensure directory exists
if (!fs.existsSync(path.join(__dirname, "..", "src", "assets"))) {
  fs.mkdirSync(path.join(__dirname, "..", "src", "assets"), {
    recursive: true,
  });
  console.log("✅ Created src/assets directory");
}

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
  console.log("✅ Created src/assets/images directory");
} else {
  console.log("📁 src/assets/images directory already exists");
}

// Create placeholder SVG content
const createSVG = (
  width,
  height,
  text,
  color = "#667eea",
  bgColor = "#f8f9fa"
) => {
  const gradientId = `bg-${Math.random().toString(36).substr(2, 9)}`;
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:0.1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:0.2" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="${bgColor}"/>
  <rect width="${width}" height="${height}" fill="url(#${gradientId})"/>
  <circle cx="${width / 2}" cy="${
    height / 2 - 30
  }" r="30" fill="${color}" opacity="0.4"/>
  <rect x="${width / 2 - 50}" y="${
    height / 2 + 10
  }" width="100" height="6" rx="3" fill="${color}" opacity="0.5"/>
  <rect x="${width / 2 - 70}" y="${
    height / 2 + 22
  }" width="140" height="4" rx="2" fill="${color}" opacity="0.4"/>
  <rect x="${width / 2 - 40}" y="${
    height / 2 + 32
  }" width="80" height="4" rx="2" fill="${color}" opacity="0.3"/>
  <text x="${width / 2}" y="${
    height / 2 + 55
  }" text-anchor="middle" fill="#495057" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="500">${text}</text>
</svg>`;
};

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

console.log("📸 Creating tour image files...");

// Create image files for tours
imageFiles.forEach((filename, index) => {
  const colors = [
    "#667eea",
    "#f093fb",
    "#764ba2",
    "#48cae4",
    "#06ffa5",
    "#ffbe0b",
    "#fb5607",
    "#8338ec",
    "#3a86ff",
    "#06d6a0",
  ];
  const color = colors[index % colors.length];
  const svgContent = createSVG(400, 300, `Tour ${index + 1}`, color);

  try {
    // Create the file with original extension (tours.json references these)
    const originalPath = path.join(assetsDir, filename);
    fs.writeFileSync(originalPath, svgContent);
    console.log(`✅ Created ${filename}`);

    // Also create .svg version for flexibility
    const svgFilename = filename.replace(/\.(jpg|jpeg|png|gif)$/i, ".svg");
    if (svgFilename !== filename) {
      const svgPath = path.join(assetsDir, svgFilename);
      fs.writeFileSync(svgPath, svgContent);
      console.log(`✅ Created ${svgFilename}`);
    }
  } catch (error) {
    console.error(`❌ Failed to create ${filename}:`, error.message);
  }
});

console.log("🖼️ Creating placeholder files...");

// Create placeholder files
const placeholders = [
  {
    name: "placeholder.jpg",
    width: 400,
    height: 300,
    text: "Изображение недоступно",
    color: "#6c757d",
  },
  {
    name: "placeholder.svg",
    width: 400,
    height: 300,
    text: "Изображение недоступно",
    color: "#6c757d",
  },
  {
    name: "placeholder-square.jpg",
    width: 300,
    height: 300,
    text: "Квадратное изображение",
    color: "#6c757d",
  },
  {
    name: "placeholder-portrait.jpg",
    width: 300,
    height: 400,
    text: "Портретное изображение",
    color: "#6c757d",
  },
  {
    name: "no-image.jpg",
    width: 400,
    height: 300,
    text: "Нет изображения",
    color: "#dc3545",
  },
  {
    name: "tour-placeholder.jpg",
    width: 400,
    height: 300,
    text: "Фото тура недоступно",
    color: "#28a745",
  },
  {
    name: "error-image.jpg",
    width: 400,
    height: 300,
    text: "Ошибка загрузки",
    color: "#ffc107",
  },
];

placeholders.forEach(({ name, width, height, text, color }) => {
  try {
    const content = createSVG(width, height, text, color, "#f8f9fa");
    const filePath = path.join(assetsDir, name);
    fs.writeFileSync(filePath, content);
    console.log(`✅ Created ${name}`);
  } catch (error) {
    console.error(`❌ Failed to create ${name}:`, error.message);
  }
});

// Create a simple CSS file for image styling (optional)
const cssContent = `/* Auto-generated image styles */
.tour-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
}

.tour-image:hover {
  transform: scale(1.05);
}

.image-placeholder {
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 14px;
}
`;

try {
  const cssPath = path.join(assetsDir, "images.css");
  fs.writeFileSync(cssPath, cssContent);
  console.log("✅ Created images.css");
} catch (error) {
  console.error("❌ Failed to create images.css:", error.message);
}

// Create an index file listing all images
const indexContent = `# Generated Images

## Tour Images
${imageFiles.map((file) => `- ${file}`).join("\n")}

## Placeholders
${placeholders.map((p) => `- ${p.name}`).join("\n")}

Generated on: ${new Date().toISOString()}
`;

try {
  const indexPath = path.join(assetsDir, "README.md");
  fs.writeFileSync(indexPath, indexContent);
  console.log("✅ Created README.md");
} catch (error) {
  console.error("❌ Failed to create README.md:", error.message);
}

console.log("\n🎉 Image creation completed!");
console.log(`📁 Files created in: ${assetsDir}`);
console.log(
  `📊 Total files created: ${imageFiles.length + placeholders.length + 2}`
);

// Verify files were created
const createdFiles = fs.readdirSync(assetsDir);
console.log("\n📋 Created files:");
createdFiles.forEach((file) => {
  const filePath = path.join(assetsDir, file);
  const stats = fs.statSync(filePath);
  console.log(`   ${file} (${stats.size} bytes)`);
});

console.log(
  "\n✨ Ready to use! Your Angular app should now load images properly."
);
