// 用于解析关键词 Issue 表单内容并创建或更新对应的 meta 文件。
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const metaDir = process.env.META_DIR ? path.resolve(process.env.META_DIR) : path.join(rootDir, 'meta');
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(rootDir, 'data');
const issueBody = process.env.ISSUE_BODY ?? '';
const issueNumber = process.env.ISSUE_NUMBER ?? '';
const issueTitle = process.env.ISSUE_TITLE ?? '';
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

function setOutput(name, value) {
    const outputPath = process.env.GITHUB_OUTPUT;

    if (!outputPath) {
        return;
    }

    fs.appendFileSync(outputPath, `${name}=${value}\n`);
}

function parseSections(markdown) {
    const lines = markdown.replace(/\r\n/g, '\n').split('\n');
    const sections = new Map();
    let currentSection = null;
    let currentLines = [];

    function flush() {
        if (!currentSection) {
            return;
        }

        sections.set(currentSection, currentLines.join('\n').trim());
    }

    for (const line of lines) {
        const headingMatch = line.match(/^###\s+(.+?)\s*$/);

        if (headingMatch) {
            flush();
            currentSection = headingMatch[1].trim();
            currentLines = [];
            continue;
        }

        if (currentSection) {
            currentLines.push(line);
        }
    }

    flush();
    return sections;
}

function requireSection(sections, name) {
    const value = sections.get(name);

    if (!value) {
        throw new Error(`Issue form is missing section: ${name}`);
    }

    return value;
}

function parseKeywords(raw) {
    return [...new Set(
        raw
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean)
    )];
}

function findImage(id) {
    const matches = imageExtensions
        .map((extension) => path.join(dataDir, `${id}${extension}`))
        .filter((candidate) => fs.existsSync(candidate));

    if (matches.length !== 1) {
        throw new Error(`Expected exactly one image for ${id} under data/, found ${matches.length}`);
    }
}

function readMeta(filePath, id) {
    if (!fs.existsSync(filePath)) {
        return {
            id,
            keywords: []
        };
    }

    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (parsed.id !== id) {
        throw new Error(`Existing meta id mismatch in ${path.basename(filePath)}`);
    }

    if (!Array.isArray(parsed.keywords)) {
        throw new Error(`Existing meta keywords must be an array in ${path.basename(filePath)}`);
    }

    return parsed;
}

function mergeKeywords(existingKeywords, incomingKeywords) {
    const merged = [...existingKeywords];
    const seen = new Set(existingKeywords);
    const added = [];

    for (const keyword of incomingKeywords) {
        if (seen.has(keyword)) {
            continue;
        }

        seen.add(keyword);
        merged.push(keyword);
        added.push(keyword);
    }

    return { merged, added };
}

function main() {
    if (!issueBody.trim()) {
        throw new Error('ISSUE_BODY is required');
    }

    const sections = parseSections(issueBody);
    const role = requireSection(sections, '角色 ID').trim();
    const keywords = parseKeywords(requireSection(sections, '关键词列表'));

    if (!/^[A-Za-z0-9_]+$/.test(role)) {
        throw new Error('Role ID must contain only letters, numbers, and underscores');
    }

    if (keywords.length === 0) {
        throw new Error('At least one keyword is required');
    }

    findImage(role);
    fs.mkdirSync(metaDir, { recursive: true });

    const metaPath = path.join(metaDir, `${role}.json`);
    const existedBeforeWrite = fs.existsSync(metaPath);
    const currentMeta = readMeta(metaPath, role);
    const { merged, added } = mergeKeywords(currentMeta.keywords, keywords);
    const nextMeta = {
        id: role,
        keywords: merged
    };

    fs.writeFileSync(metaPath, `${JSON.stringify(nextMeta, null, 4)}\n`, 'utf8');

    console.log(`Updated ${path.relative(rootDir, metaPath)} from issue #${issueNumber || 'unknown'}`);
    console.log(`Title: ${issueTitle || 'N/A'}`);
    console.log(`Added keywords: ${added.length}`);

    setOutput('role', role);
    setOutput('meta_path', `meta/${role}.json`);
    setOutput('created', String(!existedBeforeWrite));
    setOutput('added_keywords_count', String(added.length));
}

main();