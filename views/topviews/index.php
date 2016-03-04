<!DOCTYPE html>
<html>
  <head>
    <?php include '../_head.php' ?>
    <title>Topviews Analysis</title>
  </head>
  <body>
    <div class='container'>
      <div class='col-lg-offset-2'>
        <!-- Header -->
        <header class='row aqs-row'>
          <div class='col-lg-10 text-center'>
            <h4>
              <strong>
                Topviews Analysis
              </strong>
            </h4>
          </div>
        </header>
        <!-- Site notice -->
        <div class='col-lg-10 text-center site-notice-wrapper'>
          <div class='site-notice'></div>
        </div>
        <div class='row aqs-row options'>
          <!-- Date range selector -->
          <div class='col-lg-4 col-sm-4'>
            <label for='range-input'>Date</label>
            <input class='form-control aqs-date-range-selector' id='range-input'>
          </div>
          <!-- Project selector -->
          <div class='col-lg-3 col-sm-4'>
            <label for='project-input'>Project</label>
            <input class='form-control aqs-project-input' id='project-input' placeholder='en.wikipedia.org'>
          </div>
          <!-- .col-lg-3 -->
          <!-- %label{for: "platform-select"} Namespace -->
          <!-- %select#platform-select.form-control -->
          <!-- %option{value: "all"} All -->
          <!-- %option{value: "1"} Main -->
          <!-- %option{value: "2"} Mobile app -->
          <!-- %option{value: "3"} Mobile web -->
          <!-- Advanced options -->
          <div class='col-lg-3 col-sm-4'>
            <label for='platform-select'>Platform</label>
            <select class='form-control' id='platform-select'>
              <option value='all-access'>All</option>
              <option value='desktop'>Desktop</option>
              <option value='mobile-app'>Mobile app</option>
              <option value='mobile-web'>Mobile web</option>
            </select>
          </div>
        </div>
        <!-- Article selector -->
        <div class='row aqs-row'>
          <div class='col-lg-10'>
            <label for='article-input'>Excluded pages</label>
            <select class='aqs-article-selector col-lg-12' id='article-input' multiple='multiple'></select>
          </div>
        </div>
        <!-- Chart -->
        <div class='chart-container col-lg-10'></div>
        <div class='col-lg-10 text-center'>
          <a class='expand-chart' href='#'>Show more</a>
        </div>
        <div class='message-container col-lg-10'></div>
        <!-- Other links -->
        <div class='col-lg-10 data-links'>
          <hr>
          <!-- Download as -->
          <!-- %a.download-csv{href: "#"} CSV -->
          <!-- \&middot; -->
          <!-- %a.download-json{href: "#"} JSON -->
        </div>
        <?php
          $app = "topviews";
          include "../_footer.php";
        ?>
      </div>
    </div>
  </body>
</html>