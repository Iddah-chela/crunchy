#!/usr/bin/env node
// Simple media optimization wrapper that calls ImageMagick and ffmpeg when available.
// Usage examples:
//  node tools/optimize-media.js --images
//  node tools/optimize-media.js --audio

const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, (err, stdout, stderr) => {
      if (err) return reject({ err, stdout, stderr });
      resolve({ stdout, stderr });
    });
  });
}

async function optimizeImages() {
  const base = path.join(__dirname, '..', 'frontend');
  const targets = ['images', 'icons', 'backgrounds'];

  // Resolve ImageMagick command. Prefer environment variable, then common Windows path, else `magick`/`convert`.
  let magickCmd = process.env.IMAGEMAGICK_PATH || null;
  if (!magickCmd) {
    if (process.platform === 'win32') {
      const winPath = 'C:\\Program Files\\ImageMagick-7.1.2-Q16-HDRI\\magick.exe';
      if (fs.existsSync(winPath)) magickCmd = winPath;
      else magickCmd = 'magick';
    } else {
      magickCmd = 'convert';
    }
  }

  for (const sub of targets) {
    const dir = path.join(base, sub);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(f));
    for (const f of files) {
      const full = path.join(dir, f);
      const out = path.join(dir, f.replace(/(\.[^.]+)$/, '-opt$1'));
      try {
        const ext = path.extname(f).toLowerCase();
        // For vector SVGs, avoid rasterizing — just copy (we preserve alpha by keeping the file as-is)
        if (ext === '.svg') {
          fs.copyFileSync(full, out);
          console.log('Copied (svg) ', f, '→', path.basename(out));
          continue;
        }

        // For raster images, limit max dimension and preserve alpha where applicable.
        // Resize only if image is larger than 1920x1920 (no upscaling) and strip metadata.
        const args = [full, '-strip', '-resize', '1920x1920>', '-quality', '85'];
        if (ext === '.png') {
          // Preserve alpha and set PNG compression level
          args.push('-define', 'png:compression-level=9');
        }
        args.push(out);
        await run(magickCmd, args);
        console.log('Optimized', path.join(sub, f), '→', path.basename(out));
      } catch (e) {
        console.warn('Image optimize failed for', path.join(sub, f), e.stdout || e.err || e);
      }
    }
  }
}

async function optimizeAudio() {
  const dir = path.join(__dirname, '..', 'frontend', 'audio');
  if (!fs.existsSync(dir)) return console.log('Audio dir not found:', dir);
  const files = fs.readdirSync(dir).filter(f => /\.(mp3|wav|m4a|ogg)$/i.test(f));
  for (const f of files) {
    const full = path.join(dir, f);
    const out = path.join(dir, f.replace(/(\.[^.]+)$/, '-opt.mp3'));
    try {
      // Resolve ffmpeg cmd via env var or known Windows download path
      let ffmpegCmd = process.env.FFMPEG_PATH || null;
      if (!ffmpegCmd) {
        if (process.platform === 'win32') {
          const altFfmpeg = 'C:\\Users\\HP\\Downloads\\ffmpeg-8.0.1-essentials_build\\bin\\ffmpeg.exe';
          const altFfmpeg2 = 'C:\\Users\\HP\\Downloads\\ffmpeg-8.0.1-essentials_build\\ffmpeg.exe';
          if (fs.existsSync(altFfmpeg)) ffmpegCmd = altFfmpeg;
          else if (fs.existsSync(altFfmpeg2)) ffmpegCmd = altFfmpeg2;
          else ffmpegCmd = 'ffmpeg';
        } else {
          ffmpegCmd = 'ffmpeg';
        }
      }
      await run(ffmpegCmd, ['-y', '-i', full, '-b:a', '96k', out]);
      console.log('Optimized audio', f, '→', path.basename(out));
    } catch (e) {
      console.warn('Audio optimize failed for', f, e.stdout || e.err || e);
    }
  }
}

(async () => {
  const arg = process.argv[2] || '';
  if (arg.includes('image')) {
    await optimizeImages();
  } else if (arg.includes('audio')) {
    await optimizeAudio();
  } else {
    console.log('Usage: node tools/optimize-media.js --images|--audio');
  }
})();
