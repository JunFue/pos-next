import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local if available
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Make sure to use the correct credentials based on your setup. A service role key is ideal for bypassing RLS to list all documents.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vwhdvrhqohtayarwbtbg.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SERVICE_ROLE_KEY_HERE';

if (!supabaseUrl || URL.canParse(supabaseUrl) === false) {
    console.error("Invalid Supabase URL.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'customer-documents';
const THRESHOLD_KB = 500;
const THRESHOLD_BYTES = THRESHOLD_KB * 1024; 

async function listAllFiles(folderPath = '') {
  let allFiles: any[] = [];
  
  const { data, error } = await supabase.storage.from(BUCKET_NAME).list(folderPath, {
    limit: 1000,
    sortBy: { column: 'name', order: 'asc' }
  });

  if (error) {
    console.error(`Error listing folder ${folderPath}:`, error.message);
    return allFiles;
  }

  for (const item of data) {
    // If there is no id, it's typically a folder in Supabase storage
    if (item.id === null) {
      const subPath = folderPath ? `${folderPath}/${item.name}` : item.name;
      const subFiles = await listAllFiles(subPath);
      allFiles = allFiles.concat(subFiles);
    } else {
      // It's a file
      allFiles.push({
        ...item,
        path: folderPath ? `${folderPath}/${item.name}` : item.name
      });
    }
  }

  return allFiles;
}

async function processLargeImages() {
  console.log(`Starting scan of bucket: ${BUCKET_NAME}...`);
  console.log(`Looking for files > ${THRESHOLD_KB}KB`);

  const files = await listAllFiles('customers');
  console.log(`Total files found: ${files.length}`);

  let compressedCount = 0;
  let skippedCount = 0;
  
  for (const file of files) {
    const sizeKb = file.metadata?.size / 1024 || 0;
    const isImage = file.metadata?.mimetype?.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|webp|avif)$/i);

    if (!isImage) {
      skippedCount++;
      continue;
    }

    if (file.metadata?.size > THRESHOLD_BYTES) {
      console.log(`[COMPRESSING] ${file.path} (${sizeKb.toFixed(2)} KB)`);
      
      try {
        // 1. Download the original file
        const { data: fileData, error: downloadError } = await supabase.storage
          .from(BUCKET_NAME)
          .download(file.path);

        if (downloadError) {
          console.error(`  -> Failed to download: ${downloadError.message}`);
          continue;
        }

        const arrayBuffer = await fileData.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 2. Compress with Sharp
        // Note: If you want exactly ~300KB, it's hard to dial perfectly. 
        // Resizing to max 1600px width/height and quality 80 usually achieves good compression safely.
        const compressedBuffer = await sharp(buffer)
          .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
          // Use webp or keep original format based on your needs. For standard compression we can force high-efficiency webp or standard jpeg
          .jpeg({ quality: 75, progressive: true }) 
          .toBuffer();

        const newSizeKb = compressedBuffer.length / 1024;

        if (compressedBuffer.length < buffer.length) {
            // 3. Re-upload (overwrite)
            const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(file.path, compressedBuffer, {
                contentType: 'image/jpeg',
                cacheControl: '3600',
                upsert: true
            });

            if (uploadError) {
                console.error(`  -> Failed to upload compressed file: ${uploadError.message}`);
            } else {
                console.log(`  -> SUCCESS! New size: ${newSizeKb.toFixed(2)} KB (-${(sizeKb - newSizeKb).toFixed(2)} KB saved)`);
                compressedCount++;
            }
        } else {
            console.log(`  -> Skipped. Compressed version is larger or similar size.`);
            skippedCount++;
        }

      } catch (err: any) {
        console.error(`  -> Error processing file ${file.path}:`, err.message);
      }
    } else {
      skippedCount++;
    }
  }

  console.log('--- DONE ---');
  console.log(`Files compressed: ${compressedCount}`);
  console.log(`Files skipped: ${skippedCount}`);
}

processLargeImages();
