import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import cloudinary from '../src/lib/cloudinary.js';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATEGORIES_DIR = path.resolve(
    __dirname,
    '../../public/images/categories'
);

function uploadToCloudinary(filePath, publicId) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'otaku-store/categories',
                public_id: publicId,
                resource_type: 'image',
                overwrite: false,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        fs.readFile(filePath)
            .then((buffer) => stream.end(buffer))
            .catch(reject);
    });
}

async function main() {
    console.log('Starting category image migration...');
    console.log(`Images directory: ${CATEGORIES_DIR}`);

    const files = await fs.readdir(CATEGORIES_DIR);

    const imageFiles = files.filter((file) =>
        /\.(png|jpg|jpeg|webp)$/i.test(file)
    );

    console.log(`Found ${imageFiles.length} image files.`);


    let uploaded = 0;
    let skipped = 0;

    for (const file of imageFiles) {
        const extension = path.extname(file);
        const categoryId = path.basename(file, extension);

        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            select: {
                id: true,
                image: true,
            },
        });

        if (!category) {
            console.log(
                `⚠️ Skipping ${file} — category "${categoryId}" not found.`
            );
            skipped++;
            continue;
        }

        console.log(`Uploading ${file} → category ${categoryId}...`);

        const filePath = path.join(CATEGORIES_DIR, file);

        const result = await uploadToCloudinary(
            filePath,
            categoryId
        );

        if (!result?.secure_url) {
            throw new Error(`Cloudinary upload failed for ${file}`);
        }

        await prisma.category.update({
            where: { id: categoryId },
            data: {
                image: result.secure_url,
            },
        });

        console.log(`✅ ${categoryId} updated`);
        uploaded++;
    }

    console.log('');
    console.log('=================================');
    console.log('Category image migration complete');
    console.log('=================================');
    console.log(`Uploaded: ${uploaded}`);
    console.log(`Skipped:  ${skipped}`);
}

main()
    .catch((error) => {
        console.error('');
        console.error('❌ Migration failed:');
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });