<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');

use RCPL\Polaris\Request;
use RCPL\Polaris\Client;
if (!isset($_SERVER["DOCUMENT_ROOT"])) {
  $_SERVER["DOCUMENT_ROOT"] = getcwd();
}
try {

  require_once(__DIR__.'/vendor/autoload.php');

  $ini_array = parse_ini_file("../../private/staff.ini");

  if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $jsonData = file_get_contents('php://input');
    $data = json_decode($jsonData);
    $client = new Client([
      'ACCESS_ID' => $ini_array["API_ACCESS_ID"],
      'ACCESS_KEY' => $ini_array["API_KEY"],
      'HOST' => $ini_array["TEST_HOST"],
      'STAFF_DOMAIN' => $ini_array['STAFF_DOMAIN'],
      'STAFF_ID' =>  $ini_array["API_ACCESS_ID"],
      'STAFF_USERNAME' => $ini_array["ADMIN_USER"],
      'STAFF_PASSWORD' => $ini_array["ADMIN_PASSWORD"],
      'WORKSTATION_ID' => '1',
      'DEFAULT_PATRON_BRANCH_ID' => '0'
    ]);

    try {
      $patron = $client->patron->get($data->username);
      $result = $patron->authenticate($data->password);
      $data = $patron->basicData();
      //$subsetData = ['email' => $data['EmailAddress']];
      if ($result != null) {
        try {
          $return_data=[
            "email" => $data->EmailAddress,
            "nameFirst" => $data->NameFirst,
            "nameLast" => $data->NameLast,
          ];
          header('Content-Type: application/json');
          echo json_encode($return_data);
          //echo json_encode($subsetData, JSON_PRETTY_PRINT);
          http_response_code(200);
        } catch (Exception $e) {
          http_response_code(401);
          echo $e;
        }
      } else
        throw new Exception("401 Patron Auth Failed");
    } catch (Throwable $e) {
      http_response_code(401);
      echo $e;
    }
  }
}
catch(Throwable $e) {
  http_response_code(500);
  echo $e;
}