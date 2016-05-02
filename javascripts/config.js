/**
 * @file Configuration for Pageviews application
 * @author MusikAnimal
 * @copyright 2016 MusikAnimal
 */

const templates = require('./templates');
const pv = require('./shared/pv');

/**
 * Configuration for Pageviews application.
 * This includes selectors, defaults, and other constants specific to Pageviews
 * @type {Object}
 */
const config = {
  agentSelector: '#agent-select',
  articleSelector: '.aqs-article-selector',
  chart: '.aqs-chart',
  chartConfig: {
    line: {
      dataset(color) {
        return {
          color,
          backgroundColor: 'rgba(0,0,0,0)',
          borderColor: color,
          pointColor: color,
          pointBackgroundColor: '#fff',
          pointBorderColor: pv.rgba(color, 0.8),
          pointHoverBackgroundColor: color,
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointHoverRadius: 5
        };
      },
      opts: {
        legendCallback: chart => {
          return templates.linearLegend(chart.data.datasets);
        }
      }
    },
    bar: {
      dataset(color) {
        return {
          color,
          backgroundColor: pv.rgba(color, 0.5),
          borderColor: pv.rgba(color, 0.8),
          borderWidth: 1,
          hoverBackgroundColor: pv.rgba(color, 0.75),
          hoverBorderColor: color
        };
      },
      opts: {
        scales: {
          xAxes: [{
            barPercentage: 1.0,
            categoryPercentage: 0.85
          }]
        },
        legendCallback: chart => {
          return templates.linearLegend(chart.data.datasets);
        }
      }
    },
    pie: {
      opts: {
        legendCallback: chart => {
          return templates.circularLegend(chart.data.datasets);
        }
      },
      dataset(color) {
        return {
          color: color,
          backgroundColor: pv.rgba(color, 0.8),
          hoverBackgroundColor: color
        };
      }
    },
    doughnut: {
      opts: {
        legendCallback: chart => {
          return templates.circularLegend(chart.data.datasets);
        }
      },
      dataset(color) {
        return {
          color: color,
          backgroundColor: pv.rgba(color, 0.8),
          hoverBackgroundColor: color
        };
      }
    },
    polarArea: {
      opts: {
        legendCallback: chart => {
          return templates.circularLegend(chart.data.datasets);
        }
      },
      dataset(color) {
        return {
          color: color,
          backgroundColor: pv.rgba(color, 0.7),
          hoverBackgroundColor: pv.rgba(color, 0.9)
        };
      }
    },
    radar: {
      opts: {
        legendCallback: chart => {
          return templates.linearLegend(chart.data.datasets);
        }
      },
      dataset(color) {
        return {
          color,
          backgroundColor: pv.rgba(color, 0.1),
          borderColor: color,
          pointBackgroundColor: '#fff',
          pointBorderColor: pv.rgba(color, 0.8),
          pointHoverBackgroundColor: color,
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointHoverRadius: 5
        };
      }
    }
  },
  circularCharts: ['pie', 'doughnut', 'polarArea'],
  colors: ['rgba(171, 212, 235, 1)', 'rgba(178, 223, 138, 1)', 'rgba(251, 154, 153, 1)', 'rgba(253, 191, 111, 1)', 'rgba(202, 178, 214, 1)', 'rgba(207, 182, 128, 1)', 'rgba(141, 211, 199, 1)', 'rgba(252, 205, 229, 1)', 'rgba(255, 247, 161, 1)', 'rgba(217, 217, 217, 1)'],
  cookieExpiry: 30, // num days
  defaults: {
    autocomplete: 'autocomplete',
    chartType: 'Line',
    dateFormat: 'YYYY-MM-DD',
    dateRange: 'latest-20',
    daysAgo: 20,
    localizeDateFormat: 'true',
    numericalFormatting: 'true',
    project: 'en.wikipedia.org'
  },
  dateRangeSelector: '.aqs-date-range-selector',
  globalChartOpts: {
    animation: {
      duration: 500,
      easing: 'easeInOutQuart'
    },
    legend: {
      display: false
    }
  },
  linearCharts: ['line', 'bar', 'radar'],
  logarithmicCheckbox: '.logarithmic-scale-option',
  minDate: moment('2015-08-01').startOf('day'),
  maxDate: moment().subtract(1, 'days').startOf('day'),
  platformSelector: '#platform-select',
  projectInput: '.aqs-project-input',
  specialRanges: {
    'last-week': [moment().subtract(1, 'week').startOf('week'), moment().subtract(1, 'week').endOf('week')],
    'this-month': [moment().startOf('month'), moment().subtract(1, 'days').startOf('day')],
    'last-month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
    latest(offset = config.daysAgo) {
      return [moment().subtract(offset, 'days').startOf('day'), config.maxDate];
    }
  },
  timestampFormat: 'YYYYMMDD00'
};

module.exports = config;
