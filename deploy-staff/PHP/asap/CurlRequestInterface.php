<?php

interface CurlRequestInterface {
	public function beginRequest();
	public function addHeader($name, $value);
}