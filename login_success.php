<?php
  session_start();
  if (!isset($_SESSION["name"])) {
    if ($ajax) {
      http_response_code(401);
      die("Sinun on kirjauduttava sisään!");
    } else {
      header("Location: login.php");
    }
  }
?>