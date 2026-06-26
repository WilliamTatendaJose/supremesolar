<?php
header('Content-Type: application/json');

if (empty($_POST['name']) || empty($_POST['subject']) || empty($_POST['message']) || !filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please complete all fields with a valid email address.']);
    exit();
}

$name = trim(strip_tags($_POST['name']));
$email = trim(filter_var($_POST['email'], FILTER_SANITIZE_EMAIL));
$m_subject = trim(strip_tags($_POST['subject']));
$message = trim(strip_tags($_POST['message']));

$to = 'support@supremesolar.co.zw';
$subject = "Website enquiry: $m_subject";
$body = "You have received a new message from your website contact form.\n\nHere are the details:\n\nName: $name\nEmail: $email\nSubject: $m_subject\n\nMessage:\n$message";
$headers = "From: $email\r\n" .
    "Reply-To: $email\r\n" .
    "X-Mailer: PHP/" . phpversion();

if (mail($to, $subject, $body, $headers)) {
    echo json_encode(['success' => true, 'message' => 'Your message has been sent.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Your message could not be sent right now. Please try again later.']);
}
?>
