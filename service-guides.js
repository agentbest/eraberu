'use strict';
/* Official service facts and editorial connections are kept separately.
   Do not infer support for a particular medium, occupation or location from a broad RPO menu. */
const checkedAt = '2026-11-08';
const services = {
  caster: {name:'CASTER BIZ recruiting', company:'株式会社キャスター', kind:'採用チームの運用支援', url:'https://recruiting.cast-er.com/', scope:'採用戦略、スカウト、求人媒体の運用、応募者対応などを支援。', confirm:'必要な稼働時間と、任せる工程・追加作業の範囲を確認。'},
  marugoto: {name:'まるごと人事', company:'マルゴト株式会社', kind:'採用体制づくり・実行', url:'https://marugotoinc.jp/', scope:'採用の設計からスカウト、選考運用、改善までを支援。', confirm:'採用チームの体制、月間の業務量、依頼するプランの範囲を確認。'},
  bsearch: {name:'採善策', company:'株式会社bサーチ', kind:'求人媒体・採用実務', url:'https://www.bsearch.co.jp/recruit/2490/', scope:'求人媒体の運用、スカウト、応募者対応、採用広報などを支援。', confirm:'対象の求人媒体、広告費と代行費の内訳、改善提案の範囲を確認。'},
  proscout: {name:'PRO SCOUT', company:'株式会社VOLLECT', kind:'スカウト運用', url:'https://vollect.net/proscout_lp/', scope:'スカウトの文面作成、配信、振り返りなどを支援。', confirm:'利用媒体、対象職種、通数、返信後の対応範囲を確認。'},
  helpyou: {name:'HELP YOU', company:'株式会社ニット', kind:'採用事務の切り出し', url:'https://help-you.me/service/hr/', scope:'求人票の作成、応募者対応、面接日程の調整、採用データ入力などに対応。', confirm:'月の作業時間、対応時間帯、承認が必要な業務の分担を確認。'},
  neo: {name:'ネオキャリアの採用代行', company:'株式会社ネオキャリア', kind:'採用計画・選考運用', url:'https://bizfocus.jp/rpo', scope:'新卒・中途の採用計画、母集団形成、選考・内定フォローを支援。一部業務の委託も相談可能。', confirm:'採用区分、必要な時期、連絡対応の範囲と運用体制を確認。'},
  neoPart: {name:'ネオキャリアのアルバイト採用代行', company:'株式会社ネオキャリア', kind:'アルバイト・パート採用', url:'https://www.neo-career.co.jp/humanresource/parttimerpo/', scope:'アルバイト採用に関わる応募管理や選考運用などのアウトソーシングを案内。', confirm:'店舗数、応募件数、店舗との連携方法、必要な対応時間帯を確認。'},
  leggenda: {name:'レジェンダの採用代行（RPO）', company:'レジェンダ・コーポレーション株式会社', kind:'採用設計・プロセス改善', url:'https://www.leggenda.co.jp/recruitment_support/rpo/', scope:'新卒・中途の採用設計、母集団形成、選考運用、分析などを支援。', confirm:'設計・実行それぞれの担当範囲と、社内の関係部署との進め方を確認。'},
  lein: {name:'LeINの採用代行（RPO）', company:'株式会社レイン', kind:'エンジニア採用', url:'https://lein.co.jp/lp/rpo/', scope:'エンジニア採用に向けた媒体・エージェント管理やスカウト設計などを支援。', confirm:'募集ポジションの技術領域、現場との要件整理、利用媒体を確認。'},
  agentbest: {name:'エージェントベストのスカウト代行', company:'株式会社エージェントベスト', kind:'スカウト実務', owned:true, url:'https://scout.agent-best.net/', scope:'候補者選定、文面作成・送信、日程調整、選考管理などを支援。', confirm:'対応媒体、成果報酬を含む総額、返信後の業務分担を確認。'}
};
// Each connection describes an option, never a guarantee that the underlying problem will be solved.
const profiles = {
  operations: {title:'応募者対応や日程調整を、外に任せるなら', lead:'連絡や入力が滞っているなら、採用全体を任せる前に、止まっている作業を切り出す方法があります。社内の面接枠と判断担当は決めたうえで、実務を支えるサービスを検討しましょう。', check:'初回連絡までの目安、社内確認で止まった場合の連絡先、土日・夜間の対応が必要かを先に整理します。', entries:[['helpyou','決まった手順の作業を切り出す','日程の候補を集める、応募情報を入力するなど、手順化できる作業を渡したい場合の候補です。'],['neo','選考の流れまで含めて相談する','連絡業務だけでなく、選考・内定フォローとのつながりも整えたい場合に、委託する工程を相談できます。'],['caster','継続して採用を回すチームを補う','応募者対応と媒体運用など、複数の作業をまとめて継続運用したい場合に検討できます。']]},
  scout: {title:'スカウトの改善と運用を任せるなら', lead:'送信だけが足りないのか、対象者や文面の設計から見直す必要があるのかで、依頼先への相談内容は変わります。運用に特化した支援と、採用全体も扱う支援を分けて考えましょう。', check:'対象者の条件、文面の承認者、配信量、返信後の対応を同じ条件にして相談します。特定の媒体に対応できるかは各社へ確認してください。', entries:[['proscout','文面・配信・振り返りをつなげる','文面を作って終わりにせず、配信後の反応を見ながら運用を見直す支援を探す場合の候補です。'],['caster','スカウト以外の採用実務もまとめる','スカウトと求人媒体の運用、応募者対応の間で仕事が止まる場合は、周辺業務も含めた体制を検討できます。'],['agentbest','候補者選定から日程調整まで相談する','運営会社もスカウト実務を提供しています。依頼する範囲と費用条件を他社とそろえて検討してください。']]},
  engineer: {title:'エンジニア採用の支援を検討するなら', lead:'技術要件を言葉にする作業と、候補者を探して接点をつくる作業を分けると、必要な支援を相談しやすくなります。技術領域と募集ポジションを伝え、実際に担当する体制を確かめましょう。', check:'技術要件の理解、現場との打ち合わせ、利用する媒体、類似ポジションの支援経験を確認します。専門職への対応をサービス名だけで判断しないことが大切です。', entries:[['lein','技術職の要件と採用チャネルを整理する','エンジニア採用を掲げるRPOとして、媒体やエージェントの使い方から相談したい場合の候補です。'],['proscout','スカウトで候補者との接点をつくる','要件は社内で持ち、文面や配信、反応の振り返りを外部と進めたい場合に、対象ポジションへの対応を確認できます。']]},
  newgrad: {title:'新卒採用の設計・実務を補うなら', lead:'学生への連絡、イベント、選考、内定後のフォローは、時期ごとに負荷が変わります。採用年度と各工程の予定をそろえ、忙しい期間にどこを任せるかから相談しましょう。', check:'対象年度、繁忙期の稼働、学校・学生への連絡方法、イベント当日の対応範囲を確認します。特定の新卒媒体の操作は別途確認が必要です。', entries:[['neo','選考・内定フォローまでの流れを支える','新卒の採用計画から実務まで扱うサービスとして、一部業務から全体運用まで相談する候補です。'],['leggenda','年間の採用プロセスから整える','採用設計や選考運用を扱うため、年度を通した工程や社内の役割分担から見直したい場合に検討できます。']]},
  parttime: {title:'店舗・アルバイト採用の実務を支えるなら', lead:'応募から店舗での面接までに時間がかかる場合は、応募受付と店舗側の判断の受け渡しを見直します。採用人数だけでなく、店舗数と応募件数を伝えると、必要な運用体制を相談しやすくなります。', check:'店舗ごとの連絡担当、面接枠、連絡手段、夜間・休日の要否を整理します。対応時間や店舗数の条件は個別に確認してください。', entries:[['neoPart','アルバイト採用の運用を相談する','アルバイト採用向けの窓口として、応募管理や店舗との連携を含む実務の委託を検討できます。'],['helpyou','連絡・入力などの事務を切り出す','店舗の採用判断は社内に残し、応募情報の入力や日程候補の確認などを手順化して渡す場合の候補です。']]},
  attraction: {title:'応募を増やすための支援を考えるなら', lead:'応募が少ないときは、求人の伝え方、媒体の選択、採用条件のどこに原因があるかを切り分けます。広告を増やす支援と、採用の設計から見直す支援では、頼む内容が異なります。', check:'対象職種、勤務地、広告予算、現在の閲覧数・応募数を伝えます。採用条件そのものの変更が必要な場合は、自社で判断する担当者も決めておきましょう。', entries:[['bsearch','求人媒体の運用と採用実務を相談する','媒体運用や採用広報を扱うため、求人の出し方と応募後の運用を一緒に見直したい場合に検討できます。'],['leggenda','母集団形成の前提を整理する','ターゲットや採用プロセスの設計から扱うため、媒体を変える前に方針を見直したい場合の候補です。'],['neo','母集団形成から選考につなげる','応募を集める施策と選考運用を切り離さず、採用計画に沿って相談したい場合に検討できます。']]},
  team: {title:'少人数の人事を支えるサービスを検討するなら', lead:'採用を兼務している場合は、自社で決めることと、外部に任せる実務を先に分けます。採用チームを補う方法と、事務作業だけを切り出す方法の両方があります。', check:'採用計画の責任者、承認に使える時間、月の仕事量を整理します。業務を渡したあとも、合否や採用条件を誰が決めるかは社内で明確にします。', entries:[['marugoto','設計から実行までチームを補う','採用の進め方を相談しながら、日々の運用にも手が必要な場合に、支援体制を検討できます。'],['caster','複数の採用実務をまとめて任せる','媒体運用、スカウト、応募者対応などをまとめ、継続して回す実務を補いたい場合の候補です。'],['helpyou','手順の決まった作業から減らす','採用方針は社内で持ち、日程調整やデータ入力などの負担を減らしたい場合に検討できます。']]},
  process: {title:'採用プロセスの見直しも任せるなら', lead:'辞退や選考の停滞は、連絡を増やすだけでは改善しないことがあります。どの工程で止まるかを確認し、設計の見直しと実務の委託を分けて相談しましょう。', check:'現在の選考フロー、工程ごとの件数と所要日数、現場の役割を共有します。採用条件や面接での評価は、自社側の判断も必要です。', entries:[['leggenda','設計・運用・分析をつなげる','選考プロセスの設計や分析も扱うため、工程を見直してから運用を回したい場合に検討できます。'],['marugoto','採用体制に実行役を加える','設計の議論だけでなく、スカウトや選考運用も継続して進める体制が必要な場合の候補です。']]},
  cost: {title:'費用を比較するときのサービス候補', lead:'予算だけで選ぶ前に、必要なのが採用チームの支援か、事務作業の代行かを分けましょう。以下は依頼範囲の異なる候補例です。同じ作業量と期間を伝え、総額で見積もりを確認してください。', check:'初期費用、月額、成果報酬、広告・媒体費、追加作業の単価と契約期間をそろえます。安い順の掲載ではありません。', entries:[['caster','採用チームの稼働量で見積もる','採用の実務を継続して任せるときは、必要時間と対象業務を決めて相談する候補です。'],['helpyou','事務作業を切り出して見積もる','採用方針や判断は社内に残し、連絡・入力などの作業量を基準に相談する候補です。']]},
  general: {title:'この記事の業務を外部に任せるなら', lead:'一括で委託する方法だけでなく、求人運用、スカウト、応募者対応などを切り出す方法もあります。記事で整理した課題を、実際に頼みたい作業に置き換えてから相談しましょう。', check:'対象の職種・業界・地域、利用する媒体、月の業務量を伝えます。各社がその条件に対応できるか、担当体制や類似の支援経験を個別に確認してください。', entries:[['marugoto','採用の設計と実行をまとめて相談する','採用体制を補いながら、日々の実務も進めたい場合の候補です。対象職種や地域への対応は確認が必要です。'],['caster','採用実務をチームで継続運用する','複数の採用業務を組み合わせて任せたい場合に、必要な稼働時間と対応範囲を相談できます。']]}
};
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
  const p=profiles[key];
  const entries=a.serviceIds ? a.serviceIds.map(id=>p.entries.find(e=>e[0]===id) || [id,'依頼範囲を確認する','この記事で整理した業務への対応と担当体制を確認してください。']) : p.entries;
  for(const [id] of entries) if(!services[id]) throw Error(`Unknown service id ${id}: ${a.slug}`);
  const html=`<section class="service-guide" aria-labelledby="service-options" data-profile="${key}">
<p class="service-guide__eyebrow">この課題を、サービスで支える</p><h2 id="service-options">${esc(p.title)}</h2>
<p>${esc(p.lead)}</p><p class="service-guide__context">この記事のテーマ：${esc(a.title)}</p>
<div class="service-guide__choices">${entries.map(([id,angle,why])=>{const s=services[id];return `<article class="service-option" data-service="${id}">
<p class="service-option__angle">${esc(angle)}</p><h3>${esc(s.name)}</h3><p class="service-option__company">${esc(s.company)}${s.owned?' <span>運営会社のサービス</span>':''}</p>
<p>${esc(why)}</p><dl><div><dt>公式に案内されている業務</dt><dd>${esc(s.scope)}</dd></div><div><dt>相談するときに確認したいこと</dt><dd>${esc(s.confirm)}</dd></div></dl>
<a class="service-option__link" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" data-service="${id}">公式サイトで支援内容を確認する ↗</a></article>`}).join('\n')}</div>
<div class="service-guide__check"><h3>相談前に、ここまで整理しておく</h3><p>${esc(p.check)}</p></div>
<p class="service-guide__note">掲載は支援内容をもとに整理した候補例で、成果や個別条件への対応を保証するものではありません。順番はランキングではありません。公式情報の確認日：${checkedAt}。料金・対応範囲は各社にご確認ください。<a href="/editorial.html">掲載方針</a></p></section>`;
  return {key,title:p.title,html,entries};
}
module.exports={services,profiles,profileFor,guideFor,checkedAt};
