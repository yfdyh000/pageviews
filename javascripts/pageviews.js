/*
 * Pageviews Analysis tool
 * @file Main file for Pageviews application
 * @author MusikAnimal, Kaldari, Marcelrf
 * @copyright 2016 MusikAnimal
 * @license MIT License: https://opensource.org/licenses/MIT
 */

const config = require('./config');
const siteMap = require('./shared/site_map');
const siteDomains = Object.keys(siteMap).map(key => siteMap[key]);
const Pv = require('./shared/pv');

/** Main PageViews class */
class PageViews extends Pv {
  constructor() {
    super();

    this.localizeDateFormat = this.getFromLocalStorage('pageviews-settings-localizeDateFormat') || config.defaults.localizeDateFormat;
    this.numericalFormatting = this.getFromLocalStorage('pageviews-settings-numericalFormatting') || config.defaults.numericalFormatting;
    this.autocomplete = this.getFromLocalStorage('pageviews-settings-autocomplete') || config.defaults.autocomplete;
    this.chartObj = null;
    this.chartType = this.getFromLocalStorage('pageviews-chart-preference') || config.defaults.chartType;
    this.normalized = false; /** let's us know if the page names have been normalized via the API yet */
    this.params = null;
    this.prevChartType = null;
    this.specialRange = null;
    this.config = config;
    this.colorsStyleEl = undefined;

    /**
     * Select2 library prints "Uncaught TypeError: XYZ is not a function" errors
     * caused by race conditions between consecutive ajax calls. They are actually
     * not critical and can be avoided with this empty function.
     */
    window.articleSuggestionCallback = $.noop;

    /** need to export to global for chart templating */
    window.formatNumber = this.formatNumber.bind(this);
    window.getPageURL = this.getPageURL.bind(this);
    window.getLangviewsURL = this.getLangviewsURL.bind(this);
    window.getExpandedPageURL = this.getExpandedPageURL.bind(this);
    window.numDaysInRange = this.numDaysInRange.bind(this);
    window.isMultilangProject = this.isMultilangProject.bind(this);
  }

  /**
   * Initialize the application.
   * Called in `pv.js` after translations have loaded
   * @return {null} Nothing
   */
  initialize() {
    this.setupProjectInput();
    this.setupDateRangeSelector();
    this.setupArticleSelector();
    this.setupSettingsModal();
    this.setupSelect2Colors();
    this.popParams();
    this.setupListeners();
    this.updateInterAppLinks();
  }

  /**
   * Destroy previous chart, if needed.
   * @returns {null} nothing
   */
  destroyChart() {
    if (this.chartObj) {
      this.chartObj.destroy();
      delete this.chartObj;
    }
  }

  /**
   * Exports current chart data to CSV format and loads it in a new tab
   * With the prepended data:text/csv this should cause the browser to download the data
   * @returns {string} CSV content
   */
  exportCSV() {
    let csvContent = 'data:text/csv;charset=utf-8,Date,';
    let titles = [];
    let dataRows = [];
    let dates = this.getDateHeadings(false);

    // Begin constructing the dataRows array by populating it with the dates
    dates.forEach((date, index) => {
      dataRows[index] = [date];
    });

    chartData.forEach(page => {
      // Build an array of page titles for use in the CSV header
      let pageTitle = '"' + page.label.replace(/"/g, '""') + '"';
      titles.push(pageTitle);

      // Populate the dataRows array with the data for this page
      dates.forEach((date, index) => {
        dataRows[index].push(page.data[index]);
      });
    });

    // Finish the CSV header
    csvContent = csvContent + titles.join(',') + '\n';

    // Add the rows to the CSV
    dataRows.forEach(data => {
      csvContent += data.join(',') + '\n';
    });

    // Output the CSV file to the browser
    const encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
  }

  /**
   * Exports current chart data to JSON format and loads it in a new tab
   * @returns {string} stringified JSON
   */
  exportJSON() {
    let data = [];

    chartData.forEach((page, index) => {
      let entry = {
        page: page.label.replace(/"/g, '\"').replace(/'/g, "\'"),
        color: page.strokeColor,
        sum: page.sum,
        daily_average: Math.round(page.sum / this.numDaysInRange())
      };

      this.getDateHeadings(false).forEach((heading, index) => {
        entry[heading.replace(/\\/,'')] = page.data[index];
      });

      data.push(entry);
    });

    const jsonContent = 'data:text/json;charset=utf-8,' + JSON.stringify(data),
      encodedUri = encodeURI(jsonContent);
    window.open(encodedUri);

    return jsonContent;
  }

  /**
   * Fill in values within settings modal with what's in the session object
   * @returns {null} nothing
   */
  fillInSettings() {
    $.each($('#settings-modal input'), (index, el) => {
      if (el.type === 'checkbox') {
        el.checked = this[el.name] === 'true';
      } else {
        el.checked = this[el.name] === el.value;
      }
    });
  }

  /**
   * Fills in zero value to a timeseries, see:
   * https://wikitech.wikimedia.org/wiki/Analytics/AQS/Pageview_API#Gotchas
   *
   * @param {object} data fetched from API
   * @param {moment} startDate - start date of range to filter through
   * @param {moment} endDate - end date of range
   * @returns {object} dataset with zeros where nulls where
   */
  fillInZeros(data, startDate, endDate) {
    /** Extract the dates that are already in the timeseries */
    let alreadyThere = {};
    data.items.forEach(elem => {
      let date = moment(elem.timestamp, config.timestampFormat);
      alreadyThere[date] = elem;
    });
    data.items = [];

    /** Reconstruct with zeros instead of nulls */
    for (let date = moment(startDate); date <= endDate; date.add(1, 'd')) {
      if (alreadyThere[date]) {
        data.items.push(alreadyThere[date]);
      } else {
        let edgeCase = date.isSame(config.maxDate) || date.isSame(moment(config.maxDate).subtract(1, 'days'));
        data.items.push({
          timestamp: date.format(config.timestampFormat),
          views: edgeCase ? null : 0
        });
      }
    }
  }

  /**
   * Get data formatted for a circular chart (Pie, Doughnut, PolarArea)
   *
   * @param {object} data - data just before we are ready to render the chart
   * @param {string} article - title of page
   * @param {integer} index - where we are in the list of pages to show
   *    used for colour selection
   * @returns {object} - ready for chart rendering
   */
  getCircularData(data, article, index) {
    const values = data.items.map(elem => elem.views),
      color = config.colors[index];

    return Object.assign(
      {
        label: article.descore(),
        value: values.reduce((a, b) => a + b)
      },
      config.chartConfig[this.chartType].dataset(color)
    );
  }

  /**
   * Gets the date headings as strings - i18n compliant
   * @param {boolean} localized - whether the dates should be localized per browser language
   * @returns {Array} the date headings as strings
   */
  getDateHeadings(localized) {
    const dateHeadings = [];

    for (let date = moment(this.daterangepicker.startDate); date.isBefore(this.daterangepicker.endDate); date.add(1, 'd')) {
      if (localized) {
        dateHeadings.push(date.format(this.dateFormat));
      } else {
        dateHeadings.push(date.format('YYYY-MM-DD'));
      }
    }
    return dateHeadings;
  }

  /**
   * Link to /langviews for given page and chosen daterange
   * @param {String} page - page title
   * @returns {String} URL
   */
  getLangviewsURL(page) {
    return `/langviews?${$.param(this.getParams())}&page=${page.replace(/[&%]/g, escape).score()}`;
  }

  /**
   * Get data formatted for a linear chart (Line, Bar, Radar)
   *
   * @param {object} data - data just before we are ready to render the chart
   * @param {string} article - title of page
   * @param {integer} index - where we are in the list of pages to show
   *    used for colour selection
   * @returns {object} - ready for chart rendering
   */
  getLinearData(data, article, index) {
    const values = data.items.map(elem => elem.views),
      color = config.colors[index % 10];

    return Object.assign(
      {
        label: article.descore(),
        data: values,
        sum: values.reduce((a, b) => a + b)
      },
      config.chartConfig[this.chartType].dataset(color)
    );
  }

  /**
   * Get params needed to create a permanent link of visible data
   * @return {Object} hash of params
   */
  getPermaLink() {
    let params = this.getParams(false);
    delete params.range;
    return params;
  }

  /**
   * Construct query for API based on what type of search we're doing
   * @param {Object} query - as returned from Select2 input
   * @returns {Object} query params to be handed off to API
   */
  getSearchParams(query) {
    if (this.autocomplete === 'autocomplete') {
      return {
        action: 'query',
        list: 'prefixsearch',
        format: 'json',
        pssearch: query || '',
        cirrusUseCompletionSuggester: 'yes'
      };
    } else if (this.autocomplete === 'autocomplete_redirects') {
      return {
        action: 'query',
        generator: 'prefixsearch',
        format: 'json',
        gpssearch: query || '',
        gpslimit: '10',
        redirects: 'true',
        cirrusUseCompletionSuggester: 'no'
      };
    }
  }

  /**
   * Generate key/value pairs of URL hash params
   * @returns {Object} key/value pairs representation of URL hash
   */
  parseHashParams() {
    const uri = location.hash.slice(1),
      chunks = uri.split('&');
    let params = {};

    for (let i = 0; i < chunks.length; i++) {
      let chunk = chunks[i].split('=');

      if (chunk[0] === 'pages') {
        params.pages = chunk[1].split(/\||%7C/);
      } else {
        params[chunk[0]] = chunk[1];
      }
    }

    return params;
  }

  /**
   * Simple metric to see how many use it (pageviews of the pageview, a meta-pageview, if you will :)
   * @return {null} nothing
   */
  patchUsage() {
    if (location.host !== 'localhost') {
      $.ajax({
        url: `//tools.wmflabs.org/musikanimal/api/pv_uses/${this.project}`,
        method: 'PATCH'
      });
    }
  }

  /**
   * Parses the URL hash and sets all the inputs accordingly
   * Should only be called on initial page load, until we decide to support pop states (probably never)
   * @returns {null} nothing
   */
  popParams() {
    let startDate, endDate, params = this.parseHashParams();

    $(config.projectInput).val(params.project || config.defaults.project);
    if (this.validateProject()) return;

    this.patchUsage();

    /**
     * Check if we're using a valid range, and if so ignore any start/end dates.
     * If an invalid range, throw and error and use default dates.
     */
    if (params.range) {
      if (!this.setSpecialRange(params.range)) {
        this.addSiteNotice('danger', $.i18n('param-error-3'), $.i18n('invalid-params'), true);
        this.setSpecialRange(config.defaults.dateRange);
      }
    } else if (params.start) {
      startDate = moment(params.start || moment().subtract(config.defaults.daysAgo, 'days'));
      endDate = moment(params.end || Date.now());
      if (startDate < moment('2015-08-01') || endDate < moment('2015-08-01')) {
        this.addSiteNotice('danger', $.i18n('param-error-1'), $.i18n('invalid-params'), true);
        this.resetView();
        return;
      } else if (startDate > endDate) {
        this.addSiteNotice('warning', $.i18n('param-error-2'), $.i18n('invalid-params'), true);
        this.resetView();
        return;
      }
      /** directly assign startDate before calling setEndDate so events will be fired once */
      this.daterangepicker.startDate = startDate;
      this.daterangepicker.setEndDate(endDate);
    } else {
      this.setSpecialRange(config.defaults.dateRange);
    }

    $(config.platformSelector).val(params.platform || 'all-access');
    $('#agent-select').val(params.agent || 'user');

    this.resetArticleSelector();

    if (!params.pages || params.pages.length === 1 && !params.pages[0]) {
      // only set default of Cat and Dog for enwiki
      if (this.project === 'en.wikipedia') {
        params.pages = ['Cat', 'Dog'];
        this.setArticleSelectorDefaults(params.pages);
      }
    } else if (this.normalized) {
      params.pages = this.underscorePageNames(params.pages);
      this.setArticleSelectorDefaults(params.pages);
    } else {
      this.normalizePageNames(params.pages).then(data => {
        this.normalized = true;

        params.pages = data;

        if (params.pages.length === 1) {
          this.chartType = this.getFromLocalStorage('pageviews-chart-preference') || 'Bar';
        }

        this.setArticleSelectorDefaults(this.underscorePageNames(params.pages));
      });
    }
  }

  /**
   * Processes Mediawiki API results into Select2 format based on settings
   * @param {Object} data - data as received from the API
   * @returns {Object} data ready to handed over to Select2
   */
  processSearchResults(data) {
    const query = data ? data.query : {};
    let results = [];

    if (this.autocomplete === 'autocomplete') {
      if (query.prefixsearch.length) {
        results = query.prefixsearch.map(function(elem) {
          return {
            id: elem.title.score(),
            text: elem.title
          };
        });
      }
    } else if (this.autocomplete === 'autocomplete_redirects') {
      /** first merge in redirects */
      if (query.redirects) {
        results = query.redirects.map(red => {
          return {
            id: red.from.score(),
            text: red.from
          };
        });
      }

      Object.keys(query.pages).forEach(pageId => {
        const pageData = query.pages[pageId];
        results.push({
          id: pageData.title.score(),
          text: pageData.title
        });
      });
    }

    return {results: results};
  }

  /**
   * Get all user-inputted parameters except the pages
   * @param {boolean} [specialRange] whether or not to include the special range instead of start/end, if applicable
   * @return {Object} project, platform, agent, etc.
   */
  getParams(specialRange = true) {
    let params = {
      project: $(config.projectInput).val(),
      platform: $(config.platformSelector).val(),
      agent: $('#agent-select').val()
    };

    /**
     * Override start and end with custom range values, if configured (set by URL params or setupDateRangeSelector)
     * Valid values are those defined in config.specialRanges, constructed like `{range: 'last-month'}`,
     *   or a relative range like `{range: 'latest-N'}` where N is the number of days.
     */
    if (this.specialRange && specialRange) {
      params.range = this.specialRange.range;
    } else {
      params.start = this.daterangepicker.startDate.format('YYYY-MM-DD');
      params.end = this.daterangepicker.endDate.format('YYYY-MM-DD');
    }

    return params;
  }

  /**
   * Replaces history state with new URL hash representing current user input
   * Called whenever we go to update the chart
   * @returns {null} nothing
   */
  pushParams() {
    const pages = $(config.articleSelector).select2('val') || [],
      escapedPages = pages.join('|').replace(/[&%]/g, escape);

    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, document.title,
        `#${$.param(this.getParams())}&pages=${escapedPages}`
      );
    }

    $('.permalink').prop('href', `#${$.param(this.getPermaLink())}&pages=${escapedPages}`);
  }

  /**
   * Removes all article selector related stuff then adds it back
   * Also calls updateChart
   * @returns {null} nothing
   */
  resetArticleSelector() {
    const articleSelector = $(config.articleSelector);
    articleSelector.off('change');
    articleSelector.select2('val', null);
    articleSelector.select2('data', null);
    articleSelector.select2('destroy');
    $('.data-links').hide();
    this.setupArticleSelector();
  }

  /**
   * Removes chart, messages, and resets article selections
   * @returns {null} nothing
   */
  resetView() {
    $('.chart-container').html('');
    $('.chart-container').removeClass('loading');
    $('#chart-legend').html('');
    $('.message-container').html('');
    this.resetArticleSelector();
  }

  /**
   * Save a particular setting to session and localStorage
   *
   * @param {string} key - settings key
   * @param {string|boolean} value - value to save
   * @returns {null} nothing
   */
  saveSetting(key, value) {
    this[key] = value;
    this.setLocalStorage(`pageviews-settings-${key}`, value);
  }

  /**
   * Save the selected settings within the settings modal
   * Prefer this implementation over a large library like serializeObject or serializeJSON
   * @returns {null} nothing
   */
  saveSettings() {
    /** track if we're changing to no_autocomplete mode */
    const wasAutocomplete = this.autocomplete === 'no_autocomplete';

    $.each($('#settings-modal input'), (index, el) => {
      if (el.type === 'checkbox') {
        this.saveSetting(el.name, el.checked ? 'true' : 'false');
      } else if (el.checked) {
        this.saveSetting(el.name, el.value);
      }
    });

    this.daterangepicker.locale.format = this.dateFormat;
    this.daterangepicker.updateElement();
    this.setupSelect2Colors();

    /**
     * If we changed to/from no_autocomplete we have to reset the article selector entirely
     *   as setArticleSelectorDefaults is super buggy due to Select2 constraints
     * So let's only reset if we have to
     */
    if ((this.autocomplete === 'no_autocomplete') !== wasAutocomplete) {
      this.resetArticleSelector();
    }

    this.updateChart(true);
  }

  /**
   * Directly set articles in article selector
   * Currently is not able to remove underscore from page names
   *
   * @param {array} pages - page titles
   * @returns {array} - untouched array of pages
   */
  setArticleSelectorDefaults(pages) {
    pages.forEach(page => {
      const escapedText = $('<div>').text(page).html();
      $('<option>' + escapedText + '</option>').appendTo(config.articleSelector);
    });
    $(config.articleSelector).select2('val', pages);
    $(config.articleSelector).select2('close');

    return pages;
  }

  /**
   * Sets up the article selector and adds listener to update chart
   * @returns {null} - nothing
   */
  setupArticleSelector() {
    const articleSelector = $(config.articleSelector);

    let params = {
      ajax: this.getArticleSelectorAjax(),
      tags: this.autocomplete === 'no_autocomplete',
      placeholder: $.i18n('article-placeholder'),
      maximumSelectionLength: 10,
      minimumInputLength: 1
    };

    articleSelector.select2(params);
    articleSelector.on('change', this.updateChart.bind(this));
  }

  /**
   * Get ajax parameters to be used in setupArticleSelector, based on this.autocomplete
   * @return {object|null} to be passed in as the value for `ajax` in setupArticleSelector
   */
  getArticleSelectorAjax() {
    if (this.autocomplete !== 'no_autocomplete') {
      /**
       * This ajax call queries the Mediawiki API for article name
       * suggestions given the search term inputed in the selector.
       * We ultimately want to make the endpoint configurable based on whether they want redirects
       */
      return {
        url: `https://${this.project}.org/w/api.php`,
        dataType: 'jsonp',
        delay: 200,
        jsonpCallback: 'articleSuggestionCallback',
        data: search => this.getSearchParams(search.term),
        processResults: this.processSearchResults.bind(this),
        cache: true
      };
    } else {
      return null;
    }
  }

  /**
   * Attempt to fine-tune the pointer detection spacing based on how cluttered the chart is
   * @returns {null} nothing
   */
  setChartPointDetectionRadius() {
    if (this.chartType !== 'Line') return;

    if (this.numDaysInRange() > 50) {
      Chart.defaults.Line.pointHitDetectionRadius = 3;
    } else if (this.numDaysInRange() > 30) {
      Chart.defaults.Line.pointHitDetectionRadius = 5;
    } else if (this.numDaysInRange() > 20) {
      Chart.defaults.Line.pointHitDetectionRadius = 10;
    } else {
      Chart.defaults.Line.pointHitDetectionRadius = 20;
    }
  }

  /**
   * sets up the daterange selector and adds listeners
   * @returns {null} - nothing
   */
  setupDateRangeSelector() {
    const dateRangeSelector = $(config.dateRangeSelector);

    /** transform config.specialRanges to have i18n as keys */
    let ranges = {};
    Object.keys(config.specialRanges).forEach(key => {
      ranges[$.i18n(key)] = config.specialRanges[key];
    });

    dateRangeSelector.daterangepicker({
      locale: {
        format: this.dateFormat,
        applyLabel: $.i18n('apply'),
        cancelLabel: $.i18n('cancel'),
        customRangeLabel: $.i18n('custom-range'),
        daysOfWeek: [
          $.i18n('su'),
          $.i18n('mo'),
          $.i18n('tu'),
          $.i18n('we'),
          $.i18n('th'),
          $.i18n('fr'),
          $.i18n('sa')
        ],
        monthNames: [
          $.i18n('january'),
          $.i18n('february'),
          $.i18n('march'),
          $.i18n('april'),
          $.i18n('may'),
          $.i18n('june'),
          $.i18n('july'),
          $.i18n('august'),
          $.i18n('september'),
          $.i18n('october'),
          $.i18n('november'),
          $.i18n('december')
        ]
      },
      startDate: moment().subtract(config.defaults.daysAgo, 'days'),
      minDate: config.minDate,
      maxDate: config.maxDate,
      ranges: ranges
    });

    /** so people know why they can't query data older than August 2015 */
    $('.daterangepicker').append(
      $('<div>')
        .addClass('daterange-notice')
        .html($.i18n('date-notice', document.title, "<a href='http://stats.grok.se' target='_blank'>stats.grok.se</a>"))
    );

    /**
     * The special date range options (buttons the right side of the daterange picker)
     *
     * WARNING: we're unable to add class names or data attrs to the range options,
     * so checking which was clicked is hardcoded based on the index of the LI,
     * as defined in config.specialRanges
     */
    $('.daterangepicker .ranges li').on('click', e => {
      const index = $('.daterangepicker .ranges li').index(e.target),
        container = this.daterangepicker.container,
        inputs = container.find('.daterangepicker_input input');
      this.specialRange = {
        range: Object.keys(config.specialRanges)[index],
        value: `${inputs[0].value} - ${inputs[1].value}`
      };
    });

    /** the "Latest N days" links */
    $('.date-latest a').on('click', e => {
      this.setSpecialRange(`latest-${$(e.target).data('value')}`);
    });

    dateRangeSelector.on('apply.daterangepicker', (e, action) => {
      if (action.chosenLabel === $.i18n('custom-range')) {
        this.specialRange = null;

        /** force events to re-fire since apply.daterangepicker occurs before 'change' event */
        this.daterangepicker.updateElement();
      }
    });

    dateRangeSelector.on('change', e => {
      this.setChartPointDetectionRadius();
      this.updateChart();

      /** clear out specialRange if it doesn't match our input */
      if (this.specialRange && this.specialRange.value !== e.target.value) {
        this.specialRange = null;
      }
    });
  }

  /**
   * General place to add page-wide listeners
   * @returns {null} - nothing
   */
  setupListeners() {
    super.setupListeners();

    $('.download-csv').on('click', this.exportCSV.bind(this));
    $('.download-json').on('click', this.exportJSON.bind(this));
    $('#platform-select, #agent-select').on('change', this.updateChart.bind(this));

    /** changing of chart types */
    $('.modal-chart-type a').on('click', e => {
      this.chartType = $(e.currentTarget).data('type');
      this.setLocalStorage('pageviews-chart-preference', this.chartType);
      this.updateChart();
    });

    // window.onpopstate = popParams();
  }

  /**
   * Setup listeners for project input
   * @returns {null} - nothing
   */
  setupProjectInput() {
    $(config.projectInput).on('change', e => {
      if (!e.target.value) {
        e.target.value = config.defaults.project;
        return;
      }
      if (this.validateProject()) return;
      this.resetView();

      this.updateInterAppLinks();
    });
  }

  /**
   * Setup colors for Select2 entries so we can dynamically change them
   * This is a necessary evil, as we have to mark them as !important
   *   and since there are any number of entires, we need to use nth-child selectors
   * @returns {CSSStylesheet} our new stylesheet
   */
  setupSelect2Colors() {
    /** first delete old stylesheet, if present */
    if (this.colorsStyleEl) this.colorsStyleEl.remove();

    /** create new stylesheet */
    this.colorsStyleEl = document.createElement('style');
    this.colorsStyleEl.appendChild(document.createTextNode('')); // WebKit hack :(
    document.head.appendChild(this.colorsStyleEl);

    /** add color rules */
    config.colors.forEach((color, index) => {
      this.colorsStyleEl.sheet.insertRule(`.select2-selection__choice:nth-of-type(${index + 1}) { background: ${color} !important }`, 0);
    });

    return this.colorsStyleEl.sheet;
  }

  /**
   * Set values of form based on localStorage or defaults, add listeners
   * @returns {null} nothing
   */
  setupSettingsModal() {
    /** fill in values, everything is either a checkbox or radio */
    this.fillInSettings();

    /** add listener */
    $('.save-settings-btn').on('click', this.saveSettings.bind(this));
    $('.cancel-settings-btn').on('click', this.fillInSettings.bind(this));
  }

  /**
   * The mother of all functions, where all the chart logic lives
   * Really needs to be broken out into several functions
   *
   * @param {boolean} force - whether to force the chart to re-render, even if no params have changed
   * @returns {null} - nothin
   */
  updateChart(force) {
    let articles = $(config.articleSelector).select2('val') || [];

    this.pushParams();

    /** prevent duplicate querying due to conflicting listeners */
    if (!force && location.hash === this.params && this.prevChartType === this.chartType) {
      return;
    }

    if (!articles.length) {
      this.resetView();
      return;
    }

    this.params = location.hash;
    this.prevChartType = this.chartType;
    this.clearMessages(); // clear out old error messages

    /** Collect parameters from inputs. */
    const startDate = this.daterangepicker.startDate.startOf('day'),
      endDate = this.daterangepicker.endDate.startOf('day');

    this.destroyChart();
    $('.message-container').html('');
    $('.chart-container').addClass('loading');

    let labels = []; // Labels (dates) for the x-axis.
    let datasets = []; // Data for each article timeseries
    let errors = []; // Queue up errors to show after all requests have been made
    let promises = [];

    /**
     * Asynchronously collect the data from Analytics Query Service API,
     * process it to Chart.js format and initialize the chart.
     */
    articles.forEach((article, index) => {
      const uriEncodedArticle = encodeURIComponent(article);
      /** @type {String} Url to query the API. */
      const url = (
        `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${this.project}` +
        `/${$(config.platformSelector).val()}/${$('#agent-select').val()}/${uriEncodedArticle}/daily` +
        `/${startDate.format(config.timestampFormat)}/${endDate.format(config.timestampFormat)}`
      );
      const promise = $.ajax({
        url: url,
        dataType: 'json'
      });
      promises.push(promise);

      promise.success(data => {
        // FIXME: these needs fixing too, sometimes doesn't show zero
        this.fillInZeros(data, startDate, endDate);

        /** Build the article's dataset. */
        if (config.linearCharts.includes(this.chartType)) {
          datasets.push(this.getLinearData(data, article, index));
        } else {
          datasets.push(this.getCircularData(data, article, index));
        }

        /** fetch the labels for the x-axis on success if we haven't already */
        if (data.items && !labels.length) {
          labels = data.items.map(elem => {
            return moment(elem.timestamp, config.timestampFormat).format(this.dateFormat);
          });
        }
      }).fail(data => {
        if (data.status === 404) {
          this.writeMessage(
            `<a href='${this.getPageURL(article)}'>${article.descore()}</a> - ${$.i18n('api-error-no-data')}`
          );
          articles = articles.filter(el => el !== article);

          if (!articles.length) {
            $('.chart-container').html('');
            $('.chart-container').removeClass('loading');
          }
        } else {
          errors.push(data.responseJSON.detail[0]);
        }
      });
    });

    $.when(...promises).always(data => {
      $('#chart-legend').html(''); // clear old chart legend

      if (errors.length && errors.length === articles.length) {
        /** something went wrong */
        $('.chart-container').removeClass('loading');
        const errorMessages = Array.from(new Set(errors)).map(error => `<li>${error}</li>`).join('');
        return this.writeMessage(
          `${$.i18n('api-error')}<ul>${errorMessages}</ul><br/>${$.i18n('api-error-contact')}`,
          true
        );
      }

      if (!articles.length) return;

      /** preserve order of datasets due to asyn calls */
      let sortedDatasets = new Array(articles.length);
      datasets.forEach(dataset => {
        sortedDatasets[articles.indexOf(dataset.label.score())] = dataset;
      });

      /** export built datasets to global scope Chart templates */
      window.chartData = sortedDatasets;

      $('.chart-container').removeClass('loading');
      const options = Object.assign({},
        config.chartConfig[this.chartType].opts,
        config.globalChartOpts
      );
      const linearData = {labels: labels, datasets: sortedDatasets};

      $('.chart-container').html('');
      $('.chart-container').append("<canvas class='aqs-chart'>");
      const context = $(config.chart)[0].getContext('2d');

      if (config.linearCharts.includes(this.chartType)) {
        this.chartObj = new Chart(context)[this.chartType](linearData, options);
      } else {
        this.chartObj = new Chart(context)[this.chartType](sortedDatasets, options);
      }

      $('#chart-legend').html(this.chartObj.generateLegend());
      $('.data-links').show();
    });
  }

  /**
   * Checks value of project input and validates it against site map
   * @returns {boolean} whether the currently input project is INvalid
   */
  validateProject() {
    let project = $(config.projectInput).val();

    /** Remove www hostnames since the pageviews API doesn't expect them. */
    if (project.startsWith('www.')) {
      project = project.substring(4);
      $(config.projectInput).val(project);
    }

    if (siteDomains.includes(project)) {
      $('.validate').remove();
      $('.select2-selection--multiple').removeClass('disabled');
    } else {
      this.resetView();
      this.writeMessage(
        $.i18n('invalid-project', `<a href='//${project}'>${project}</a>`),
        true
      );
      $('.select2-selection--multiple').addClass('disabled');
      return true;
    }
  }
}

$(document).ready(() => {
  /** assume query params are supposed to be hash params */
  if (document.location.search && !document.location.hash) {
    return document.location.href = document.location.href.replace('?', '#');
  } else if (document.location.search) {
    return document.location.href = document.location.href.replace(/\?.*/, '');
  }

  $.extend(Chart.defaults.global, {animation: false, responsive: true});

  new PageViews();
});
