<?php

require_once('DBModel.php');

class TitleRequest extends DBModel
{
	public $id;
	public $barcode;
	public $title;
	public $author;
	public $identifier;
	public $format;
	public $publication;
	public $autohold;
	public $status;
	public $created;
	public $agegroup;
	public $editedBy;
	public $notes;
	public $bibid;
	public static function loadTitleRequests($status = -1)
	{
		$pdoconnection = self::fetchPDOConnection();

		switch ($status) {
			// case -1:
			// 	$query = "SELECT * FROM title_requests WHERE publication > NOW() ";
			// 	break;
			// case 0:
			// 	$query = "SELECT * FROM title_requests WHERE status = {$status} AND publication <= NOW()";
			// 	break;
			default:
				$query = "SELECT * FROM title_requests WHERE status = {$status}";
		}
		try {
			$result = $pdoconnection->query($query);

			$titleRequests = [];
			if ($result->rowCount() > 0) {
				// Output data of each row
				while ($row = $result->fetch()) {
					$titleRequests[] = self::createFromData($row);
				}
				unset($result);
			} 
		} catch (PDOException $e) {
			echo "Error: " . $e->getMessage();
		}
		return $titleRequests;
	}

	public static function add($json)
	{
		$pdo_connection = self::fetchPDOConnection();

		try {
			$data = json_decode($json, true);
			//$cleaned_data = json_encode($data);
			$barcode = addslashes($data['barcode']);
			$title = addslashes(ucwords($data['title']));
			$author = addslashes($data['author']);
			$identifier = addslashes("");
			if (array_key_exists('isbn', $data) && $data['isbn'] != null) {
				$identifier = addslashes($data['isbn']);
			}
			$format = addslashes($data['format']);
			$agegroup = addslashes($data['agegroup']);
			$email = addslashes($data['email']);
			$publication = addslashes($data['publication']);
			$autohold = 1;
			$status = addslashes($data['status']);
			// Instert all the new tags for that category.
			//$insert_query = "INSERT INTO title_requests (barcode, title, author, identifier, format, publication, autohold, status) VALUES (?,?,?,?,?,?,?,?)";


			$limit_query = "SELECT *
							FROM title_requests
							WHERE created >= CURDATE() - INTERVAL (WEEKDAY(CURDATE()) + 7) DAY
  							AND created <  CURDATE() - INTERVAL WEEKDAY(CURDATE()) DAY;
							AND [barcode] = ?";
			$stmt = $pdo_connection->prepare($limit_query);
			if (!$stmt) {
				die(print_r(sqlsrv_errors(), true));
			}

			$stmt->execute([$barcode]);

			$requestsThisWeek = $stmt->rowCount();
			if ($requestsThisWeek >= 5) {
				echo "All 5 suggestions used for the week";
				http_response_code(406); //TODO: Handle this and check if patron already has 5 holds this week
			}


			$insert_query = "INSERT INTO title_requests
			(barcode, title, author, identifier, publication, autohold, status, email,  agegroup, format, editedBy, notes) VALUES
			(:barcode, :title, :author, :identifier, :publication, :autohold, :status, :email, :agegroup, :format, 'system', '')";

			$stmt = $pdo_connection->prepare($insert_query);
			$stmt->bindParam(':barcode', $barcode, PDO::PARAM_STR);
			$stmt->bindParam(':title', $title, PDO::PARAM_STR);
			$stmt->bindParam(':author', $author, PDO::PARAM_STR);
			$stmt->bindParam(':identifier', $identifier, PDO::PARAM_STR);
			$stmt->bindParam(':publication', $publication, PDO::PARAM_STR);
			$stmt->bindParam(':autohold', $autohold, PDO::PARAM_INT);
			$stmt->bindParam(':status', $status, PDO::PARAM_STR);
			$stmt->bindParam(':email', $email, PDO::PARAM_STR);
			$stmt->bindParam(':agegroup', $agegroup, PDO::PARAM_STR);
			$stmt->bindParam(':format', $format, PDO::PARAM_STR);
			// $stmt = sqlsrv_prepare(
			// 	$sqlsrv_connection,
			// 	$insert_query,
			// 	array(&$barcode, &$title, &$author, &$identifier, &$publication, &$autohold, &$status, &$email, &$agegroup, &$format)
			// );
			$stmt->execute();
		} catch (PDOException $e) {
			echo "Error: " . $e->getMessage();
		}
	}

	public static function update($json)
	{
		$data = json_decode($json, true);
		$pdo_connection = self::fetchPDOConnection();

		$title = addslashes(ucwords($data['title']));
		$author = addslashes($data['author']);
		$identifier = addslashes($data['identifier']);
		$format = addslashes($data['format']);
		$agegroup = addslashes($data['agegroup']);
		$status = addslashes($data['status']);
		$notes = addslashes($data['notes']);
		$editedBy = addslashes($data['editedBy']);
		$publication = addslashes($data['publication']);
		$bibid = "";
		if (array_key_exists('bibid', $data) && $data['bibid'] != null) {
			$bibid = addslashes($data['bibid']);
		}
		$query = "UPDATE title_requests SET
			status = ?,
			title = ?,
			author = ?,
			identifier = ?,
			notes = ?,
			format = ?,
			editedBy = ?,
			agegroup = ?,
			publication = ?,
			bibid = ?
			WHERE id = ?";

		$stmt = $pdo_connection->prepare($query);
		$stmt->execute([$status, $title, $author, $identifier, $notes, $format, $editedBy, $agegroup, $publication, $bibid, $data['id']]);
	}

	public function jsonSerialize(): mixed
	{
		return [
			'id' => $this->id,
			'barcode' => $this->barcode,
			'title' => $this->title,
			'author' => $this->author,
			'identifier' => $this->identifier,
			'format' => $this->format,
			'publication' => $this->publication,
			'autohold' => $this->autohold,
			'status' => $this->status,
			'created' => $this->created,
			'agegroup' => $this->agegroup,
			'editedBy' => $this->editedBy,
			'notes' => $this->notes,
			'bibid' => $this->bibid,
		];
	}

	protected static function createFromData($data)
	{
		$tr = new TitleRequest();
		$tr->id = $data['id'];
		$tr->barcode = $data['barcode'];
		$tr->title = $data['title'];
		$tr->author = $data['author'];
		$tr->identifier = $data['identifier'];
		$tr->format = $data['format'];
		$tr->publication = $data['publication'];
		$tr->autohold = $data['autohold'];
		$tr->status = $data['status'];
		$tr->created = $data['created'];
		$tr->agegroup = $data['agegroup'];
		$tr->notes = $data['notes'];
		$tr->editedBy = $data['editedBy'];
		$tr->bibid = $data['bibid'];

		return $tr;
	}
}
