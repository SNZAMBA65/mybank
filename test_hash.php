<?php
$stored_hash = '$2y$13$aYXbeGVGJVHHYvsrIOGcoOQnrZbzMAj6AshWouF3pT9h/v5b8Jj8O';
$password = 'password123';
echo "Test avec 'password123': ";
var_dump(password_verify($password, $stored_hash));

$password2 = 'password';
echo "Test avec 'password': ";
var_dump(password_verify($password2, $stored_hash));
?>
