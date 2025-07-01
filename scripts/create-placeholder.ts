import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const assetsDir = join(process.cwd(), 'src', 'assets', 'images');
try {
  mkdirSync(assetsDir, { recursive: true });
  console.log('✅ Created assets/images directory');
} catch (error) {
  console.log('📁 assets/images directory already exists');
}

const createPlaceholderSVG = (width: number, height: number, text: string) => `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#F3F4F6"/>
  <circle cx="${width/2}" cy="${height/2 - 20}" r="30" fill="#9CA3AF" opacity="0.7"/>
  <rect x="${width/2 - 40}" y="${height/2 + 20}" width="80" height="4" rx="2" fill="#9CA3AF" opacity="0.7"/>
  <rect x="${width/2 - 60}" y="${height/2 + 30}" width="120" height="4" rx="2" fill="#9CA3AF" opacity="0.5"/>
  <rect x="${width/2 - 30}" y="${height/2 + 40}" width="60" height="4" rx="2" fill="#9CA3AF" opacity="0.3"/>
  <text x="${width/2}" y="${height/2 + 65}" text-anchor="middle" fill="#6B7280" font-family="system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto" font-size="14" opacity="0.8">${text}</text>
</svg>`;

const placeholders = [
  {
    filename: 'placeholder.jpg',
    content: createPlaceholderSVG(400, 300, 'Изображение недоступно')
  },
  {
    filename: 'placeholder-square.jpg',
    content: createPlaceholderSVG(300, 300, 'Изображение недоступно')
  },
  {
    filename: 'placeholder-portrait.jpg',
    content: createPlaceholderSVG(300, 400, 'Изображение недоступно')
  },
  {
    filename: 'tour-placeholder.jpg',
    content: createPlaceholderSVG(400, 300, 'Фото тура недоступно')
  },
  {
    filename: 'no-image.jpg',
    content: createPlaceholderSVG(400, 300, 'Нет изображения')
  }
];

placeholders.forEach(({ filename, content }) => {
  const filePath = join(assetsDir, filename);
  
  const svgFilename = filename.replace('.jpg', '.svg');
  const svgPath = join(assetsDir, svgFilename);
  
  try {
    writeFileSync(svgPath, content.trim());
    console.log(`✅ Created ${svgFilename}`);
  } catch (error) {
    console.error(`❌ Failed to create ${svgFilename}:`, error);
  }
});

try {
  console.log('✅ Created README.md');
} catch (error) {
  console.error('❌ Failed to create README.md:', error);
}

console.log('\n🎉 Placeholder creation complete!');
console.log('\n📝 Next steps:');
console.log('1. Review the created SVG files in src/assets/images/');
console.log('2. Optionally convert SVG files to JPG format');
console.log('3. Update your components to use these placeholders');
console.log('4. Test image loading with the new fallbacks');

console.log('\n💡 Example usage in your component:');
console.log(`
// In your component:
onImageError(event: Event): void {
  const img = event.target as HTMLImageElement;
  img.src = 'assets/images/placeholder.svg'; // or .jpg if converted
}
`);