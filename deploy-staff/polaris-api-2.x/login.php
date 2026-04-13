<?php

use RCPL\Polaris\Request;
if (!isset($_SERVER["DOCUMENT_ROOT"])) {
  $_SERVER["DOCUMENT_ROOT"] = getcwd();
}

require_once(__DIR__.'/vendor/autoload.php');

use RCPL\Polaris\Client;

$ini_array = parse_ini_file($_SERVER["DOCUMENT_ROOT"]."/private/staff.ini");

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

  $normalizeName = strtolower($data->username);

  $allowedUsers=[
    "sstokes",
    "smcclain",
    "jhaile",
    "bblanchard",
    "dfranke",
    "jacquelinep",
    "jacobson",
    "dwillman",
    "sjamall"
  ];

  try {
    $result = $client->staff->auth();
    if ($result->PAPIErrorCode < 0) {
      $message = "Auth failed";
      $exception = new Exception($message);
      throw $exception;
    }

    if (!in_array($normalizeName, $allowedUsers)) {
      $message = "User not autherized";
      $exception = new Exception($message);
      throw $exception;
    }

    http_response_code(200);
    //$json_output = json_encode($result);
    //var_dump($result);
    $returnData = [
      'username' => $data->username,
    ];
    $json_output = json_encode($returnData);
    echo $json_output;
  } catch (Throwable $e) {
    http_response_code(402);
    echo "Auth failed";
  }
}