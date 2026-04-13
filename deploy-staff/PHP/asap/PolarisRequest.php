<?php

require_once('CurlGetRequest.php');
require_once('CurlPostRequest.php');
require_once('CurlPutRequest.php');
require_once('CurlRequest.php');
require_once('CurlRequestException.php');
require_once('CurlRequestInterface.php');

//NOTE this file requires CurlRequest class to be loaded.
class PolarisRequest {
	protected $url;
	protected $hash_url;
	private $organization_id = 1;
	protected $config;
	protected $endpoint = "";
	protected $orgId = "";
	protected $accessId = "";
	protected $accessKey = "";
	protected $workstationId = "";
	protected $userId = "";

	public function __construct($action) {
		$this->url = $this->createPolarisUrl($action);
		$this->setHashUrl($action);
	}

	protected function setHashUrl($action){
		$this->hash_url = $this->createPolarisUrl($action);
	}

	private function createPolarisUrl($action) {
		return $this->endpoint . '/' . $this->organization_id . $action;
	}

	//$query_string can be easily created using http_build_query
	public function beginGetRequest($password) {
		$curl_request = new CurlGetRequest($this->url);
		return $this->beginHTTPRequest($curl_request, 'GET', $password);
	}

	public function beginPostRequest($password, $post_body = null) {
		$curl_request = new CurlPostRequest($this->url, $post_body);
		return $this->beginHTTPRequest($curl_request, 'POST', $password);
	}

	public function beginPutRequest($password, $put_body = null) {
		$curl_request = new CurlPutRequest($this->url, $put_body);
		return $this->beginHTTPRequest($curl_request, 'PUT', $password);
	}

	public function beginDeleteRequest($password) {
		$curl_request = new CurlDeleteRequest($this->url);
		return $this->beginHTTPRequest($curl_request, 'DELETE', $password);
	}

	private function beginHTTPRequest($curl_request, $http_method, $password) {
		// throw new CurlRequestException(404);
		if(!($curl_request instanceof CurlRequestInterface)) {
			throw new \Exception('Invalid request_object passed to function try request (1729)');
		}

		//Add authentication headers
		$this->addHeaders($curl_request, $http_method, $password);

		//Make request
		$response = $curl_request->beginRequest();

		//convert the response into a json object;
		$response = json_decode($response);
		if($response === null) { //Unable to process response json
			throw new \Exception("Unable to decode server response"); //TODO: throw a more specific error.
		}

		//check for a polaris error
		if(isset($response->PAPIErrorCode) && $response->PAPIErrorCode < 0) {
			return $this->handlePolarisException($response);
		}

		//if the error code was positive but an error message was set...
		if(!empty($response->ErrorMessage)) {
			//Not sure if this actually happens... this might be best left to the caller... -AM
			error_log($response->ErrorMessage);
		}

		return $response;
	}

	private function addHeaders($curl_request, $http_method, $password) {
		$curl_request->addHeader('Accept', 'text/json');
		$curl_request->addHeader('Content-type', 'application/json');

		$request_date = gmdate('r'); // GMT date/time in RFC-1123'
		$request_date = str_replace('+0000', 'GMT', $request_date);
		$curl_request->addHeader('PolarisDate', $request_date);

		$secret = $http_method . $this->hash_url . $request_date . $password;

		$polaris_access_key = $this->accessKey;
		$hash = hash_hmac('sha1', $secret, $polaris_access_key, true);
		$token = base64_encode($hash);

		$polaris_access_id = $this->accessId;
		$curl_request->addHeader('Authorization', 'PWS ' . $polaris_access_id . ':' . $token);

		$this->addCustomHeaders($curl_request);
	}

	//Override this function to customize the headers using ->AddHeader(name, value)
	protected function addCustomHeaders($request) { }

	//Override this function to customize the hanlding of Polaris Exceptions.
	protected function handlePolarisException($response) {
		error_log('****** POLARIS ERROR *******');
		error_log(print_r($response, true));
		error_log('****************************');
		throw new PolarisRequestException($response);
	}
}
