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
	if($request['action'] === "hasPassword"){
		$sala = $request['sala'];

		$stmt = $con->prepare("SELECT passsala,COUNT(*) as existe FROM salas WHERE nombre = ?");
		$stmt->bind_param("s", $sala);
		$stmt->execute();

		$stmt-> bind_result($col1,$col2);

		$devolucion = [];

		while ($stmt-> fetch()) {
			if(empty($col1) || $col2 < 1){
				$devolucion['status'] = "false";
			}else{
	      $devolucion['status'] = "true";
			}
		}

		echo json_encode($devolucion);

		$stmt->close();
	}else if($request['action'] === "login" && isset($request['password'])){
		$sala = $request['sala'];
		$password = $request['password'];

		$stmt = $con->prepare("SELECT passsala,COUNT(*) as existe FROM salas WHERE nombre = ?");
		$stmt->bind_param("s", $sala);
		$stmt->execute();

		$stmt-> bind_result($col1,$col2);

		$devolucion = [];

		while ($stmt-> fetch()) {
			if($col1 == $password || empty($col1) || $col2 < 1){
				$devolucion['status'] = "true";
				$devolucion['partner'] = $col2 > 0 ? "true" : "false";
			}else{
	      $devolucion['status'] = "false";
	      $devolucion['partner'] = $col2 > 0 ? "true" : "false";
			}
		}

		echo json_encode($devolucion);

		$stmt->close();
	}
}
?>
