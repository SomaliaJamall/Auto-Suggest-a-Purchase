<?php

require_once('PolarisRequest.php');
require_once('TitleRequest.php');

processRequest();

function processRequest() {
	$action = 'updateTitleRequest';
	switch($action) {
		case 'authenticate':
			$response = authenticatePatron();
			print_r($response);
			$r = basicDataGet("199999", '1234');
			print_r($r);
		break;
		case "getTitleRequests":
			$titleRequests = TitleRequest::loadTitleRequests();
			echo json_encode($titleRequests);
			break;
		case 'getTitleRequest':
			$id = 1; //$_GET['id']
			$titleRequest = TitleRequest::loadTitleRequest($id);
			echo json_encode($titleRequest);
			break;
		case 'addTitleRequest':
			addTitleRequest();
			break;
		case 'updateTitleRequest':
			updateTitleRequest();
			break;
	}
}

function authenticatePatron() {
	$userName = '199999';
	$password = '1234';

	$request = new PolarisRequest('/authenticator/patron');

	$body = [];
	$body['Barcode'] = $userName;
	$body['Password'] = $password;

	return $request->beginPostRequest('', json_encode($body));
}

function basicDataGet($userName, $pin) {
	$request = new PolarisRequest('/patron/' . $userName . '/basicdata');
	return $request->beginGetRequest($pin);
}

function addTitleRequest() {
	$json = '{
			  "barcode": "FJP0000000000",
			  "pin": "0709",
			  "author": "Mary Shelly",
			  "title": "Frankenstien",
			  "isbn": "ISBN02829200393",
			  "format": "book",
			  "publication": "01/01/0001",
			  "autohold": "autohold"
			}';

	TitleRequest::add($json);
}

function updateTitleRequest() {
		// $json = '{
		// 	  "id": "2",
		// 	  "barcode": "FJP0000000000",
		// 	  "author": "M. Shelly",
		// 	  "title": "Frankenstien",
		// 	  "isbn": "ISBN02829200393",
		// 	  "format": "book",
		// 	  "publication": "01/01/0001",
		// 	  "autohold": "autohold",
		// 	  "status": "1"
		// 	}';
		$json = '{
		  "id": "2",
		  "author": "Shelly",
		  "status": "3"
		}';
	TitleRequest::update($json);
}
