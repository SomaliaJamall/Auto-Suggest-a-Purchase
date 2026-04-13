<?php

require_once('TitleRequest.php');
$status = -1;
if(isset($_GET['status'])) {
	$status = $_GET['status'];
}

try{
	$titleRequests = TitleRequest::loadTitleRequests($status);
	echo json_encode($titleRequests);
}catch (Throwable $e) {
    echo "Error: " . $e->getMessage();
    http_response_code(500);
}