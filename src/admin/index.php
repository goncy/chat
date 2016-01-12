<?php
include "../server/_db.php";
$con = crearConexion();

if ($con->connect_error) {
  die("Connection failed: " . $con->connect_error);
}

$message = "Bienvenido";
$action = isset($_POST['action']) ? $_POST['action'] : "noaction";

if($action === "changePass"){
  if(!isset( $_POST['nameSala'], $_POST['passAdmin'])){
    $message = "Ingrese la sala y la contraseña de administrador por favor.";
  }elseif(strlen( $_POST['nameSala']) > 20 || strlen($_POST['nameSala']) < 4){
    $message = "La sala no es valida.";
  }elseif(strlen( $_POST['passSala']) > 20){
    $message = "El largo del password no es valido.";
  }elseif (ctype_alnum($_POST['nameSala']) != true){
    $message = "La sala debe ser alphanumerica";
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
      $message = "Se encontraron errores en los datos, intente nuevamente";
    }
  }
}elseif($action === "login"){
  if(!isset( $_POST['nameSala'], $_POST['passAdmin'])){
    $message = "Ingrese la sala y la contraseña de administrador por favor.";
  }elseif(strlen( $_POST['nameSala']) > 20 || strlen($_POST['nameSala']) < 4){
    $message = "La sala no es valida.";
  }elseif (ctype_alnum($_POST['nameSala']) != true){
    $message = "La sala debe ser alphanumerica";
  }else{
    $nameSala = (!isset($_POST['nameSala']) || is_null($_POST['nameSala'])) ? "nodata" : $_POST['nameSala'];
    $passAdmin = (!isset($_POST['passAdmin']) || is_null($_POST['passAdmin'])) ? "nodata" : $_POST['passAdmin'];

    $stmt = $con->prepare("SELECT COUNT(*) as existe FROM salas WHERE nombre = ? AND passadmin = ?");

    $stmt->bind_param("ss", $nameSala, $passAdmin);
    $stmt->execute();

    $stmt-> bind_result($col1);
    $result = $stmt->fetch();

    if($col1 > 0){
      session_start();
      $_SESSION["admin"] = $nameSala;
      $message = "Iniciaste sesion en " . $nameSala;
      $stmt->close();
    }else{
      $message = "Se encontraron errores en los datos, intente nuevamente";
    }
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
<div class="container" id="action">
  <div class="row">
    <div class="col-sm-12 col-md-8 col-lg-6 col-md-offset-2 col-lg-offset-3">
      <div class="modal-content" method="post" class="form-signin">
        <div class="modal-header">
            <h4 class="modal-title">¿Que queres hacer?</h4>
        </div>
        <div class="modal-body">
          <a href="#" class="btn btn-block btn-default" onclick="$('#iniciarSesion').slideDown();$('#cambiarPass').slideUp();$('#action').slideUp();">Iniciar sesion</a>
          <a href="#" class="btn btn-block btn-default" onclick="$('#iniciarSesion').slideUp();$('#cambiarPass').slideDown();$('#action').slideUp();">Cambiar contraseña a sala</a>
        </div>
        <div class="modal-footer">
          <p class="text-center text-danger" style="margin-bottom:0px"><?php echo $message ?></p>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="container" id="iniciarSesion" style="display:none">
  <div class="row">
    <div class="col-sm-12 col-md-8 col-lg-6 col-md-offset-2 col-lg-offset-3">
      <form class="modal-content" method="post" class="form-signin">
            <div class="modal-header">
                <h4 class="modal-title">Iniciar sesión</h4>
            </div>
            <div class="modal-body">
                <div class="input-group" style="width:100%">
                    <input type="text" name="nameSala" id="nameSala" class="form-control" maxlength="15" placeholder="Nombre de sala" value="" style="width:100%">
                </div>
                <div class="input-group" style="width:100%">
                    <input type="password" name="passAdmin" id="passAdmin" class="form-control" maxlength="15" placeholder="Contraseña de administrador" value="" style="width:100%">
                </div>
            </div>
            <div class="modal-footer">
                <p class="text-center text-danger" style="margin-bottom:20px"><?php echo $message ?></p>
                <input type="hidden" name="action" value="login">
                <button type="submit" class="btn btn-default btn-block">Iniciar sesión</button>
                <button type="button" class="btn btn-default btn-block" onclick="$('#action').slideDown();$('#iniciarSesion').slideUp();">Volver</button>
            </div>
        </form>
    </div>
  </div>
</div>

<div class="container" id="cambiarPass" style="display:none">
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
                <input type="hidden" name="action" value="changePass">
                <button type="submit" class="btn btn-default btn-block">Enviar</button>
                <button type="button" class="btn btn-default btn-block" onclick="$('#action').slideDown();$('#cambiarPass').slideUp();">Volver</button>
            </div>
        </form>
    </div>
  </div>
</div>

<script src="https://code.jquery.com/jquery-2.1.4.js"></script>

<script>
  $('#passInput').focus();

  if(typeof(Storage) !== "undefined") {
    localStorage.setItem("admin", "<?php echo $_SESSION['admin'] ?>");
  } else {
    alert("Tu navegador no soporta inicio de sesion por cookies, por favor, cambia de navegador.");
  }
</script>

</body>
</html>