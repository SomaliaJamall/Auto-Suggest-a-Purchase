<?php

require_once('DBModel.php');

class Staff extends DBModel {
	public $id;
	public $name;
	public $library;

	public static function loadStaff($staffId) {
		$mysqli_connection = Self::fetchDBConnection();

		$query = "SELECT * FROM staff where id=?";
		$statement = $mysqli_connection->prepare($query);
		$statement->bind_param('i', $staffId);
		
		$statement->execute();
		$result = $statement->get_result();
		$rows = $result->fetch_all(MYSQLI_ASSOC);

		if(!empty($rows)) {
			return Self::createFromData($rows[0]);
		}
	
		return null;
	}

	public function jsonSerialize(): mixed {
		return [
			'id' => $this->id,
			'name' => $this->name,
			'library' => $this->library,
		];
	}

	protected static function createFromData($data) {
		$tr = new TitleRequest();
		$tr->id = $data['id'];
		$tr->name = $data['name'];
		$tr->library = $data['library'];
		return $tr;
	}
}