<?php

require_once('CurlRequest.php');
require_once('CurlRequestInterface.php');

class CurlPutRequest extends CurlRequest implements CurlRequestInterface {
	private $body;

	public function __construct($url, $body = null) {
		parent::__construct($url);
		$this->body = $body;
	}

	public function beginRequest() {
		return $this->makePutRequest($this->body);
	}
}