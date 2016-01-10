<?php
include "../server/_db.php";
$con = crearConexion();

if ($con->connect_error) {
  die("Connection failed: " . $con->connect_error);
}

$message = "Bienvenido";

if(!isset( $_POST['nameSala'], $_POST['passAdmin'], $_POST['passSala'])){
  $message = "Ingrese la sala y la contraseña de administrador por favor.";
}elseif(strlen( $_POST['nameSala']) > 20 || strlen($_POST['nameSala']) < 4){
  $message = "La sala no es valida.";
}elseif(strlen( $_POST['passSala']) > 20 || strlen($_POST['passSala']) < 4){
  $message = "El largo del password no es valido.";
}elseif (ctype_alnum($_POST['passSala']) != true){
  $message = "La sala debe ser alphanumerica";
}elseif (ctype_alnum($_POST['nameSala']) != true){
  $message = "La contraseña debe ser alphanumerica";
}else{
  $nameSala = (!isset($_POST['nameSala']) || is_null($_POST['nameSala'])) ? "nodata" : $_POST['nameSala'];
  $passAdmin = (!isset($_POST['passAdmin']) || is_null($_POST['passAdmin'])) ? "nodata" : $_POST['passAdmin'];
  $passSala = (!isset($_POST['passSala']) || is_null($_POST['passSala'])) ? "nodata" : $_POST['passSala'];

  $stmt = $con->prepare("SELECT COUNT(*) as existe FROM salas WHERE nombre = ? AND passadmin = ?");
  $stmt2 = $con->prepare("UPDATE salas SET passsala = ? WHERE nombre = ? AND passadmin = ?");

  $stmt->bind_param("ss", $nameSala, $passAdmin);
  $stmt->execute();

  $stmt-> bind_result($col1);
  $result = $stmt->fetch();

  if($col1 > 0){
    $stmt->close();
    $stmt2->bind_param("sss", $passSala, $nameSala, $passAdmin);
    if($stmt2->execute()){
      $message = "La contraseña fue establecida correctamente";
    }else{
      $message = "Se encontraron errores en los datos de update, intente nuevamente";
    }
  }else{
    $message = "Se encontraron errores en los datos, intente nuevamente, count vale " . $col1 . ", namesala: " . $nameSala . ", passadmin: " . $passAdmin;
  }     
}
?>

<!DOCTYPE html>
<html lang="en" class="no-js">

<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Chat admin</title>
  <meta name="description" content="Chat online de distintos canales desarrollado por Gonzalo Pozzo">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://bootswatch.com/cosmo/bootstrap.min.css">
  <link rel="stylesheet" href="../css/chat.css">

  <link rel="shortcut icon" href="../img/favicon.ico">
  <link rel="icon" href="../img/favicon.ico">
</head>

<body>
<div class="container">
  <div class="row">
    <div class="col-sm-12 col-md-8 col-lg-6 col-md-offset-2 col-lg-offset-3">
      <form class="modal-content" method="post" class="form-signin">
            <div class="modal-header">
                <h4 class="modal-title">Cambiar contraseña a sala</h4>
            </div>
            <div class="modal-body">
                <div class="input-group" style="width:100%">
                    <input type="text" name="nameSala" id="nameSala" class="form-control" maxlength="15" placeholder="Nombre de sala" value="" style="width:100%">
                </div>
                <div class="input-group" style="width:100%">
                    <input type="password" name="passAdmin" id="passAdmin" class="form-control" maxlength="15" placeholder="Contraseña de administrador" value="" style="width:100%">
                </div>
                <div class="input-group" style="width:100%">
                    <input type="password" name="passSala" id="passSala" class="form-control" maxlength="15" placeholder="Contraseña para la sala" value="" style="width:100%">
                </div>
            </div>
            <div class="modal-footer">
                <p class="text-center text-danger" style="margin-bottom:20px"><?php echo $message ?></p>
                <button type="submit" class="btn btn-default btn-block">Enviar</button>
            </div>
        </form>
    </div>
  </div>
</div>

<script src="https://code.jquery.com/jquery-2.1.4.js"></script>

<script>
  $('#passInput').focus();
</script>

</body>
</html>