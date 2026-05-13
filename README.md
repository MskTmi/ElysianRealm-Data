# Bh3-Elysian-Realm 攻略数据索引

## 项目说明

本仓库采用“源数据结构”和“运行时结构”分离的设计：

- source：面向维护者，使用 data 与 meta 保存图片和最小元数据
- dist：面向插件运行时，保存自动生成的搜索索引

索引由 GitHub Actions 和本地构建脚本自动生成，避免重复维护图片路径与更新时间

## 仓库结构

- data：角色图片资源
- meta：角色关键词元数据，仅维护 id 与 keywords
- dist：构建产物与索引文件
- scripts/build-index.js：根据 meta 和 data 生成 dist/elysian-realm-index.json

## 元数据格式

每个角色对应一个 meta 文件，文件名必须与 id 一致

```json
{
	"id": "Human",
	"keywords": [
		"人律乐土",
		"爱律乐土"
	]
}
```

图片路径不再手动维护，而是由构建脚本自动推导为 data/<id>.<ext>

## 构建产物

dist/elysian-realm-index.json 采用 resources + keywords 的倒排索引结构：

```json
{
	"schema_version": 1,
	"generated_at": "2026-05-13T00:00:00.000Z",
	"resources": {
		"Human": {
			"image": "data/Human.jpg",
			"last_updated": "2026-04-06T16:58:02+00:00"
		}
	},
	"keywords": {
		"人律乐土": [
			"Human_AstralRing",
			"Human"
		]
	}
}
```

同一关键词允许命中多个资源，构建时会按 last_updated 倒序排列，供插件优先返回最新攻略

## 本地构建

在仓库根目录执行：

```bash
node scripts/build-index.js
```

## Issue 自动投稿

仓库支持使用关键词 Issue 表单自动生成 meta 更新 PR

- 用户通过关键词模板提交角色 ID 和关键词列表
- GitHub Actions 解析 Issue 内容并更新对应的 meta/<id>.json
- 同步重建 dist/elysian-realm-index.json
- 自动创建待审核 PR

该流程要求目标角色在 data 中已经存在对应图片文件，否则自动化会拒绝创建变更

## Legacy 兼容同步

当 master 作为新结构主分支使用后，仓库可通过 [sync-legacy-data.yml](.github/workflows/sync-legacy-data.yml) 将 master/data 中的最新图片自动同步到 legacy 分支根目录

## 关键词匹配规则

系统允许不同角色共享相同关键词，以支持 AstralRing 等角色变种共存

当多个角色同时命中同一关键词时，系统不会报错，也不会随机返回，而是采用“最新优先策略”

### 处理规则

> 若多个角色命中同一关键词，将根据 last_updated 字段选择最新更新的角色作为返回结果

#### 示例

关键词「人律乐土」同时命中：

- Human（更新时间较早）
- Human_AstralRing（更新时间较新）

最终返回：
→ Human_AstralRing

#### 设计目的

- 支持角色变种共存
- 避免关键词冲突导致的随机性
- 保证内容更新优先级可控

## 乐土角色名对照表
| 文件名                                 | 角色名                  |
| :------------------------------------- | :---------------------- |
| Disciplinary.jpg                       | 阿波尼亚                |
| Elysia.jpg                             | 爱莉希雅                |
| LoveELF.jpg                            | 爱愿妖精                |
| LoveELF_AstralRing.jpg                 | 爱愿妖精星环流          |
| Vicissitude_Branch.jpg                 | 崩落分支流              |
| Vicissitude_Attack.jpg                 | 崩落普攻流              |
| TwinSeele.jpg                          | 彼岸双生                |
| Anchora.jpg                            | 不灭星锚                |
| Refrigerator.jpg                       | 苍骑士 · 月魂           |
| Silverwing.jpg                         | 次生银翼                |
| Silverwing_AstralRing.jpg              | 次生银翼星环流          |
| CosmicExpression_Parry.jpg             | 大格蕾修弹反流          |
| CosmicExpression_Mixed.jpg             | 大格蕾修混合流          |
| CosmicExpression_Attack.jpg            | 大格蕾修普攻流          |
| Theresa_Sleep.jpg                      | 德丽莎睡觉流            |
| Theresa_AstralRing.jpg                 | 德丽莎星环流            |
| Lantern.jpg                            | 灯                      |
| Lantern_AstralRing.jpg                 | 灯星环流                |
| Serenade.jpg                           | 第六夜想曲              |
| Raven.jpg                              | 渡鸦                    |
| Fischl.jpg                             | 菲谢尔                  |
| Starry.jpg                             | 格蕾修                  |
| Helia.jpg                              | 赫丽娅                  |
| HeliaReborn.jpg                        | 赫丽娅 · 失序时空       |
| HeliaReborn_AstralRing.jpg             | 赫丽娅 · 失序时空星环流 |
| Helia_AstralRing.jpg                   | 赫丽娅星环流            |
| Sparkle.jpg                            | 花火                    |
| Sparkle_AstralRing.jpg                 | 花火星环流              |
| Excelsis.jpg                           | 辉骑士 · 月魄           |
| Carol.jpg                              | 卡萝尔                  |
| Coralie.jpg                            | 科拉莉                  |
| CoralieDragon.jpg                      | 科拉莉 · 魔龙           |
| CoralieDragon_AstralRing.jpg           | 科拉莉 · 魔龙星环流     |
| Coralie_AstralRing.jpg                 | 科拉莉星环流            |
| Void.jpg                               | 空之律者                |
| Delta.jpg                              | 狂热蓝调Δ               |
| Thunder_Attack.jpg                     | 雷律平A流               |
| Thunder_Punishment.jpg                 | 雷律天罚流              |
| Thunder.jpg                            | 雷之律者                |
| Susang.jpg                             | 李素裳                  |
| PeregrineSword.jpg                     | 李素裳 · 一客逍游       |
| PeregrineSword_AstralRing.jpg          | 李素裳 · 一客逍游星环流 |
| Reason.jpg                             | 理之律者                |
| Rita_MissEspionage.jpg                 | 丽塔 · 窈窕谍影         |
| Rita_MissEspionage_AstralRing.jpg      | 丽塔 · 窈窕谍影         |
| Oven.jpg                               | 缭乱星棘                |
| Lnfinite.jpg                           | 梅比乌斯                |
| Twilight.jpg                           | 暮光骑士 · 月煌         |
| Void_Skill.jpg                         | 女王大招流              |
| Gloria.jpg                             | 女武神 · 荣光           |
| Felis.jpg                              | 帕朵菲莉丝              |
| Bladestrike.jpg                        | 破晓强袭                |
| Kiana_Attack.jpg                       | 琪亚娜普攻流            |
| Kiana_Jump.jpg                         | 琪亚娜跳鼓流            |
| Human_Branch.jpg                       | 人律蓄力流              |
| Human.jpg                              | 人之律者                |
| Human_AstralRing.jpg                   | 人之律者星环流          |
| Thelema.jpg                            | 瑟莉姆                  |
| Thelema_AstralRing.jpg                 | 瑟莉姆星环流            |
| Kallen.jpg                             | 圣仪装 · 今样           |
| Rosemary.jpg                           | 失落迷迭                |
| Cabbage.jpg                            | 时帆旅人                |
| ShigureKira_Branch.jpg                 | 时雨绮                  |
| ShigureKira.jpg                        | 时雨绮罗                |
| Sentience_brick.jpg                    | 识律板砖流              |
| Sentience_HoeFlow.jpg                  | 识律锄地流              |
| Sentience.jpg                          | 识之律者                |
| First_Branch.jpg                       | 始源分支流              |
| First.jpg                              | 始源之律者              |
| Rebirth_Swap.jpg                       | 死律调换流              |
| Rebirth.jpg                            | 死律非星环流            |
| Rebirth_Death.jpg                      | 死律结命流/安愈流       |
| Rebirth_Life.jpg                       | 死律塑灵流              |
| Rebirth_AstralRing.jpg                 | 死律星环流              |
| Songque.jpg                            | 松雀                    |
| Songque_AstralRing.jpg                 | 松雀星环流              |
| Susana.jpg                             | 苏莎娜                  |
| Durandal_TakeWalk.jpg                  | 天光驰彻逛街流          |
| Durandal_Branch.jpg                    | 天光驰彻蓄力流          |
| Palatinus.jpg                          | 天元骑英                |
| Vita.jpg                               | 薇塔                    |
| Vita_AstralRing.jpg                    | 薇塔星环流              |
| Helical.jpg                            | 维尔薇                  |
| Sirin_Attack.jpg                       | 西琳普攻流              |
| Sirin_Branch.jpg                       | 西琳蓄力流              |
| Senadina.jpg                           | 希娜狄雅                |
| Flamescion.jpg                         | 薪炎之律者              |
| Mei_DawnbearingCrescent.jpg            | 芽衣 · 偃月叩晓         |
| Mei_DawnbearingCrescent_AstralRing.jpg | 芽衣 · 偃月叩晓星环流   |
| Starchasm.jpg                          | 魇夜星渊                |
| Golden.jpg                             | 伊甸                    |
| ShadowKnight.jpg                       | 影骑士 · 月轮           |
| Dreamweaver.jpg                        | 羽兔                    |
| Dreamweaver_Weapon.jpg                 | 羽兔武器流              |
| Moment.jpg                             | 御神装 · 勿忘           |
| LunaKindred.jpg                        | 月下初拥                |
| TheresaLuna_Attack.jpg                 | 月下普攻流              |
| TheresaLuna_Weapon.jpg                 | 月下武器流              |
| TheresaLuna.jpg                        | 月下非星环流            |
| TheresaLuna_AstralRing.jpg             | 月下星环流              |
| Eclipse.jpg                            | 真红骑士 · 月蚀         |
| Eclipse_Branch.jpg                     | 真红蓄力流              |
| Truth.jpg                              | 真理之律者              |
| Truth_Weapon.jpg                       | 真律武器流              |
| TerminalAide0017.jpg                   | 终末协理0017            |
| Finally_Branch.jpg                     | 终焉分支流              |
| Finally.jpg                            | 终焉之律者              |

## 维护说明

> 图片素材来源于崩坏3通讯中心（月光中心），仅供交流学习使用

> 手动上传图床,在不弃坑的情况下可能会有一到两天延迟

> ~目前的维护需手动[替换文件名](https://blog.msktmi.com/posts/2024/580597065.html)~  
> 当前仓库的 dist 索引可通过 GitHub Actions 自动构建；如果您有更好的维护方式，欢迎[讨论](https://github.com/MskTmi/ElysianRealm-Data/discussions/new?category=general)
