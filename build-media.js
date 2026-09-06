/* eraberusaiyodaiko.com のオウンドメディアを作る。
 *
 *   node build-media.js            … media/_articles/*.md → media/ 以下のHTML
 *   node build-media.js --check    … 書かずに件数と問題だけ出す
 *
 * 記事の原稿（.md）は別リポジトリ eraberu-media で書き、py publish.py がここへコピーする。
 * **media/ 以下の .html を手で編集しないこと。** 次のビルドで消える。
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
const PER_PAGE = 24;
/* 計測。既存12サイトと同じプロパティに相乗りし、サイト別はホスト名で分けて見る（[[ga4-operations]]） */
const GA_ID = 'G-1XXMP8Y1B4';

/* 柱（記事の大分類）。URL・ハブページ・パンくずの元になる。
   ⚠ ここのキーは記事の frontmatter の pillar と一致させること。 */
const PILLARS = [
  { key: 'rpo', name: '採用代行', lead: '採用代行（RPO）に何をどこまで任せられるのか。費用の見方、契約の勘所、媒体・職種ごとの進め方をまとめています。' },
  { key: 'scout', name: 'スカウト代行', lead: 'スカウトの返信率は、送信数を増やす前に決まります。媒体ごとの設計、文面の型、外注する範囲の切り分け方。' },
  { key: 'fukugyo', name: '人事副業', lead: '人事・採用の経験を副業で活かすための実務。単価の決め方、案件の取り方、契約と税務、踏み込みすぎない線引き。' },
];
const PILLAR = Object.fromEntries(PILLARS.map(p => [p.key, p]));

/* 読者ごとのCTA。company＝採用したい企業、person＝副業したい個人。
   ⚠ 記事の読者と違うCTAを出すと問い合わせが噛み合わなくなる。frontmatter の reader で必ず出し分ける。 */
const CTA = {
  company: { href: '/#consult', label: '無料で相談する',
             lead: '担当者を選べる採用代行「エラベル」', sub: '基準を満たした担当者だけをご紹介します。相談は無料、費用は採用が決まったときのみ。' },
  person:  { href: '/partner.html', label: '担当者として登録する',
             lead: '人事の経験を、副業で活かす', sub: '稼働時間も単価もご自身で決められます。エラベルは企業とあなたをつなぐ窓口です。' },
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
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(o.title)}</title>
<meta name="description" content="${escAttr(o.desc)}">
<meta name="robots" content="index,follow">
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
${o.jsonld ? `<script type="application/ld+json">${JSON.stringify(o.jsonld)}</script>` : ''}
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

function crumbs(items) {
  return `<nav class="crumb" aria-label="パンくず"><div class="wrap">`
    + items.map((x, n) => x.url
        ? `<a href="${escAttr(x.url)}">${esc(x.name)}</a>`
        : `<span>${esc(x.name)}</span>`).join('<i>›</i>')
    + `</div></nav>`;
}

function ctaBlock(reader) {
  const c = CTA[reader] || CTA.company;
  return `<aside class="cta-end">
  <p class="cta-end__lead">${esc(c.lead)}</p>
  <p class="cta-end__sub">${esc(c.sub)}</p>
  <a class="btn btn-primary" href="${escAttr(c.href)}">${esc(c.label)}</a>
</aside>`;
}

const AUTHOR = `<aside class="author">
  <p class="author__t">監修</p>
  <p class="author__n">松岡 良次</p>
  <p class="author__b">株式会社エージェントベスト代表。人材紹介・採用支援の実務に携わり、企業の採用体制づくりと、
  人事経験者が副業で力を発揮できる場づくりに取り組んでいます。（有料職業紹介事業 厚生労働大臣許可 13-ユ-316964）</p>
</aside>`;

/* ---------- 読み込み ---------- */
function load() {
  if (!fs.existsSync(SRC)) return [];
  return fs.readdirSync(SRC).filter(f => f.endsWith('.md')).map(f => {
    const raw = fs.readFileSync(path.join(SRC, f), 'utf8');
    const { fm, body } = parseFM(raw);
    if (!fm) { console.log(`⚠ frontmatter がありません: ${f}`); return null; }
    fm.slug = fm.slug || f.replace(/\.md$/, '');
    fm._body = body;
    return fm;
  }).filter(Boolean);
}

/* ---------- 記事ページ ---------- */
function articleHtml(a, all) {
  const p = PILLAR[a.pillar] || PILLARS[0];
  const { html, heads } = mdToHtml(a._body);
  const url = `/media/${a.slug}/`;

  const toc = heads.length >= 3
    ? `<nav class="toc"><p class="toc__t">この記事の内容</p><ol>`
      + heads.map(h => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join('')
      + `</ol></nav>` : '';

  const rel = (a.related || []).map(s => all.find(x => x.slug === s)).filter(Boolean);
  const relHtml = rel.length
    ? `<section class="related"><h2>あわせて読む</h2><ul>`
      + rel.map(r => `<li><a href="/media/${esc(r.slug)}/">${esc(r.title)}</a></li>`).join('')
      + `</ul></section>` : '';

  const src = (a.sources || []).filter(s => s && s.name);
  const srcHtml = src.length
    ? `<section class="sources"><h2>出典</h2><ul>`
      + src.map(s => s.url
          ? `<li><a href="${escAttr(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a></li>`
          : `<li>${esc(s.name)}</li>`).join('')
      + `</ul></section>` : '';

  const jsonld = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: a.title, description: a.description,
    datePublished: a.pubDate, dateModified: a.reviewedAt || a.pubDate,
    author: { '@type': 'Organization', name: '株式会社エージェントベスト' },
    publisher: { '@type': 'Organization', name: 'エラベル' },
    mainEntityOfPage: SITE + url,
  };

  return head({ title: `${a.title}｜エラベル`, desc: a.description, url, ogType: 'article', jsonld })
    + crumbs([{ name: 'ホーム', url: '/' }, { name: 'メディア', url: '/media/' },
              { name: p.name, url: `/media/${p.key}/` }, { name: a.title }])
    + `<main class="wrap article">
  <p class="art__kicker">${esc(p.name)}${a.target ? ' / ' + esc(a.target) : ''}</p>
  <h1>${esc(a.title)}</h1>
  <p class="art__meta">公開 ${esc(a.pubDate)}${a.reviewedAt && a.reviewedAt !== a.pubDate ? ' ／ 更新 ' + esc(a.reviewedAt) : ''}</p>
  ${toc}
  <div class="body">
${html}
  </div>
  ${srcHtml}
  ${ctaBlock(a.reader)}
  ${relHtml}
  ${AUTHOR}
</main>`
    + foot();
}

/* ---------- 一覧（ハブ・トップ） ---------- */
function card(a) {
  const p = PILLAR[a.pillar] || PILLARS[0];
  return `<li class="card">
    <a href="/media/${esc(a.slug)}/">
      <span class="card__tag">${esc(p.name)}</span>
      <span class="card__t">${esc(a.title)}</span>
      <span class="card__d">${esc(a.description || '')}</span>
    </a>
  </li>`;
}
function listPage(o) {
  const pager = o.pages > 1 ? `<nav class="pager">`
    + Array.from({ length: o.pages }, (_, n) => n + 1).map(n =>
        n === o.page ? `<span class="on">${n}</span>`
                     : `<a href="${o.base}${n === 1 ? '' : 'page-' + n + '.html'}">${n}</a>`).join('')
    + `</nav>` : '';
  return head({ title: o.title, desc: o.desc, url: o.url })
    + crumbs(o.crumbs)
    + `<main class="wrap listing">
  <h1>${esc(o.h1)}</h1>
  <p class="lead">${esc(o.lead)}</p>
  ${o.nav || ''}
  <p class="count">${o.total}件</p>
  <ul class="cards">${o.items.map(card).join('')}</ul>
  ${pager}
</main>`
    + foot();
}

function pillarNav(active) {
  return `<nav class="pnav">`
    + PILLARS.map(p => `<a href="/media/${p.key}/"${p.key === active ? ' class="on"' : ''}>${esc(p.name)}</a>`).join('')
    + `</nav>`;
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
  --maxw:1060px;--readw:740px;--radius:16px;
  --shadow:0 1px 2px rgba(20,26,36,.05),0 16px 38px -20px rgba(20,26,36,.26);
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--sans);line-height:1.9;
  -webkit-font-smoothing:antialiased;overflow-x:hidden}
h1,h2,h3,h4,p,ul,ol{margin:0}
a{color:inherit;text-decoration:none}
.wrap{max-width:var(--maxw);margin:0 auto;padding:0 22px}
.btn{display:inline-flex;align-items:center;gap:9px;font-weight:800;font-size:.95rem;padding:14px 26px;border-radius:11px;
  cursor:pointer;border:1px solid transparent;transition:transform .15s ease,background .2s ease,box-shadow .2s ease;white-space:nowrap}
.btn-primary{background:var(--accent);color:#fff;box-shadow:0 10px 26px -10px var(--accent)}
.btn-primary:hover{background:var(--accent-strong);transform:translateY(-1px)}

header.nav{position:sticky;top:0;z-index:50;background:rgba(245,246,248,.88);
  backdrop-filter:saturate(180%) blur(12px);border-bottom:1px solid var(--line)}
.nav-in{display:flex;align-items:center;justify-content:space-between;height:64px;gap:16px}
.brand{display:flex;align-items:center;gap:11px;font-weight:800}
.brand .mk{width:32px;height:32px;border-radius:9px;flex:none;background:var(--navy);display:grid;place-items:center}
.brand .mk svg{display:block}
.brand .nm{font-size:1.05rem;line-height:1.2;letter-spacing:.02em}
.brand .nm small{display:block;font-family:var(--mono);font-size:.56rem;letter-spacing:.14em;color:var(--ink-faint);font-weight:600}
.nav-links{display:flex;gap:20px;font-size:.9rem;font-weight:700;color:var(--ink-soft);margin-left:auto;margin-right:6px}
.nav-links a:hover{color:var(--accent-ink)}
.cta-mini{padding:10px 18px;font-size:.86rem}
@media (max-width:720px){.nav-links{display:none}}
@media (max-width:560px){.brand .nm small{display:none}}

.crumb{border-bottom:1px solid var(--line);background:var(--surface)}
.crumb .wrap{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding-top:11px;padding-bottom:11px;
  font-size:.78rem;color:var(--ink-faint)}
.crumb a:hover{color:var(--accent-ink)}
.crumb i{font-style:normal;color:var(--line-strong)}
.crumb span{color:var(--ink-soft)}

.article{max-width:var(--readw);padding-top:34px;padding-bottom:70px}
.art__kicker{font-size:.76rem;font-weight:800;letter-spacing:.1em;color:var(--accent-ink);
  text-transform:uppercase;margin-bottom:12px}
.article h1{font-size:1.86rem;line-height:1.5;letter-spacing:-.01em;margin-bottom:12px}
.art__meta{font-family:var(--mono);font-size:.76rem;color:var(--ink-faint);margin-bottom:26px}
@media (max-width:560px){.article h1{font-size:1.44rem}}

.toc{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:20px 24px;margin-bottom:34px}
.toc__t{font-size:.78rem;font-weight:800;letter-spacing:.08em;color:var(--ink-faint);margin-bottom:10px}
.toc ol{margin:0;padding-left:1.25em;font-size:.92rem}
.toc li{margin:5px 0}
.toc a:hover{color:var(--accent-ink);text-decoration:underline}

.body{font-size:1.02rem}
.body h2{font-size:1.34rem;line-height:1.55;margin:44px 0 14px;padding-top:8px;border-top:2px solid var(--navy)}
.body h3{font-size:1.1rem;margin:30px 0 10px}
.body h4{font-size:1rem;margin:22px 0 8px;color:var(--ink-soft)}
.body p{margin:0 0 18px}
.body ul,.body ol{margin:0 0 20px;padding-left:1.4em}
.body li{margin:6px 0}
.body strong{font-weight:800}
.body code{font-family:var(--mono);font-size:.88em;background:var(--surface-2);padding:2px 6px;border-radius:5px}
.body a{color:var(--accent-ink);text-decoration:underline;text-underline-offset:3px}
.body hr{border:0;border-top:1px solid var(--line);margin:34px 0}
.body blockquote{margin:0 0 20px;padding:14px 20px;border-left:3px solid var(--accent);
  background:var(--surface);color:var(--ink-soft);border-radius:0 10px 10px 0}
.body blockquote p:last-child{margin:0}
.tw{overflow-x:auto;margin:0 0 22px;border:1px solid var(--line);border-radius:12px;background:var(--surface)}
.body table{border-collapse:collapse;width:100%;font-size:.92rem}
.body th,.body td{padding:11px 14px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
.body th{background:var(--surface-2);font-weight:800;white-space:nowrap}
.body tbody tr:last-child td{border-bottom:0}

.cta-inline{background:var(--navy);color:var(--on-navy);border-radius:var(--radius);padding:22px 24px;margin:34px 0;
  display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px}
.cta-inline p{margin:0;font-weight:700;font-size:.98rem}
.cta-inline a{background:var(--accent);color:#fff;font-weight:800;font-size:.9rem;padding:12px 22px;border-radius:10px;white-space:nowrap}
.cta-inline a:hover{background:var(--accent-strong)}

.sources{margin:44px 0 0;padding-top:22px;border-top:1px solid var(--line)}
.sources h2,.related h2{font-size:.82rem;font-weight:800;letter-spacing:.08em;color:var(--ink-faint);margin-bottom:10px}
.sources ul,.related ul{margin:0;padding-left:1.2em;font-size:.9rem}
.sources li,.related li{margin:6px 0}
.sources a,.related a{color:var(--accent-ink);text-decoration:underline;text-underline-offset:3px}

.cta-end{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);
  padding:30px 28px;margin:40px 0 0;text-align:center;box-shadow:var(--shadow)}
.cta-end__lead{font-size:1.12rem;font-weight:800;margin-bottom:8px}
.cta-end__sub{font-size:.92rem;color:var(--ink-soft);margin-bottom:20px}

.related{margin-top:40px}
.author{margin-top:40px;padding-top:22px;border-top:1px solid var(--line);font-size:.88rem;color:var(--ink-soft)}
.author__t{font-size:.74rem;font-weight:800;letter-spacing:.1em;color:var(--ink-faint)}
.author__n{font-size:1rem;font-weight:800;color:var(--ink);margin:4px 0 6px}

.listing{padding-top:38px;padding-bottom:70px}
.listing h1{font-size:1.9rem;line-height:1.45;margin-bottom:12px}
.listing .lead{color:var(--ink-soft);font-size:.98rem;max-width:var(--readw);margin-bottom:24px}
.pnav{display:flex;flex-wrap:wrap;gap:9px;margin-bottom:24px}
.pnav a{border:1px solid var(--line-strong);background:var(--surface);border-radius:999px;
  padding:9px 18px;font-size:.9rem;font-weight:700;color:var(--ink-soft)}
.pnav a:hover{border-color:var(--accent);color:var(--accent-ink)}
.pnav a.on{background:var(--navy);border-color:var(--navy);color:#fff}
.count{font-family:var(--mono);font-size:.8rem;color:var(--ink-faint);margin-bottom:14px}
.cards{list-style:none;margin:0;padding:0;display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(310px,1fr))}
.card a{display:flex;flex-direction:column;gap:7px;height:100%;background:var(--surface);border:1px solid var(--line);
  border-radius:14px;padding:18px 20px;transition:border-color .15s,transform .15s}
.card a:hover{border-color:var(--accent);transform:translateY(-2px)}
.card__tag{font-size:.7rem;font-weight:800;letter-spacing:.08em;color:var(--accent-ink)}
.card__t{font-size:1rem;font-weight:800;line-height:1.6}
.card__d{font-size:.85rem;color:var(--ink-soft);line-height:1.7}
.pager{display:flex;flex-wrap:wrap;gap:7px;margin-top:30px;font-family:var(--mono);font-size:.85rem}
.pager a,.pager span{padding:8px 13px;border-radius:9px;border:1px solid var(--line-strong);background:var(--surface)}
.pager span.on{background:var(--navy);border-color:var(--navy);color:#fff}
.pager a:hover{border-color:var(--accent);color:var(--accent-ink)}
.empty{background:var(--surface);border:1px dashed var(--line-strong);border-radius:var(--radius);
  padding:40px 24px;text-align:center;color:var(--ink-soft)}

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

  const bad = [];
  all.forEach(a => {
    ['title', 'description', 'pillar', 'reader', 'pubDate'].forEach(k => { if (!a[k]) bad.push(`${a.slug}: ${k} がありません`); });
    if (a.pillar && !PILLAR[a.pillar]) bad.push(`${a.slug}: 知らない pillar「${a.pillar}」`);
    if (a.reader && !CTA[a.reader]) bad.push(`${a.slug}: 知らない reader「${a.reader}」`);
    (a.related || []).forEach(s => { if (!all.some(x => x.slug === s)) bad.push(`${a.slug}: related のリンク先が無い（${s}）`); });
  });
  const byPillar = {};
  PILLARS.forEach(p => byPillar[p.key] = all.filter(a => a.pillar === p.key));

  console.log(`記事 ${all.length}件`);
  PILLARS.forEach(p => console.log(`  ${p.name}: ${byPillar[p.key].length}件`));
  if (bad.length) { console.log('⚠ 問題:'); bad.slice(0, 40).forEach(x => console.log('   - ' + x)); }
  if (check) return;
  if (bad.length) { console.log('問題があるので書き出しません。'); process.exit(1); }

  /* 古い出力を消す（記事を削ったときに残骸が残らないように）。_articles と assets は消さない */
  if (fs.existsSync(OUT)) {
    fs.readdirSync(OUT).forEach(f => {
      if (f === '_articles' || f === 'assets') return;
      fs.rmSync(path.join(OUT, f), { recursive: true, force: true });
    });
  }
  w('assets/media.css', CSS);
  fs.writeFileSync(path.join(DIR, '.nojekyll'), '', 'utf8');

  all.forEach(a => w(`${a.slug}/index.html`, articleHtml(a, all)));

  /* 柱ごとのハブ（ページ送り） */
  PILLARS.forEach(p => {
    const list = byPillar[p.key];
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    for (let n = 1; n <= pages; n++) {
      const items = list.slice((n - 1) * PER_PAGE, n * PER_PAGE);
      const rel = n === 1 ? `${p.key}/index.html` : `${p.key}/page-${n}.html`;
      w(rel, listPage({
        title: `${p.name}の記事一覧${n > 1 ? `（${n}ページ目）` : ''}｜エラベル`,
        desc: p.lead, url: `/media/${p.key}/${n > 1 ? `page-${n}.html` : ''}`,
        h1: p.name, lead: p.lead, nav: pillarNav(p.key),
        crumbs: [{ name: 'ホーム', url: '/' }, { name: 'メディア', url: '/media/' }, { name: p.name }],
        items, total: list.length, page: n, pages, base: `/media/${p.key}/`,
      }));
    }
  });

  /* メディアトップ */
  const topPages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  for (let n = 1; n <= topPages; n++) {
    w(n === 1 ? 'index.html' : `page-${n}.html`, listPage({
      title: `採用代行・スカウト代行・人事副業のメディア｜エラベル`,
      desc: '採用代行（RPO）とスカウト代行の実務、人事経験を副業で活かす方法をまとめたメディアです。',
      url: `/media/${n > 1 ? `page-${n}.html` : ''}`,
      h1: '採用と、採用を支える働き方のメディア',
      lead: '採用代行に何をどこまで任せるか。スカウトの返信率をどう上げるか。人事の経験を副業でどう活かすか。実務の判断に使える形でまとめています。',
      nav: pillarNav(''),
      crumbs: [{ name: 'ホーム', url: '/' }, { name: 'メディア' }],
      items: all.slice((n - 1) * PER_PAGE, n * PER_PAGE), total: all.length,
      page: n, pages: topPages, base: '/media/',
    }));
  }

  /* sitemap（本体3ページ＋メディア全部） */
  const urls = ['/', '/partner.html', '/privacy.html', '/media/']
    .concat(PILLARS.map(p => `/media/${p.key}/`))
    .concat(all.map(a => `/media/${a.slug}/`));
  fs.writeFileSync(path.join(DIR, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
    + urls.map(u => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')
    + `\n</urlset>\n`, 'utf8');
  fs.writeFileSync(path.join(DIR, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`, 'utf8');

  console.log(`media/ に ${all.length}記事 ＋ ハブ${PILLARS.length}本 ＋ トップを書き出しました`);
  console.log(`sitemap.xml: ${urls.length}URL`);
}

main();
