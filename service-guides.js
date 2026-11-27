'use strict';
/* Official service facts and editorial connections are kept separately.
   Do not infer support for a particular medium, occupation or location from a broad RPO menu. */
const checkedAt = '2026-11-08';
const services = {
  jobmedley: {name:'ジョブメドレー（求人掲載・スカウト）', company:'株式会社メドレー', kind:'医療・介護・福祉等の求人媒体', url:'https://employer.job-medley.com/services/job-medley', scope:'医療・介護・福祉等の求人掲載、登録求職者へのスカウト、求人作成サポート、応募者とのメッセージや面接調整等の管理機能を案内。採用時の成果報酬と条件付きの返金制度を案内。', confirm:'施設・職種・地域と掲載審査、資格や希望条件の検索・スカウト枠、原稿支援と外部担当利用の可否、応募後の担当、採用報告・料金と返金・終了条件を確認。'},
  welmeejob: {name:'ウェルミージョブ（旧カイゴジョブ）', company:'株式会社エス・エム・エス', kind:'介護・医療・障害福祉・保育の求人媒体', url:'https://www.business.kaigojob.com/', scope:'介護等の求人掲載と成果報酬型料金を案内。保有資格・地域等での検索、スカウト、一括送信、候補者との管理画面でのやりとりを提供。', confirm:'今回の施設職種資格地域、掲載とスカウト利用条件、検索・送信・応募後対応の担当、外部担当利用と権限、採用報告・料金算定と返金・契約終了を確認。'},
  manpowerGlobal: {name:'マンパワーグループのRPO・グローバル採用相談', company:'マンパワーグループ株式会社', kind:'採用代行・採用コンサルティング', url:'https://www.manpowergroup.jp/client/rpo/featurs/', scope:'採用代行・採用コンサルティングの特長として、グローバル採用への対応、プロジェクトマネージャーと専任チーム、応募者や人材紹介会社への対応を案内。', confirm:'今回の国・地域、雇用主体、職種と言語、対象工程と現地担当、契約主体・再委託、専門家確認とデータ経路、時間帯・費用・終了引継を確認。'},
  randstadRpo: {name:'Randstad EnterpriseのRPO', company:'ランスタッド（Randstad Enterprise／Randstad Sourceright）', kind:'採用工程の包括・部分支援', url:'https://www.randstadenterprise.com/solutions/talent-acquisition/rpo/what-is-rpo-ja/', scope:'包括型、プロジェクト型、選択型のRPOを案内。募集から選考・内定までの支援、応募対応・面接調整・実績管理などを説明し、日本向け案内とグローバルのRPOサービスを公開。', confirm:'日本の窓口から今回の海外採用を依頼できるか、国・職種・言語と工程、提供・契約主体、現地担当・再委託、制度とデータ取扱い、稼働・費用・終了を確認。'},
  inshokuten: {name:'求人飲食店ドットコム（求人掲載・スカウト）', company:'株式会社シンクロ・フード', kind:'飲食店向け求人媒体', url:'https://www.inshokuten.com/recruit/', scope:'飲食店向けに正社員・アルバイト等の求人掲載を案内。掲載中の店舗は別途プランで匿名プロフィールを閲覧してスカウトでき、希望勤務地域・雇用形態・業態等での絞り込みや経験・自己PRの確認を案内。原稿作成は別料金のサービスも扱う。', confirm:'店舗・業態と対象職務・地域、掲載条件とプラン、検索項目・送信枠、原稿作成と応募後の担当、外部担当の利用可否と権限、掲載・オプション費用と契約終了を確認。'},
  rejob: {name:'リジョブ（求人掲載・スカウト）', company:'株式会社リジョブ', kind:'美容・ヘルスケア分野の求人媒体', url:'https://biz.relax-job.com/new_inquiry', scope:'美容師等の求人掲載とスカウト機能を案内。掲載費と採用成果報酬を組み合わせるプラン、掲載費0円の採用成果報酬プラン等を案内し、契約条件がある。', confirm:'勤務地・職種と募集形態、掲載条件と利用プラン、スカウト枠・検索項目、成果報酬の発生・返金条件とオプション、外部担当による利用可否を確認。'},
  talenco: {name:'Talencoの採用代行', company:'株式会社Talenco', kind:'採用実務・運用支援', url:'https://talenco.jp/saiyo-daiko/', scope:'全国対応、オンラインでの打ち合わせを基本とし、媒体・求人原稿の運用、スカウト、応募連絡、面接日程、手順書と毎月の数値報告を案内。', confirm:'対象職務・勤務地と媒体、任せる工程・件数、承認と報告、現地対応の可否、媒体費等を含めた見積もりを確認。'},
  idhayato: {name:'アイアンドディハヤトのRPO', company:'株式会社アイアンドディハヤト', kind:'採用設計・実務支援', url:'https://www.id-hayato.co.jp/rpo/', scope:'全国対応を案内。採用基準の言語化、媒体・スカウト、応募者対応、説明会の参加者管理、日程調整、週次レポートと月次定例などを扱う。対応工程はプラン等で異なる。', confirm:'対象職務・勤務地、プランごとの対応工程と契約期間、説明会や現地対応の範囲、権限・承認と報告、追加費用を確認。'},
  agrinavi: {name:'あぐりナビ（求人広告・人材紹介）', company:'株式会社アグリメディア', kind:'農業分野の求人掲載・人材紹介', url:'https://www.agri-navi.com/application', scope:'農業の生産事業者向けに求人広告掲載と成果報酬の人材紹介を案内。求人原稿の作成にも対応すると説明。農業関連企業向けの募集サービスも扱う。', confirm:'作物・畜産等の業務と地域、通年・季節の雇用、広告と紹介の対象・料金の違い、原稿と現地取材、応募後の連絡・見学体験・住まい情報の分担、手数料と返金条件を確認。'},
  jacrecruitment: {name:'JAC Recruitment（人材紹介）', company:'株式会社ジェイ エイ シー リクルートメント', kind:'管理職・専門職・グローバル人材の紹介', url:'https://www.jacgroup.com/jp/service-brands/jac-recruitment.html', scope:'ミドル・ハイクラスのマネジメント層、業界スペシャリスト、グローバル人材の紹介を主に案内。業界・職種ごとの専門チームを設ける。', confirm:'対象職務・役職・地域と候補者探索、推薦と連絡・調整の範囲、手数料の算定対象・発生時期、返金・保証と契約期間、RPO等を併用する場合の分担を確認。'},
  rekatsusupport: {name:'Ｒｅ就活の採用・スカウト支援', company:'株式会社学情', kind:'媒体運営側の掲載・スカウト支援', url:'https://service.gakujo.ne.jp/services/career/', scope:'Ｒｅ就活の会員抽出・文面作成・配信を学情側で代行できる場合があると案内。原稿作成や採用活動の支援も相談できる。', confirm:'適用プランと代行可否、会員抽出・文面・配信の範囲、手段別の通数、企業の確認・承認、応募後の担当、掲載・追加費用を確認。'},
  roglio: {name:'RPO・採用コンサルティング（旧ログリオ）', company:'株式会社ハウテレビジョン', kind:'採用戦略・ダイレクトリクルーティング支援', url:'https://howtelevision.co.jp/business/', scope:'エンジニア採用に強みを持つRPOとして、ダイレクトリクルーティングの代行から採用戦略設計までを案内。', confirm:'対象職種と媒体、外資就活NEXTの現行対応、選定・文面・送信・返信の範囲、媒体契約との分担、承認・権限と情報管理、成果物・期間と費用を確認。'},
  geekly: {name:'Geekly（企業向け人材紹介）', company:'株式会社ギークリー', kind:'IT・Web・ゲーム領域の人材紹介', url:'https://www.geekly.co.jp/business/', scope:'要件確認と求人作成、候補者紹介、面接日程・合否連絡や条件・入社日程の調整を案内。', confirm:'人材紹介契約とスカウト機能の条件、社内の送信承認と面接枠、外部支援との分担、紹介手数料と契約条件を確認。'},
  wantedlybsearch: {name:'bサーチのWantedly運用代行', company:'株式会社bサーチ', kind:'募集・ストーリー・スカウト運用支援', url:'https://www.bsearch.co.jp/media/wantedly-unyou-daikou/', scope:'会社・募集ページ改善、スカウト対象整理・文面・送信支援・反応確認、ストーリー企画・社員取材・記事投稿をプラン別に案内。', confirm:'契約プランと制作・投稿・送信の範囲、名義と権限、取材と公開承認、面談までの分担、終了時のコンテンツ・記録、媒体費と委託費を確認。'},
  typebsearch: {name:'bサーチの転職サイトtype運用代行', company:'株式会社bサーチ', kind:'typeの原稿・スカウト運用支援', url:'https://www.bsearch.co.jp/media/type-unyou-daiko/', scope:'typeの申込・原稿制作、スカウト対象者整理・文面作成・配信予約・効果検証を案内。', confirm:'現在のプランと機能、媒体側制作との分担、選定・文面・配信と再送、特典承認、応募後と報告、媒体費と委託費・期間を確認。'},
  naitostanby: {name:'内藤一水社のスタンバイ運用支援', company:'株式会社内藤一水社', kind:'スタンバイのクリック課金広告運用支援', url:'https://www.naito.jp/omr/stanby/', scope:'表示回数・クリック数を確認した予算配分と求人情報の調整、掲載準備から運用、分析・課題確認と改善提案を案内。', confirm:'現在の連携方法、アカウント・レポート、計測と採用サイト修正・応募後の範囲、予算変更と停止の承認、広告実費と委託費・期間を確認。'},
  rikunabibsearch: {name:'bサーチのリクナビNEXT／Indeed PLUS運用支援', company:'株式会社bサーチ', kind:'原稿・クリック課金広告と手動アプローチの支援', url:'https://www.bsearch.co.jp/media/rikunabi-next/', scope:'Indeed PLUS連携の原稿作成・予算上限設定・単価調整・レポートを案内。Airワークの手動アプローチ代行は別プランとして案内。', confirm:'連携ATSと既存代理店、掲載・機能利用条件、広告と手動アプローチの分担、予算変更・停止の承認、取得可能な指標、応募後と広告費・委託費を確認。'},
  paizasupport: {name:'paiza転職の採用サポート', company:'paiza株式会社', kind:'媒体運営側のスカウト・選考サポート', url:'https://paiza.jp/pages/recruiters/career/service', scope:'求人作成・掲載、条件に沿うリスト選定と企業判断後の送信を支援。管理画面の日程・面接フィードバック入力を受けてサポートチームが対応すると案内。', confirm:'求人と要件、送信判断・プラチナスカウトの分担、管理画面入力と内定前後の連絡、成果報酬の算定・返戻条件、追加費用と利用条件を確認。'},
  offersairpo: {name:'Offers AI RPO', company:'株式会社overflow', kind:'媒体運営側のエンジニア採用・スカウト代行', url:'https://offers.jp/client/ai-rpo', scope:'現場へのヒアリング、候補者サーチ、AI生成文面の専門チームによる確認、配信・継続アプローチ、面談調整・選考支援を案内。', confirm:'対象職務と契約プラン、選定・文面の確認と承認、継続接触と停止、返信後の範囲、報告と記録、月額・期間と予算型リテーナーとの違いを確認。'},
  mynavibsearch: {name:'bサーチのマイナビ転職運用代行', company:'株式会社bサーチ', kind:'求人原稿・スカウトの運用支援', url:'https://www.bsearch.co.jp/media/mynavi-tenshoku/', scope:'マイナビ転職の求人原稿改善とスカウト運用を案内。スカウト配信代行のみの相談も受け付けている。', confirm:'掲載契約と媒体側の支援との分担、機能別の受託可否、原稿・文面・配信と特典承認、反応の取得・報告、応募後と媒体費・委託費を確認。'},
  laprasbpaas: {name:'LAPRASの運用代行（BPaaS）', company:'LAPRAS株式会社', kind:'媒体運営側の採用業務アウトソース', url:'https://corp.lapras.com/service/', scope:'採用企業向けに、採用活動の一部をアウトソースするBPaaS型プランを案内。運用サポートページでも運用代行オプションを契約担当へ相談できると案内。', confirm:'現在のプランと利用条件、候補者選定・興味通知・文面・送信・返信後の範囲、事実確認と承認、担当と報告、媒体費と代行費を確認。'},
  kyujinbsearch: {name:'bサーチの求人ボックス運用代行', company:'株式会社bサーチ', kind:'求人原稿・クリック課金広告の運用支援', url:'https://www.bsearch.co.jp/media/kyujinbox/', scope:'採用ターゲット・配信戦略、求人原稿の作成・リライト、クリック単価と運用調整、効果分析・レポートと改善提案を案内。', confirm:'対象の掲載・連携経路、原稿と広告設定、計測・連携作業の受託範囲、予算変更の承認、応募後、広告実費と代行費・期間を確認。'},
  indeedbsearch: {name:'bサーチのIndeed PLUS運用代行', company:'株式会社bサーチ', kind:'求人原稿・広告配信の運用支援', url:'https://www.bsearch.co.jp/media/indeed-plus/', scope:'Indeed PLUSの求人原稿作成・改善、配信設計、月次レポートと改善提案を案内。広告費と運用代行費は別途と説明。', confirm:'利用する投稿経路と契約、原稿・予算・配信の範囲、変更承認、機能利用条件、応募後の対応、広告実費と代行費・期間を確認。'},
  entenshoku: {name:'エン転職のスカウト代行サービス', company:'エン株式会社', kind:'掲載媒体側のスカウト代行オプション', url:'https://saiyo.employment.en-japan.com/blog/entensyoku-offer-scout-difference', scope:'エン転職のオプションとして、デイリースカウトの文面作成・対象者選定・配信を代行すると案内。エン転職ダイレクトとは区別して確認。', confirm:'掲載契約と対象プラン、選定・文面・配信と変更の範囲、特典の承認、応募後の担当、媒体費・オプション費と期間を確認。'},
  enbsearch: {name:'bサーチのエン転職運用代行', company:'株式会社bサーチ', kind:'求人原稿・スカウト・採用実務の運用支援', url:'https://www.bsearch.co.jp/media/en-tenshoku/', scope:'エン転職の求人原稿改善・スカウト運用などの支援を案内。エン転職ダイレクトの支援ページは別に設けている。', confirm:'掲載型かダイレクトか、媒体側の支援との分担、原稿・配信・応募後の範囲、特典と承認、報告・媒体費と委託費を確認。'},
  sokudan: {name:'SOKUDAN', company:'CAMELORS株式会社', kind:'フリーランス・副業人材マッチング', url:'https://business.sokudan.work/', scope:'企業とフリーランス・副業人材のマッチングを提供。採用人事を含む業務委託人材の活用を案内。', confirm:'人事領域の候補者と経験、業務・稼働時間、契約相手、報酬と利用料、選定・管理・交代・引き継ぎの分担を確認。'},
  projinji: {name:'プロ人事のダイレクトリクルーティング運用支援', company:'株式会社プロ人事', kind:'スカウト運用・採用実務支援', url:'https://projinji.com/work/direct-sourcing', scope:'ダイレクトリクルーティングの運用支援を案内。公式サイトにEight Career Designとの連携に関する記事を掲載。', confirm:'現在の対象媒体・機能、設計と選定・文面・送信、通知と返信後の範囲、担当と承認、権限、媒体費と委託費・契約条件を確認。'},
  dodabsearch: {name:'bサーチのdodaダイレクト運用代行', company:'株式会社bサーチ', kind:'doda ダイレクトのスカウト運用支援', url:'https://www.bsearch.co.jp/media/doda-direct/', scope:'求職者プロフィールの確認、個別の文面作成、送信を支援。応募者対応・面接日程調整などとの組み合わせを案内。', confirm:'対象求人と利用契約、選定・文面・配信の範囲、確約と承認、返信後の対応、担当と報告、媒体費と委託費・契約条件を確認。'},
  stepbasedoda: {name:'doda ダイレクト・StepBase連携の配信業務代行', company:'パーソルキャリア株式会社／パーソルビジネスプロセスデザイン株式会社', kind:'媒体連携による配信までの業務支援', url:'https://prtimes.jp/main/html/rd/p/000000817.000022215.html', scope:'2025年3月のパーソルキャリア発表で、求人票・配信文面の作成や配信などをStepBaseが代行する連携を案内。返信後の対応と面接日程調整は企業が担う説明。', confirm:'現在の提供と利用条件、対象プラン、指示書と承認、配信までの範囲、返信後に社内が担う作業、担当・件数・料金と契約を確認。'},
  careercross: {name:'キャリアクロスのスカウト代行', company:'株式会社キャリアクロス', kind:'媒体運営側のスカウト代行', url:'https://www.careercross.com/company/employer-landing', scope:'採用企業向けページで、忙しい企業にスペシャリストによるスカウト代行を案内。求人掲載・レジュメ検索・メッセージ機能を提供。', confirm:'利用プラン、選定・文面・送信の範囲、対応言語と確認者、返信後の対応、媒体費と代行費、期間と契約条件を確認。'},
  jacrpo: {name:'JAC RPO', company:'株式会社ジェイ エイ シー リクルートメント', kind:'採用計画・実務・プロセス改善の支援', url:'https://www.jacgroup.com/jp/service-brands/jac-rpo.html', scope:'採用計画、候補者獲得、選考、入社、プロセス改善やノウハウ体系化を案内。英語力のあるリクルーターも在籍。', confirm:'対象職種と工程、担当者の言語・実務経験、特定媒体の操作可否、原稿と候補者連絡、社内承認、成果物・期間と費用を確認。'},
  bizreachrpo: {name:'ビズリーチの採用代行（RPO）', company:'株式会社ビズリーチ', kind:'ビズリーチ利用企業向けの採用代行', url:'https://bizreach.biz/service/bizreach/faq/', scope:'ビズリーチ利用中の企業向けに、要件定義・スカウト送信・候補者との面談調整や面談対応などをニーズに合わせて提供すると案内。', confirm:'利用契約と対象企業の条件、今回の業務範囲、担当・件数・権限、面談の実施と日程調整の違い、媒体費と代行費、契約条件を確認。'},
  herphire: {name:'HERP Hire', company:'株式会社HERP', kind:'採用管理システム', url:'https://lp.herp.cloud/functions', scope:'応募情報の一元管理、日程・評価管理、コミュニケーションツール連携、ユーザーごとの権限管理などを案内。', confirm:'必要な機能と提供プラン、外部担当の権限、利用媒体・ツールの連携、データ移行・出力・削除、導入支援と費用を確認。'},
  guidable: {name:'Guidable RPO', company:'Guidable株式会社', kind:'外国人採用の実務支援', url:'https://guidable.co.jp/rpo/', scope:'外国人採用の応募受付、書類選考、面接設定などを案内。在留資格の確認や日本語能力の確認も支援内容として掲げる。', confirm:'対象職種・採用区分・言語、資格等の確認方法と専門家の分担、選考と連絡の範囲、面接設定の課金条件を含む費用を確認。'},
  worlding: {name:'ワールディングの外国人RPOC', company:'株式会社ワールディング', kind:'外国人採用代行・コンサルティング', url:'https://worlding.asia/business01-03', scope:'外国人採用の戦略・ルート管理・事務代行を案内。専門家との連携、多言語資料や通訳等、状況に応じた支援を扱う。', confirm:'対象職種・採用ルート、専門家と自社の分担、連絡・通訳・受け入れ支援の範囲、外部機関との連携、費用を確認。'},
  manpowerplus: {name:'マンパワーグループ プラスの障がい者採用代行', company:'マンパワーグループ プラス株式会社', kind:'障がい者採用の実務支援', url:'https://www.manpowergroupplus.jp/services/rpo/', scope:'求人作成、支援機関等への対応、応募者連絡・面接調整、受入部署向けの配慮事項レクチャー、入社後フォローを案内。', confirm:'対象業務と採用条件、選考・受け入れの分担、本人への説明と情報共有、支援機関との連携、入社後支援の範囲と費用を確認。'},
  persoldiverse: {name:'パーソルダイバースの採用事務代行', company:'パーソルダイバース株式会社', kind:'障害者採用・受け入れ準備支援', url:'https://persol-diverse.co.jp/solution/rpo/', scope:'障害者採用の業務切り出し・要件整理、求人票作成、支援機関との連携、面接同席や受け入れ準備を案内。', confirm:'業務と要件の整理、実務代行と選考助言の範囲、配属先の準備、本人と関係者への説明・共有、支援期間と費用を確認。'},
  onegoal: {name:'ワンゴールのハローワーク求人票作成', company:'株式会社ワンゴール', kind:'ハローワーク求人票の原稿作成', url:'https://www.onegoal.co.jp/flow', scope:'求人条件等を聞き取り、ハローワーク向け求人票の原稿を作成。応募者への連絡や採否通知等は代行しないと案内。', confirm:'対象求人と取材、原稿の納品形式・修正、掲載手続きの分担、応募後に自社で行う仕事、費用を確認。'},
  ogoe: {name:'Ｏ－ＧＯＥの採用代行', company:'株式会社Ｏ－ＧＯＥ', kind:'学校訪問・採用実務', url:'https://service.o-goe.co.jp/outsourcing/', scope:'高校・大学への学校訪問、会社説明、採用窓口、求人票作成、説明会の運営などを案内。', confirm:'対象地域・学校、訪問先の調整と説明資料、社内担当の同席、訪問後の記録・連絡、費用を確認。'},
  kcareer: {name:'ケイキャリアパートナーズの採用代行', company:'株式会社ケイキャリアパートナーズ', kind:'新卒・中途の採用実務', url:'https://www.kcareer.co.jp/forcompany/rpo/', scope:'新卒採用の企画・設計、学校訪問、学生情報管理・連絡、説明会・選考の運営支援などを案内。', confirm:'対象の採用区分・地域・学校、企画と運営の範囲、社員の役割、学生連絡・記録、期間と費用を確認。'},
  neointern: {name:'ネオキャリアのインターンシップ企画代行', company:'株式会社ネオキャリア', kind:'インターンシップ企画・運営支援', url:'https://www.neo-career.co.jp/humanresource/internship-planning/', scope:'インターンシップの企画提案・プログラム設計、コンテンツ開発、当日の進行や運用支援を案内。', confirm:'目的と対象学生、期間・実施形態、企画と教材、当日の進行、社員の受け入れ、募集と連絡の範囲、費用を確認。'},
  jacexec: {name:'JAC Executive', company:'株式会社ジェイ エイ シー リクルートメント', kind:'経営幹部の人材紹介・サーチ', url:'https://www.jacgroup.com/jp/service-brands/jac-executive.html', scope:'Cクラス・役員・部長職など経営幹部の人材紹介を案内。リテーナー型のエグゼクティブサーチにも対応。', confirm:'対象の役職・業界・事業段階、紹介とサーチの方法、機密情報の扱い、担当体制、着手金・成功報酬等の条件を確認。'},
  recruitexec: {name:'リクルートエグゼクティブエージェント', company:'株式会社リクルートエグゼクティブエージェント', kind:'経営層の人材紹介・サーチ', url:'https://www.recruit-ex.co.jp/', scope:'経営層・事業部門責任者などの人材紹介・エグゼクティブサーチを案内。成功報酬型人材紹介、リテーナーサーチ等を扱う。', confirm:'役職・業界とサービス対象地域、探索方法、情報開示と連絡の承認、担当体制、着手金・成功報酬等の契約条件を確認。'},
  mycrm: {name:'MyTalent CRM', company:'株式会社TalentX', kind:'採用CRM', url:'https://mytalent.jp/crm/', scope:'候補者データの管理、タレントプールの構築、候補者へのアプローチと継続運用の仕組みを案内。', confirm:'取り込むデータ、連絡の承認・停止、利用権限、既存ATSとの連携、導入支援と日々の運用の分担、出力・削除と費用を確認。'},
  hrmos: {name:'HRMOS採用', company:'株式会社ビズリーチ', kind:'採用管理システム', url:'https://hrmos.co/ats/', scope:'応募者・選考の管理に加え、過去の応募者やイベントで接点を持った候補者の蓄積と個別のやり取りを行うタレントプール機能を案内。', confirm:'必要なタレントプール機能の提供プラン、既存データの移行、権限と連絡履歴、出力・削除、システム利用料と運用支援の範囲を確認。'},
  proox: {name:'プルークスの採用動画制作', company:'株式会社プルークス', kind:'採用動画制作', url:'https://proox.co.jp/our-values/recruit-movie/', scope:'新卒・中途採用の動画制作を案内。採用課題の整理から企画、シナリオ・絵コンテ、撮影、編集までを扱う。', confirm:'動画の目的と利用場面、撮影場所、納品形式、修正回数、公開・二次利用の範囲、制作費と追加費用を確認。'},
  somethingfun: {name:'サムシングファンの動画制作', company:'株式会社サムシングファン', kind:'動画・映像制作', url:'https://www.somethingfun.co.jp/service/videoproduction', scope:'採用動画を含む映像制作を案内。ヒアリング、企画・コンテ提案、撮影などの制作工程を扱う。', confirm:'採用向けに伝える内容、撮影・編集の分担、掲載先に合う納品、修正、公開期間と二次利用、費用を確認。'},
  myrefer: {name:'MyTalent Refer（MyRefer）', company:'株式会社TalentX', kind:'リファラル採用システム', url:'https://mytalent.jp/refer/', scope:'社員による知人・友人の紹介採用を支えるシステムと従業員向けアプリを提供。', confirm:'対象の社員・採用区分、紹介と進捗共有の流れ、導入・運用支援の範囲、利用料と社内に残る仕事を確認。'},
  officialalumni: {name:'オフィシャル・アルムナイ', company:'株式会社ハッカズーク', kind:'アルムナイの関係構築支援', url:'https://official-alumni.com/', scope:'企業とアルムナイの関係構築に向け、専用クラウドシステムとコンサルティング・運用支援を案内。', confirm:'関係構築の目的、対象者、初期設計と継続運用の範囲、情報共有・退会、再雇用の事務との分担と費用を確認。'},
  manpowerOnsite: {name:'マンパワーグループの採用代行・常駐相談', company:'マンパワーグループ株式会社', kind:'採用代行の常駐体制の相談', url:'https://www.manpowergroup.jp/client/rpo/featurs/', scope:'採用代行の自社オフィス内常駐による業務委託が可能と案内。業務内容によっては人材派遣を提案する場合がある。', confirm:'常駐の目的と対象業務、場所・頻度・期間、契約形態、受託側の管理と連絡窓口、環境・権限、代替体制と費用を確認。'},
  manpower: {name:'マンパワーグループの中途採用・事務業務代行', company:'マンパワーグループ株式会社', kind:'中途採用の事務・運用支援', url:'https://www.manpowergroup.jp/client/rpo/serve/career-rpo.html', scope:'中途採用の応募者対応、適性検査の案内・結果管理、リファラル・アルムナイ採用の事務局業務などを案内。', confirm:'対象の採用区分と管理環境、任せる事務・連絡の範囲、社内承認、記録の受け渡しと費用を確認。'},
  insource: {name:'インソースの採用面接研修', company:'株式会社インソース', kind:'採用面接官向けの公開講座', url:'https://www.insource.co.jp/bup/bup_saiyo.html', scope:'採用面接を担当する人に向け、面接の進め方、質問、評価、模擬面接を扱う公開講座を案内。', confirm:'対象者と受講形式、現在のプログラム、自社の面接基準との接続、受講後の支援と費用を確認。'},
  backcheck: {name:'back check', company:'back check株式会社', kind:'オンライン型リファレンスチェック', url:'https://site.backcheck.jp/reference_check', scope:'候補者の上司・同僚などからオンラインで回答を取得するリファレンスチェック。質問設計や取得レポートの活用支援を案内。', confirm:'候補者・回答者への説明と同意、質問設定、利用プランの支援範囲、情報の保管と共有方法を確認。'},
  herptrust: {name:'HERP Trust', company:'株式会社HERP', kind:'オンライン型リファレンスチェック', url:'https://app.herptrust.cloud/ja/', scope:'企業が質問項目と回答者条件を設定し、案内メール・回答URLを通じて推薦情報を取得するサービス。候補者と回答者の合意を得る仕組みを案内。', confirm:'質問設定と回答者条件、回答の依頼・回収の役割、対象の利用プラン、情報の閲覧と保存の条件を確認。'},
  caster: {name:'CASTER BIZ recruiting', company:'株式会社キャスター', kind:'採用チームの運用支援', url:'https://recruiting.cast-er.com/', scope:'採用戦略、スカウト、求人媒体の運用、応募者対応などを支援。', confirm:'必要な稼働時間と、任せる工程・追加作業の範囲を確認。'},
  marugoto: {name:'まるごと人事', company:'マルゴト株式会社', kind:'採用体制づくり・実行', url:'https://marugotoinc.jp/', scope:'採用の設計からスカウト、選考運用、改善までを支援。', confirm:'採用チームの体制、月間の業務量、依頼するプランの範囲を確認。'},
  bsearch: {name:'採善策', company:'株式会社bサーチ', kind:'求人媒体・採用実務', url:'https://www.bsearch.co.jp/recruit/2490/', scope:'求人媒体の運用、スカウト、応募者対応、採用広報などを支援。', confirm:'対象の求人媒体、広告費と代行費の内訳、改善提案の範囲を確認。'},
  proscout: {name:'PRO SCOUT', company:'株式会社VOLLECT', kind:'スカウト運用', url:'https://vollect.net/proscout_lp/', scope:'スカウトの文面作成、配信、振り返りなどを支援。', confirm:'利用媒体、対象職種、通数、返信後の対応範囲を確認。'},
  helpyou: {name:'HELP YOU', company:'株式会社ニット', kind:'採用事務の切り出し', url:'https://help-you.me/service/hr/', scope:'求人票の作成、応募者対応、面接日程の調整、採用データ入力などに対応。', confirm:'月の作業時間、対応時間帯、承認が必要な業務の分担を確認。'},
  neo: {name:'ネオキャリアの採用代行', company:'株式会社ネオキャリア', kind:'採用計画・選考運用', url:'https://bizfocus.jp/rpo', scope:'新卒・中途の採用計画、母集団形成、選考・内定フォローを支援。一部業務の委託も相談可能。', confirm:'採用区分、必要な時期、連絡対応の範囲と運用体制を確認。'},
  neoPart: {name:'ネオキャリアのアルバイト採用代行', company:'株式会社ネオキャリア', kind:'アルバイト・パート採用', url:'https://www.neo-career.co.jp/humanresource/parttimerpo/', scope:'アルバイト採用に関わる応募管理や選考運用などのアウトソーシングを案内。', confirm:'店舗数、応募件数、店舗との連携方法、必要な対応時間帯を確認。'},
  leggenda: {name:'レジェンダの採用代行（RPO）', company:'レジェンダ・コーポレーション株式会社', kind:'採用設計・プロセス改善', url:'https://www.leggenda.co.jp/recruitment_support/rpo/', scope:'新卒・中途の採用設計、母集団形成、選考運用、分析などを支援。', confirm:'設計・実行それぞれの担当範囲と、社内の関係部署との進め方を確認。'},
  lein: {name:'LeINの採用代行（RPO）', company:'株式会社レイン', kind:'エンジニア採用', url:'https://lein.co.jp/lp/rpo/', scope:'エンジニア採用に向けた媒体・エージェント管理やスカウト設計などを支援。', confirm:'募集ポジションの技術領域、現場との要件整理、利用媒体を確認。'},
  // aff: ASP（A8.net）の計測リンク。表示時はPR表記・rel="sponsored"・計測用1pxを付ける。公式URLは url に残す。
  ikkatsu: {name:'採用代行一括.jp', company:'株式会社eclore', kind:'採用代行会社への一括問い合わせ', url:'https://www.ikkatsu.jp/rpo/', scope:'採用代行会社への依頼のほか、求人媒体への掲載や面接代行などの依頼内容を選び、複数の業者へまとめて問い合わせできる無料サービス。', confirm:'連絡が来る会社の数と、提案を比べる項目（任せる工程・費用の内訳・担当体制）を先に決めておく。'},
  // 広告リンク・計測画像は affiliate-programs.json の承認済み一覧から設定する。
  kyujinkoukoku: {name:'求人広告ドットコム', company:'株式会社bサーチ', kind:'求人広告の掲載・運用', url:'https://www.bsearch.co.jp/', scope:'リクナビNEXT・Indeed・doda・engage・求人ボックスなど、多数の求人広告をまとめて扱い、媒体選びから掲載まで相談できる。', confirm:'募集職種・勤務地・予算・採用までの期限を伝え、媒体ごとの費用と掲載期間、原稿作成の範囲を比べる。人材業界の会社・個人事業主からの問い合わせは対象外。'},
  sumareji: {name:'スマレジ・タイムカード', company:'株式会社スマレジ', kind:'クラウド勤怠管理', url:'https://timecard.smaregi.jp/', scope:'打刻・シフト作成・有給管理・給与計算までをクラウドでまとめて管理できる勤怠管理システム。料金と利用できる機能はプランごとに確認する。', confirm:'従業員数・店舗数、打刻の方法、今使っている給与ソフトとの連携、有料プランに切り替える条件を資料で確認する。'},
  fujiko: {name:'オンラインアシスタント フジ子さん', company:'BPOテクノロジー株式会社', kind:'バックオフィス業務のオンライン代行', url:'https://fujiko-san.com/', scope:'経理・労務・採用・秘書などのバックオフィス業務を、オンラインのアシスタントが月単位の時間契約で支援。', confirm:'月の依頼時間、採用業務で任せる作業（応募者への連絡・日程調整・データ入力など）、社内で判断を残す範囲を確認。'},
  agentbest: {name:'エージェントベストのスカウト代行', company:'株式会社エージェントベスト', kind:'スカウト実務', owned:true, url:'https://scout.agent-best.net/', scope:'候補者選定、文面作成・送信、日程調整、選考管理などを支援。', confirm:'対応媒体、成果報酬を含む総額、返信後の業務分担を確認。'}
};
// Each connection describes an option, never a guarantee that the underlying problem will be solved.
const profiles = {
  reference: {title:'リファレンスの取得を、専用サービスで支えるなら', lead:'候補者への説明、確認する項目、結果を使う範囲を先に整理します。以下はオンラインで回答を取得する専用サービスの候補です。人が推薦者へ電話する調査代行とは、実施方法と担当範囲を分けて比較してください。', check:'実施の目的、候補者・回答者への説明、質問、結果を見る人と扱いを社内で決めます。サービスを使うことだけで、個別の手続きや判断が適切になるとは限りません。', entries:[['backcheck','オンラインで回答を取得し、活用を相談する','質問設計やレポート活用の支援を含めて相談したい場合の候補です。'],['herptrust','質問と回答者条件を設定して依頼する','自社で決めた質問をオンラインで回収したい場合の候補です。']]},
  operations: {title:'応募者対応や日程調整を、外に任せるなら', lead:'連絡や入力が滞っているなら、採用全体を任せる前に、止まっている作業を切り出す方法があります。社内の面接枠と判断担当は決めたうえで、実務を支えるサービスを検討しましょう。', check:'初回連絡までの目安、社内確認で止まった場合の連絡先、土日・夜間の対応が必要かを先に整理します。', entries:[['helpyou','決まった手順の作業を切り出す','日程の候補を集める、応募情報を入力するなど、手順化できる作業を渡したい場合の候補です。'],['neo','選考の流れまで含めて相談する','連絡業務だけでなく、選考・内定フォローとのつながりも整えたい場合に、委託する工程を相談できます。'],['caster','継続して採用を回すチームを補う','応募者対応と媒体運用など、複数の作業をまとめて継続運用したい場合に検討できます。'],['fujiko','月単位の時間契約で事務を任せる','採用の連絡や入力に加えて、経理・労務など他のバックオフィス業務も同じ契約で頼みたい場合の候補です。']]},
  scout: {title:'スカウトの改善と運用を任せるなら', lead:'送信だけが足りないのか、対象者や文面の設計から見直す必要があるのかで、依頼先への相談内容は変わります。運用に特化した支援と、採用全体も扱う支援を分けて考えましょう。', check:'対象者の条件、文面の承認者、配信量、返信後の対応を同じ条件にして相談します。特定の媒体に対応できるかは各社へ確認してください。', entries:[['proscout','文面・配信・振り返りをつなげる','文面を作って終わりにせず、配信後の反応を見ながら運用を見直す支援を探す場合の候補です。'],['caster','スカウト以外の採用実務もまとめる','スカウトと求人媒体の運用、応募者対応の間で仕事が止まる場合は、周辺業務も含めた体制を検討できます。'],['agentbest','候補者選定から日程調整まで相談する','運営会社もスカウト実務を提供しています。依頼する範囲と費用条件を他社とそろえて検討してください。']]},
  engineer: {title:'エンジニア採用の支援を検討するなら', lead:'技術要件を言葉にする作業と、候補者を探して接点をつくる作業を分けると、必要な支援を相談しやすくなります。技術領域と募集ポジションを伝え、実際に担当する体制を確かめましょう。', check:'技術要件の理解、現場との打ち合わせ、利用する媒体、類似ポジションの支援経験を確認します。専門職への対応をサービス名だけで判断しないことが大切です。', entries:[['lein','技術職の要件と採用チャネルを整理する','エンジニア採用を掲げるRPOとして、媒体やエージェントの使い方から相談したい場合の候補です。'],['proscout','スカウトで候補者との接点をつくる','要件は社内で持ち、文面や配信、反応の振り返りを外部と進めたい場合に、対象ポジションへの対応を確認できます。']]},
  newgrad: {title:'新卒採用の設計・実務を補うなら', lead:'学生への連絡、イベント、選考、内定後のフォローは、時期ごとに負荷が変わります。採用年度と各工程の予定をそろえ、忙しい期間にどこを任せるかから相談しましょう。', check:'対象年度、繁忙期の稼働、学校・学生への連絡方法、イベント当日の対応範囲を確認します。特定の新卒媒体の操作は別途確認が必要です。', entries:[['neo','選考・内定フォローまでの流れを支える','新卒の採用計画から実務まで扱うサービスとして、一部業務から全体運用まで相談する候補です。'],['leggenda','年間の採用プロセスから整える','採用設計や選考運用を扱うため、年度を通した工程や社内の役割分担から見直したい場合に検討できます。']]},
  parttime: {title:'店舗・アルバイト採用の実務を支えるなら', lead:'応募から店舗での面接までに時間がかかる場合は、応募受付と店舗側の判断の受け渡しを見直します。採用人数だけでなく、店舗数と応募件数を伝えると、必要な運用体制を相談しやすくなります。', check:'店舗ごとの連絡担当、面接枠、連絡手段、夜間・休日の要否を整理します。対応時間や店舗数の条件は個別に確認してください。', entries:[['neoPart','アルバイト採用の運用を相談する','アルバイト採用向けの窓口として、応募管理や店舗との連携を含む実務の委託を検討できます。'],['helpyou','連絡・入力などの事務を切り出す','店舗の採用判断は社内に残し、応募情報の入力や日程候補の確認などを手順化して渡す場合の候補です。'],['kyujinkoukoku','アルバイト向けの求人広告を選び直す','応募が集まらない店舗では、掲載している媒体そのものを見直すと改善することがあります。媒体ごとの費用と掲載期間を比べて相談できます。'],['sumareji','シフトと勤怠の管理を軽くする','採用後のシフト作成や打刻の集計に手を取られている場合に、管理をクラウドにまとめて店長・人事の時間を空ける方法です。']]},
  attraction: {title:'応募を増やすための支援を考えるなら', lead:'応募が少ないときは、求人の伝え方、媒体の選択、採用条件のどこに原因があるかを切り分けます。広告を増やす支援と、採用の設計から見直す支援では、頼む内容が異なります。', check:'対象職種、勤務地、広告予算、現在の閲覧数・応募数を伝えます。採用条件そのものの変更が必要な場合は、自社で判断する担当者も決めておきましょう。', entries:[['kyujinkoukoku','求人広告をまとめて比べて出す','どの媒体に出すか決めきれないときに、複数の求人広告の費用と掲載期間を一度に比べて相談できる候補です。'],['bsearch','求人媒体の運用と採用実務を相談する','媒体運用や採用広報を扱うため、求人の出し方と応募後の運用を一緒に見直したい場合に検討できます。'],['leggenda','母集団形成の前提を整理する','ターゲットや採用プロセスの設計から扱うため、媒体を変える前に方針を見直したい場合の候補です。'],['neo','母集団形成から選考につなげる','応募を集める施策と選考運用を切り離さず、採用計画に沿って相談したい場合に検討できます。']]},
  team: {title:'少人数の人事を支えるサービスを検討するなら', lead:'採用を兼務している場合は、自社で決めることと、外部に任せる実務を先に分けます。採用チームを補う方法と、事務作業だけを切り出す方法の両方があります。', check:'採用計画の責任者、承認に使える時間、月の仕事量を整理します。業務を渡したあとも、合否や採用条件を誰が決めるかは社内で明確にします。', entries:[['marugoto','設計から実行までチームを補う','採用の進め方を相談しながら、日々の運用にも手が必要な場合に、支援体制を検討できます。'],['caster','複数の採用実務をまとめて任せる','媒体運用、スカウト、応募者対応などをまとめ、継続して回す実務を補いたい場合の候補です。'],['helpyou','手順の決まった作業から減らす','採用方針は社内で持ち、日程調整やデータ入力などの負担を減らしたい場合に検討できます。'],['fujiko','採用以外の事務もまとめて手放す','ひとりで人事と総務を兼ねていて、採用事務と経理・労務の作業を同じアシスタントに頼みたい場合の候補です。'],['sumareji','勤怠・シフトの集計を自動化する','少人数で労務まで見ている場合、勤怠の集計や有給管理をシステムに任せると、採用に使える時間を確保しやすくなります。']]},
  process: {title:'採用プロセスの見直しも任せるなら', lead:'辞退や選考の停滞は、連絡を増やすだけでは改善しないことがあります。どの工程で止まるかを確認し、設計の見直しと実務の委託を分けて相談しましょう。', check:'現在の選考フロー、工程ごとの件数と所要日数、現場の役割を共有します。採用条件や面接での評価は、自社側の判断も必要です。', entries:[['leggenda','設計・運用・分析をつなげる','選考プロセスの設計や分析も扱うため、工程を見直してから運用を回したい場合に検討できます。'],['marugoto','採用体制に実行役を加える','設計の議論だけでなく、スカウトや選考運用も継続して進める体制が必要な場合の候補です。'],['ikkatsu','見直しを頼む先を複数集める','プロセスの見直しを外部に相談したいが依頼先が決まっていない場合に、同じ依頼内容で複数社の提案を比べる方法です。']]},
  cost: {title:'費用を比較するときのサービス候補', lead:'予算だけで選ぶ前に、必要なのが採用チームの支援か、事務作業の代行かを分けましょう。以下は依頼範囲の異なる候補例です。同じ作業量と期間を伝え、総額で見積もりを確認してください。', check:'初期費用、月額、成果報酬、広告・媒体費、追加作業の単価と契約期間をそろえます。安い順の掲載ではありません。', entries:[['caster','採用チームの稼働量で見積もる','採用の実務を継続して任せるときは、必要時間と対象業務を決めて相談する候補です。'],['helpyou','事務作業を切り出して見積もる','採用方針や判断は社内に残し、連絡・入力などの作業量を基準に相談する候補です。'],['ikkatsu','同じ条件で複数社に問い合わせる','依頼先の候補がまだ決まっていない段階で、同じ依頼内容を複数の採用代行会社に送り、提案と見積もりを並べたい場合に使えます。'],['kyujinkoukoku','求人広告費を媒体ごとに比べる','代行を頼む前に、求人広告そのものの費用を見直したい場合の候補です。同じ募集条件で複数の媒体の見積もりを並べられます。']]},
  general: {title:'この記事の業務を外部に任せるなら', lead:'一括で委託する方法だけでなく、求人運用、スカウト、応募者対応などを切り出す方法もあります。記事で整理した課題を、実際に頼みたい作業に置き換えてから相談しましょう。', check:'対象の職種・業界・地域、利用する媒体、月の業務量を伝えます。各社がその条件に対応できるか、担当体制や類似の支援経験を個別に確認してください。', entries:[['marugoto','採用の設計と実行をまとめて相談する','採用体制を補いながら、日々の実務も進めたい場合の候補です。対象職種や地域への対応は確認が必要です。'],['caster','採用実務をチームで継続運用する','複数の採用業務を組み合わせて任せたい場合に、必要な稼働時間と対応範囲を相談できます。'],['ikkatsu','依頼先の候補をまとめて集める','どの会社に相談するか決まっていない場合に、依頼内容を選んで複数の採用代行会社へまとめて問い合わせる方法です。'],['kyujinkoukoku','まず求人広告の出し方から見直す','外部に任せる前に、媒体選びや原稿の出し方を変えるだけで応募が増えることもあります。媒体を横断して相談できる窓口です。']]}
};
const affiliatePrograms = require('./affiliate-programs.json');
function attachAffiliate(id, service) {
  const program = affiliatePrograms.programs[id];
  if (!program || program.status !== 'approved') throw Error(`Unapproved affiliate: ${id}`);
  service.aff = `https://px.a8.net/svt/ejp?a8mat=${program.text[0]}`;
  service.pixel = `https://${program.text[1]}.a8.net/0.gif?a8mat=${program.text[0]}`;
  service.bn = program.bn;
}
for (const id of ['ikkatsu','fujiko','kyujinkoukoku','sumareji']) attachAffiliate(id, services[id]);
const ruleText = a => `${a.slug} ${a.title} ${a.target || ''} ${(a.tags || []).join(' ')}`;
function profileFor(a) {
  if(a.reader !== 'company') return null;
  if(a.serviceProfile === 'none') return null;
  if(a.serviceProfile) {
    if(!profiles[a.serviceProfile]) throw Error(`Unknown serviceProfile: ${a.slug}`);
    return a.serviceProfile;
  }
  const t=ruleText(a);
  // Legal and internal HR issues should not become a promise of a commercial remedy.
  if(/rpo-(law-|kojin-jouhou|itaku-boshu|gisou|haken|kyoka|hourei)|職業安定法|委託募集の|個人情報保護|偽装請負|労働法|労務手続|就業規則/.test(t)) return null;
  if(/arubaito|parttime|アルバイト|パート採用/.test(t)) return 'parttime';
  if(/shinsotsu|新卒|インターン/.test(t)) return 'newgrad';
  if(/engineer|frontend|backend|sre-|data-scientist|エンジニア|IT採用/.test(t)) return 'engineer';
  if(/nittei|oubo-houchi|oubo-taiou|ats-|jim(u|u-)|日程調整|応募者対応|データ入力/.test(t)) return 'operations';
  if(a.pillar==='scout' || /scout|スカウト/.test(`${a.slug} ${a.title}`)) return 'scout';
  if(/ouboga-konai|boshuudan|kyujinhyo|baitai|求人広告|応募が|応募数|母集団|媒体選定|求人票/.test(t)) return 'attraction';
  if(/jinji-(hitori|fuzai)|startup|少人数|ひとり人事|一人.?人事|兼務|人事がいない/.test(t)) return 'team';
  if(/hiyou|mitsumori|料金|費用|予算|見積/.test(t)) return 'cost';
  if(/jitai|senko|naitei|選考|辞退|内定|戦略|プロセス|要件定義/.test(t)) return 'process';
  return 'general';
}
const esc = s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
function guideFor(a) {
  const key=profileFor(a); if(!key) return null;
  const p={...profiles[key], title:a.serviceTitle || profiles[key].title,
    lead:a.serviceLead || profiles[key].lead, check:a.serviceCheck || profiles[key].check};
  const entries=a.serviceIds ? a.serviceIds.map(id=>p.entries.find(e=>e[0]===id) || [id,'依頼範囲を確認する','この記事で整理した業務への対応と担当体制を確認してください。']) : p.entries;
  for(const [id] of entries) if(!services[id]) throw Error(`Unknown service id ${id}: ${a.slug}`);
  const html=`<section class="service-guide" aria-labelledby="service-options" data-profile="${key}">
<p class="service-guide__eyebrow">この課題を、サービスで支える${entries.some(([id])=>services[id]&&services[id].aff)?'（PRを含みます）':''}</p><h2 id="service-options">${esc(p.title)}</h2>
<p>${esc(p.lead)}</p><p class="service-guide__context">この記事のテーマ：${esc(a.title)}</p>
<div class="service-guide__choices">${entries.map(([id,angle,why])=>{const s=services[id];return `<article class="service-option" data-service="${id}">
<p class="service-option__angle">${esc(a[`serviceAngle_${id}`] || angle)}</p><h3>${esc(s.name)}</h3><p class="service-option__company">${esc(s.company)}${s.owned?' <span>運営会社のサービス</span>':''}${s.aff?' <span>PR</span>':''}</p>
<p>${esc(a[`serviceReason_${id}`] || why)}</p><dl><div><dt>公式に案内されている業務</dt><dd>${esc(s.scope)}</dd></div><div><dt>相談するときに確認したいこと</dt><dd>${esc(a[`serviceConfirm_${id}`] || s.confirm)}</dd></div></dl>
${s.aff&&s.bn?bannerHtml(id,s):''}${s.aff?`<a class="service-option__link" href="${esc(s.aff)}" target="_blank" rel="nofollow sponsored noopener" data-service="${id}">公式サイトで支援内容を確認する（PR）↗</a><img class="service-option__px" src="${esc(s.pixel)}" width="1" height="1" alt="" style="border:0;position:absolute;width:1px;height:1px;overflow:hidden">`:`<a class="service-option__link" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" data-service="${id}">公式サイトで支援内容を確認する ↗</a>`}</article>`}).join('\n')}</div>
<div class="service-guide__check"><h3>相談前に、ここまで整理しておく</h3><p>${esc(p.check)}</p></div>
<p class="service-guide__note">掲載は支援内容をもとに整理した候補例で、成果や個別条件への対応を保証するものではありません。順番はランキングではありません。公式情報の確認日：${esc(a.serviceCheckedAt || checkedAt)}。料金・対応範囲は各社にご確認ください。${entries.some(([id])=>services[id].aff)?'広告・提携情報の確認日：2026年11月27日。「PR」と表示したサービスのリンクはアフィリエイト広告で、申し込みがあった場合に当社が報酬を受け取ることがあります。':''}<a href="/editorial.html">掲載方針</a></p></section>`;
  return {key,title:p.title,html,entries};
}
// A8 の 300x250 バナー（エラベルのメディアは wid=002）。PR表記はカード側に付いている。
function bannerHtml(id, s) {
  const [mat, px, img, aid, mid] = s.bn;
  return `<a class="service-option__bn" href="https://px.a8.net/svt/ejp?a8mat=${mat}" target="_blank" rel="nofollow sponsored noopener" data-service="${id}"><img src="https://${img}.a8.net/svt/bgt?aid=${aid}&amp;wid=002&amp;eno=01&amp;mid=${mid}&amp;mc=1" width="300" height="250" alt="${esc(s.name)}" loading="lazy"></a><img class="service-option__px" src="https://${px}.a8.net/0.gif?a8mat=${mat}" width="1" height="1" alt="" style="border:0;position:absolute;width:1px;height:1px;overflow:hidden">`;
}

/* 人事副業：案件出品と資格学習を分ける。広告のコードは承認済み一覧だけから取得。 */
const personServices = {
  coconala: {name:'ココナラ', catch:'人事・採用の経験を、サービスとして出品する', points:['求人票の添削や面接練習など、自分が提供できる内容を出品する方法','提供範囲・納品物・料金・対応回数を決めてから掲載','案件の獲得や収入を保証するサービスではありません'], who:'自分の経験を生かし、依頼を受ける窓口を作りたい方', cta:'出品の仕組みを確認する（PR）'},
  pasonaCc: {name:'パソナ 国家資格キャリアコンサルタント養成講習', catch:'キャリア面談や人材育成につながる学習を検討する', points:['企業人事や人材育成での活用を考える方向けの養成講習','無料ガイダンスで学習内容と日程を確認','講習の修了と資格取得は別。受講料・受験要件も確認'], who:'18歳以上（高校生・海外在住者を除く）で、面談支援を体系的に学びたい方', cta:'無料ガイダンスの内容を確認する（PR）'},
  chiikiCc: {name:'地域連携プラットフォーム キャリアコンサルタント養成講習', catch:'働きながら学ぶための受講方法を確認する', points:['オンラインを含む受講方法・開講日程を説明会で確認','無料説明会・質問会で学習時間と費用を相談','資格取得や副業の受注・単価上昇を保証するものではありません'], who:'18歳以上（高校生・海外在住者を除く）で、学習と仕事の両立条件を確かめたい方', cta:'無料説明会の内容を確認する（PR）'},
  cmcaCc: {name:'日本キャリア・マネージメント・カウンセラー協会（CMCA）養成講習', catch:'人事経験を生かすキャリア支援の学習を検討する', points:['人事・採用・人材育成の経験からキャリア支援を学ぶ方向け','無料オンライン説明会で講習内容と受講条件を確認','受講費用・日程・試験までの流れを確かめて判断'], who:'日本在住の22〜60歳で、キャリア支援を学びたい方', cta:'無料オンライン説明会を確認する（PR）'}
};
for (const [id, service] of Object.entries(personServices)) {
  attachAffiliate(id, service);
  service.text = affiliatePrograms.programs[id].text;
}
function personIdsFor(a) {
  if (a.reader !== 'person') return [];
  // 資格保有者向け記事には、未取得者向けの養成講習を押し出さない。
  if (['fukugyo-shikaku','fukugyo-shikaku-toru'].includes(a.slug)) return ['pasonaCc','chiikiCc','cmcaCc'];
  return ['coconala'];
}
function personGuideFor(a) {
  const ids = personIdsFor(a);
  if (!ids.length) return null;
  const card = id => { const s = personServices[id]; const [mat, px, img, aid, mid] = s.bn;
    return `<article class="pr-card"><p class="pr-card__name">${esc(s.name)} <span>PR</span></p><p class="pr-card__catch">${esc(s.catch)}</p>
<a class="pr-card__bn" href="https://px.a8.net/svt/ejp?a8mat=${mat}" target="_blank" rel="nofollow sponsored noopener" data-service="${id}"><img src="https://${img}.a8.net/svt/bgt?aid=${aid}&amp;wid=002&amp;eno=01&amp;mid=${mid}&amp;mc=1" width="300" height="250" alt="${esc(s.name)}" loading="lazy"></a><img src="https://${px}.a8.net/0.gif?a8mat=${mat}" width="1" height="1" alt="" style="border:0;position:absolute;width:1px;height:1px;overflow:hidden">
<ul>${s.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul><p class="pr-card__who"><b>こんな人に：</b>${esc(s.who)}</p>
<a class="pr-card__btn" href="https://px.a8.net/svt/ejp?a8mat=${s.text[0]}" target="_blank" rel="nofollow sponsored noopener" data-service="${id}">${esc(s.cta)} ›</a><img src="https://${s.text[1]}.a8.net/0.gif?a8mat=${s.text[0]}" width="1" height="1" alt="" style="border:0;position:absolute;width:1px;height:1px;overflow:hidden"></article>`; };
  const title = '人事の経験を、副業・キャリアに広げるサービス';
  const html = `<section class="pr-guide" aria-labelledby="pr-services"><p class="pr-guide__eyebrow">PR｜この記事に関連するサービス</p><h2 id="pr-services">${title}</h2>
<p>${ids.includes('coconala')?'人事・採用の経験を、自分のサービスとして出品したい方向けの広告です。提供する業務に必要な資格・許可、所属先の副業ルール、守秘義務と情報の扱いは、出品前に確認してください。募集されている副業求人への応募や、案件紹介を受けるサービスとは異なります。':'キャリア支援を学ぶ場合の養成講習の広告です。資格取得が副業の必須条件という意味ではありません。無料説明会と有料講習を分け、受講料・学習時間・受験要件を確認してください。'}</p>
<div class="pr-guide__cards">${ids.map(card).join('\n')}</div>
<p class="pr-guide__note">この枠はアフィリエイト広告（PR）です。リンク先で申し込みがあった場合、運営会社が報酬を受け取ることがあります。広告・提携情報の確認日：2026年11月27日。対象年齢・地域、料金・日程などの条件は各サービスの公式情報をご確認ください。<a href="/editorial.html">掲載方針</a></p></section>`;
  return {key:'person', id:'pr-services', title, html, entries: ids};
}

// 全記事にASPを掲載する。本文の候補選定を広告のために変更せず、未掲載なら独立したPR枠を補う。
function articleAffiliateFor(a, guide) {
  if (a.reader === 'person') {
    if (!guide || guide.key !== 'person' || !guide.entries.length) throw Error(`Missing person affiliate: ${a.slug}`);
    return null;
  }
  if (a.reader !== 'company') throw Error(`Unknown affiliate audience: ${a.slug}`);
  if (guide?.entries.some(([id]) => services[id]?.aff)) return null;
  const profile = profileFor(a);
  const id = ['operations','team'].includes(profile) ? 'fujiko'
    : profile === 'attraction' ? 'kyujinkoukoku' : 'ikkatsu';
  const s = services[id];
  const ad = affiliatePrograms.programs[id];
  if (!s?.aff || ad?.status !== 'approved') throw Error(`Missing approved affiliate: ${a.slug}`);
  const contexts = {
    fujiko: ['採用の事務を外部に任せたい方へ', '応募者への連絡や日程調整、データ入力など、採用事務の負担を減らしたい場合の広告です。任せたい作業と月の業務量を整理し、実際に対応できる範囲と社内に残す判断を確認してください。'],
    kyujinkoukoku: ['求人広告の相談先を探している法人の方へ', '募集職種・勤務地・予算を伝えて、媒体選びや求人掲載を相談したい場合の広告です。記事で扱う特定の媒体・職種への対応、原稿作成や運用の範囲、広告費と支援費を個別に確認してください。人材業界の会社・個人事業主は広告の対象外です。'],
    ikkatsu: ['採用実務の依頼先を探している方へ', '採用業務の委託も検討している法人・個人事業主向けの広告です。複数の採用代行会社への問い合わせ窓口で、一括.jp自体が採用実務を行うサービスではありません。依頼する工程と条件を整理して相談してください。']
  };
  const [title, context] = contexts[id];
  const limitation = !profile
    ? 'この記事は制度・法務や社内での判断を整理する記事です。下記の広告は採用業務の委託先探しに関するもので、法的判断や記事の問題を解決するサービスとしての紹介ではありません。'
    : '本文で紹介したサービスとは別の広告枠です。記事で扱う個別の職種・地域・媒体への対応や成果を保証するものではありません。';
  const html = `<aside class="article-affiliate" aria-labelledby="affiliate-options" data-affiliate-service="${id}">
<p class="article-affiliate__label">PR｜採用担当者向けの広告</p><h2 id="affiliate-options">${esc(title)}</h2>
<p class="article-affiliate__context">${esc(limitation)}</p><div class="article-affiliate__content"><div><h3>${esc(s.name)}</h3><p>${esc(context)}</p><p class="article-affiliate__company">提供：${esc(s.company)}</p></div><div>${bannerHtml(id,s)}</div></div>
<p class="article-affiliate__note">この枠はアフィリエイト広告です。申し込みにより運営会社が報酬を受け取る場合があります。広告・提携情報の確認日：${esc(affiliatePrograms.checkedAt)}。料金・契約条件・対応範囲はリンク先で確認してください。<a href="/editorial.html">掲載・広告ポリシー</a></p></aside>`;
  return {id, html};
}

module.exports={services,profiles,profileFor,guideFor,checkedAt,personGuideFor,personServices,personIdsFor,articleAffiliateFor};
