<?php

require_once('CurlRequest.php');
require_once('CurlRequestInterface.php');

class CurlGetRequest extends CurlRequest implements CurlRequestInterface {
	public function __construct($url) {
		parent::__construct($url);
	}

	public function beginRequest() {
		return $this->makeGetRequest();
	}
}