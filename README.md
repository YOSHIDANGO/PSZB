# DIE YET TYPE-A パチスロシミュレーター仕様メモ

ゾンビだらけの街を舞台にした、オリジナルAタイプ風パチスロシミュレーターです。

今後の改修判断に使うため、現時点のゲーム性・演出・停止制御・素材配置をまとめています。

## 起動方法

```bash
python -m http.server 8080
```

通常表示:

```text
http://localhost:8080
```

位置確認:

```text
http://localhost:8080?debug=1
```

`?debug=1` では、液晶・リール・ボタン判定位置の確認と、リール配列PNG出力用のデバッグUIを表示します。

## 維持する前提

- 筐体画像をメインのガワとして使用
- 上部液晶、リール、MAX BET、PUSH、レバー、STOP 1-3 は筐体画像上にオーバーレイ配置
- 既存の筐体画像、液晶位置、リール位置、ボタン座標、debug表示機能は基本維持
- 液晶位置はCSS末尾の上書き指定で調整済み
- リール図柄は8種類固定

## 使用リール図柄

内部キーと表示画像は以下です。

```js
const symbolDefs = {
  red7:  { label: 'RED 7', src: 'assets/reel-symbols/red7.png' },
  blue7: { label: 'BLUE 7', src: 'assets/reel-symbols/blue7.png' },
  bar:   { label: 'BAR', src: 'assets/reel-symbols/bar.png' },
  bell:  { label: 'BAT', src: 'assets/reel-symbols/bat.png' },
  suika: { label: 'AMMO', src: 'assets/reel-symbols/ammo.png' },
  cherry:{ label: 'CHERRY', src: 'assets/reel-symbols/cherry.png' },
  replay:{ label: 'REPLAY', src: 'assets/reel-symbols/replay.png' },
  hero:  { label: 'HERO', src: 'assets/reel-symbols/hero.png' }
};
```

役割:

- `red7` = 赤7
- `blue7` = 青7
- `bar` = BAR
- `bell` = ベル役。見た目は `bat.png`
- `suika` = スイカ役。見た目は `ammo.png`
- `cherry` = チェリー
- `replay` = リプレイ
- `hero` = HERO図柄。ボーナス主図柄ではなく、チャンス目・特殊役・リーチ目・演出用図柄

リール図柄として `gun / mzombie / fzombie / zombie / undead / ammoキー / batキー` は使いません。

## 現在のリール配列

全リール21コマ、8図柄のみで構成しています。

```js
const reelMap = [
  ['replay','bell','red7','replay','blue7','bell','cherry','suika','replay','bell','bar','hero','replay','bell','blue7','cherry','suika','bell','replay','red7','bar'],
  ['bell','replay','blue7','bell','suika','bar','replay','bell','red7','cherry','hero','replay','bell','suika','blue7','bell','bar','replay','cherry','red7','bell'],
  ['replay','bell','bar','blue7','bell','suika','cherry','replay','red7','bell','hero','replay','bell','blue7','suika','bar','replay','cherry','bell','red7','replay']
];
```

左リールは青7狙いを想定しています。

- 通常時は `replay / bell / red7 / blue7 / bar / hero` が中心
- ハズレ時は左リール中央に `cherry / suika` が基本止まらないよう制御
- `cherry / suika` が左に止まった場合はチャンス感を持たせる
- レア役成立時は4コマ滑り風に `cherry / suika` を出す

## 基本ゲーム性

Aタイプ風の通常ゲームです。

- 設定1-6あり
- 設定差のあるベル確率
- 小役重複あり
- ボーナス成立後は `pendingBonus` 状態
- ボーナス図柄を揃えると自動でボーナス開始する方針
- PUSHは液晶に案内がある時だけ使用する方針

主な小役:

- `REPLAY`
- `BELL` = BAT揃い
- `CHERRY`
- `SUIKA` = AMMO揃い
- `HERO`

ボーナス:

- `SBB_RED`
- `SBB_BLUE`
- `BB_RED`
- `BB_BLUE`
- `REG`

ボーナス図柄の基本:

- 赤系: `red7 / red7 / red7`
- 青系: `blue7 / blue7 / blue7`
- REG: `bar / bar / bar`

## ボーナス消化

ボーナス開始後は専用背景へ切り替わります。

素材:

- `assets/lcd/bonus-sbb-bg.png`
- `assets/lcd/bonus-big-bg.png`
- `assets/lcd/bonus-reg-bg.png`

消化仕様:

- SBB: 402枚想定
- BIG: 280枚想定
- REG: 104枚想定
- 消化中はベル役を揃えて払い出しを進める
- SBB/BIG後は `SURVIVE` へ移行
  - SBB後: 64G
  - BIG後: 32G
  - REG後: SURVIVEなし

SBB中は `assets/sprites/hero/rush/` の主人公走りスプライトを使用します。

## BONUS確定画面

ボーナス確定時は液晶全面に以下を表示します。

```text
assets/lcd/bonus-confirm.png
```

ボーナス確定中に図柄を揃えられなかった場合でも、通常画面には戻さず確定状態を維持します。

## ロングフリーズ

確認用の通常UIボタンとして `NEXT FREEZE` があります。

流れ:

1. `NEXT FREEZE` を押す
2. 次ゲームでBET
3. レバーON
4. レバーON直後に暗転
5. 約3秒暗転
6. `assets/lcd/long-freeze.mp4` を再生
7. 約14秒後にBONUS確定画面へ移行

重要:

- ロングフリーズは第3停止後ではなく、レバーON契機
- ロングフリーズ時はリールを回さず、即プチュン暗転へ入る

## 液晶演出方針

演出は成立役の説明ではなく、期待度演出として扱います。

通常時は大きな文字を常時表示しません。

- 通常時: テキストなし
- チャンス時: 小さく `WARNING / SURVIVE`
- ボーナス確定時のみ大きくBONUS系背景
- 小役名や `MISS / GET / SHOOT` などは毎回大きく出さない

主な演出タイプ:

- `idle`: 無演出
- `enemy_walk`: 敵が歩いてくる
- `hero_run`: 主人公が走る
- `item_get`: アイテム発見。bell対応寄り
- `ammo_event`: 弾薬箱/AMMO系。suika対応寄り
- `cherry_notice`: 赤い違和感。cherry対応寄り
- `shadow`: 奥に影
- `warning`: レア役 or ボーナス期待
- `survive`: ボーナス期待大
- `silent`: ほぼ無演出
- `silentContradiction`: 矛盾/違和感用

期待度テーブルの目安:

```js
const performanceExpect = {
  idle: 0.01,
  enemy_walk: 0.03,
  hero_run: 0.06,
  item_get: 0.04,
  ammo_event: 0.12,
  cherry_notice: 0.15,
  shadow: 0.25,
  warning: 0.40,
  survive: 0.75,
  silent: 0.02,
  silentContradiction: 0.90
};
```

演出と成立役は完全一致させず、ハズレでチャンス演出、小役で無演出も発生します。

## 矛盾演出

演出と停止役が矛盾した場合は、ボーナス期待度を上げる扱いです。

例:

- `item_get` で `CHERRY / SUIKA / HERO`
- `ammo_event` で `REPLAY`
- `cherry_notice` で `BELL`
- `silent` で小役
- `enemy_walk` で `SUIKA`
- `hero_run / silent / enemy_walk` でボーナス

矛盾時はすぐBONUS表示ではなく、以下のような違和感を挟みます。

- 一瞬暗くなる
- 赤ノイズ
- 奥の影
- 第3停止後の沈黙

## 第3停止後の間

第3停止後、即結果を出さないようにしています。

目安:

- ハズレ: 約0.15秒
- 小役: 約0.25秒
- レア役/HERO: 約0.35秒
- ボーナス期待/チャレンジ: 約0.6秒

## ボーナス告知パターン

ボーナス内部成立時に毎回即告知しないようにしています。

比率イメージ:

- 即告知: 30%
- PUSH告知: 25%
- 遅れ告知: 20%
- 次ゲーム告知: 15%
- 違和感告知: 10%

PUSH告知時のみPUSHボタンを使います。

## BONUS CHANCE

小役重複などから発展するボーナス期待ゲームです。

ボス素材:

- `assets/sprites/bosses/security_captain_boss.png`
- `assets/sprites/bosses/police_officer_boss.png`
- `assets/sprites/bosses/gym_teacher_boss.png`
- `assets/sprites/bosses/announcer_boss.png`
- `assets/sprites/bosses/zombie_queen_boss.png`

ボスごとに期待度差があります。

現在の期待度目安:

- SECURITY CAPTAIN: 25%
- POLICE OFFICER: 45%
- GYM TEACHER: 60%
- ANNOUNCER: 75%
- ZOMBIE QUEEN: 90%

今後の方針:

- PUSHでしか進まない状態は避ける
- 液晶にPUSH案内がある時だけPUSHを使う
- 通常は自動進行または停止後演出として扱う

## 停止制御

現在は完全な実機制御ではなく、Aタイプ風の疑似停止制御です。

方針:

- STOP押下時の現在位置を時間から計算
- 成立役が引き込める場合は最大4コマ滑り
- `REPLAY / BELL / BONUS_READY / BONUS_GAME` は補助を強める
- ハズレ時は左リール中央 `cherry / suika` を避ける
- `cherry / suika` 停止時はチャンス感を持たせる

課題:

- 本物の目押し感はまだ調整余地あり
- ボーナス成立後の揃えやすさと自力感のバランス調整が必要
- リーチ目、制御矛盾、4コマ滑りの見せ方は今後さらに詰める

## 通常UIの確認ボタン

通常UIに `NEXT FREEZE` ボタンがあります。

用途:

- 次ゲームで強制ロングフリーズを確認する
- 演出確認用

本番化する場合は非表示またはdebug限定に戻す候補です。

## 主な素材配置

```text
assets/cabinet/cabinet-main.png
assets/reel-symbols/red7.png
assets/reel-symbols/blue7.png
assets/reel-symbols/bar.png
assets/reel-symbols/bat.png
assets/reel-symbols/ammo.png
assets/reel-symbols/cherry.png
assets/reel-symbols/replay.png
assets/reel-symbols/hero.png
assets/lcd/bonus-confirm.png
assets/lcd/bonus-sbb-bg.png
assets/lcd/bonus-big-bg.png
assets/lcd/bonus-reg-bg.png
assets/lcd/long-freeze.mp4
assets/sprites/hero/school/
assets/sprites/hero/rush/
assets/sprites/enemies/
assets/sprites/bosses/
```

## 今後の改修候補

- BONUS CHANCEの完全自動進行化
- PUSH告知時のみ液晶にPUSH案内を出す
- レア役停止時の液晶発展パターン増加
- ボーナス成立後のリーチ目/違和感停止形追加
- 左リール青7狙い時の停止形をさらに調整
- `cherry / suika` の停止頻度と期待度バランス調整
- 小役成立時の払い出しと取りこぼし挙動の整理
- ボーナス消化中のアニメーション強化
- `NEXT FREEZE` ボタンをdebug限定へ戻すか検討
- 上部カウンター位置の最終調整

