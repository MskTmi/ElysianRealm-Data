const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const outputPath = process.env.GITHUB_OUTPUT;
const version = process.env.RELEASE_VERSION ?? '';
const beforeSha = process.env.BEFORE_SHA ?? '';
const headSha = process.env.HEAD_SHA ?? 'HEAD';
const changedMetaFilesOverride = process.env.CHANGED_META_FILES ?? '';

function setMultilineOutput(name, value) {
    if (!outputPath) {
        return;
    }

    fs.appendFileSync(outputPath, `${name}<<EOF\n${value}\nEOF\n`);
}

function listChangedMetaFiles() {
    if (changedMetaFilesOverride.trim()) {
        return changedMetaFilesOverride
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item.startsWith('meta/') && item.endsWith('.json'));
    }

    if (!beforeSha || !headSha || /^0+$/.test(beforeSha)) {
        return [];
    }

    const output = execFileSync(
        'git',
        ['diff', '--name-only', beforeSha, headSha, '--', 'meta'],
        { cwd: rootDir, encoding: 'utf8' }
    );

    return output
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter((item) => item.startsWith('meta/') && item.endsWith('.json'))
        .sort((left, right) => left.localeCompare(right, 'en'));
}

function readMeta(metaPath) {
    const fullPath = path.join(rootDir, metaPath);

    if (!fs.existsSync(fullPath)) {
        return null;
    }

    const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

    if (!parsed.id || !Array.isArray(parsed.keywords) || parsed.keywords.length === 0) {
        return null;
    }

    return parsed;
}

function buildCommand(meta) {
    const keywords = [...new Set(meta.keywords.map((item) => String(item).trim()).filter(Boolean))];

    if (keywords.length === 0) {
        return null;
    }

    return `/RealmCommand add ${meta.id} ${keywords.join(',')}`;
}

function buildBody() {
    if (!version.endsWith('v1')) {
        return '> 推荐使用 `/更新乐土攻略` 指令获取攻略';
    }

    const commands = listChangedMetaFiles()
        .map(readMeta)
        .filter(Boolean)
        .map(buildCommand)
        .filter(Boolean);

    if (commands.length === 0) {
        return [
            '### 使用 `/更新乐土攻略` 后可直接复制下面命令添加唤醒词',
            '',
            '> 本次发布未检测到新增或更新的 meta 命令，请按需要手动维护 RealmCommand。'
        ].join('\n');
    }

    return [
        '### 使用 `/更新乐土攻略` 后可直接复制下面命令添加唤醒词',
        '',
        ...commands.map((command) => `- \
\`${command}\``),
        '',
        '> 指令内容请阅读 [README.md](https://github.com/MskTim/Bh3-ElysianRealm-Strategy/blob/master/README.md)'
    ].join('\n');
}

setMultilineOutput('release_body', buildBody());