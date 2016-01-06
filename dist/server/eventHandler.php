<?php
require_once('./vendor/autoload.php');

$app_id = '163546';
$app_key = '1af1d4c26abef175083a';
$app_secret = 'b06bd7deadbe3c59cd79';

$pusher = new Pusher(
  $app_key,
  $app_secret,
  $app_id,
  array('encrypted' => true)
);
?>
