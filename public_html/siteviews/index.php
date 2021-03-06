<!-- Siteviews Analysis tool -->
<!-- Copyright 2016 MusikAnimal -->
<!DOCTYPE html>
<html>
  <head>
    <?php include '../_head.php'; ?>
    <title><?php echo $I18N->msg( 'siteviews-title' ); ?></title>
  </head>
  <body class="<?php echo $rtl; ?>">
    <div class="container">
      <header class="col-lg-10 col-lg-offset-1 aqs-row text-center">
        <h4>
          <strong>
            <?php echo $I18N->msg( 'siteviews-title' ); ?>
          </strong>
        </h4>
      </header>
      <main class="col-lg-10 col-lg-offset-1">
        <!-- Site notice -->
        <div class="text-center site-notice-wrapper">
          <div class="site-notice">
            <?php include "../_browser_check.php"; ?>
          </div>
        </div>
        <div class="row aqs-row options">
          <!-- Date range selector -->
          <div class="col-lg-5 col-sm-5">
            <label for="range-input">
              <?php echo $I18N->msg( 'dates' ); ?>
            </label>
            <span class="date-latest">
              <?php
                $days = array(10, 20, 30, 60, 90);
                $dayLinks = '';
                foreach ( $days as $day ) {
                  $dayLinks .= " <a data-value='{$day}' href='#'>{$day}</a>";
                }
              ?>
              <?php echo $I18N->msg( 'latest-days', array( 'variables' => array( $dayLinks ) ) ); ?>
            </span>
            <input class="form-control aqs-date-range-selector" id="range-input">
          </div>
          <!-- Advanced options -->
          <div class="col-lg-3 col-sm-3">
            <label for="data-source-select">
              Data source
            </label>
            <select class="form-control" id="data-source-select">
              <option value="pageviews">
                Pageviews
              </option>
              <option value="unique-devices">
                Unique devices
              </option>
            </select>
          </div>
          <div class="col-lg-2 col-sm-2">
            <label for="platform-select">
              <?php echo $I18N->msg( 'platform' ); ?>
            </label>
            <select class="form-control" id="platform-select">
              <option value="all-access" data-value="all-access" data-ud-value="all-sites">
                <?php echo $I18N->msg( 'all' ); ?>
              </option>
              <option value="desktop" data-value="desktop" data-ud-value="desktop-site">
                <?php echo $I18N->msg( 'desktop' ); ?>
              </option>
              <option class="platform-select--mobile-web" value="mobile-app">
                <?php echo $I18N->msg( 'mobile-app' ); ?>
              </option>
              <option value="mobile-web" data-value="mobile-web" data-ud-value="mobile-site">
                <?php echo $I18N->msg( 'mobile-web' ); ?>
              </option>
            </select>
          </div>
          <div class="col-lg-2 col-sm-2">
            <label for="agent-select">
              <?php echo $I18N->msg( 'agent' ); ?>
            </label>
            <select class="form-control" id="agent-select">
              <option value="all-agents">
                <?php echo $I18N->msg( 'all' ); ?>
              </option>
              <option selected="selected" value="user">
                <?php echo $I18N->msg( 'user' ); ?>
              </option>
              <option value="spider">
                <?php echo $I18N->msg( 'spider' ); ?>
              </option>
              <option value="bot">
                <?php echo $I18N->msg( 'bot' ); ?>
              </option>
            </select>
          </div>
        </div>
        <!-- Site selector -->
        <div class="row aqs-row">
          <div class="col-lg-12">
            <label for="site-input">
              <?php echo $I18N->msg( 'projects' ); ?>
            </label>
            <select class="aqs-site-selector col-lg-12" id="site-input" multiple="multiple"></select>
          </div>
        </div>
        <!-- Chart -->
        <div class="chart-container col-lg-12 loading">
          <canvas class="aqs-chart"></canvas>
        </div>
        <div class="message-container col-lg-12"></div>
        <!-- Legend -->
        <div class="col-lg-12 tm clearfix" id="chart-legend"></div>
        <!-- Other links -->
        <div class="col-lg-12 data-links">
          <a class="js-test-change-chart" data-target="#chart-type-modal" data-toggle="modal" href="#"><span class="glyphicon glyphicon-th"></span>
          <?php echo $I18N->msg( 'change-chart' ); ?></a>
          &nbsp;&bullet;&nbsp;
          <a class="js-test-settings" data-target="#settings-modal" data-toggle="modal" href="#"><span class="glyphicon glyphicon-wrench"></span>
          <?php echo $I18N->msg( 'settings' ); ?></a>
          &bullet;&nbsp;
          <a class="permalink" href="#"><span class="glyphicon glyphicon-link"></span>
          <?php echo $I18N->msg( 'permalink' ); ?></a>
          &nbsp;&bullet;&nbsp;
          <span class="glyphicon glyphicon-download-alt"></span>
          <?php $csvlink = "<a class='download-csv' href='#'>" . $I18N->msg( 'csv' ) . "</a>"; ?>
          <?php echo $I18N->msg( 'download', array( 'variables' => array( $csvlink ), 'parsemag' => true ) ); ?>
          &middot;
          <a class="download-json" href="#"><?php echo $I18N->msg( 'json' ); ?></a>
          <?php include "../_lang_selector.php"; ?>
        </div>
        <?php $currentApp = "siteviews"; ?>
        <?php $columns = 12; ?>
        <?php include "../_footer.php"; ?>
      </main>
      <?php include "../_modals.php"; ?>
    </div>
  </body>
</html>