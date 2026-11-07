(() => {
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const rows = [...document.querySelectorAll('tr[data-tags]')];
  const services = [...document.querySelectorAll('article[data-tags]')];
  buttons.forEach(button => button.addEventListener('click', () => {
    const value = button.dataset.filter;
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    [...rows, ...services].forEach(el => { el.hidden = value !== 'all' && !el.dataset.tags.split(' ').includes(value); });
    document.getElementById('result-count').textContent = `${rows.filter(el => !el.hidden).length}サービスを表示`;
  }));
  document.querySelectorAll('[data-service]').forEach(a => a.addEventListener('click', () => {
    if (typeof window.gtag === 'function') window.gtag('event', 'service_outbound', {service: a.dataset.service, link_url: a.href});
  }));
})();
