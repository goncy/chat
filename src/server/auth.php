<?php
  //Autenticar
  require_once('./vendor/autoload.php');

  session_start();

  include "_db.php";
  $con = crearConexion();

  if ($con->connect_error) {
  	die("Connection failed: " . $con->connect_error);
  }

  $app_id = '163546';
  $app_key = '1af1d4c26abef175083a';
  $app_secret = 'b06bd7deadbe3c59cd79';

  $pusher = new Pusher(
    $app_key,
    $app_secret,
    $app_id,
    array('encrypted' => true)
  );

  if(!isset( $_POST['sala'], $_POST['password'])){
  	echo "Ingrese una contraseña por favor";
  }else{
  	$sala = $_POST['sala'];
  	$password = $_POST['password'];

  	$stmt = $con->prepare("SELECT passsala FROM salas WHERE nombre = ?");
  	$stmt->bind_param("s", $sala);
  	$stmt->execute();

  	$stmt-> bind_result($col1);

  	while ($stmt-> fetch()) {
  		if($col1 == $password || empty($col1)){
        echo $pusher->presence_auth($_POST['channel_name'], $_POST['socket_id'], "srpao-".$_POST['socket_id'], "");
  		}else{
        echo "false";
  		}
  	}

  	$stmt->close();
  }
?>
