'use strict';
/* 運営会社（エージェントベスト）のスカウト代行LPへの導線。企業向け（reader=company）の記事にだけ出す。
   ⚠ 文言はLP（scout.agent-best.net / offerboxapp.com / green.agent-best.net）に書いてある事実だけ。
     「No.1」「必ず採用できる」は書かない。自社サービスであることを毎回明記する（ステマ規制）。
   記事の中の3か所に入る：冒頭「先に結論」／本文中ほどのバナー／末尾の濃紺CTA＋サイドバー。 */
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const OWN = {
  scout: {
    name: 'エージェントベストのスカウト代行', short: 'スカウト代行', url: 'https://scout.agent-best.net/', img: '/assets/own/scout.svg',
    catch: 'スカウト運用を、まるごと代行。月額0円のフリープランから',
    points: ['候補者選定・文面作成・送信・日程調整・選考管理まで代行', 'フリープランは月額0円、成果報酬のみ（新卒20万円／中途50万円）', 'OpenWork・BizReach・doda・Green・AMBIに対応'],
    who: 'スカウトを送る時間がない／返信率が上がらない採用担当者',
    note: 'フリープランは最低送信数150通/月。プランの条件はLPでご確認ください。',
    cta: 'スカウト代行を無料で相談する',
  },
  offerbox: {
    name: 'エージェントベストのOfferBox運用代行', short: 'OfferBox運用代行', url: 'https://offerboxapp.com/', img: '/assets/own/offerbox.svg',
    catch: '新卒スカウトを完全成果報酬で。成果が出なければ費用0円',
    points: ['ターゲット設計・文面作成・送信・返信対応まで専属チームが代行', '初期費用・月額費用0円、新卒1名採用時20万円', '内定承諾後・入社前の辞退は100%返金'],
    who: 'OfferBoxを使いたいが、毎日のスカウトに手が回らない新卒採用担当者',
    note: 'OfferBoxの利用契約は別途必要です。返金規定の詳細は契約時に案内されます。',
    cta: 'OfferBox運用代行を無料で相談する',
  },
  green: {
    name: 'エージェントベストのGreen運用代行', short: 'Green運用代行', url: 'https://green.agent-best.net/', img: '/assets/own/green.svg',
    catch: 'IT・Web採用のGreen運用を、入社時だけの成功報酬で',
    points: ['Green特化。スカウト配信・日程調整などの運用を代行', '初期費用・月額固定費0円、入社1名50万円（税別）', '契約期間の縛りなし'],
    who: 'エンジニア・Web職の採用でGreenを使っている／使いたい企業',
    note: 'Greenの利用料金は含まれず、Greenとのご契約にもとづいて別にかかります。',
    cta: 'Green運用代行を無料で相談する',
  },
};

/* 記事ごとにどのLPを出すか。法令・労務の解説記事でも末尾には出す（冒頭・中ほどは guide がある記事だけ）。 */
function ownFor(a) {
  if (a.reader === 'person') return null;
  const t = `${a.slug} ${a.title} ${a.target || ''} ${(a.tags || []).join(' ')}`;
  if (/offerbox|オファーボックス|OfferBox/i.test(t)) return 'offerbox';
  if (/(^|[^a-z])green|Green/.test(t)) return 'green';
  if (/shinsotsu|新卒|インターン|学生/.test(t)) return 'offerbox';
  if (/engineer|frontend|backend|sre-|data-scientist|エンジニア|IT採用|Web職|デザイナー/.test(t)) return 'green';
  return 'scout';
}
const link = (id, pos, slug) => `${OWN[id].url}?utm_source=eraberu&amp;utm_medium=article&amp;utm_campaign=${pos}&amp;utm_content=${encodeURIComponent(slug || '')}`;
const ga = (id, pos) => ` data-own="${id}" data-pos="${pos}"`;

/* 冒頭：【先に結論】自社LP＋記事のサービス候補（PRを優先）から2件 */
function topBox(a, guide, services) {
  const id = ownFor(a); if (!id) return '';
  const o = OWN[id];
  const picks = [];
  if (guide && guide.entries) {
    const es = guide.entries.filter(([sid]) => services[sid] && !services[sid].owned);
    for (const [sid, angle] of es.slice(0, 2)) {
      const s = services[sid];
      picks.push(`<li><span class="ob-top__n">他社の候補</span><b>${esc(s.name)}</b>${s.aff ? '<span class="ob-pr">PR</span>' : ''}<span class="ob-top__d">${esc(angle)}</span>`
        + `<a href="${esc(s.aff || s.url)}" target="_blank" rel="${s.aff ? 'nofollow sponsored noopener' : 'noopener noreferrer'}" data-service="${sid}">公式サイト ›</a></li>`);
    }
  }
  return `<aside class="ob-top" aria-label="先に結論">
<p class="ob-top__h">【先に結論】自社で回しきれないなら、<em>任せたほうが早い</em></p>
<ol class="ob-top__list"><li class="ob-top__own"><span class="ob-top__n">運営会社</span><b>${esc(o.name)}</b><span class="ob-own">運営会社のサービス</span><span class="ob-top__d">${esc(o.catch)}</span>`
    + `<a class="ob-top__btn" href="${link(id, 'top', a.slug)}" target="_blank" rel="noopener"${ga(id, 'top')}>${esc(o.cta)} ›</a></li>${picks.join('')}</ol>
<p class="ob-top__note">一番上は当メディアの運営会社のサービスです。他社の候補は記事内のサービス紹介と同じ並びで、順位ではありません。「PR」はアフィリエイト広告です。<a href="/editorial.html">掲載方針</a></p></aside>`;
}

/* 本文中ほど：バナー画像＋ボタン */
function midBanner(a) {
  const id = ownFor(a); if (!id) return '';
  const o = OWN[id];
  return `<aside class="ob-mid"><p class="ob-mid__h">${esc(o.short)}｜<span>運営会社のサービス</span></p>
<a class="ob-mid__bn" href="${link(id, 'mid', a.slug)}" target="_blank" rel="noopener"${ga(id, 'mid')}><img src="${o.img}" width="600" height="300" alt="${esc(o.name)}：${esc(o.catch)}" loading="lazy"></a>
<a class="ob-btn" href="${link(id, 'mid', a.slug)}" target="_blank" rel="noopener"${ga(id, 'mid')}>${esc(o.cta)} ›</a>
<p class="ob-mid__note">フォーム送信のみ・営業電話なし（LP記載）。${esc(o.note)}</p></aside>`;
}

/* 末尾：濃紺の大きいCTA（バナー＋✓ポイント） */
function endBlock(a) {
  const id = ownFor(a); if (!id) return '';
  const o = OWN[id];
  return `<aside class="ob-end"><p class="ob-end__eyebrow">ここまで読んで「自社だけで回すのは厳しい」と感じたら</p>
<h2>${esc(o.catch)}</h2>
<div class="ob-end__in"><a class="ob-end__bn" href="${link(id, 'end', a.slug)}" target="_blank" rel="noopener"${ga(id, 'end')}><img src="${o.img}" width="600" height="300" alt="${esc(o.name)}" loading="lazy"></a>
<div><ul>${o.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul><p class="ob-end__who"><b>こんな方に：</b>${esc(o.who)}</p></div></div>
<a class="ob-btn ob-btn--lg" href="${link(id, 'end', a.slug)}" target="_blank" rel="noopener"${ga(id, 'end')}>${esc(o.cta)} ›</a>
<p class="ob-end__note">${esc(o.name)}は、当メディアを運営する株式会社エージェントベストのサービスです。${esc(o.note)} <a href="/compare/">他社のサービスも課題別に比べる →</a></p></aside>`;
}

/* サイドバー（追従） */
function sideBox(a) {
  const id = ownFor(a); if (!id) return '';
  const o = OWN[id];
  return `<div class="side__box ob-side"><p class="side__h">${esc(o.short)}｜運営会社</p>
<a href="${link(id, 'side', a.slug)}" target="_blank" rel="noopener"${ga(id, 'side')}><img src="${o.img}" width="600" height="300" alt="${esc(o.name)}" loading="lazy"></a>
<a class="ob-btn" href="${link(id, 'side', a.slug)}" target="_blank" rel="noopener"${ga(id, 'side')}>無料で相談する ›</a></div>`;
}

/* 一覧ページ（トップ・柱・ハブ・タグ）用。記事ではないので utm_content は一覧のパス */
function listBanner(id, pos, path) {
  const o = OWN[id];
  return `<aside class="ob-mid ob-mid--list"><p class="ob-mid__h">${esc(o.short)}｜<span>運営会社のサービス</span></p>
<a class="ob-mid__bn" href="${link(id, pos, path)}" target="_blank" rel="noopener"${ga(id, pos)}><img src="${o.img}" width="600" height="300" alt="${esc(o.name)}" loading="lazy"></a>
<a class="ob-btn" href="${link(id, pos, path)}" target="_blank" rel="noopener"${ga(id, pos)}>${esc(o.cta)} ›</a></aside>`;
}

/* 本文の中ほど（h2 の真ん中）に入れる。h2 が3本未満なら入れない */
function insertMid(html, block) {
  if (!block) return html;
  const re = /<h2 id="[^"]*">/g; const pos = []; let m;
  while ((m = re.exec(html))) pos.push(m.index);
  if (pos.length < 3) return html;
  const at = pos[Math.floor(pos.length / 2)];
  return html.slice(0, at) + block + '\n' + html.slice(at);
}
/* 冒頭（最初の h2 の直前＝リード文の後） */
function insertTop(html, block) {
  if (!block) return html;
  const at = html.search(/<h2 id="[^"]*">/);
  return at < 0 ? block + html : html.slice(0, at) + block + '\n' + html.slice(at);
}

const CSS = `
/* 運営会社のスカウト代行LPへの導線（own-promo.js） */
.ob-own,.ob-pr{display:inline-block;margin-left:.5em;padding:.05em .55em;border-radius:4px;font-size:.68rem;font-weight:800;vertical-align:.12em}
.ob-own{background:#E4E5FB;color:#33359E}.ob-pr{background:#f3f0e8;color:#6b5a2e;border:1px solid #d8ccb0}
.ob-top{margin:1.6rem 0 2.2rem;padding:1.2rem 1.2rem 1rem;border:2px solid #4C4FD8;border-radius:12px;background:#F7F7FF}
.ob-top__h{margin:0 0 .8rem;font-weight:900;font-size:1.05rem;line-height:1.55}.ob-top__h em{font-style:normal;background:linear-gradient(transparent 60%,#FFE08A 60%)}
.ob-top__list{list-style:none;margin:0;padding:0;display:grid;gap:.6rem}
.body .ob-top__list li{margin:0;padding:.75rem .9rem;border:1px solid var(--line);border-radius:9px;background:#fff;display:grid;grid-template-columns:auto 1fr auto;gap:.2rem .7rem;align-items:center}
.body .ob-top__list li::before{content:none}
.ob-top__n{grid-row:span 2;font-size:.7rem;font-weight:900;color:#fff;background:#0B1A32;border-radius:6px;padding:.3rem .5rem;white-space:nowrap}
.ob-top__own .ob-top__n{background:#4C4FD8}
.ob-top__list b{font-size:.95rem}
.ob-top__d{grid-column:2;font-size:.82rem;color:var(--ink-soft,#48586F);line-height:1.5}
.body .ob-top__list a{grid-column:3;grid-row:1/span 2;font-size:.8rem;font-weight:800;white-space:nowrap}
.body .ob-top__list a.ob-top__btn,.body a.ob-btn{display:inline-block;background:#E8590C;color:#fff;border-radius:8px;padding:.6rem 1rem;text-decoration:none;box-shadow:0 6px 16px -8px #E8590C}
.body a.ob-btn:hover,.body .ob-top__list a.ob-top__btn:hover{background:#C9480A}
.ob-top__note,.ob-mid__note{margin:.7rem 0 0;font-size:.72rem;color:#6b7280;line-height:1.6}
@media (max-width:600px){.body .ob-top__list li{grid-template-columns:auto 1fr}.body .ob-top__list a{grid-column:1/-1;grid-row:auto;text-align:center}}
.ob-mid{margin:2.4rem 0;padding:1rem;border:1px solid var(--line);border-radius:12px;background:#fff;text-align:center}
.ob-mid__h{margin:0 0 .6rem;font-size:.8rem;font-weight:800;color:#33359E}.ob-mid__h span{font-weight:700;color:#6b7280}
.body a.ob-mid__bn,.ob-mid__bn{display:block;max-width:600px;margin:0 auto .8rem;border:0}
.ob-mid__bn img,.ob-end__bn img,.ob-side img{display:block;width:100%;height:auto;border-radius:12px;transition:transform .15s}
.ob-mid__bn:hover img,.ob-end__bn:hover img{transform:translateY(-2px)}
.ob-mid a.ob-btn{min-width:min(100%,340px);padding:.85rem 1.4rem;font-size:1rem;font-weight:900}
.ob-end{margin:2.8rem 0 1.6rem;padding:1.6rem 1.4rem;border-radius:14px;background:#0B1A32;color:#EAF0F8}
.ob-end__eyebrow{margin:0 0 .3rem;font-size:.82rem;font-weight:800;color:#FFD166}
.ob-end h2{margin:0 0 1rem;padding:0;border:0;background:none;color:#fff;font-size:1.3rem;line-height:1.5}
.ob-end__in{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:1.2rem;align-items:center}
.ob-end ul{margin:0;padding:0;list-style:none}.ob-end li{margin:0 0 .5rem;padding-left:1.5em;position:relative;font-size:.92rem;line-height:1.6}
.ob-end li::before{content:"✓";position:absolute;left:0;color:#12A150;font-weight:900}
.ob-end__who{margin:.6rem 0 0;font-size:.85rem;color:#C9D4E5}
.ob-end a.ob-btn--lg,.ob-end .ob-btn--lg{display:block;margin:1.2rem auto 0;max-width:460px;text-align:center;padding:1rem;font-size:1.05rem;font-weight:900;background:#E8590C;color:#fff;border-radius:10px;text-decoration:none}
.ob-end__note{margin:1rem 0 0;font-size:.74rem;color:#9CB0CB;line-height:1.7}.ob-end__note a{color:#fff;text-decoration:underline}
@media (max-width:640px){.ob-end__in{grid-template-columns:1fr}}
.ob-side img{margin:0 0 .7rem}.ob-side a.ob-btn{display:block;text-align:center;background:#E8590C;color:#fff;border-radius:8px;padding:.65rem;font-weight:900}
.ob-mid--list{max-width:720px;margin-left:auto;margin-right:auto}
.ob-mid--list a.ob-btn{display:inline-block;background:#E8590C;color:#fff;border-radius:8px;padding:.85rem 1.4rem;font-weight:900}
`;

/* GA4：自社LPへのクリック */
const JS = `<script>document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[data-own]');if(a&&window.gtag)gtag('event','own_lp_click',{service:a.dataset.own,position:a.dataset.pos,link_url:a.href});var p=e.target.closest&&e.target.closest('a[data-service]');if(p&&window.gtag&&!a)gtag('event','service_click',{service:p.dataset.service,link_url:p.href});});</script>`;

module.exports = { OWN, ownFor, topBox, midBanner, endBlock, sideBox, listBanner, insertMid, insertTop, CSS, JS };
