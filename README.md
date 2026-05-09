# Wuthering.club

![Wuthering.club](https://img.shields.io/badge/Wuthering.club-Community-blue)
![Nuxt.js](https://img.shields.io/badge/Nuxt.js-2.15-green)
![Express](https://img.shields.io/badge/Express-4.19-lightgray)

> **【お知らせ】 本サービスは既に閉鎖されています。**
> このリポジトリは過去のソースコードのアーカイブ、および参考目的として公開されています。

Wuthering.club は「鳴潮 (Wuthering Waves)」プレイヤー向けのコミュニティプラットフォームです。ユーザー同士で投稿、コメント、いいね、フォローなどの機能を通じて交流することができます。

## 🌟 特徴

- **タイムライン＆投稿**: ユーザー同士でテキストや画像の投稿を共有。
- **フォローシステム**: 気になるユーザーをフォローしてタイムラインをカスタマイズ。
- **いいね＆コメント**: 投稿に対してリアクション。
- **Discord連携**: アカウント認証や通知などをDiscordと連携。

## 🛠 テクノロジースタック

### フロントエンド
- **フレームワーク**: Nuxt.js 2 (Vue 2)
- **UIコンポーネント**: Vuetify
- **その他**: Vuex, vue-sweetalert2, vue2-editor

### バックエンド
- **フレームワーク**: Express.js
- **データベース**: MySQL
- **ストレージ**: MinIO (オブジェクトストレージ)
- **その他**: Discord Webhook, express-rate-limit

## 🚀 ローカルでのセットアップ

このプロジェクトをローカルで動かすための手順です。

### 前提条件
- Node.js
- MySQL
- MinIO (または互換性のあるS3ストレージ)

### 1. リポジトリのクローン
```bash
git clone https://github.com/yourusername/wuthering.club.git
cd wuthering.club
```

### 2. バックエンドのセットアップ
```bash
cd backend
npm install
```
`.env` ファイルを作成し、必要な環境変数（データベース接続情報、MinIOの認証情報、Discordのシークレットなど）を設定してください。
```bash
npm run dev
```

### 3. フロントエンドのセットアップ
```bash
cd ../frontend
npm install
```
同じくフロントエンド側の `.env` にAPIのエンドポイントなどを設定します。
```bash
npm run dev
```

フロントエンドは `http://localhost:3000` で起動します。

## 📄 ライセンス

このプロジェクトは [MIT ライセンス](LICENSE) の下で公開されています。
