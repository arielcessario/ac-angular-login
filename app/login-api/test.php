<?php

session_start();
//require_once 'user.php';
require_once 'MyDBi.php';

$data = file_get_contents("php://input");

$decoded = json_decode($data);


echo $decoded->function;