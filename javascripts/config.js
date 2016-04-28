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
        }
      }
    },
    pie: {
      opts: {
        legendTemplate: templates.circularLegend
      },
      dataset(color) {
        return {
          color: color,
          highlight: pv.rgba(color, 0.8)
        };
      }
    },
    doughnut: {
      opts: {
        legendTemplate: templates.circularLegend
      },
      dataset(color) {
        return {
          color: color,
          highlight: pv.rgba(color, 0.8)
        };
      }
    },
    polararea: {
      opts: {
        legendTemplate: templates.circularLegend
      },
      dataset(color) {
        return {
          color: color,
          highlight: pv.rgba(color, 0.8)
        };
      }
    },
    radar: {
      opts: {
        legendTemplate: templates.linearLegend
      },
      dataset(color) {
        return {
          fillColor: pv.rgba(color, 0.1),
          pointColor: color,
          pointStrokeColor: '#fff',
          pointHighlightFill: '#fff',
          pointHighlightStroke: color,
          strokeColor: color
        };
      }
    }
  },
  circularCharts: ['Pie', 'Doughnut', 'PolarArea'],
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
    },
    tooltips: {
      mode: 'label',
      callbacks: {
        label: tooltipItem => {
          if (Number.isNaN(tooltipItem.yLabel)) {
            return ' ' + i18nMessages.unknown;
          } else {
            return ' ' + (new Number(tooltipItem.yLabel)).toLocaleString();
          }
        }
      }
    },
    legendCallback: chart => {
      return templates.linearLegend(chart.data.datasets);
    }

    // animation: true,
    // animationEasing: 'easeInOutQuart',
    // animationSteps: 30,
    // labelsFilter: (value, index, labels) => {
    //   if (labels.length >= 60) {
    //     return (index + 1) % Math.ceil(labels.length / 60 * 2) !== 0;
    //   } else {
    //     return false;
    //   }
    // },
    // multiTooltipTemplate: '<%= formatNumber(value) %>',
    // scaleLabel: '<%= formatNumber(value) %>',
    // tooltipTemplate: '<%if (label){%><%=label%>: <%}%><%= formatNumber(value) %>'
  },
  linearCharts: ['line', 'bar', 'radar'],
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
