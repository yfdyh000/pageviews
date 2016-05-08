/**
 * @file Templates used by Chart.js
 * @author MusikAnimal
 * @copyright 2016 MusikAnimal
 */

const pv = require('./shared/pv');

/**
 * Templates used by Chart.js.
 * Functions used within our app must be in the global scope.
 * All quotations must be double-quotes or properly escaped.
 * @type {Object}
 */
const templates = {
  // FIXME: add back a tile for Totals, and include totals for all of the currently selected project, and perhaps unique devices
  linearLegend: datasets => {
    let markup = '';
    if (datasets.length === 1) {
      const dataset = datasets[0];
      return `<div class="linear-legend--totals">
        <strong>${$.i18n('totals')}:</strong>
        ${formatNumber(dataset.sum)} (${formatNumber(dataset.average)}/${$.i18n('day')})
        &bullet;
        <a href="${getLangviewsURL(dataset.label)}" target="_blank">All languages</a>
        &bullet;
        <a href="${getExpandedPageURL(dataset.label)}?action=history" target="_blank">History</a>
        &bullet;
        <a href="${getExpandedPageURL(dataset.label)}?action=info" target="_blank">Info</a>
      </div>`;
    }

    if (datasets.length > 1) {
      const total = datasets.reduce((a,b) => a + b.sum, 0);
      markup = `<div class="linear-legend--totals">
        <strong>${$.i18n('totals')}:</strong>
        ${formatNumber(total)} (${formatNumber(Math.round(total / numDaysInRange()))}/${$.i18n('day')})
      </div>`;
    }
    markup += '<div class="linear-legends">';

    for (let i = 0; i < datasets.length; i++) {
      markup += `
        <span class="linear-legend">
          <div class="linear-legend--label" style="background-color:${pv.rgba(datasets[i].color, 0.8)}">
            <a href="${getPageURL(datasets[i].label)}" target="_blank">${datasets[i].label}</a>
          </div>
          <div class="linear-legend--counts">
            ${formatNumber(datasets[i].sum)} (${formatNumber(datasets[i].average)}/${$.i18n('day')})
          </div>
          <div class="linear-legend--links">
            <a href="${getLangviewsURL(datasets[i].label)}" target="_blank">All languages</a>
            &bullet;
            <a href="${getExpandedPageURL(datasets[i].label)}?action=history" target="_blank">History</a>
            &bullet;
            <a href="${getExpandedPageURL(datasets[i].label)}?action=info" target="_blank">Info</a>
          </div>
        </span>
      `;
    }
    return markup += '</div>';
  },
  circularLegend: datasets => {
    const dataset = datasets[0],
      total = dataset.data.reduce((a,b) => a + b);
    let markup = `<div class="linear-legend--totals">
      <strong>${$.i18n('totals')}:</strong>
      ${formatNumber(total)} (${formatNumber(Math.round(total / numDaysInRange()))}/${$.i18n('day')})
    </div>`;

    markup += '<div class="linear-legends">';

    for (let i = 0; i < dataset.data.length; i++) {
      const label = dataset.metaData[i]._view.label;
      markup += `
        <span class="linear-legend">
          <div class="linear-legend--label" style="background-color:${dataset.backgroundColor[i]}">
            <a href="${getPageURL(label)}" target="_blank">${label}</a>
          </div>
          <div class="linear-legend--counts">
            ${formatNumber(dataset.data[i])} (${formatNumber(dataset.averages[i])}/${$.i18n('day')})
          </div>
          <div class="linear-legend--links">
            <a href="${getLangviewsURL(label)}" target="_blank">All languages</a>
            &bullet;
            <a href="${getPageURL(label)}?action=history" target="_blank">History</a>
            &bullet;
            <a href="${getPageURL(label)}?action=info" target="_blank">Info</a>
          </div>
        </span>
      `;
    }
    return markup += '</div>';
  }
};

module.exports = templates;
