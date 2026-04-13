<?php

class CurlRequest {
	private $url; //The request url.
	protected $curl_options; //array of curl configuration options.
	protected $http_headers; //array of name value http headers.

	public function __construct($url) {
		//TODO: validate that $url is valid.
		$this->url = $url;
		$curl_options = array();
		$http_headers = array();
	}

	public function setTimeout($seconds) {
		$this->curl_options[CURLOPT_TIMEOUT] = $seconds;
	}

	/************************************/
	/*        Header Functions          */
	/************************************/
	public function addHeader($name, $value) {
		//TODO validate that $name and $value are valid.
		$this->http_headers[$name] = $value;
	}

	private function prepareRequestHeaders() {
		$prepared_headers = array();
		foreach ($this->http_headers as $key => $value) {
			$prepared_headers[] = $key . ': ' . $value;
		}

		return $prepared_headers; 
	}

	/************************************/
	/*        Request Functions         */
	/************************************/
	public function makeGetRequest() {
		return $this->makeRequest();
	}

	public function makePostRequest($post_body = null) {
		$this->curl_options[CURLOPT_POST] = true;

		//I think we need to set this value else the lenght won't be calculated correctly
		$this->curl_options[CURLOPT_POSTFIELDS] = $post_body;

		return $this->makeRequest();
	}

	public function makePutRequest($post_body = null) {

		if($post_body) {
			$this->curl_options[CURLOPT_CUSTOMREQUEST] = "PUT";
			$this->curl_options[CURLOPT_POSTFIELDS] = $post_body;
		}
		else {
			$this->curl_options[CURLOPT_PUT] = true;
		}

		return $this->makeRequest();
	}

	public function makeDeleteRequest() {
		$this->curl_options[CURLOPT_CUSTOMREQUEST] = 'DELETE';
		return $this->makeRequest();
	}

	//Take in a curl_request as this allows the caller to set specific parameters and attributes.
	protected function makeRequest() {
		// $start_time = microtime(true);
		$curl_request = curl_init($this->url);
		// error_log(print_r($this->url, true));
		//return the response data as a result of curl_exec
		$this->curl_options[CURLOPT_RETURNTRANSFER] = 1;

		//If there are headers add them to the request
		if(!empty($this->http_headers)) {
			// error_log(print_r($this->PrepareRequestHeaders(), true));
			$this->curl_options[CURLOPT_HTTPHEADER] = $this->PrepareRequestHeaders();
		}
		// error_log(print_r($this->curl_options, true));

		//Set the curl configuration.
		curl_setopt_array($curl_request, $this->curl_options);
		// curl_setopt($curl_request, CURLOPT_SSL_VERIFYPEER, false);
		// curl_setopt($curl_request, CURLOPT_SSL_VERIFYHOST, false);

		// This allows curl to follow 301
		curl_setopt($curl_request, CURLOPT_FOLLOWLOCATION, true);

		$response = curl_exec($curl_request);

		//check for an error.
		$request_info = curl_getinfo($curl_request);

		// error_log(print_r(curl_getinfo($curl_request), true)); error_log('RESPONSE: ' . print_r($response, true));
		// error_log(print_r(curl_error($curl_request), true));

		if($request_info['http_code'] === 0) {
			throw new CurlRequestException(0, curl_error($curl_request));
		}

		if($request_info['http_code'] !== 200) {
			throw new CurlRequestException((int)$request_info['http_code'], $response);
		}

		// drupal_set_message('URL:' . $this->url, 'warn');
		// drupal_set_message('Response' . print_r($response,true), 'warn');
		if($response === FALSE) {
			throw new \Exception(curl_error($curl_request));
		}

		// error_log('Error Number ' . curl_errno($curl_request) . "\n");
		curl_close($curl_request);
		// error_log("**** EXECUTION TIME: " . (microtime(true) - $start_time) . "\n");

		return $response;
	}
}