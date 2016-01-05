<?php
session_start();

include "_db.php";
$con = crearConexion();

if ($con->connect_error) {
	die("Connection failed: " . $con->connect_error);
}

$postdata = file_get_contents("php://input");
$request = json_decode($postdata,true);

if(!isset( $request['sala'])){
	echo "Ingrese una sala por favor";
}else{
	$sala = $request['sala'];
	$password = $request['password'];

	$stmt = $con->prepare("SELECT passsala FROM salas WHERE nombre = ?");
	$stmt->bind_param("s", $sala);
	$stmt->execute();

	$stmt-> bind_result($col1);

	while ($stmt-> fetch()) {
		if($col1 == $password || empty($col1)){
      echo "true";
		}else{
      echo "false";
		}
	}

	$stmt->close();
}
?>
