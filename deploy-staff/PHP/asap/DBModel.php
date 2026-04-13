<?php
error_reporting(E_ALL);

$ini_array = parse_ini_file("../../private/staff.ini");

class DBModel implements JsonSerializable
{
	protected $id;

	private static $sqlsrv_connection;
	private static $pdo_connection;

	protected static function fetchPDOConnection()
	{
		if (!isset(self::$pdo_connection)) {
			try {
				$servername = "db";
				$username = "user";
				$password = "user_password";
				$dbname = "ASAP";

				try {
					self::$pdo_connection = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
					// set the PDO error mode to exception
					self::$pdo_connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
					//echo "Connected successfully";
				} catch(PDOException $e) {
					echo "Connection failed: " . $e->getMessage();
				}

			} catch (Throwable $e) {
				var_dump($e);
			}
		}

		return self::$pdo_connection;
	}

	public function getId()
	{
		return $this->id;
	}

	public function setId(int $id)
	{
		$this->id = $id;
	}

	// JsonSerializable Implementation
	public function jsonSerialize(): mixed
	{
		return [
			strtolower(get_class($this)) . 'Id' => $this->id
		];
	}
}
