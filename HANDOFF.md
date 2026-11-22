# エラベル（eraberusaiyodaiko.com）引き継ぎメモ

採用代行・RPO比較メディア。運営は株式会社エージェントベスト。GitHub Pages（`CNAME`）で配信し、main に push すると本番に反映される。

## 作業の前に
- 作業前に `git pull`。終わったら commit・push まで済ませる（放置しない）。
- 記事ページは `node build-media.js` で生成する（原稿は `media/_articles/*.md`）。生成物の `media/**` も commit する。
- ⚠ **再ビルドすると、一覧ページと転送ページ（約165ファイル）からチャットの埋め込み（`<!-- ab-chat:start -->〜<!-- ab-chat:end -->`）が消える**。commit 前に、チャットが消えたHTMLへ HEAD の版から埋め込みを戻すこと。目安は `git diff --name-only` の HTML のうち `ab-chat:start` を含まないものを、`git show HEAD:<file>` の埋め込みで `</body>` 直前に復元（2026-11-22 時点で毎回165件）。`grep -rL "ab-chat:start" --include=index.html media | wc -l` が 0 なら OK。

## 主なファイル
| ファイル | 役割 |
|---|---|
| `build-media.js` | 記事・一覧・トップ・検索・sitemap の生成。CSS（`media/assets/media.css`）もここから出る |
| `service-guides.js` | 記事内の「サービス紹介」枠（企業向け）と、人事副業記事のPR枠（個人向け `personGuideFor`）。A8 の提携分はここ |
| `own-promo.js` | 運営会社の自社LPへの導線（2026-11-22 追加。下記） |
| `assets/own/*.svg` | 自社LP用のバナー画像（scout / offerbox / green） |
| `editorial.html` | 掲載・広告ポリシー。PR・自社サービスの扱いを変えたらここも直す |

## 広告・PR（2026-11-22 時点）
- **A8（エラベルのメディア＝a8mat が `4BGNCJ`、バナーの wid=002）**：提携9件をすべて掲載済み。
  - 企業向け記事：`service-guides.js` の services（一括.jp・フジ子さん・求人広告ドットコム・スマレジ。PRには300x250バナー付き）。
  - 人事副業記事（reader=person、603本）：`personGuideFor`（ココナラ・キャリコン養成講習2件・Backup Carrer・クラウドワークス テック）。
- `4BGNCI` で始まる a8mat はエージェントベストサーチ（C:\dev\jobs-front）側の提携。エラベルに載せない。逆も同じ。

### 自社LPの導線（own-promo.js）
企業向け記事（reader=company、1,397本）に、記事テーマで出し分けて4か所に出す。
| 記事 | 出すLP |
|---|---|
| OfferBox・新卒・インターン・学生 | OfferBox運用代行 https://offerboxapp.com/ |
| Green・エンジニア・IT採用 | Green運用代行 https://green.agent-best.net/ |
| それ以外 | スカウト代行 https://scout.agent-best.net/ |

- 場所：冒頭「【先に結論】」（自社＋記事のサービス候補から他社2件）／本文中ほどのバナー／本文直後の濃紺ブロック／サイドバー追従。一覧ページ・メディアトップにもバナー。
- 冒頭・中ほどは「サービス紹介」枠がある記事だけ。法令・労務の解説記事は末尾とサイドバーだけ。人事副業記事には出さない。
- 計測：リンクに `utm_source=eraberu&utm_medium=article&utm_campaign=<top|mid|end|side|list>&utm_content=<slug>`。GA4 イベント `own_lp_click`（service / position）、他社サービスは `service_click`。

### 守ること
- 掲載ポリシーに「報酬の有無で掲載順を変えない」とある。冒頭枠でもPR（報酬あり）を上に寄せない。「PICK 1」など順位に見える表示は使わない（「運営会社」「他社の候補」と表記）。
- 自社サービスの箇所には必ず「運営会社」「運営会社のサービス」と書く（ステマ規制）。
- 自社LPの文言は各LPに書いてある事実だけ（スカウト代行＝月額0円のフリープラン・成果報酬 新卒20万円/中途50万円・最低150通/月、OfferBox＝完全成果報酬 新卒1名20万円・入社前辞退は100%返金、Green＝入社1名50万円税別・Green利用料は別）。LPの料金が変わったら `own-promo.js` と `assets/own/*.svg` を両方直す。
- 「No.1」「人気」「ランキング」「必ず採用できる」は書かない（アクセス数のデータも無い）。
- 企業向けの打合せ予約（Timerex）は記事から直リンクしない。

## 関連
- 同じASP作業のエージェントベストサーチ側：`C:\dev\jobs-front\HANDOFF.md` の「アフィリエイト（PR枠）」。
- 提携状況の一覧：Google スプレッドシート「ASP提携状況（エラベル・エージェントベストサーチ）2026-11-20」。
- ASP の管理画面ログインは本人が行う。パスワードは入力しない。
