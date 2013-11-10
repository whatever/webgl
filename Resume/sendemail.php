<?php

date_default_timezone_set('America/New_York');

$name    = $_POST['name']    ? $_POST['name'] : 'Undefined Name';
$email   = $_POST['email']   ? $_POST['email'] : 'nobody@nowhere.com';
$company = $_POST['company'] ? $_POST['company'] : 'Undefined Company';
$website = $_POST['website'] ? $_POST['website'] : 'Undefined Website';
$message = $_POST['message'] ? $_POST['message'] : 'Undefined Message';

$to = "not.mattowen@gmail.com";
$subject = 'Resume | ' . date('m.d.y');
$text = <<<h
Name ...... $name
Email ..... $email
Company ... $company
Website ... $website

$message
h;

$result = mail($to, $subject, $text);

header('Content-type: application/json');

if ($result)
  echo json_encode(array('resp' => 0, 'message' => 'very successful'));
else
  echo json_encode(array('resp' => 1, 'message' => 'such bad'));

?>
