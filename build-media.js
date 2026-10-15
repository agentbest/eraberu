/* eraberusaiyodaiko.com のオウンドメディアを作る。
 *
 *   node build-media.js            … media/_articles/*.md → media/ 以下のHTML
 *   node build-media.js --check    … 書かずに件数と問題だけ出す
 *
 * 記事の原稿（.md）は別リポジトリ eraberu-media で書き、py publish.py がここへコピーする。
 * **media/ 以下の .html を手で編集しないこと。** 次のビルドで消える。
 *
 * ページ構成は www.agent-best.net/media/（agentbest-lp の src/pages/media/）に揃えている。
 *   /media/                 … トップ。検索・タグから探す・柱ごとのハブ・新着8件・CTA
 *   /media/{柱}/            … 柱（採用代行／スカウト代行／人事副業）。ハブの一覧＋全記事（ページ送り /2/）
 *   /media/hub/{ハブ}/      … 柱×series のハブ。記事一覧（ページ送り /2/）
 *   /media/tag/{タグ}/      … 柱をまたぐタグの一覧（ページ送り /2/）
 *   /media/search/          … 記事検索。インデックスは /media/search.json を検索ページだけが読む
 *   /media/{slug}/          … 記事
 * 旧URL（/media/page-N.html・/media/{柱}/page-N.html）は転送用の小さいページだけ残している。
 *
 * ⚠ 外部の依存（npm パッケージ）は使わない。Node だけで動く。
 *   エラベル本体の3ページ（index/partner/members）と同じで、ビルド環境を要求しない作りにしている。
 * ⚠ CSSだけは記事ページから外に出して media/assets/media.css にしてある。
 *   本体3ページは1ファイル完結だが、2,000ページに同じCSSを埋め込むと30MB以上になるため。
 */
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const SRC = path.join(DIR, 'media', '_articles');
const OUT = path.join(DIR, 'media');
const SITE = 'https://eraberusaiyodaiko.com';
const PER_PAGE = 40;        /* ハブ・タグ・柱の一覧（agent-best と同じ40件） */
const LATEST = 8;           /* トップの新着 */
const TAG_MIN = 5;          /* これ未満の記事しか無いタグはページを作らない */
/* 計測。既存12サイトと同じプロパティに相乗りし、サイト別はホスト名で分けて見る（[[ga4-operations]]） */
const GA_ID = 'G-1XXMP8Y1B4';

/* 柱（記事の大分類）。URL・パンくず・CTAの元になる。
   ⚠ ここのキーは記事の frontmatter の pillar と一致させること。 */
const PILLARS = [
  { key: 'rpo', name: '採用代行', lead: '採用代行（RPO）に何をどこまで任せられるのか。費用の見方、契約の勘所、媒体・職種ごとの進め方をまとめています。' },
  { key: 'scout', name: 'スカウト代行', lead: 'スカウトの返信率は、送信数を増やす前に決まります。媒体ごとの設計、文面の型、外注する範囲の切り分け方。' },
  { key: 'fukugyo', name: '人事副業', lead: '人事・採用の経験を副業で活かすための実務。単価の決め方、案件の取り方、契約と税務、踏み込みすぎない線引き。' },
];
const PILLAR = Object.fromEntries(PILLARS.map(p => [p.key, p]));

/* ハブ＝柱×series。agent-best の「職種・業界ハブ」にあたる。
   ⚠ 記事の series が増えたらここに足す（足さないとビルドが止まる）。slug は公開URLなので変えない。 */
const HUBS = [
  { slug: 'rpo-kadai',      pillar: 'rpo', series: '課題',       name: '採用の課題から考える',  note: '応募が来ない、面接に来ない、辞退が続く。課題を分解して、外に任せる部分を決める。' },
  { slug: 'rpo-erabikata',  pillar: 'rpo', series: '選び方',     name: '採用代行の選び方・比較', note: '会社の比べ方、見積もりの読み方、発注前に確かめること。' },
  { slug: 'rpo-hiyou',      pillar: 'rpo', series: '費用・契約', name: '費用・契約・法務',      note: '料金体系の違い、契約で決めておくこと、職業安定法まわりの線引き。' },
  { slug: 'rpo-phase',      pillar: 'rpo', series: 'フェーズ別', name: '会社のフェーズ別',      note: '創業期・拡大期・人事が1人の会社など、段階ごとの任せ方。' },
  { slug: 'rpo-gyomu',      pillar: 'rpo', series: '業務別',     name: '業務別に任せる',        note: '日程調整、求人票、スカウト、面接代行。工程ごとに切り出す。' },
  { slug: 'rpo-shokushu',   pillar: 'rpo', series: '職種別',     name: '職種別の採用代行',      note: 'エンジニア、営業、看護師、施工管理など。職種ごとの集め方と任せ方。' },
  { slug: 'rpo-gyokai',     pillar: 'rpo', series: '業界別',     name: '業界別の採用代行',      note: 'IT・医療・建設・飲食など、業界ごとの採用の事情。' },
  { slug: 'rpo-chiiki',     pillar: 'rpo', series: '地域別',     name: '地域別の採用代行',      note: '都道府県ごとの採用市場と、地方採用で外注を使うときの勘所。' },
  { slug: 'rpo-baitai',     pillar: 'rpo', series: '媒体別',     name: '媒体別の運用代行',      note: '求人媒体ごとの運用を任せるときの範囲と費用。' },
  { slug: 'scout-unyo',     pillar: 'scout', series: '運用・費用', name: '運用・費用',          note: 'スカウト代行の費用相場、運用の型、外注の範囲。' },
  { slug: 'scout-kaizen',   pillar: 'scout', series: '改善',       name: '返信率の改善',        note: '件名・文面・ターゲティング。返信が来ないときの見直し順。' },
  { slug: 'scout-baitai',   pillar: 'scout', series: '媒体別',     name: '中途媒体別',          note: 'ビズリーチ、doda、Green、Findyなど、媒体ごとの使い方。' },
  { slug: 'scout-shinsotsu', pillar: 'scout', series: '新卒媒体別', name: '新卒媒体別',          note: 'OfferBox、ワンキャリア、dodaキャンパスなど、新卒スカウトの媒体別。' },
  { slug: 'scout-shokushu', pillar: 'scout', series: '職種別',     name: '職種別のスカウト',    note: '職種ごとの検索条件と文面の組み立て方。' },
  { slug: 'fukugyo-hajimekata',   pillar: 'fukugyo', series: '始め方',     name: '人事副業の始め方',  note: '最初の1件の取り方、案件の探し方、準備しておくこと。' },
  { slug: 'fukugyo-hatarakikata', pillar: 'fukugyo', series: '働き方',     name: '働き方・両立',      note: '本業との両立、稼働時間の決め方、続け方。' },
  { slug: 'fukugyo-hoshu',        pillar: 'fukugyo', series: '報酬・契約', name: '報酬・契約・税務',  note: '単価の決め方、契約書、確定申告・インボイス。' },
  { slug: 'fukugyo-seido',        pillar: 'fukugyo', series: '制度・法務', name: '制度・法務',        note: '就業規則、競業避止、労働時間の通算、社会保険。' },
  { slug: 'fukugyo-skill',        pillar: 'fukugyo', series: '実務スキル', name: '実務スキル',        note: '副業先で求められる実務の型と、伝え方。' },
  { slug: 'fukugyo-gyomu',        pillar: 'fukugyo', series: '業務別',     name: '業務別の人事副業',  note: 'スカウト運用、面接代行、制度設計など、業務ごとの受け方。' },
  { slug: 'fukugyo-keireki',      pillar: 'fukugyo', series: '経歴別',     name: '経歴別の人事副業',  note: '人事1年目、エージェント出身、労務出身など、経歴ごとの始め方。' },
];
const hubOf = a => HUBS.find(h => h.pillar === a.pillar && h.series === a.series);

/* タグ。ハブ（柱の中の縦の分類）と直交する、柱をまたぐ横の分類。agent-best の「タグから探す」にあたる。
   記事の tags は自由記述で1,600種以上あるので、一覧ページを作るのはここに挙げたものだけ。
   ⚠ slug は公開URLなので変えない。label は記事の tags の表記と完全一致させる。 */
const TAG_GROUPS = [
  { name: '採用の進め方', note: '母集団形成から定着まで。採用活動のどの工程の話かで探せます。', tags: [
    ['boshu', '母集団形成'], ['yoken', '採用要件'], ['kyujinhyo', '求人票'], ['senko', '選考設計'],
    ['kouhosha', '候補者対応'], ['cx', '候補者体験'], ['koho', '採用広報'], ['teichaku', '定着'],
    ['channel', '採用チャネル'], ['dr', 'ダイレクトリクルーティング'], ['shokai', '人材紹介'], ['ats', 'ATS'],
  ] },
  { name: '採用の対象', note: '誰を採るかで探せます。', tags: [
    ['shinsotsu', '新卒採用'], ['engineer', 'エンジニア採用'], ['it', 'IT採用'], ['gijutsu', '技術職採用'],
    ['chiiki', '地域採用'], ['startup', 'スタートアップ'],
  ] },
  { name: '外注・委託の判断', note: '何を任せるか、どこに頼むか、いくらで頼むか。発注する側の判断材料です。', tags: [
    ['makaseru', '任せる範囲'], ['kotei', '工程の切り分け'], ['gaichu-junban', '外注の順番'], ['erabikata', '選び方'],
    ['hikaku', '比較'], ['sentei', '選定基準'], ['mitsumori', '見積もり'], ['hiyou', '費用'], ['seika', '成果報酬'],
    ['keiyaku', '契約'], ['keiyaku-shuryo', '契約終了'], ['hikitsugi', '引き継ぎ'], ['hacchu', '発注前の確認'],
    ['shippai', '失敗パターン'], ['kinou', '機能する条件'], ['joho', '情報管理'], ['tachiage', '立ち上げ'],
  ] },
  { name: 'スカウト運用', note: 'スカウトの返信率を左右する要素ごとに探せます。', tags: [
    ['bunmen', 'スカウト文面'], ['kenmei', '件名'], ['kensaku', '検索条件'], ['targeting', 'ターゲティング'],
    ['template', 'テンプレート'], ['unyo-sekkei', '運用設計'], ['kaizen', '改善'], ['kyujin-search', '求人検索エンジン'],
  ] },
  { name: '人事副業', note: '人事・採用の経験を副業で活かしたい方向けです。', tags: [
    ['hajimekata', '副業の始め方'], ['anken', '案件獲得'], ['first', '最初の1件'], ['nagare', '案件の流れ'],
    ['fukugyo-anken', '副業案件'], ['skill', '実務スキル'], ['ryoritsu', '両立'], ['tanka', '単価'], ['hoshu', '報酬'],
    ['itaku', '業務委託'], ['kado', '稼働管理'], ['roki', '労働基準法'], ['shugyo', '就業規則'], ['faq', 'よくある質問'],
  ] },
];
const TAGS = TAG_GROUPS.flatMap(g => g.tags.map(([slug, label]) => ({ slug, label, group: g.name })));
const TAG_BY_LABEL = new Map(TAGS.map(t => [t.label, t]));

/* 読者ごとのCTA。company＝採用したい企業、person＝副業したい個人。
   ⚠ 記事の読者と違うCTAを出すと問い合わせが噛み合わなくなる。frontmatter の reader で必ず出し分ける。
   ⚠ 企業向けの打合せ予約（Timerex）はフォーム送信後に案内する方針。ここから直リンクしない。 */
const CTA = {
  company: { href: '/#consult', label: '無料で相談する',
             lead: '採用の進め方を、担当者と整理しませんか', sub: '担当者を選べる採用代行「エラベル」。基準を満たした担当者だけをご紹介します。相談は無料、費用は採用が決まったときのみ。',
             alt: { href: '/#fee', label: '費用を見る' } },
  person:  { href: '/partner.html', label: '担当者として登録する',
             lead: '人事の経験を、副業で活かしませんか', sub: '稼働時間も単価もご自身で決められます。エラベルは企業とあなたをつなぐ窓口です。',
             alt: { href: '/media/fukugyo/', label: '人事副業の記事を読む' } },
};

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const escAttr = esc;

/* ---------- frontmatter ----------
   YAML の全部は解釈しない。使うのは「key: 値」「key: [a, b]」と sources の - name/url だけ。
   仕様を増やすときは check.py（原稿側の検査）と合わせること。 */
function parseFM(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw);
  if (!m) return { fm: null, body: raw };
  const fm = {}; const lines = m[1].split(/\r?\n/);
  let key = null, list = null;
  const unq = v => {
    v = v.trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
    return v;
  };
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (!ln.trim()) continue;
    const item = /^\s+-\s*(.*)$/.exec(ln);
    if (item && list) {                          /* sources: の - name: / url: */
      const kv = /^([A-Za-z_]+)\s*:\s*(.*)$/.exec(item[1]);
      if (kv) { const o = {}; o[kv[1]] = unq(kv[2]); list.push(o); }
      else if (list.length && typeof list[list.length - 1] === 'object') { /* 続き行 */ }
      else list.push(unq(item[1]));
      continue;
    }
    const cont = /^\s{2,}([A-Za-z_]+)\s*:\s*(.*)$/.exec(ln);
    if (cont && list && list.length && typeof list[list.length - 1] === 'object') {
      list[list.length - 1][cont[1]] = unq(cont[2]); continue;
    }
    const kv = /^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/.exec(ln);
    if (!kv) continue;
    key = kv[1]; const val = kv[2].trim(); list = null;
    if (val === '') { fm[key] = []; list = fm[key]; continue; }
    if (val.startsWith('[')) {
      fm[key] = val.replace(/^\[|\]$/g, '').split(',').map(s => unq(s)).filter(Boolean);
      continue;
    }
    fm[key] = unq(val);
  }
  return { fm, body: m[2] };
}

/* ---------- markdown（使う記法だけ） ----------
   見出し(##〜####) / 段落 / 箇条書き / 番号付き / 表 / 引用 / 水平線 /
   強調・リンク・コード / <aside> などの生HTMLブロック。
   ⚠ 記事側で新しい記法を使いたくなったら、ここに足してから使う（黙って崩れるため）。 */
function inline(s) {
  s = esc(s);
  s = s.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) =>
    /^https?:\/\//.test(u) && !u.includes('eraberusaiyodaiko.com')
      ? `<a href="${escAttr(u)}" target="_blank" rel="noopener">${t}</a>`
      : `<a href="${escAttr(u)}">${t}</a>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return s;
}
function mdToHtml(src) {
  const lines = String(src).replace(/\r\n/g, '\n').split('\n');
  const out = [];
  const heads = [];              /* 目次用の H2 */
  let i = 0;
  const isTableSep = s => /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(s) && s.includes('-');
  while (i < lines.length) {
    let ln = lines[i];
    if (!ln.trim()) { i++; continue; }

    /* 生HTMLブロック（<aside> の中間CTAなど）。空行まで素通し */
    if (/^\s*<(aside|div|figure|table|blockquote)\b/.test(ln)) {
      const buf = [];
      const tag = /^\s*<([a-z]+)/.exec(ln)[1];
      const close = new RegExp('</' + tag + '>');
      while (i < lines.length) { buf.push(lines[i]); if (close.test(lines[i])) { i++; break; } i++; }
      out.push(buf.join('\n')); continue;
    }
    /* 見出し */
    let h = /^(#{2,4})\s+(.*)$/.exec(ln);
    if (h) {
      const lv = h[1].length, txt = h[2].trim();
      if (lv === 2) { const id = 'h' + (heads.length + 1); heads.push({ id, text: txt });
        out.push(`<h2 id="${id}">${inline(txt)}</h2>`); }
      else out.push(`<h${lv}>${inline(txt)}</h${lv}>`);
      i++; continue;
    }
    /* 水平線 */
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(ln)) { out.push('<hr>'); i++; continue; }
    /* 表 */
    if (ln.includes('|') && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const cells = r => r.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      const head = cells(ln); i += 2;
      const body = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) { body.push(cells(lines[i])); i++; }
      out.push('<div class="tw"><table><thead><tr>'
        + head.map(c => `<th>${inline(c)}</th>`).join('')
        + '</tr></thead><tbody>'
        + body.map(r => '<tr>' + r.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>').join('')
        + '</tbody></table></div>');
      continue;
    }
    /* 箇条書き */
    if (/^\s*[-*]\s+/.test(ln)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*]\s+/, '')); i++; }
      out.push('<ul>' + items.map(x => `<li>${inline(x)}</li>`).join('') + '</ul>');
      continue;
    }
    /* 番号付き */
    if (/^\s*\d+\.\s+/.test(ln)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s+/, '')); i++; }
      out.push('<ol>' + items.map(x => `<li>${inline(x)}</li>`).join('') + '</ol>');
      continue;
    }
    /* 引用 */
    if (/^\s*>\s?/.test(ln)) {
      const buf = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
      out.push('<blockquote>' + buf.map(x => `<p>${inline(x)}</p>`).join('') + '</blockquote>');
      continue;
    }
    /* 段落（次の空行まで） */
    const buf = [];
    while (i < lines.length && lines[i].trim()
           && !/^(#{2,4})\s/.test(lines[i]) && !/^\s*[-*]\s+/.test(lines[i])
           && !/^\s*\d+\.\s+/.test(lines[i]) && !/^\s*>/.test(lines[i])
           && !/^\s*</.test(lines[i]) && !(lines[i].includes('|') && isTableSep(lines[i + 1] || ''))) {
      buf.push(lines[i]); i++;
    }
    if (buf.length) out.push(`<p>${buf.map(inline).join('<br>')}</p>`);
  }
  return { html: out.join('\n'), heads };
}

/* ---------- ページの外枠 ---------- */
const BRAND = `<a class="brand" href="/">
      <span class="mk"><svg width="20" height="20" viewBox="0 0 64 64" aria-hidden="true"><path d="M20 20h24M20 32h18M20 44h24" stroke="#E4572E" stroke-width="7" stroke-linecap="round"/></svg></span>
      <span class="nm">エラベル<small>ERABERU</small></span>
    </a>`;

function head(o) {
  const canon = SITE + o.url;
  const ld = [].concat(o.jsonld || []);
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(o.title)}</title>
<meta name="description" content="${escAttr(o.desc)}">
<meta name="robots" content="${o.noindex ? 'noindex,follow' : 'index,follow'}">
<meta name="theme-color" content="#0B1A32">
<link rel="canonical" href="${escAttr(canon)}">
<meta property="og:type" content="${o.ogType || 'website'}">
<meta property="og:site_name" content="エラベル">
<meta property="og:title" content="${escAttr(o.title)}">
<meta property="og:description" content="${escAttr(o.desc)}">
<meta property="og:url" content="${escAttr(canon)}">
<meta property="og:locale" content="ja_JP">
<meta property="og:image" content="${SITE}/assets/ogp.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230B1A32'/%3E%3Cpath d='M20 20h24M20 32h18M20 44h24' stroke='%23E4572E' stroke-width='6' stroke-linecap='round'/%3E%3C/svg%3E">
<link rel="stylesheet" href="/media/assets/media.css">
${ld.map(x => `<script type="application/ld+json">${JSON.stringify(x)}</script>`).join('\n')}
<!-- Google アナリティクス（既存12サイトと同じプロパティ。サイト別はホスト名で分ける） -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>
  window.dataLayer=window.dataLayer||[];
  function gtag(){dataLayer.push(arguments)}
  gtag('js',new Date());
  gtag('config','${GA_ID}');
</script>
</head>
<body>
<header class="nav">
  <div class="wrap nav-in">
    ${BRAND}
    <nav class="nav-links">
      <a href="/media/">メディア</a>
      ${PILLARS.map(p => `<a href="/media/${p.key}/">${esc(p.name)}</a>`).join('\n      ')}
      <a href="/partner.html">担当者として登録</a>
    </nav>
    <a class="btn btn-primary cta-mini" href="/#consult">無料で相談する</a>
  </div>
</header>`;
}

function foot() {
  return `<footer>
  <div class="wrap">
    <div class="foot-in">
      <div>
        <div class="foot-brand">エラベル</div>
        <div style="margin-top:6px">採用代行の担当者を選べる窓口</div>
      </div>
      <div class="foot-links">
        <a href="/media/">メディア</a>
        ${PILLARS.map(p => `<a href="/media/${p.key}/">${esc(p.name)}</a>`).join('\n        ')}
        <a href="/media/search/">記事を検索</a>
        <a href="/#fee">費用</a>
        <a href="/#consult">無料で相談する</a>
        <a href="/members.html">会員サイト</a>
        <a href="/partner.html">担当者として登録する</a>
        <a href="/privacy.html">プライバシーポリシー</a>
        <a href="https://www.agent-best.net/" target="_blank" rel="noopener">運営会社</a>
      </div>
    </div>
    <div class="foot-copy">運営：株式会社エージェントベスト（厚生労働大臣許可 13-ユ-316964）</div>
  </div>
</footer>
</body>
</html>`;
}

/* パンくず。画面の表示と構造化データ（BreadcrumbList）を同じ配列から作る */
function crumbs(items) {
  return `<nav class="crumb" aria-label="パンくず">`
    + items.map(x => x.url
        ? `<a href="${escAttr(x.url)}">${esc(x.name)}</a>`
        : `<span>${esc(x.name)}</span>`).join('<i aria-hidden="true">/</i>')
    + `</nav>`;
}
function crumbLd(items, selfUrl) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map((x, n) => ({ '@type': 'ListItem', position: n + 1, name: x.name, item: SITE + (x.url || selfUrl) })),
  };
}

function searchBox(placeholder) {
  return `<form class="msearch" action="/media/search/" method="get" role="search">
    <label class="sr-only" for="media-q">記事を検索</label>
    <input id="media-q" type="search" name="q" placeholder="${escAttr(placeholder || 'キーワードで検索（例：スカウト 返信率、費用相場、確定申告）')}" autocomplete="off">
    <button type="submit">検索</button>
  </form>`;
}

/* シェア。共有先で解決できるよう絶対URLを渡す */
function share(url, title, label) {
  const u = encodeURIComponent(SITE + url), t = encodeURIComponent(title);
  return `<div class="share">
    <p class="share__t">${esc(label || 'この記事をシェア')}</p>
    <ul>
      <li><a href="https://twitter.com/intent/tweet?url=${u}&amp;text=${t}" target="_blank" rel="noopener">X</a></li>
      <li><a href="https://www.facebook.com/sharer/sharer.php?u=${u}" target="_blank" rel="noopener">Facebook</a></li>
      <li><a href="https://www.linkedin.com/sharing/share-offsite/?url=${u}" target="_blank" rel="noopener">LinkedIn</a></li>
      <li><a href="https://b.hatena.ne.jp/add?mode=confirm&amp;url=${u}&amp;title=${t}" target="_blank" rel="noopener">はてブ</a></li>
    </ul>
  </div>`;
}

/* 締めのCTA（濃紺の帯）。トップ・柱・ハブ・タグ・記事で共通 */
function ctaBlock(reader, h2) {
  const c = CTA[reader] || CTA.company;
  const other = reader === 'person'
    ? `<p class="cta__other">採用でお困りの企業さまは <a href="/#consult">無料で相談する →</a></p>`
    : `<p class="cta__other">人事の経験を副業で活かしたい方は <a href="/partner.html">担当者として登録 →</a></p>`;
  return `<aside class="cta">
    <h2>${esc(h2 || c.lead)}</h2>
    <p>${esc(c.sub)}</p>
    <div class="cta__actions">
      <a class="cta__btn" href="${escAttr(c.href)}">${esc(c.label)}</a>
      <a class="cta__btn cta__btn--sub" href="${escAttr(c.alt.href)}">${esc(c.alt.label)}</a>
    </div>
    ${other}
  </aside>`;
}

const AUTHOR = `<aside class="author">
  <p class="author__t">監修</p>
  <p class="author__n">松岡 良次</p>
  <p class="author__b">株式会社エージェントベスト代表。大手人材会社およびスタートアップ人材企業にて、IT・スタートアップ・メガベンチャー企業の採用支援に従事。独立後はIT・スタートアップ・コンサル領域に特化し、20〜30代のキャリア支援を行う。（厚生労働大臣許可 13-ユ-316964）</p>
</aside>`;

/* 記事の一覧（タイトル＋説明＋柱・テーマのチップ）。agent-best の art-list と同じ見せ方 */
function artItem(a, opt = {}) {
  const p = PILLAR[a.pillar] || PILLARS[0];
  return `<li><a href="/media/${esc(a.slug)}/">
      <span class="art__t">${esc(a.title)}</span>
      <span class="art__d">${esc(a.description || '')}</span>
      <span class="art__m">${opt.noPillar ? '' : `<span class="chip chip--p">${esc(p.name)}</span>`}${a.target ? `<span class="chip">${esc(a.target)}</span>` : ''}</span>
    </a></li>`;
}
function artList(items, opt) { return `<ul class="art">${items.map(a => artItem(a, opt)).join('')}</ul>`; }

/* ページ送り。agent-best と同じ「← 前へ ｜ n / N ｜ 次へ →」。2ページ目以降は {base}{n}/ */
function pager(base, page, pages) {
  if (pages <= 1) return '';
  const href = n => n === 1 ? base : `${base}${n}/`;
  return `<nav class="pager" aria-label="ページ送り">
    ${page > 1 ? `<a href="${href(page - 1)}" rel="prev">← 前へ</a>` : `<span class="off">← 前へ</span>`}
    <span class="now">${page} / ${pages}</span>
    ${page < pages ? `<a href="${href(page + 1)}" rel="next">次へ →</a>` : `<span class="off">次へ →</span>`}
  </nav>`;
}

/* ---------- 読み込み ---------- */
function load() {
  if (!fs.existsSync(SRC)) return [];
  return fs.readdirSync(SRC).filter(f => f.endsWith('.md')).map(f => {
    const raw = fs.readFileSync(path.join(SRC, f), 'utf8');
    const { fm, body } = parseFM(raw);
    if (!fm) { console.log(`⚠ frontmatter がありません: ${f}`); return null; }
    fm.slug = fm.slug || f.replace(/\.md$/, '');
    fm.tags = Array.isArray(fm.tags) ? fm.tags : [];
    fm._body = body;
    return fm;
  }).filter(Boolean);
}

/* ---------- 記事ページ ---------- */
function articleHtml(a, ctx) {
  const p = PILLAR[a.pillar] || PILLARS[0];
  const hub = hubOf(a);
  const hubUrl = `/media/hub/${hub.slug}/`;
  const { html, heads } = mdToHtml(a._body);
  const url = `/media/${a.slug}/`;

  const toc = heads.length >= 3
    ? `<nav class="toc" aria-label="目次"><p class="toc__t">目次</p><ol>`
      + heads.map(h => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join('')
      + `</ol></nav>` : '';

  const src = (a.sources || []).filter(s => s && s.name);
  const srcHtml = src.length
    ? `<section class="sources"><strong>出典</strong><ul>`
      + src.map(s => s.url
          ? `<li><a href="${escAttr(s.url)}" target="_blank" rel="noopener nofollow">${esc(s.name)}</a></li>`
          : `<li>${esc(s.name)}</li>`).join('')
      + `</ul>${a.reviewedAt ? `<p class="reviewed">本記事は ${esc(a.reviewedAt)} 時点の公開情報にもとづいて作成しています。</p>` : ''}</section>` : '';

  /* 本文直後の「次の一歩」ボックス。agent-best の「この職種の転職を考えている方へ」にあたる。
     記事から一覧・相談へ戻る導線を、読者（企業／個人）で出し分ける */
  const box = a.reader === 'person'
    ? `<aside class="nextbox"><p class="nextbox__t">人事の経験を副業で活かしたい方へ</p>
      <p class="nextbox__l">案件の内容も稼働時間も、まず話を聞いてから決めて構いません。エラベルでは、企業が担当者を選ぶ前提で、条件をすり合わせてからご紹介します。</p>
      <ul><li><a href="/partner.html">担当者として登録する →</a></li>
          <li><a href="${hubUrl}">「${esc(hub.name)}」の記事一覧を見る →</a></li>
          <li><a href="/media/fukugyo/">人事副業の記事をすべて見る →</a></li></ul></aside>`
    : `<aside class="nextbox"><p class="nextbox__t">${esc(p.name)}の検討を進めている方へ</p>
      <p class="nextbox__l">同じ「${esc(p.name)}」でも、担当者によって進め方も成果も大きく変わります。エラベルでは、担当者の経歴と実績を見てから選べます。</p>
      <ul><li><a href="/#consult">担当者を選べる採用代行に無料で相談する →</a></li>
          <li><a href="/#fee">費用を見る →</a></li>
          <li><a href="${hubUrl}">「${esc(hub.name)}」の記事一覧を見る →</a></li></ul></aside>`;

  /* この記事のタグ（一覧ページを持っているものだけ） */
  const tags = a.tags.map(t => TAG_BY_LABEL.get(t)).filter(t => t && ctx.liveTags.has(t.slug));
  const tagHtml = tags.length
    ? `<section class="block"><h2 class="block__t">この記事のタグ</h2><ul class="chips">`
      + tags.map(t => `<li><a href="/media/tag/${t.slug}/">${esc(t.label)}</a></li>`).join('') + `</ul></section>` : '';

  const rel = (a.related || []).map(s => ctx.bySlug.get(s)).filter(Boolean);
  const relHtml = rel.length
    ? `<section class="block"><h2 class="block__t">関連記事</h2>${artList(rel)}</section>` : '';

  /* 同じハブの他の記事。先頭から取ると全記事が同じ6本にリンクするので、
     並び順の中で「自分の次の6件」を巡回して取り、内部リンクをハブ全体に散らす（agent-best と同じ） */
  const mates = ctx.byHub.get(hub.slug);
  const relSet = new Set([a.slug, ...rel.map(r => r.slug)]);
  const me = Math.max(0, mates.findIndex(x => x.slug === a.slug));
  const same = [];
  for (let i = 1; i < mates.length && same.length < 6; i++) {
    const x = mates[(me + i) % mates.length];
    if (!relSet.has(x.slug)) same.push(x);
  }
  const sameHtml = same.length
    ? `<section class="block"><h2 class="block__t">「${esc(hub.name)}」の他の記事</h2>
      <ul class="art art--compact">${same.map(x => `<li><a href="/media/${esc(x.slug)}/"><span class="art__t">${esc(x.title)}</span>${x.target ? `<span class="chip">${esc(x.target)}</span>` : ''}</a></li>`).join('')}</ul>
      <p class="more"><a href="${hubUrl}">「${esc(hub.name)}」の記事一覧を見る →</a></p></section>` : '';

  const cr = [{ name: 'ホーム', url: '/' }, { name: 'メディア', url: '/media/' },
              { name: p.name, url: `/media/${p.key}/` }, { name: hub.name, url: hubUrl }];
  const jsonld = [{
    '@context': 'https://schema.org', '@type': 'Article',
    mainEntityOfPage: { '@type': 'WebPage', '@id': SITE + url }, url: SITE + url,
    headline: a.title, description: a.description, inLanguage: 'ja',
    datePublished: a.pubDate, dateModified: a.reviewedAt || a.pubDate,
    author: { '@type': 'Person', name: '松岡 良次', url: 'https://www.agent-best.net/profile/' },
    publisher: { '@type': 'Organization', name: '株式会社エージェントベスト', url: 'https://www.agent-best.net/' },
  }, crumbLd(cr.concat({ name: a.title }), url)];

  return head({ title: `${a.title}｜エラベル`, desc: a.description, url, ogType: 'article', jsonld })
    + `<main class="wrap art-page">
  ${crumbs(cr)}
  <h1>${esc(a.title)}</h1>
  <p class="meta">
    <a class="meta__hub" href="${hubUrl}">${esc(hub.name)}</a>${a.target ? `<span class="chip">${esc(a.target)}</span>` : ''}
    <span class="meta__date">更新日 ${esc(a.reviewedAt || a.pubDate)}</span>
  </p>
  ${toc}
  <div class="body">
${html}
  </div>
  ${srcHtml}
  ${box}
  ${share(url, a.title)}
  ${tagHtml}
  ${relHtml}
  ${sameHtml}
  ${AUTHOR}
  ${ctaBlock(a.reader)}
</main>`
    + foot();
}

/* ---------- 一覧ページ（柱・ハブ・タグ）共通の外枠 ---------- */
function listPage(o) {
  const url = o.page > 1 ? `${o.base}${o.page}/` : o.base;
  const suffix = o.page > 1 ? `（${o.page}／${o.pages}ページ）` : '';
  return head({ title: `${o.title}${suffix}｜エラベル`, desc: o.desc, url, jsonld: crumbLd(o.crumbs, url) })
    + `<main class="wrap hub">
  ${crumbs(o.crumbs)}
  <h1>${esc(o.h1)}</h1>
  <p class="lead">${esc(o.lead)}</p>
  ${o.links || ''}
  ${searchBox()}
  ${o.top || ''}
  <h2 class="sec">${esc(o.listTitle || 'すべての記事')}（${o.total}本）${o.pages > 1 ? `<span class="pageof">${o.page}／${o.pages}ページ</span>` : ''}</h2>
  ${artList(o.items, { noPillar: o.noPillar })}
  ${pager(o.base, o.page, o.pages)}
  ${share(o.base, o.h1, 'このページをシェア')}
  ${ctaBlock(o.reader, o.ctaTitle)}
</main>`
    + foot();
}
/* 1ページ目は {base}index.html、2ページ目以降は {base}{n}/index.html */
function writePaged(o, list) {
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  for (let n = 1; n <= pages; n++) {
    const rel = o.base.replace(/^\/media\//, '') + (n === 1 ? '' : `${n}/`) + 'index.html';
    w(rel, listPage({ ...o, items: list.slice((n - 1) * PER_PAGE, n * PER_PAGE), total: list.length, page: n, pages }));
  }
  return pages;
}

/* ハブの一覧（件数付きのグリッド）。トップと柱ページで使う */
function hubGrid(hubs, counts) {
  return `<ul class="grid">${hubs.filter(h => counts.get(h.slug)).map(h =>
    `<li><a href="/media/hub/${h.slug}/"><span class="grid__n">${esc(h.name)}<span class="count">${counts.get(h.slug)}</span></span><span class="grid__d">${esc(h.note)}</span></a></li>`).join('')}</ul>`;
}
function tagCloud(tags) {
  return `<ul class="chips">${tags.map(t =>
    `<li><a href="/media/tag/${t.slug}/">${esc(t.label)}<span class="count">${t.count}</span></a></li>`).join('')}</ul>`;
}

/* ---------- メディアトップ ---------- */
function topHtml(all, ctx) {
  const title = '採用代行・スカウト代行・人事副業のメディア｜エラベル';
  const desc = `採用代行（RPO）とスカウト代行の実務、人事経験を副業で活かす方法を${all.length.toLocaleString()}本の記事で解説しています。課題・費用・職種・媒体ごとに探せます。`;
  const tagTotal = ctx.tagGroups.reduce((n, g) => n + g.tags.length, 0);
  const latest = all.slice(0, LATEST);
  return head({ title, desc, url: '/media/', jsonld: crumbLd([{ name: 'ホーム', url: '/' }, { name: 'メディア' }], '/media/') })
    + `<main class="wrap hub hub--top">
  ${crumbs([{ name: 'ホーム', url: '/' }, { name: 'メディア' }])}
  <h1>採用と、採用を支える働き方のメディア</h1>
  <p class="lead">採用代行に何をどこまで任せるか。スカウトの返信率をどう上げるか。人事の経験を副業でどう活かすか。
    <strong>${all.length.toLocaleString()}本</strong>の記事で、実務の判断に使える形でまとめています。</p>
  ${searchBox()}
  <nav class="jump" aria-label="カテゴリ">
    <a href="#tag">タグから探す</a>
    ${PILLARS.map(p => `<a href="#${p.key}">${esc(p.name)}から探す</a>`).join('\n    ')}
    <a href="#latest">新着記事</a>
  </nav>

  <h2 class="sec" id="tag">タグから探す</h2>
  <p class="note">採用代行・スカウト代行・人事副業をまたいで、テーマから探せます。「母集団形成」「見積もり」「確定申告」のように、いま知りたいことがはっきりしている場合はこちらが早いです（${tagTotal}タグ）。</p>
  ${ctx.tagGroups.map(g => `<div class="group">
    <h3>${esc(g.name)}<span class="gcount">${g.tags.length}タグ</span></h3>
    <p class="gnote">${esc(g.note)}</p>
    ${tagCloud(g.tags)}
  </div>`).join('\n  ')}

  ${PILLARS.map(p => `<h2 class="sec" id="${p.key}">${esc(p.name)}から探す</h2>
  <p class="note">${esc(p.lead)}</p>
  ${hubGrid(HUBS.filter(h => h.pillar === p.key), ctx.hubCount)}
  <p class="more"><a href="/media/${p.key}/">${esc(p.name)}の記事をすべて見る（${ctx.byPillar[p.key].length}本）→</a></p>`).join('\n\n  ')}

  <h2 class="sec" id="latest">新着記事</h2>
  ${artList(latest)}

  ${share('/media/', '採用と、採用を支える働き方のメディア｜エラベル', 'このページをシェア')}
  ${ctaBlock('company', '採用の進め方を、担当者と整理しませんか')}
</main>`
    + foot();
}

/* ---------- 検索ページ ----------
   インデックス（/media/search.json）はこのページからだけ読む。トップやハブに埋め込むとHTMLが重くなるため。
   検索結果は毎回変わるので noindex。 */
function searchHtml() {
  const cr = [{ name: 'ホーム', url: '/' }, { name: 'メディア', url: '/media/' }, { name: '検索' }];
  return head({ title: '記事を検索｜エラベル', desc: 'エラベルのメディア内を、キーワードで検索できます。', url: '/media/search/', noindex: true })
    + `<main class="wrap hub">
  ${crumbs(cr)}
  <h1>記事を検索</h1>
  <form class="msearch" role="search" id="f" action="/media/search/" method="get">
    <label class="sr-only" for="q">検索語</label>
    <input id="q" type="search" name="q" placeholder="キーワード（例：スカウト 返信率、費用相場、確定申告）" autocomplete="off">
    <button type="submit">検索</button>
  </form>
  <p class="status" id="status" role="status" aria-live="polite">検索語を入力してください。</p>
  <ul class="art" id="results"></ul>
  <p class="note" id="more" hidden></p>
  <p class="note fallback">うまく見つからないときは、<a href="/media/#tag">タグの一覧</a>や、${PILLARS.map(p => `<a href="/media/${p.key}/">${esc(p.name)}</a>`).join('・')}の一覧からもたどれます。</p>
</main>
<script>
(function(){
  var input=document.getElementById('q'),statusEl=document.getElementById('status'),
      list=document.getElementById('results'),moreEl=document.getElementById('more'),LIMIT=60,index=null,loading=null;
  function loadIndex(){
    if(index)return Promise.resolve(index);
    if(!loading){
      /* 容量を削るため [slug, title, desc, 柱番号, ハブ番号, target, タグ番号の配列] の配列で来る */
      loading=fetch('/media/search.json').then(function(r){if(!r.ok)throw new Error(r.status);return r.json();})
        .then(function(raw){index=raw.i.map(function(a){return{s:a[0],t:a[1],d:a[2],p:raw.p[a[3]],h:raw.h[a[4]],x:a[5]||'',
          g:(a[6]||[]).map(function(i){return raw.g[i];}).join(' ')};});return index;});
    }
    return loading;
  }
  function norm(s){return(s||'').toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g,function(c){return String.fromCharCode(c.charCodeAt(0)-0xfee0);})
    .replace(/[ァ-ヶ]/g,function(c){return String.fromCharCode(c.charCodeAt(0)-0x60);})
    .replace(/[・･\\s　‐-‒–—―ー_.,]/g,'');}
  function score(it,terms){
    var t=norm(it.t),x=norm(it.x),h=norm(it.h+it.p),g=norm(it.g),d=norm(it.d)+it.s,total=0;
    for(var i=0;i<terms.length;i++){var q=terms[i];
      if(t.indexOf(q)>=0)total+=30;else if(x.indexOf(q)>=0)total+=24;else if(h.indexOf(q)>=0)total+=20;
      else if(g.indexOf(q)>=0)total+=14;else if(d.indexOf(q)>=0)total+=8;else return -1;}
    return total;
  }
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function render(q){
    var terms=q.split(/[\\s　,、]+/).map(norm).filter(Boolean);
    if(!terms.length){statusEl.textContent='検索語を入力してください。';list.innerHTML='';moreEl.hidden=true;return;}
    var hits=[];index.forEach(function(it){var s=score(it,terms);if(s>0)hits.push([s,it]);});
    hits.sort(function(a,b){return b[0]-a[0]||a[1].t.localeCompare(b[1].t,'ja');});
    if(!hits.length){statusEl.textContent='「'+q+'」に一致する記事は見つかりませんでした。';list.innerHTML='';moreEl.hidden=true;return;}
    statusEl.textContent='「'+q+'」の検索結果：'+hits.length+'件';
    list.innerHTML=hits.slice(0,LIMIT).map(function(h){var it=h[1];return '<li><a href="/media/'+it.s+'/">'
      +'<span class="art__t">'+esc(it.t)+'</span><span class="art__d">'+esc(it.d)+'</span>'
      +'<span class="art__m"><span class="chip chip--p">'+esc(it.p)+'</span><span class="chip">'+esc(it.h)+'</span></span></a></li>';}).join('');
    if(hits.length>LIMIT){moreEl.hidden=false;moreEl.textContent='上位'+LIMIT+'件を表示しています。絞り込むには語を足してください（例：「スカウト 新卒」）。';}
    else moreEl.hidden=true;
  }
  var timer;
  function run(q){statusEl.textContent='検索中…';loadIndex().then(function(){render(q);})
    .catch(function(){statusEl.textContent='検索データを読み込めませんでした。時間をおいて再度お試しください。';});}
  input.addEventListener('input',function(){clearTimeout(timer);var q=input.value.trim();if(!q){list.innerHTML='';statusEl.textContent='検索語を入力してください。';moreEl.hidden=true;return;}timer=setTimeout(function(){run(q);},150);});
  document.getElementById('f').addEventListener('submit',function(e){e.preventDefault();run(input.value.trim());});
  var q0=new URLSearchParams(location.search).get('q');
  if(q0){input.value=q0;run(q0.trim());}
  input.focus();
})();
</script>`
    + foot();
}

/* 検索インデックス。キー名とラベルの繰り返しを削ってサイズを抑える。
   { p: [柱名], h: [ハブ名], g: [タグ名], i: [[slug, title, desc, 柱番号, ハブ番号, target, [タグ番号]]] } */
function searchJson(all, ctx) {
  const DESC_MAX = 90;
  const pl = PILLARS.map(p => p.name), hl = HUBS.map(h => h.name), gl = [];
  const gid = v => { const i = gl.indexOf(v); return i >= 0 ? i : gl.push(v) - 1; };
  const items = all.map(a => {
    const d = a.description || '';
    return [a.slug, a.title, d.length > DESC_MAX ? d.slice(0, DESC_MAX) + '…' : d,
      PILLARS.findIndex(p => p.key === a.pillar), HUBS.indexOf(hubOf(a)), a.target || '',
      a.tags.filter(t => { const x = TAG_BY_LABEL.get(t); return x && ctx.liveTags.has(x.slug); }).map(gid)];
  });
  return JSON.stringify({ p: pl, h: hl, g: gl, i: items });
}

/* 旧URL（ページ送りを /page-N.html から /N/ に変えた分）の転送ページ */
function redirectHtml(to) {
  return `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>移動しました｜エラベル</title>
<meta name="robots" content="noindex,follow"><link rel="canonical" href="${SITE}${to}">
<meta http-equiv="refresh" content="0; url=${to}"></head>
<body><p><a href="${to}">新しいページへ移動しました</a></p></body></html>`;
}

/* ---------- CSS ---------- */
const CSS = `:root{
  --paper:#F5F6F8;--surface:#FFFFFF;--surface-2:#ECEEF2;
  --ink:#141A24;--ink-soft:#4C566A;--ink-faint:#858F9E;
  --line:#E2E6EC;--line-strong:#C9D0DA;
  --accent:#E4572E;--accent-strong:#C6431D;--accent-ink:#A73716;--accent-tint:#FCE9E1;
  --navy:#0B1A32;--on-navy:#EAF0F8;--on-navy-soft:#9CB0CB;--on-navy-line:#20324D;
  --sans:"Hiragino Kaku Gothic ProN","Hiragino Sans","Yu Gothic",YuGothic,"Noto Sans JP","Segoe UI",sans-serif;
  --mono:"SFMono-Regular","SF Mono","Cascadia Code",Consolas,"Roboto Mono",monospace;
  --maxw:1060px;--hubw:900px;--readw:760px;--radius:12px;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--sans);line-height:1.9;
  -webkit-font-smoothing:antialiased;overflow-x:hidden}
h1,h2,h3,h4,p,ul,ol{margin:0}
a{color:inherit;text-decoration:none}
.wrap{max-width:var(--maxw);margin:0 auto;padding:0 20px}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.btn{display:inline-flex;align-items:center;gap:9px;font-weight:800;font-size:.95rem;padding:14px 26px;border-radius:11px;
  cursor:pointer;border:1px solid transparent;transition:transform .15s ease,background .2s ease;white-space:nowrap}
.btn-primary{background:var(--accent);color:#fff;box-shadow:0 10px 26px -10px var(--accent)}
.btn-primary:hover{background:var(--accent-strong);transform:translateY(-1px)}

header.nav{position:sticky;top:0;z-index:50;background:rgba(245,246,248,.9);
  backdrop-filter:saturate(180%) blur(12px);border-bottom:1px solid var(--line)}
.nav-in{display:flex;align-items:center;justify-content:space-between;height:64px;gap:16px}
.brand{display:flex;align-items:center;gap:11px;font-weight:800}
.brand .mk{width:32px;height:32px;border-radius:9px;flex:none;background:var(--navy);display:grid;place-items:center}
.brand .mk svg{display:block}
.brand .nm{font-size:1.05rem;line-height:1.2;letter-spacing:.02em}
.brand .nm small{display:block;font-family:var(--mono);font-size:.56rem;letter-spacing:.14em;color:var(--ink-faint);font-weight:600}
.nav-links{display:flex;gap:18px;font-size:.88rem;font-weight:700;color:var(--ink-soft);margin-left:auto;margin-right:6px}
.nav-links a:hover{color:var(--accent-ink)}
.cta-mini{padding:10px 18px;font-size:.86rem}
@media (max-width:900px){.nav-links{display:none}}
@media (max-width:560px){.brand .nm small{display:none}}

/* パンくず */
.crumb{display:flex;flex-wrap:wrap;align-items:baseline;gap:.45em;font-size:.82rem;color:var(--ink-faint);margin-bottom:10px}
.crumb a:hover{color:var(--accent-ink);text-decoration:underline}
.crumb i{font-style:normal;color:var(--line-strong)}
.crumb span{color:var(--ink-soft)}

/* ===== 一覧（トップ・柱・ハブ・タグ・検索） ===== */
.hub{max-width:var(--hubw);padding-top:30px;padding-bottom:70px}
.hub h1{font-size:1.7rem;line-height:1.5;margin:.3em 0 .4em}
.hub .lead{color:var(--ink-soft)}
.hub .lead strong{color:var(--ink)}
.sec{font-size:1.25rem;line-height:1.5;margin:2.4em 0 .7em;padding:.4em .8em;border-left:5px solid var(--navy);
  background:var(--surface-2);border-radius:4px;scroll-margin-top:80px;display:flex;justify-content:space-between;align-items:baseline;gap:.6em}
.pageof{font-size:.78rem;color:var(--ink-faint);font-weight:400}
.note{color:var(--ink-faint);font-size:.92rem;margin:-.1em 0 .9em}
.note a,.lead a{color:var(--accent-ink);text-decoration:underline;text-underline-offset:3px}
.group{margin-top:1.3em}
.group h3{font-size:1rem;display:flex;align-items:baseline;gap:.6em;margin-bottom:.2em}
.group h3::before{content:'';width:3px;height:1em;background:var(--accent);border-radius:2px;align-self:center}
.gcount{font-size:.75rem;color:var(--ink-faint);font-weight:400}
.gnote{font-size:.85rem;color:var(--ink-faint);margin-bottom:.6em}
.count{font-size:.76rem;color:var(--ink-faint);font-weight:400;margin-left:.45em}

.msearch{display:flex;gap:8px;margin:1.3em 0 0}
.msearch input{flex:1;min-width:0;padding:.7em 1em;font-size:.95rem;font-family:inherit;border:1px solid var(--line-strong);
  border-radius:9px;background:var(--surface);color:var(--ink)}
.msearch input:focus{outline:2px solid var(--navy);outline-offset:-1px;border-color:var(--navy)}
.msearch button{padding:.7em 1.6em;font-size:.95rem;font-weight:800;font-family:inherit;cursor:pointer;border:none;border-radius:9px;
  background:var(--navy);color:#fff}
.msearch button:hover{background:#1B2E4F}
@media (max-width:480px){.msearch input{font-size:.88rem}.msearch button{padding:.7em 1.1em}}
.status{margin:1.3em 0 .2em;font-size:.9rem;color:var(--ink-soft);font-weight:700}
.fallback{margin-top:2.2em}

.jump{display:flex;flex-wrap:wrap;gap:8px;margin:1.3em 0 0}
.jump a{font-size:.85rem;padding:.35em 1em;border:1px solid var(--line-strong);border-radius:999px;background:var(--surface);color:var(--ink-soft)}
.jump a:hover{border-color:var(--navy);color:var(--ink)}

.chips{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:7px}
.chips a{display:inline-flex;align-items:baseline;padding:.36em .95em;border:1px solid var(--line-strong);border-radius:999px;
  background:var(--surface);font-size:.87rem;font-weight:700}
.chips a:hover{background:var(--navy);border-color:var(--navy);color:#fff}
.chips a:hover .count{color:#B9C4D4}

.grid{list-style:none;padding:0;margin:0;display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(270px,1fr))}
.grid a{display:flex;flex-direction:column;gap:.2em;height:100%;padding:.75em 1em;border:1px solid var(--line);border-radius:9px;background:var(--surface)}
.grid a:hover{border-color:var(--navy)}
.grid__n{display:flex;justify-content:space-between;align-items:baseline;font-weight:800;font-size:.95rem}
.grid__d{font-size:.8rem;color:var(--ink-faint);line-height:1.7}
@media (max-width:600px){.grid{grid-template-columns:1fr}}
.more{margin:1em 0 0;font-size:.92rem}
.more a{font-weight:800;color:var(--ink)}
.more a:hover{text-decoration:underline;color:var(--accent-ink)}
.hub-links{display:flex;flex-wrap:wrap;gap:.4em 1.4em;margin:1em 0 0;font-size:.92rem}
.hub-links a{font-weight:800;color:var(--accent-ink)}
.hub-links a:hover{text-decoration:underline}

/* 記事リスト（タイトル＋説明＋チップ） */
.art{list-style:none;padding:0;margin:.3em 0 0}
.art li{border-bottom:1px solid var(--line)}
.art a{display:block;padding:1em .3em}
.art a:hover{background:var(--surface)}
.art__t{display:block;font-weight:800;line-height:1.6}
.art a:hover .art__t{text-decoration:underline}
.art__d{display:-webkit-box;margin-top:.25em;font-size:.87rem;color:var(--ink-soft);line-height:1.75;
  -webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.art__m{display:flex;flex-wrap:wrap;gap:.45em;margin-top:.45em}
.art__m:empty{display:none}
.chip{display:inline-block;font-size:.73rem;border-radius:4px;padding:1px 8px;background:var(--surface-2);color:var(--ink-soft);font-weight:600}
.chip--p{background:var(--navy);color:#fff}
.art--compact a{display:flex;justify-content:space-between;align-items:baseline;gap:.8em;padding:.75em .3em}
.art--compact .art__t{font-size:.95rem}
.art--compact .chip{flex-shrink:0}
@media (max-width:600px){.art__d{-webkit-line-clamp:1}.art--compact a{flex-direction:column;gap:.2em}}

.pager{display:flex;align-items:center;justify-content:center;gap:1.2em;margin:2.2em 0 0;font-size:.9rem}
.pager a{font-weight:800;padding:.5em 1.2em;border:1px solid var(--line-strong);border-radius:8px;background:var(--surface)}
.pager a:hover{border-color:var(--navy)}
.pager .off{color:var(--line-strong);padding:.5em 1.2em;border:1px solid var(--line);border-radius:8px}
.pager .now{color:var(--ink-faint);font-family:var(--mono)}

/* シェア */
.share{margin:2.4em 0 0;display:flex;flex-wrap:wrap;align-items:center;gap:.6em 1em}
.share__t{font-size:.82rem;font-weight:800;color:var(--ink-faint)}
.share ul{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:6px}
.share a{display:inline-block;font-size:.82rem;font-weight:700;padding:.3em .95em;border:1px solid var(--line-strong);border-radius:999px;background:var(--surface)}
.share a:hover{border-color:var(--navy)}

/* 締めのCTA */
.cta{margin-top:2.6rem;padding:2rem 1.5rem;border-radius:var(--radius);background:var(--navy);color:#fff;text-align:center}
.cta h2{font-size:1.25rem;line-height:1.5;margin:0 0 .6em;color:#fff;background:none;border:0;padding:0}
.cta p{color:var(--on-navy-soft);font-size:.93rem}
.cta__actions{display:flex;flex-wrap:wrap;gap:.8rem;justify-content:center;margin-top:1.1rem}
.cta__btn{display:inline-block;padding:.8rem 2.2rem;background:var(--accent);color:#fff;border-radius:9px;font-weight:800}
.cta__btn:hover{background:var(--accent-strong)}
.cta__btn--sub{background:transparent;border:1px solid var(--on-navy-line);color:var(--on-navy)}
.cta__btn--sub:hover{background:#13274A}
.cta__other{margin:1.1rem 0 0;padding-top:1rem;border-top:1px solid var(--on-navy-line);font-size:.85rem}
.cta__other a{color:#fff;text-decoration:underline;text-underline-offset:.3em}
@media (max-width:480px){.cta__actions{flex-direction:column;align-items:stretch}}

/* ===== 記事 ===== */
.art-page{max-width:var(--readw);padding-top:30px;padding-bottom:70px;font-size:16px}
.art-page h1{font-size:1.65rem;line-height:1.5;margin:8px 0}
.meta{display:flex;flex-wrap:wrap;align-items:center;gap:.5em;font-size:.85rem;color:var(--ink-faint);margin-bottom:26px}
.meta__hub{font-weight:800;color:var(--ink);background:var(--surface-2);border-radius:4px;padding:1px 9px}
.meta__hub:hover{background:var(--line)}
.meta__date{font-family:var(--mono);font-size:.78rem}
@media (max-width:600px){.art-page{font-size:15.5px}.art-page h1{font-size:1.35rem}}

.toc{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:1.1rem 1.4rem 1.2rem;margin-bottom:2.4em}
.toc__t{font-size:.82rem;font-weight:800;letter-spacing:.08em;margin-bottom:.5em}
.toc ol{margin:0;padding-left:1.4em;font-size:.92rem}
.toc li{margin:.3em 0}
.toc a{color:var(--ink-soft)}
.toc a:hover{color:var(--ink);text-decoration:underline}

.body h2{font-size:1.3rem;line-height:1.55;margin:2.5em 0 1em;padding:.4em .8em;border-left:5px solid var(--navy);
  background:var(--surface-2);border-radius:4px;scroll-margin-top:88px}
.body h3{font-size:1.1rem;margin:2em 0 .8em;scroll-margin-top:88px}
.body h4{font-size:1rem;margin:1.5em 0 .6em;color:var(--ink-soft)}
.body p{margin:1.1em 0}
.body ul,.body ol{margin:1.1em 0;padding-left:1.5em}
.body li{margin:.4em 0}
.body strong{font-weight:800}
.body code{font-family:var(--mono);font-size:.88em;background:var(--surface-2);padding:2px 6px;border-radius:5px}
.body a{color:var(--accent-ink);text-decoration:underline;text-underline-offset:3px}
.body hr{border:0;border-top:1px solid var(--line);margin:2.5em 0}
.body blockquote{margin:1.2em 0;padding:14px 20px;border-left:3px solid var(--accent);
  background:var(--surface);color:var(--ink-soft);border-radius:0 10px 10px 0}
.body blockquote p{margin:.4em 0}
.tw{overflow-x:auto;margin:1.5em 0;border:1px solid var(--line);border-radius:10px;background:var(--surface)}
.body table{border-collapse:collapse;width:100%;font-size:.92rem}
.body th,.body td{padding:9px 13px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
.body th{background:var(--surface-2);font-weight:800;white-space:nowrap}
.body tbody tr:last-child td{border-bottom:0}

/* 本文中の中間CTA（markdown本文に <aside class="cta-inline"> で記述） */
.cta-inline{margin:2.4em 0;padding:1.1rem 1.3rem;border:1px solid var(--line);border-left:4px solid var(--navy);border-radius:8px;
  background:var(--surface);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem}
.cta-inline p{margin:0;font-weight:800;font-size:.93rem}
.cta-inline a{background:var(--accent);color:#fff;font-weight:800;font-size:.88rem;padding:.6rem 1.5rem;border-radius:7px;white-space:nowrap;text-decoration:none}
.cta-inline a:hover{background:var(--accent-strong)}
@media (max-width:600px){.cta-inline{flex-direction:column;align-items:stretch}.cta-inline a{text-align:center}}

.sources{margin-top:2.6rem;padding:1.1rem 1.4rem;border:1px solid var(--line);border-radius:10px;background:var(--surface);font-size:.88rem;color:var(--ink-soft)}
.sources ul{margin:.6em 0 0;padding-left:1.2em}
.sources li{margin-bottom:.3em}
.sources a{color:var(--accent-ink);text-decoration:underline;text-underline-offset:3px}
.reviewed{margin:.9em 0 0;color:var(--ink-faint);font-size:.84rem}

/* 本文直後の「次の一歩」ボックス */
.nextbox{margin:2.2rem 0 .4rem;padding:20px 22px;border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:8px;background:var(--surface)}
.nextbox__t{font-weight:800;font-size:1.05rem;margin-bottom:6px}
.nextbox__l{font-size:.92rem;color:var(--ink-soft);margin-bottom:10px}
.nextbox ul{list-style:none;margin:0;padding:0;display:grid;gap:6px}
.nextbox a{font-weight:800;font-size:.95rem;color:var(--accent-ink)}
.nextbox a:hover{text-decoration:underline}

.block{margin-top:2.6rem}
.block__t{font-size:1.05rem;margin:0 0 .5em;padding:.35em .8em;border-left:5px solid var(--navy);background:var(--surface-2);border-radius:4px}
.author{margin-top:2.6rem;padding-top:22px;border-top:1px solid var(--line);font-size:.88rem;color:var(--ink-soft)}
.author__t{font-size:.74rem;font-weight:800;letter-spacing:.1em;color:var(--ink-faint)}
.author__n{font-size:1rem;font-weight:800;color:var(--ink);margin:4px 0 6px}

footer{background:var(--navy);color:var(--on-navy-soft);border-top:1px solid var(--on-navy-line);padding:46px 0 40px;font-size:.88rem}
.foot-in{display:flex;flex-wrap:wrap;justify-content:space-between;gap:26px}
.foot-brand{color:#fff;font-weight:800;font-size:1.05rem}
.foot-links{display:flex;flex-wrap:wrap;gap:8px 22px}
.foot-links a:hover{color:#fff}
.foot-copy{margin-top:26px;padding-top:18px;border-top:1px solid var(--on-navy-line);font-size:.8rem;color:#6E8199}
`;

/* ---------- 出力 ---------- */
function w(rel, html) {
  const p = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, html, 'utf8');
}

function main() {
  const check = process.argv.includes('--check');
  const all = load();
  /* 新しい順（同日なら slug 順）。公開日が無いものは末尾 */
  all.sort((a, b) => String(b.pubDate || '').localeCompare(String(a.pubDate || '')) || a.slug.localeCompare(b.slug));

  const RESERVED = new Set(['hub', 'tag', 'search', 'assets', '_articles', ...PILLARS.map(p => p.key)]);
  const bad = [];
  all.forEach(a => {
    ['title', 'description', 'pillar', 'series', 'reader', 'pubDate'].forEach(k => { if (!a[k]) bad.push(`${a.slug}: ${k} がありません`); });
    if (a.pillar && !PILLAR[a.pillar]) bad.push(`${a.slug}: 知らない pillar「${a.pillar}」`);
    if (a.pillar && a.series && !hubOf(a)) bad.push(`${a.slug}: HUBS に無い series「${a.pillar} / ${a.series}」（build-media.js の HUBS に足す）`);
    if (a.reader && !CTA[a.reader]) bad.push(`${a.slug}: 知らない reader「${a.reader}」`);
    if (RESERVED.has(a.slug) || /^\d+$/.test(a.slug)) bad.push(`${a.slug}: 一覧ページのURLと重なる slug`);
    (a.related || []).forEach(s => { if (!all.some(x => x.slug === s)) bad.push(`${a.slug}: related のリンク先が無い（${s}）`); });
  });
  const dupTag = TAGS.map(t => t.slug).filter((s, i, arr) => arr.indexOf(s) !== i);
  if (dupTag.length) bad.push(`TAG_GROUPS の slug が重複: ${dupTag.join(', ')}`);

  const byPillar = {};
  PILLARS.forEach(p => byPillar[p.key] = all.filter(a => a.pillar === p.key));

  console.log(`記事 ${all.length}件`);
  PILLARS.forEach(p => console.log(`  ${p.name}: ${byPillar[p.key].length}件`));
  if (bad.length) { console.log('⚠ 問題:'); bad.slice(0, 40).forEach(x => console.log('   - ' + x)); }
  if (check) return;
  if (bad.length) { console.log('問題があるので書き出しません。'); process.exit(1); }

  /* ハブ：テーマ（target）順→タイトル順。並びが毎回のビルドで揺れないようにする */
  const byHub = new Map(HUBS.map(h => [h.slug, []]));
  all.forEach(a => byHub.get(hubOf(a).slug).push(a));
  byHub.forEach(list => list.sort((a, b) =>
    String(a.target || '').localeCompare(String(b.target || ''), 'ja') || a.title.localeCompare(b.title, 'ja')));
  const hubCount = new Map([...byHub].map(([k, v]) => [k, v.length]));

  /* タグ：TAG_MIN 本以上あるものだけページを作る */
  const byTag = new Map(TAGS.map(t => [t.slug, []]));
  all.forEach(a => a.tags.forEach(l => { const t = TAG_BY_LABEL.get(l); if (t) byTag.get(t.slug).push(a); }));
  const liveTags = new Set(TAGS.filter(t => byTag.get(t.slug).length >= TAG_MIN).map(t => t.slug));
  const tagGroups = TAG_GROUPS.map(g => ({ ...g,
    tags: g.tags.map(([slug, label]) => ({ slug, label, count: byTag.get(slug).length })).filter(t => liveTags.has(t.slug)) }))
    .filter(g => g.tags.length);

  const ctx = { bySlug: new Map(all.map(a => [a.slug, a])), byHub, hubCount, byPillar, liveTags, tagGroups };

  /* 古い出力を消す（記事を削ったときに残骸が残らないように）。_articles と assets は消さない */
  if (fs.existsSync(OUT)) {
    fs.readdirSync(OUT).forEach(f => {
      if (f === '_articles' || f === 'assets') return;
      fs.rmSync(path.join(OUT, f), { recursive: true, force: true });
    });
  }
  w('assets/media.css', CSS);
  fs.writeFileSync(path.join(DIR, '.nojekyll'), '', 'utf8');

  all.forEach(a => w(`${a.slug}/index.html`, articleHtml(a, ctx)));

  /* トップ・検索 */
  w('index.html', topHtml(all, ctx));
  w('search/index.html', searchHtml());
  w('search.json', searchJson(all, ctx));

  const urls = ['/', '/partner.html', '/privacy.html', '/media/'];

  /* 柱。ハブの一覧＋全記事 */
  PILLARS.forEach(p => {
    const list = byPillar[p.key];
    const pages = writePaged({
      base: `/media/${p.key}/`, title: `${p.name}の記事一覧`, desc: p.lead, h1: p.name, lead: p.lead, noPillar: true,
      crumbs: [{ name: 'ホーム', url: '/' }, { name: 'メディア', url: '/media/' }, { name: p.name }],
      top: `<h2 class="sec">テーマから探す</h2>${hubGrid(HUBS.filter(h => h.pillar === p.key), hubCount)}`,
      reader: p.key === 'fukugyo' ? 'person' : 'company',
    }, list);
    urls.push(`/media/${p.key}/`);
    /* 旧URL /media/{柱}/page-N.html */
    for (let n = 2; n <= Math.ceil(list.length / 24); n++)
      w(`${p.key}/page-${n}.html`, redirectHtml(`/media/${p.key}/${Math.min(n, pages) > 1 ? Math.min(n, pages) + '/' : ''}`));
  });

  /* ハブ */
  HUBS.forEach(h => {
    const list = byHub.get(h.slug); if (!list.length) return;
    const p = PILLAR[h.pillar];
    writePaged({
      base: `/media/hub/${h.slug}/`, title: `${h.name}｜${p.name}`, h1: `${p.name}｜${h.name}`,
      desc: `${p.name}の「${h.name}」に関する記事${list.length}本の一覧です。${h.note}`,
      lead: `${h.note} ${p.name}の「${h.name}」に関する記事${list.length}本の一覧です。`, noPillar: true,
      crumbs: [{ name: 'ホーム', url: '/' }, { name: 'メディア', url: '/media/' }, { name: p.name, url: `/media/${p.key}/` }, { name: h.name }],
      links: h.pillar === 'fukugyo'
        ? `<p class="hub-links"><a href="/partner.html">担当者として登録する →</a><a href="/media/fukugyo/">人事副業の記事をすべて見る →</a></p>`
        : `<p class="hub-links"><a href="/#consult">担当者を選べる採用代行に相談する →</a><a href="/#fee">費用を見る →</a></p>`,
      reader: h.pillar === 'fukugyo' ? 'person' : 'company', ctaTitle: h.pillar === 'fukugyo' ? null : `${p.name}の進め方を相談する`,
    }, list);
    urls.push(`/media/hub/${h.slug}/`);
  });

  /* タグ（新しい順） */
  tagGroups.forEach(g => g.tags.forEach(t => {
    const list = byTag.get(t.slug);
    const fuku = list.filter(a => a.reader === 'person').length > list.length / 2;
    writePaged({
      base: `/media/tag/${t.slug}/`, title: `「${t.label}」の記事一覧`, h1: `「${t.label}」の記事`,
      desc: `「${t.label}」に関する記事${list.length}本の一覧です。採用代行・スカウト代行・人事副業をまたいでまとめています。`,
      lead: `「${t.label}」に関する記事${list.length}本を、採用代行・スカウト代行・人事副業をまたいでまとめています（${g.name}）。`,
      crumbs: [{ name: 'ホーム', url: '/' }, { name: 'メディア', url: '/media/' }, { name: 'タグ', url: '/media/#tag' }, { name: t.label }],
      reader: fuku ? 'person' : 'company',
    }, list);
    urls.push(`/media/tag/${t.slug}/`);
  }));

  /* 旧URL /media/page-N.html → トップ（トップのページ送りは無くし、新着＋ハブ・タグでたどる形にした） */
  for (let n = 2; n <= Math.ceil(all.length / 24); n++) w(`page-${n}.html`, redirectHtml('/media/'));

  /* sitemap（本体3ページ＋メディア。ページ送りの2ページ目以降と検索は入れない） */
  all.forEach(a => urls.push(`/media/${a.slug}/`));
  fs.writeFileSync(path.join(DIR, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
    + urls.map(u => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')
    + `\n</urlset>\n`, 'utf8');
  fs.writeFileSync(path.join(DIR, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`, 'utf8');

  console.log(`media/ に ${all.length}記事 ＋ 柱${PILLARS.length} ＋ ハブ${HUBS.filter(h => hubCount.get(h.slug)).length} ＋ タグ${liveTags.size} ＋ トップ・検索を書き出しました`);
  console.log(`sitemap.xml: ${urls.length}URL`);
}

main();
