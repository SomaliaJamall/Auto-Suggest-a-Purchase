<?php
ini_set('display_errors', '1');
require __DIR__.'/PHPMailer-master/src/PHPMailer.php';
require __DIR__.'/PHPMailer-master/src/SMTP.php';
require __DIR__.'/PHPMailer-master/src/Exception.php';
require_once('TitleRequest.php');
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
$json = file_get_contents('php://input');
$result = TitleRequest::add($json);
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

$ini_array = parse_ini_file($_SERVER["DOCUMENT_ROOT"]."/private/staff.ini");

try {

    if ($result === 1) {
        echo 'Suggestion has been logged';
        $data = json_decode($json, true);
        try {
            $mail = new PHPMailer(true);
            // Server settings
            $mail->isSMTP();                                            // Send using SMTP
            $mail->Host = $ini_array["SMTP_SERVER"];                     // Set the SMTP server to send through
            $mail->SMTPAuth = true;                                   // Enable SMTP authentication
            $mail->Username = $ini_array["SMTP_EMAIL"];               // SMTP username
            $mail->Password = $ini_array["SMTP_PASSWORD"];                   // SMTP password
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;         // Enable TLS encryption; `PHPMailer::ENCRYPTION_SMTPS` encouraged
            $mail->Port = $ini_array["SMTP_PORT"];                                    // TCP port to connect to, use 465 for `PHPMailer::ENCRYPTION_SMTPS` above

            // Recipients
            $mail->setFrom($ini_array["SMTP_EMAIL"], 'Library Collection Development');
            $mail->addAddress($data['email'], 'Library Patron');     // Add a recipient
            // $mail->addReplyTo('info@example.com', 'Information');
            // $mail->addCC('cc@example.com');
            // $mail->addBCC('bcc@example.com');

            // Content
            $mail->isHTML(true);                                  // Set email format to HTML
            $mail->Subject = 'Your Material Purchase Suggestion Has been Submitted';
            $firstName = ucwords(strtolower($data['nameFirst']));
            $lastName = ucwords(strtolower($data['nameLast']));
            $title = str_replace('/', '', $data['title']);
            $author = str_replace('/', '', $data['author']);
            $mail->Body = <<<EOT
            <p>Hello {$firstName} {$lastName},</p>
        
        <p>Thanks for your suggestion! The collection development team is reviewing your request for the purchase of {$title} by
        {$author} in {$formats[$data["format"]]} format.</p>
        
        <p>You will receive a follow-up email if we make the purchase.</p>
        
        <p>This is a free service provided by your Public Library.</p>
        EOT;

            $mail->AltBody = "
        Hello {$firstName} {$lastName},
        
        Thanks for your suggestion! The collection development team is reviewing your request for the purchase of {$data['title']} by
        {$data['author']} in {$formats[$data["format"]]} format.
        
        You will receive a follow-up email if we make the purchase. 
        
        This is a free service provided by your Public Library.";

            $mail->send();
            echo 'An email has been sent';
            http_response_code(200);
        } catch (Throwable $e) {
            echo "<pre>";
            echo "Message could not be sent. Mailer Error: {$e}";
            echo "</pre>";
            http_response_code(500);
        }
    }
}catch (Throwable $e) {
    echo "Error: " . $e->getMessage();
    http_response_code(500);
}