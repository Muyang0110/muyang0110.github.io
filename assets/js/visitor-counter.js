(() => {
  const widgets = [...document.querySelectorAll('[data-visitor-widget]')];
  if (!widgets.length) return;
  const hasMap = widgets.some(widget => widget.dataset.visitorWidget === 'map');
  const footer = document.querySelector('.profile-visitor-footer');
  if (hasMap) footer?.remove();
  const slots = widgets.filter(widget => widget.isConnected);
  const status = document.getElementById('visitor-status');

  // Local previews and automated tests must not create real visitor records.
  if (location.hostname !== 'muyang0110.github.io' || location.protocol !== 'https:') {
    slots.forEach(slot => {
      slot.querySelector('.visitor-widget-placeholder').textContent = 'Live visitor statistics are available on the published website.';
    });
    if (status) status.textContent = 'Local preview: tracking is disabled. Live counts appear on the published website.';
    return;
  }

  const server = 'https://s05.flagcounter.com';
  const counter = '3QXR';
  const urls = {
    map: `${server}/map/${counter}/size_l/txt_19324A/border_DCE2E6/pageviews_0/viewers_0/flags_1/`,
    compact: `${server}/count/${counter}/bg_FFFFFF/txt_19324A/border_FFFFFF/columns_3/maxflags_6/viewers_0/labels_1/pageviews_0/flags_1/percent_0/`,
    countries: `${server}/count/${counter}/bg_FFFFFF/txt_19324A/border_FFFFFF/columns_4/maxflags_250/viewers_0/labels_1/pageviews_0/flags_1/percent_0/`,
  };
  let remaining = slots.length;
  let failed = false;
  slots.forEach(slot => {
    const type = slot.dataset.visitorWidget;
    const image = document.createElement('img');
    image.alt = type === 'map' ? 'World map of visitor countries — Flag Counter' : 'Visitor counts by country — Flag Counter';
    image.loading = 'eager';
    image.referrerPolicy = 'no-referrer';
    image.addEventListener('load', () => {
      slot.querySelector('.visitor-widget-placeholder')?.remove();
      remaining--;
      if (status && remaining === 0 && !failed) status.textContent = 'Live statistics are enabled. Map and counter images can take about five minutes to refresh; click through for current totals.';
    }, { once: true });
    image.addEventListener('error', () => {
      failed = true;
      image.remove();
      slot.querySelector('.visitor-widget-placeholder').textContent = 'Statistics image unavailable. Open visitor statistics.';
      if (status) status.textContent = 'Statistics images could not load. Open the visitor history link below for current totals.';
    }, { once: true });
    slot.append(image);
    image.src = urls[type];
  });
})();
