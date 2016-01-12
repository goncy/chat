<?php
  include('vendor/imageManager/imageManager.php');

  $devolucion = [];
  $filename = strtolower(substr(str_shuffle(MD5(microtime())), 0, 15));
  $fileext = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));

  $handle = new Upload($_FILES['file'], 'es_ES');

  if ($handle->uploaded) {
    $handle->file_new_name_body = $filename;
    $handle->file_safe_name = true;
    $handle->file_max_size = '31457280';
    $handle->allowed = array('image/*','video/*');
    $devolucion['tipo'] = $handle->file_src_mime;
    $handle->Process('../uploads/');
    if ($handle->processed) {
      $devolucion['path'] = 'uploads/'.$filename.".".strtolower($fileext);
    }else{
      $devolucion['error'] = "Error: " . $handle->error;
    }
    $handle-> Clean();
  }else {
    $devolucion['error'] = "Error, no uploaded";
  }

  echo json_encode($devolucion);
?>
