import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateIcons() {
  const assetsDir = path.resolve('src/assets/images');
  const files = fs.readdirSync(assetsDir);
  const sourceFile = files.find(f => f.startsWith('shemar_chat_icon_'));
  
  if (!sourceFile) {
    console.error('Source image not found');
    process.exit(1);
  }

  const sourcePath = path.join(assetsDir, sourceFile);
  const publicDir = path.resolve('public');
  const iconsDir = path.resolve('public/icons');

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const sizes = [16, 32, 48, 72, 96, 144, 192, 256, 384, 512, 1024];

  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    await sharp(sourcePath)
      .resize(size, size, { fit: 'cover' })
      .toFormat('png')
      .toFile(outputPath);
    console.log(`Generated: ${outputPath}`);
  }

  // Generate specific root variants
  await sharp(sourcePath).resize(16, 16).toFormat('png').toFile(path.join(publicDir, 'favicon-16x16.png'));
  await sharp(sourcePath).resize(32, 32).toFormat('png').toFile(path.join(publicDir, 'favicon-32x32.png'));
  await sharp(sourcePath).resize(180, 180).toFormat('png').toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp(sourcePath).resize(192, 192).toFormat('png').toFile(path.join(publicDir, 'pwa-192x192.png'));
  await sharp(sourcePath).resize(512, 512).toFormat('png').toFile(path.join(publicDir, 'pwa-512x512.png'));
  await sharp(sourcePath).resize(1024, 1024).toFormat('png').toFile(path.join(publicDir, 'shemar-logo.png'));

  // Generate maskable/adaptive icons (with 10% padding as recommended for maskable icons)
  const maskable192Path = path.join(iconsDir, 'icon-maskable-192x192.png');
  const maskable512Path = path.join(iconsDir, 'icon-maskable-512x512.png');
  const maskable512Root = path.join(publicDir, 'pwa-maskable-512x512.png');

  await sharp(sourcePath)
    .resize(150, 150, { fit: 'cover' })
    .extend({
      top: 21,
      bottom: 21,
      left: 21,
      right: 21,
      background: { r: 2, g: 6, b: 23, alpha: 1 } // #020617 dark slate background
    })
    .toFormat('png')
    .toFile(maskable192Path);

  await sharp(sourcePath)
    .resize(400, 400, { fit: 'cover' })
    .extend({
      top: 56,
      bottom: 56,
      left: 56,
      right: 56,
      background: { r: 2, g: 6, b: 23, alpha: 1 }
    })
    .toFormat('png')
    .toFile(maskable512Path);

  await sharp(sourcePath)
    .resize(400, 400, { fit: 'cover' })
    .extend({
      top: 56,
      bottom: 56,
      left: 56,
      right: 56,
      background: { r: 2, g: 6, b: 23, alpha: 1 }
    })
    .toFormat('png')
    .toFile(maskable512Root);

  console.log('All Shemar Chat icon variants generated successfully!');
}

generateIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
