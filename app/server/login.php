<?php
session_start();

include "_db.php";
$con = crearConexion();

if ($con->connect_error) {
	die("Connection failed: " . $con->connect_error);
}

$postdata = file_get_contents("php://input");
$request = json_decode($postdata,true);

if(!isset( $request['sala'], $request['password'])){
	echo "Ingrese una contraseña por favor";
}else{
	$sala = $request['sala'];
	$password = $request['password'];

	$stmt = $con->prepare("SELECT passsala FROM salas WHERE nombre = ?");
	$stmt->bind_param("s", $sala);
	$stmt->execute();

	$stmt-> bind_result($col1);

	while ($stmt-> fetch()) {
		if($col1 == $password){
      echo "true";
			//$_SESSION['sala'] = $sala;
		}else{
      echo "false";
			//$message = "El password es incorrecto";
		}
	}

	$stmt->close();
}
?>
