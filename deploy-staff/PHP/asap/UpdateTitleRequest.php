<?php
require __DIR__.'/PHPMailer-master/src/PHPMailer.php';
require __DIR__.'/PHPMailer-master/src/SMTP.php';
require __DIR__.'/PHPMailer-master/src/Exception.php';
require_once 'TitleRequest.php';
require_once(__DIR__.'/../../polaris-api-2.x/vendor/autoload.php');

use RCPL\Polaris\Request;
use RCPL\Polaris\Client;
if (!isset($_SERVER["DOCUMENT_ROOT"])) {
    $_SERVER["DOCUMENT_ROOT"] = getcwd();
}


use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$json = file_get_contents('php://input');
$result = TitleRequest::update($json);

$ini_array = parse_ini_file($_SERVER["DOCUMENT_ROOT"]."/private/staff.ini");

$formats = [
    "Book",
    "eBook",
    "Audiobook (Physical CD)",
    "Audiobook (Digital)",
    "DVD",
    "CD"
];

$ageGroups = [
    "Adult",
    "Teen",
    "Children"
];


if ($result === true) {
    echo 'Suggestion has been updated<br />';
    $data = json_decode($json, true);
    try {
        if (array_key_exists('action', $data)) {
            echo $data["action"];
            $client = new Client([
                'ACCESS_ID' => $ini_array["API_ACCESS_ID"],
                'ACCESS_KEY' => $ini_array["API_KEY"],
                'HOST' => $ini_array["TEST_HOST"],
                'STAFF_DOMAIN' => $ini_array['STAFF_DOMAIN'],
                'STAFF_ID' =>  $ini_array["API_ACCESS_ID"],
                'STAFF_USERNAME' => $ini_array["ADMIN_USER"],
                'STAFF_PASSWORD' => $ini_array["ADMIN_PASSWORD"],
                'WORKSTATION_ID' => '1',
                'DEFAULT_PATRON_BRANCH_ID' => '0'
            ]);

            try {
                $patron = $client->patron->get($data["barcode"]);
                $patronData = $patron->data();
                var_dump($patron->data());
                try {
                    $title = str_replace('/', '', $data['title']);
                    $author = str_replace('/', '', $data['author']);
                    $firstName = ucwords(strtolower($patronData->NameFirst));
                    $lastName = ucwords(strtolower($patronData->NameLast));
                    $emailBody = "";
                    $emailAltBody="";
                    $subjectLine = "Your Material Purchase Suggestion";
                    if ($data["action"] == "alreadyOwn") {
                        $emailBody = <<<EOT
                            <p>Hello, {$firstName} {$lastName}</p>
                            
                            <p>Great news! The collection development team has reviewed your suggestion and your Library already owns {$title} by {$author} in {$formats[$data["format"]]} format.</p>
                            
                            <p>A hold will be placed for {$title} by {$author} on the card {$data["barcode"]}.</p>
                            
                            <p>This is a free service provided by your Public Library.</p>
                            EOT;

                        $emailAltBody = "
                            Hello {$firstName} {$lastName},
                            
                            Great news! The collection development team has reviewed your suggestion and your Library already owns {$title} by {$author} in {$formats[$data["format"]]} format.
                            
                            A hold will be placed for {$title} by {$author} on the card {$data["barcode"]}.
                            
                            This is a free service provided by the your Library.";
                    } elseif ($data["action"] == "reject") {
                        if ((int)$data["format"] == 0) { //print book
                            $emailBody = <<<EOT
                                <p>Hello {$firstName} {$lastName},</p>
                                
                                <p>The collection development team has reviewed your suggestion and {$title} by {$author} in {$formats[$data["format"]]} format is unable to be purchased at this time. You may wish to consider requesting the item through Interlibrary Loan (ILL), a cooperative borrowing agreement among library systems nationwide.</p>
                                
                                <p>More information can be found on our website <a href="https://jaxpubliclibrary.org/services/interlibrary-loan">Library's Interlibrary Loan webpage</a>. For additional assistance, please call 904-255-2665 or visit the <a href="https://askalibrarian.org/local.php?LibraryName=Jacksonville+Public+Library&DepartmentNumber=22849&utm_source=web&utm_medium=web&utm_campaign=Ask+a+Librarian+topnav&utm_id=ask_a_librarian_topnav">Ask A Librarian Help Center</a> to chat with or email us.</p>
                                
                                <p>Thank you again for your suggestion.</p>
                                EOT;

                            $emailAltBody = "
                                Hello {$firstName} {$lastName},
                                
                                The collection development team has reviewed your suggestion and {$title} by {$author} in {$formats[$data["format"]]} format is unable to be purchased at this time. You may wish to consider requesting the item through Interlibrary Loan (ILL), a cooperative borrowing agreement among library systems nationwide.
                                
                                More information can be found on the Library's Interlibrary Loan webpage. For additional assistance, please call 904-255-2665 or visit the Ask A Librarian Help Center to chat with or email us.
                                
                                Thank you again for your suggestion.";
                        } else {//other formats
                            $emailBody = <<<EOT
                                <p>Hello {$firstName} {$lastName},</p>
                                
                                <p>The collection development team has reviewed your suggestion and {$title} by {$author} in {$formats[$data["format"]]} format is unable to be purchased at this time.</p>
                                
                                <p>If you have any questions, please call 904-255-2665 or visit the <a href="https://askalibrarian.org/local.php?LibraryName=Jacksonville+Public+Library&DepartmentNumber=22849&utm_source=web&utm_medium=web&utm_campaign=Ask+a+Librarian+topnav&utm_id=ask_a_librarian_topnav">Ask A Librarian Help Center</a> to chat with or email us.</p>
                                
                                <p>Thank you again for your suggestion.</p>
                                
                                EOT;

                            $emailAltBody = "
                                Hello {$firstName} {$lastName},
                                
                                The collection development team has reviewed your suggestion and {$title} by {$author} in {$formats[$data["format"]]} format is unable to be purchased at this time. 
                                
                                If you have any questions, please call 904-255-2665 or visit the Ask A Librarian Help Center to chat with or email us.
                                
                                Thank you again for your suggestion.";
                        }
                    }
                    $mail = new PHPMailer(true);
                    // Server settings
                    $mail->isSMTP();                                            // Send using SMTP
                    $mail->Host =  $ini_array["SMTP_SERVER"];                     // Set the SMTP server to send through
                    $mail->SMTPAuth = true;                                   // Enable SMTP authentication
                    $mail->Username = $ini_array["SMTP_EMAIL"]; 
                    $mail->Password = $ini_array["SMTP_PASSWORD"]; 
                    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;         // Enable TLS encryption; `PHPMailer::ENCRYPTION_SMTPS` encouraged
                    $mail->Port = 25;                                    // TCP port to connect to, use 465 for `PHPMailer::ENCRYPTION_SMTPS` above

                    // Recipients
                    $mail->setFrom($ini_array["SMTP_EMAIL"], 'Library Collection Development');
                    $mail->addAddress($patronData->EmailAddress, 'Library Customer');     // Add a recipient
                    // $mail->addReplyTo('info@example.com', 'Information');
                    // $mail->addCC('cc@example.com');
                    // $mail->addBCC('bcc@example.com');

                    // Content
                    $mail->isHTML(true);                                  // Set email format to HTML
                    $mail->Subject = $subjectLine;
                    $mail->Body = $emailBody;
                    $mail->AltBody = $emailAltBody;

                    $mail->send();
                    echo 'An email has been sent';
                } catch (Exception $e) {
                    echo 'Error - No email sent';
                    http_response_code(401);
                    echo $e;
                }
            } catch (Throwable $e) {
                http_response_code(500);
                echo $e;
            }


        }
    } catch (Throwable $e) {
        echo "<pre>";
        echo "Message could not be sent. Mailer Error: {$e}";
        echo "</pre>";
        http_response_code(500);
    }
}
