// 用于将 master 的 data 图片同步到 legacy 分支目录，并覆盖同名旧图片。
const fs = require('fs');
const path = require('path');

const sourceDir = process.env.SOURCE_DIR ? path.resolve(process.env.SOURCE_DIR) : null;
const targetDir = process.env.TARGET_DIR ? path.resolve(process.env.TARGET_DIR) : null;
const outputPath = process.env.GITHUB_OUTPUT;
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

function setOutput(name, value) {
    if (!outputPath) {
        return;
    }

    fs.appendFileSync(outputPath, `${name}=${value}\n`);
}

function listImageFiles(dirPath) {
    if (!fs.existsSync(dirPath)) {
        return [];
    }

    return fs.readdirSync(dirPath)
        .filter((fileName) => imageExtensions.has(path.extname(fileName).toLowerCase()))
        .sort((left, right) => left.localeCompare(right, 'en'));
}

function ensureDirectory(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function main() {
    if (!sourceDir || !targetDir) {
        throw new Error('SOURCE_DIR and TARGET_DIR are required');
    }

    ensureDirectory(targetDir);

    const sourceFiles = listImageFiles(sourceDir);
    const synced = [];

    for (const fileName of sourceFiles) {
        const sourceFile = path.join(sourceDir, fileName);
        const targetFile = path.join(targetDir, fileName);

        fs.copyFileSync(sourceFile, targetFile);
        synced.push(fileName);
    }

    console.log(`Scanned ${sourceFiles.length} source images`);
    console.log(`Synced ${synced.length} images to legacy`);

    setOutput('synced_count', String(synced.length));
    setOutput('synced_files', synced.join(','));
}

main();