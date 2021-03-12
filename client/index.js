
import { fetchEarthquakes } from './lib/earthquakes.js';
import { el, element, formatDate } from './lib/utils.js';
import { init, createPopup } from './lib/map.js';


const urlParams = new URLSearchParams(window.location.search);

if (!urlParams.get('type') || !urlParams.get('period')) {
  const hidden = document.querySelector('.hidden');
  hidden.style.display = "none";
}

function translate(type, period) {
  var typeIS;
  var periodIS;

  if (type === "significant") {
    typeIS = "Verulegir jarðskjálftar";
  } else if (type === "all") {
    typeIS = "Allir jarðskjálftar";
  } else {
    typeIS = type + " á richter jarðskjálftar";
  }

  if (period === "hour") {
    periodIS = ", seinastu klukkustund";
  }
  if (period === "day") {
    periodIS = ", seinasta dag";
  }
  if (period === "week") {
    periodIS = ", seinustu viku";
  }
  if (period === "month") {
    periodIS = ", seinasta mánuð";
  }

  return typeIS + periodIS;
}

document.addEventListener('DOMContentLoaded', async () => {
  // TODO
  // Bæta við virkni til að sækja úr lista
  // Nota proxy
  // Hreinsa header og upplýsingar þegar ný gögn eru sótt
  // Sterkur leikur að refactora úr virkni fyrir event handler í sér fall

  const period = urlParams.get('period');
  const type = urlParams.get('type');

  const data = await fetchEarthquakes(type, period);
  if (!data) {
    return;
  }
  const earthquakes = data.data;

  const headerText = translate(type, period);
  document.querySelector('.header').appendChild(document.createTextNode(headerText));

  var cacheText;

  if (data.info.cached) {
    cacheText = "Gögn eru í cache.";
  } else {
    cacheText = "Gögn eru ekki í cache."
  }

  cacheText = cacheText + " Fyrirspurn tók " + data.info.elapsed + " sek.";
  document.querySelector('.cache').appendChild(document.createTextNode(cacheText));


  // Fjarlægjum loading skilaboð eftir að við höfum sótt gögn
  const loading = document.querySelector('.loading');
  loading.style.display = "none";

  if (!earthquakes) {
    parent.appendChild(
      el('p', 'Villa við að sækja gögn'),
    );
  }

  const ul = document.querySelector('.earthquakes');
  const map = document.querySelector('.map');

  init(map);

  earthquakes.features.forEach((quake) => {
    const {
      title, mag, time, url,
    } = quake.properties;

    const link = element('a', { href: url, target: '_blank' }, null, 'Skoða nánar');

    const markerContent = el('div',
      el('h3', title),
      el('p', formatDate(time)),
      el('p', link));
    const marker = createPopup(quake.geometry, markerContent.outerHTML);

    const onClick = () => {
      marker.openPopup();
    };

    const li = el('li');

    li.appendChild(
      el('div',
        el('h2', title),
        el('dl',
          el('dt', 'Tími'),
          el('dd', formatDate(time)),
          el('dt', 'Styrkur'),
          el('dd', `${mag} á richter`),
          el('dt', 'Nánar'),
          el('dd', url.toString())),
        element('div', { class: 'buttons' }, null,
          element('button', null, { click: onClick }, 'Sjá á korti'),
          link)),
    );

    ul.appendChild(li);
  });
});
