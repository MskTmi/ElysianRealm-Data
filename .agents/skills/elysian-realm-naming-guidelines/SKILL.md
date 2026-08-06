---
name: elysian-realm-naming-guidelines
description: |
  ElysianRealm-Data（崩坏3往世乐土攻略索引仓库）攻略条目的命名决策指南。

  当用户的工作涉及乐土攻略条目的命名判断时使用，包括：
  - 判断攻略条目 id 是否合理（如该不该带 Attack / Branch / AstralRing / MMB 后缀）
  - 新增角色攻略条目的命名
  - 修改已有条目名称（改名是否必要、如何执行）
  - 规划"XX乐土N"关键词编号（角色内唯一）
  - 判断关键词归属（"普攻流"这类玩家习惯词放哪个条目）
  - 修正 README 乐土角色名对照表
  - 攻略图更新导致流派标签变化后的命名调整

  本指南定义命名决策原则、改名工作流和历史经验。即使只是问"这个名字合理吗"也要使用本 skill。
metadata:
  short-description: 乐土攻略命名决策指南
  version: "1.0"
  compatibility: ElysianRealm-Data 及其 fork（需存在 meta/ data/ scripts/build-index.js）
---

# elysian-realm-naming-guidelines

本 skill 是 ElysianRealm-Data 仓库的命名决策指南：判断一个乐土攻略条目应该叫什么、为什么这样命名，以及如何执行改名。目标：任何命名问题都能一次做对，且与仓库既有惯例保持一致，而不是每次从零推理。

## 适用前提

先确认工作区确实是目标仓库（存在 `meta/`、`data/`、`scripts/build-index.js`）。若不是，仅把本 skill 的哲学作为参考，不要直接套用具体命名。

## 仓库结构

- `data/<id>.jpg`：攻略图，图片左上角"角色流派"标签 = 官方流派名（月光中心，事实来源）
- `meta/<id>.json`：`{"id": ..., "keywords": [...]}`，id 必须与文件名一致
- `README.md`：乐土角色名对照表（文件名 → 角色名）
- `dist/elysian-realm-index.json`：构建产物（resources + keywords 倒排索引），由 GitHub Actions 自动重建——push 到 master 且 `data/`、`meta/`、`build-index.js` 变化时触发 `build-index.yml`，无需手动执行

data 图片、meta id、README 三处必须一致；dist 交给 CI。

## 命名决策原则

### 1. 官方标签优先原则

攻略图左上角"角色流派"标签来自月光中心，是命名的事实来源，优先级最高。官方把标签从"普攻流"改成"非星环流"，id 和 README 就要跟着变。评估命名合理性前，先用读图/OCR 确认图内标签，不要凭印象。

### 2. 最小语义原则

后缀只加必要的一层：当角色没有独立于基础打法的流派条目时，基础条目用纯名（`Rebirth`=死律非星环流、`TheresaLuna`=月下非星环流、`Vicissitude`=崩落），不添加冗余流派后缀。README 对照表里纯名条目填角色名（崩落、灯、赫丽娅），流派条目才填"角色名+流派"（崩落星环流）。

### 3. 流派显式原则

当角色有多个流派需要区分时，流派必须显式标注在 id 上，避免歧义：

| 类别 | 模式 | 例子 |
|---|---|---|
| 基础/非星环流 | 纯名 | `Vicissitude`, `Human`, `Lantern`, `Helia` |
| 星环流 | `_AstralRing` | `Helia_AstralRing`, `Vicissitude_AstralRing` |
| 千机兵幕 | `_MMB`（永远在组合最后） | `Panacea_MMB`, `Panacea_AstralRing_MMB`, `Vicissitude_Branch_MMB` |
| 流派 | `_Attack`(普攻) `_Branch`(分支/蓄力) `_Weapon`(武器) 等 | `Sirin_Attack`, `First_Branch`, `Dreamweaver_Weapon` |

- 组合顺序固定：`角色名 + 流派 + MMB`
- 多流派角色的普攻流用 `_Attack`（`Sirin_Attack`、`Kiana_Attack`、`CosmicExpression_Attack`、`TheresaLuna_Attack`、`Thunder_Attack`）；若角色只有一张非星环图且打法就是普攻，则回到最小语义原则用纯名，把"崩符普攻流"这类玩家词放进关键词
- 同角色不同装甲用不同角色名前缀（`Coralie` vs `CoralieDragon`）

### 4. 关键词兼容原则

关键词承担"玩家怎么说"的兼容层，与 id 的"官方怎么说"解耦：

- 玩家习惯词（崩符普攻流、火符普攻流）放对应流派条目；基础条目若打法就是该流派也可保留，dist 按 `last_updated` 自动取最新
- "XX乐土N" 的 N 是角色内条目顺序编号。**新增条目优先遵循：基础无数字 → 星环流=2 → 其他流派按顺序从 3 开始**（如 `Vicissitude`：基础、星环2、普攻3、分支4、MMB5）
- 历史先例允许差异（`Panacea` 基础带 1），存量条目保持原样，不为此回溯修改
- **每个数字在角色内必须唯一**——硬约束，重复即缺陷（如两个"崩符乐土2"）
- 无数字通用词（如"崩符乐土"）保留在所有条目中，命中多个时按 `last_updated` 倒序返回最新
- 完整序列先例：`Vicissitude`（基础无数字 → 星环2 → 普攻3 → 分支4 → MMB5）、`Rebirth`（基础无数字 → 结命2 塑灵3 调换4 星环5）

### 5. 历史一致性原则

命名决策要兼顾仓库机制约束和历史可追溯：

- `meta/<id>.json` 的 id == 文件名 == `data/<id>.jpg`，`build-index.js` 强校验（meta 缺失、图片缺失、一个 id 多图都会构建失败）——两个条目无法共用一张图，新旧并存必须有各自的图片文件
- 改名用 `git mv` 保留历史，不要直接删/覆盖；恢复旧图用 `git show <完整40位SHA>:data/<file>`
- 官方攻略图更新（标签"普攻流"→"非星环流"）时，若新旧图打法确实不同（备注、刻印不同），应新旧并存（各自 id + 图片 + 唯一编号）；若只是同一张图标签变了，改名即可。判断依据是两张图内容是否真的不同

## 改名工作流

评估通过后按此执行（用 `git mv` 保留历史，不要直接删/覆盖）：

1. **确认现状**：`git log --oneline -5` 看最近提交；读目标 meta；OCR 图片标签
2. **git mv**：`git mv data/<旧>.jpg data/<新>.jpg; git mv meta/<旧>.json meta/<新>.json`
3. **改 meta id**：新文件内 `"id"` 同步，关键词按需调整
4. **改 README**：对照表同步，相关行按条目编号顺序相邻排列
5. **dist 交给 CI**：不要手动改 dist/——合并到 master 后 `build-index.yml` 自动重建并提交 "chore: rebuild dist index"
6. **验证**：
   - 搜索旧 id 全仓库无残留
   - 检查 meta 中数字关键词在角色内唯一（grep "XX乐土N" 逐条目核对）
   - `git status --short` 确认重命名被识别为 R（历史保留）

## 常见坑（实证）

1. **数字关键词角色内重复**：新增条目时复制了已有条目的"XX乐土N"，导致两个条目共用编号。每个 N 必须唯一。
2. **命名与图标签脱节**：图已更新为"非星环流"仍叫 `_Attack`，或反过来。以图标签为准。
3. **直接覆盖丢历史**：改名前不用 `git mv`，旧版本无法追溯。恢复旧图用 `git show <完整40位SHA>:data/<file>`。
4. **手动改 dist 与 CI 重复**：dist 由 `build-index.yml` 自动重建，本地手动执行 `node scripts/build-index.js` 会在 PR diff 里引入与 CI 重复的产物改动。改 meta/data 即可，dist 交给 CI。
5. **PowerShell 导出二进制**：`Set-Content -Encoding Byte` 在 PS7 不可用；cmd 里 `git show sha^:file` 的 `^` 会被当转义符吃成 `sha:file`，必须用完整 40 位 SHA 或 `git cat-file blob`。
6. **旧条目 vs 新条目并存**：官方攻略图更新（如标签"普攻流"→"非星环流"）时，若新旧图打法确实不同（备注、刻印不同），应新旧并存（各自 id + 各自图片 + 各自唯一编号）；若只是同一张图标签变了，改名即可。判断依据是两张图内容是否真的不同。
7. **关键词归属**："崩符普攻流"这类玩家习惯词放在对应流派条目里；基础条目若打法就是该流派也可保留，dist 按 `last_updated` 自动取最新。

## 判断清单（评估"这个名字合理吗"时逐条过）

- [ ] 图内标签与 id 语义一致？
- [ ] 纯名是否被误用于有独立流派条目的角色？
- [ ] 多流派角色的普攻流是否用了 `_Attack`？
- [ ] `_MMB` 是否在组合最后？
- [ ] "XX乐土N" 在角色内是否唯一？新增条目是否遵循"基础无数字 → 星环2 → 其他3"？
- [ ] data 图片、meta id、README 三处一致？
- [ ] dist 未手动改动（交由 CI 重建）?
