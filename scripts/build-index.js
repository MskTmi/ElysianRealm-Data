const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const metaDir = path.join(rootDir, 'meta');
const dataDir = path.join(rootDir, 'data');
const distDir = path.join(rootDir, 'dist');
const outputFile = path.join(distDir, 'elysian-realm-index.json');
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

function normalizePath(targetPath) {
    return targetPath.split(path.sep).join('/');
}

function getImagePath(id) {
    const matches = imageExtensions
        .map((extension) => path.join(dataDir, `${id}${extension}`))
        .filter((candidate) => fs.existsSync(candidate));

    if (matches.length === 0) {
        throw new Error(`Missing image for ${id} under data/`);
    }

    if (matches.length > 1) {
        throw new Error(`Multiple images found for ${id}: ${matches.map((item) => path.basename(item)).join(', ')}`);
    }

    return matches[0];
}

function getLastUpdated(relativeImagePath, absoluteImagePath) {
    try {
        const output = execFileSync('git', ['log', '-1', '--format=%cI', '--', relativeImagePath], {
            cwd: rootDir,
            encoding: 'utf8'
        }).trim();

        if (output) {
            return output;
        }
    } catch (error) {
        // Fall back to file mtime for local, uncommitted files.
    }

    return fs.statSync(absoluteImagePath).mtime.toISOString();
}

function readMeta(fileName) {
    const fullPath = path.join(metaDir, fileName);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const parsed = JSON.parse(raw);
    const expectedId = path.basename(fileName, '.json');

    if (parsed.id !== expectedId) {
        throw new Error(`meta/${fileName} id must equal file name (${expectedId})`);
    }

    if (!Array.isArray(parsed.keywords) || parsed.keywords.length === 0) {
        throw new Error(`meta/${fileName} must define a non-empty keywords array`);
    }

    return parsed;
}

function buildIndex() {
    if (!fs.existsSync(metaDir)) {
        throw new Error('meta/ directory does not exist');
    }

    const metaFiles = fs.readdirSync(metaDir)
        .filter((fileName) => fileName.endsWith('.json'))
        .sort((left, right) => left.localeCompare(right, 'en'));

    const resourceEntries = [];
    const keywordEntries = new Map();

    for (const fileName of metaFiles) {
        const meta = readMeta(fileName);
        const imagePath = getImagePath(meta.id);
        const relativeImagePath = normalizePath(path.relative(rootDir, imagePath));
        const lastUpdated = getLastUpdated(relativeImagePath, imagePath);

        resourceEntries.push([
            meta.id,
            {
                image: relativeImagePath,
                last_updated: lastUpdated
            }
        ]);

        for (const rawKeyword of meta.keywords) {
            const keyword = String(rawKeyword).trim();

            if (!keyword) {
                continue;
            }

            const bucket = keywordEntries.get(keyword) ?? [];
            bucket.push({ id: meta.id, lastUpdated });
            keywordEntries.set(keyword, bucket);
        }
    }

    const resources = Object.fromEntries(resourceEntries);
    const keywords = Object.fromEntries(
        [...keywordEntries.entries()]
            .sort(([left], [right]) => left.localeCompare(right, 'zh-Hans-CN'))
            .map(([keyword, matches]) => [
                keyword,
                matches
                    .sort((left, right) => {
                        const timeDelta = Date.parse(right.lastUpdated) - Date.parse(left.lastUpdated);

                        if (timeDelta !== 0) {
                            return timeDelta;
                        }

                        return left.id.localeCompare(right.id, 'en');
                    })
                    .map((item) => item.id)
            ])
    );

    const output = {
        schema_version: 1,
        generated_at: new Date().toISOString(),
        resources,
        keywords
    };

    fs.mkdirSync(distDir, { recursive: true });
    fs.writeFileSync(outputFile, `${JSON.stringify(output, null, 4)}\n`, 'utf8');
}

buildIndex();