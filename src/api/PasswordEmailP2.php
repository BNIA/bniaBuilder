<?php

// Recieves a user ID
// Gets Email of User.
// Sends new Password


// Get Credentials from a file
require_once('dbCredentials.php');
require_once('crypt.php');
$cred = new Credentials();
$servername = my_decrypt($cred->servername);
$username = my_decrypt($cred->username);
$password = my_decrypt($cred->password);
$database = my_decrypt($cred->database);

// Try to connect to the SQL Server with em
$couldConnectToServer = false;
$conn = new mysqli($servername, $username, $password);

$my_file = 'index.html'; require_once($my_file);

?>
