<?php
  include('vendor/imageManager/imageManager.php');

  $devolucion = [];
  $filename = substr(str_shuffle(MD5(microtime())), 0, 15);
  $fileext = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);

  $handle = new Upload($_FILES['file'], 'es_ES');

  if ($handle->uploaded) {
    $handle->file_new_name_body = $filename;
    $handle->file_safe_name = true;
    $handle->allowed = array('image/*','video/*');
    $handle->Process('../uploads/');
    if ($handle->processed) {
      $devolucion['path'] = 'uploads/'.$filename.".".$fileext;
    }else{
      $devolucion['error'] = "Error";
    }
    $handle-> Clean();
  }else {
    $devolucion['error'] = "Error";
  }

  echo json_encode($devolucion);
?>
