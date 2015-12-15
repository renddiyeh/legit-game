<?php

$params = array();
if(count($_GET) > 0) {
    $params = $_GET;
}
// defaults
$description = '「想讓一條法案活著過三讀，真的超級難！」不相信？不如你親自來死看看～';
$url = 'http://legislator.thenewslens.com/game/';
$img = $url . 'assets/fb.jpg';
if($params['d']) {
  $id = $params['d'];
  $description = ($id == 0) ? '我推動的法案活著通過三讀了！想體驗立委生活不必跳火圈，你要不要也來試試看？' : '我推動的法案死在立法院了！想跟體驗立委生活不必跳火圈，你要不要也來試試看？';
  $img .= $url . 'assets/fb/' . $id . '-01.jpg';
  $url .= '?d=' . $id;
}

?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>一百種殺死法案的方法</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no">
  <meta name="description" content="「想讓一條法案活著過三讀，真的超級難！」不相信？不如你親自來死看看～">
  <meta property="og:url" content="<?= $url ?>" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="一百種殺死法案的方法" />
  <meta property="og:description" content="<?= $description ?>" />
  <meta property="og:image" content="<?= $img ?>" />

  <!-- build:css main.min.css -->
  <link rel="stylesheet" href="css/main.css">
  <!-- /build -->
</head>

<body class="bg-orange">
  <div class="wrapper">
    <div id="legi-game" class="game" style="font-family: 'Heiti TC', 'Microsoft YaHei'"></div>
    <div id="info">
      <img src="assets/gameover/others.png" data-sr="enter bottom, over 1s">
      <div id="law"></div>
      <div class="btn btn-again margin-medium" data-sr="enter bottom, over 0.5s">
        <img src="assets/gameover/again.png">
      </div>
      <div id="share" class="btn btn-share margin-medium" data-sr="enter bottom, over 0.5s">
        <img src="assets/gameover/share.png">
      </div>
      <div id="more" class="btn btn-more margin-medium" data-sr="enter bottom, over 0.5s">
        <img src="assets/overview/more.png">
      </div>
    </div>
  </div>
  <div id="orientation"></div>

  <script src="js/lib/phaser.js"></script>

  <!-- build:js main.min.js -->
  <script src="js/main.min.js"></script>
  <!-- /build -->

</body>
</html>

