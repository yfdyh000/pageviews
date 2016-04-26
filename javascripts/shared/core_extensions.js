/**
 * @file Core JavaScript extensions, either to native JS or a library.
 *   Polyfills have their own file [polyfills.js](global.html#polyfills)
 * @author MusikAnimal
 * @copyright 2016 MusikAnimal
 * @license MIT License: https://opensource.org/licenses/MIT
 */

String.prototype.descore = function() {
  return this.replace(/_/g, ' ');
};
String.prototype.score = function() {
  return this.replace(/ /g, '_');
};

/*
 * HOT PATCH for Chart.js GetElementsAtEvent
 * https://github.com/chartjs/Chart.js/issues/2299
 * TODO: remove me when this gets implemented into Charts.js core
 */
Chart.Controller.prototype.getElementsAtEvent = function(e) {
  let helpers = Chart.helpers;
  let eventPosition = helpers.getRelativePosition(e, this.chart);
  let elementsArray = [];

  let found = (function() {
    if (this.data.datasets) {
      for (let i = 0; i < this.data.datasets.length; i++) {
        if (helpers.isDatasetVisible(this.data.datasets[i])) {
          for (let j = 0; j < this.data.datasets[i].metaData.length; j++) {
            /* eslint-disable max-depth */
            if (this.data.datasets[i].metaData[j].inLabelRange(eventPosition.x, eventPosition.y)) {
              return this.data.datasets[i].metaData[j];
            }
          }
        }
      }
    }
  }).call(this);

  if (!found) {
    return elementsArray;
  }

  helpers.each(this.data.datasets, function(dataset, dsIndex) {
    if (helpers.isDatasetVisible(dataset)) {
      elementsArray.push(dataset.metaData[found._index]);
    }
  });

  return elementsArray;
};
