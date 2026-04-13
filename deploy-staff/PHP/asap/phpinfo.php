<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
if(!isset($_SERVER["DOCUMENT_ROOT"])){
    $_SERVER["DOCUMENT_ROOT"] = getcwd();
}
phpinfo();