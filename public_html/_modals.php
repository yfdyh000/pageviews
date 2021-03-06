<div class="modal fade" id="chart-type-modal" role="dialog" tabindex="-1">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button class="close" arialabel="Close" data-dismiss="modal" type="button">
          <span ariahidden="true">&times;</span>
        </button>
        <h4 class="modal-title">
          <?php echo $I18N->msg( 'chart-types' ); ?>
        </h4>
      </div>
      <div class="modal-body">
        <div>
          <strong>
            <?php echo $I18N->msg( 'daily-pageviews' ); ?>
          </strong>
          <span class="modal-chart-type">
            <a class="js-test-line-chart" data-dismiss="modal" data-type="Line" href="#">
              <img src="/pageviews/images/line-chart-small.jpg">
              <?php echo $I18N->msg( 'line' ); ?>
            </a>
          </span>
          <span class="modal-chart-type">
            <a class="js-test-bar-chart" data-dismiss="modal" data-type="Bar" href="#">
              <img src="/pageviews/images/bar-chart-small.jpg">
              <?php echo $I18N->msg( 'bar' ); ?>
            </a>
          </span>
          <span class="modal-chart-type">
            <a data-dismiss="modal" data-type="Radar" href="#">
              <img src="/pageviews/images/radar-chart-small.jpg">
              <?php echo $I18N->msg( 'radar' ); ?>
            </a>
          </span>
        </div>
        <hr>
        <div>
          <strong>
            <?php echo $I18N->msg( 'total-pageviews' ); ?>
          </strong>
          <span class="modal-chart-type">
            <a class="js-test-pie-chart" data-dismiss="modal" data-type="Pie" href="#">
              <img src="/pageviews/images/pie-chart-small.jpg">
              <?php echo $I18N->msg( 'pie' ); ?>
            </a>
          </span>
          <span class="modal-chart-type">
            <a data-dismiss="modal" data-type="Doughnut" href="#">
              <img src="/pageviews/images/doughnut-chart-small.jpg">
              <?php echo $I18N->msg( 'doughnut' ); ?>
            </a>
          </span>
          <span class="modal-chart-type">
            <a data-dismiss="modal" data-type="PolarArea" href="#">
              <img src="/pageviews/images/polararea-chart-small.jpg">
              <?php echo $I18N->msg( 'polar-area' ); ?>
            </a>
          </span>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-default" data-dismiss="modal" type="button">
          <?php echo $I18N->msg( 'cancel' ); ?>
        </button>
      </div>
    </div>
  </div>
</div>
<div class="modal fade" id="settings-modal" role="dialog" tabindex="-1">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button arialabel="Close" class="close" data-dismiss="modal" type="button">
          <span ariahidden="true">&times;</span>
        </button>
        <h4 class="modal-title">
          <?php echo $I18N->msg( 'settings' ); ?>
        </h4>
      </div>
      <form class="modal-body">
        <p>
          <?php echo $I18N->msg( 'settings-notice' ); ?>
        </p>
        <fieldset class="radio-list">
          <?php echo $I18N->msg( 'search-method' ); ?>
          <div class="radio">
            <label>
              <input class="js-test-prefixsearch" name="autocomplete" type="radio" value="autocomplete">
              <?php echo $I18N->msg( 'autocompletion' );; ?>
            </label>
          </div>
          <div class="radio">
            <label>
              <input class="js-test-opensearch" name="autocomplete" type="radio" value="autocomplete_redirects">
              <?php echo $I18N->msg( 'autocompletion-redirects' );; ?>
            </label>
          </div>
          <div class="radio">
            <label>
              <input name="autocomplete" type="radio" value="no_autocomplete">
              <?php echo $I18N->msg( 'no-autocompletion' ); ?>
            </label>
          </div>
        </fieldset>
        <fieldset>
          <?php echo $I18N->msg( 'other-options' ); ?>
          <div class="checkbox">
            <label>
              <input class="js-test-format-numbers" name="numericalFormatting" type="checkbox">
              <?php echo $I18N->msg( 'format-numbers' ); ?>
            </label>
          </div>
          <div class="checkbox">
            <label>
              <input class="js-test-localize-dates" name="localizeDateFormat" type="checkbox">
              <?php echo $I18N->msg( 'localize-dates' ); ?>
            </label>
          </div>
        </fieldset>
      </form>
      <div class="modal-footer">
        <button class="btn btn-default cancel-settings-btn" data-dismiss="modal" type="button">
          <?php echo $I18N->msg( 'cancel' ); ?>
        </button>
        <button class="btn btn-primary save-settings-btn" data-dismiss="modal" type="button">
          <?php echo $I18N->msg( 'save' ); ?>
        </button>
      </div>
    </div>
  </div>
</div>