<!DOCTYPE html>
<html>
<head>
<title> Installation </title>
</head>
</html>
<body>
<h1> Step 3 of 4 : <small> Database Installation </small> </h1>
<?php
//<?php $my_file  = 'installation.php'; require_once($my_file); ? >

error_reporting(0);
date_default_timezone_set('America/New_York');
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

// If you are unable
if ($conn->connect_error) {
    // Update the Credentials with with any available POST values.
    $servername = (isset($_POST['servername']) ? $_POST['servername'] : $servername);
    $username = (isset($_POST['username']) ? $_POST['username'] : $username);
    //if ($username == ''){ $username = 'root'; }
    $password = (isset($_POST['password']) ? $_POST['password'] : $password);
    //if ($password == ''){ $password = 'admin'; }
    $database = (isset($_POST['database']) ? $_POST['database'] : $database);
    // And overwrite the original file.
    $handle = fopen($my_file, 'w');
    fwrite($handle, "<?php " );
    fwrite($handle, "class Credentials { " );
    fwrite($handle, "var ". '$servername' ." = '". my_encrypt($servername) ."'; " );
    fwrite($handle, "var ". '$username' ." = '". my_encrypt($username) ."'; " );
    fwrite($handle, "var ". '$password' ." = '". my_encrypt($password) ."'; " );
    fwrite($handle, "var ". '$database' ." = '". my_encrypt($database) ."'; " );
    fwrite($handle, "} ?>" );
    fclose($handle); // Close
    //  Then try to connect again
    $conn = new mysqli($servername, $username, $password);
    // If still unable, then the user provided values were invalid, Repromp the user for more POST Values and try again.
    if ($conn->connect_error) {
        ?>
        <h2>Connect to an SQL Server and Create a Database</h2>
        <div style=' padding:5px;'>
            <details><summary>What is this page?</summary>
            <div style='background:rgba(200,200,200,1); padding:15px;'><br>
              Databases allow us to collect analytics on your behalf, provide a log-in system, and much much more. <br>
              For this to happen, the website needs to Log-In to your SQL Server and set up your database!<br>
              What you provide in the input boxes below will be used for <u>all future connections</u> to the SQL Server. <br><br>
            </div>
            </details>
            <details><summary>I'm still confused</summary>
            <div style='background:rgba(200,200,200,1); padding:15px;'><br>
                If you are unsure of what to do on this page, it may be because you are unfamiliar with SQL Servers. <br>
                If you do not know how to access nor administer an SQL Server, follow this <a target="#" href="https://codex.wordpress.org/Installing_WordPress#Step_2:_Create_the_Database_and_a_User"> tutorial </a> to learn just that. <br>
                Do not worry that the link is written for wordpress as the instructions are mutually intelligible.<br> <br>
            </div>
            </details>
            <details><summary>Advanced</summary>
            <div style='background:rgba(200,200,200,1); padding:15px;'><br>
              - This system can non-intrusively install itself into any existing database given in the <span style='color :rgba(255,0,0,1);'>*Optional</span> database field below.<br>
              - Multiple systems can share data sets, administrators & user data by having them all point to the same database. <br>
              - If the System constructs a new database on your behalf, the name of the new database would be something like :<br>"autobuild_[TheFolderNameThisFileIsStoredIn]"<br> <br>
            </div>
            </details>
            <details>
            <summary> <span style='color :rgba(255,0,0,1);'>*Optional</span> Best Practice </summary>
            <div style='background:rgba(200,200,200,1); padding:15px;'><br>
                The following best practice involves the <span style='color :rgba(255,0,0,1);'>*Optional</span> database field
                <details style='padding:5px; margin:10px;'>
                    <summary style='background:rgba(255,100,100,.5); padding:10px;'>
                      Click to learn more
                    </summary>
                    <div style='padding:5px;'><br>
                      Although this website <i> should really </i> only be able to connect to a single database from within the SQL Server. <br>
                      The installation script may have access to your entire SQL server if you do not follow these instructions. <br>
                      In such a case, it will automatically try and create a new Database for you.<br> <br>
                      This feature is provided as a bypass to a rather complex procedure. <br>
                      For security reasons it is advised not to rely on this shortcut and to comply with the best practice instructions below. <br>
                    </div>
                    <br>
                </details>
                <details  style='padding:5px; margin:10px;'>
                    <summary style='background:rgba(100,100,100,.5); padding:10px;'>
                      Click for instructions
                    </summary>
                    <div style='padding:5px;'><br>
                        1) Create a new Database specifically for this Website. <br>
                        2) Create a new User Account with Read/Write access to the Database <br>
                        3) Provide these Credentials in the Connnection Identifiers section below.
                    </div>
                </details>
            </div>
            </details>
            <br>
        <div>
        <form action="./install.php" method="post">
          <fieldset align='center'>
            <legend>Connection Identifiers</legend>
            SQL Servername: <input type="text" name="servername"><br>
            SQL Username: <input type="text" name="username"><br>
            SQL Password: <input type="text" name="password"><br>
            <div style='color:rgba(255,0,0,1)'> *Optional </div>
            SQL Database: <input type="text" name="database"><br>
          </fieldset>
          <input type="submit">
        </form><br>
        <h4> Automated Tip : </h4>
        <?php
        if (strpos($conn->connect_error, 'getaddrinfo') !== false) {  echo 'Please enter a valid Servername<br>'; }
        else { echo 'The Server was found <br> Invalid Username or Password<br>'; }
        //echo $conn->connect_error;
    }
    else{$couldConnectToServer = true;}
}
else{$couldConnectToServer = true; }

// If you were able to connect to the server.
if($couldConnectToServer) {
    $dbName = 'autobuilt_'.basename(__DIR__);
    // Create the DB
    $sql = "CREATE DATABASE IF NOT EXISTS $dbName;";
    if ($conn->query($sql) === TRUE) {  }
    else { die("Problem constructing DATABASE. <br>".mysqli_error($conn)); }
    $conn->close();

    // Connect to the DB
    //echo $dbName;echo $dbName;echo $dbName;echo $dbName;echo $dbName;echo $dbName;echo $dbName;echo $dbName;
    $conn = new mysqli($servername, $username, $password, $dbName );
    if ($conn->connect_error) { die("Connection failed: " . $conn->connect_error); }

    // Create TABLE login_attempts
    //$conn->query('drop table login_attempts');
    $sql = "CREATE TABLE IF NOT EXISTS `login_attempts` (
      `datetime` datetime NOT NULL PRIMARY KEY,
      `ipaddr` varchar(50) NOT NULL,
      `username` varchar(50) NOT NULL );";
    if (mysqli_query($conn, $sql)) {  }
    else { echo "Problem constructing TABLE 'login_attempts' <br>".mysqli_error($conn); }

    // Create TABLE queries
    //$conn->query('drop table queries');
    $sql = "CREATE TABLE IF NOT EXISTS `queries` (
      `datetime` datetime NOT NULL PRIMARY KEY,
      `ipaddr` varchar(50) NOT NULL,
      `userid` varchar(50) NOT NULL );";
    if (mysqli_query($conn, $sql)) { }
    else { echo "Problem constructing TABLE 'queries' <br>".mysqli_error($conn)."<br>"; }

    // Create TABLE visitors
    //$conn->query('drop table visitors');
    $sql = "CREATE TABLE IF NOT EXISTS `visitors` (
      `datetime` datetime NOT NULL PRIMARY KEY,
      `ipaddr` varchar(50) NOT NULL,
      `userid` varchar(50) NOT NULL );";
    if (mysqli_query($conn, $sql)) { }
    else { echo "There was a problem constructing the TABLE 'visitors' <br>".mysqli_error($conn)."<br>"; }

    // Create TABLE changed_credentials
    //$conn->query('drop table changed_credentials');
    $sql = "CREATE TABLE IF NOT EXISTS `changed_credentials` (
      `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
      `created` datetime NOT NULL,
      `role` varchar(50) NOT NULL,
      `email` varchar(250) NOT NULL,
      `phone` varchar(50) NOT NULL,
      `firstname` varchar(250) NOT NULL,
      `lastname` varchar(250) NOT NULL,
      `username` varchar(250) NOT NULL,
      `passwordsalt` varchar(250) NOT NULL,
      `passwordhash` varchar(250) NOT NULL );";
    if (mysqli_query($conn, $sql)) {  }
    else { echo "Problem constructing TABLE 'changed_credentials' <br>".mysqli_error($conn)."<br>"; }

    // Create TABLE users
    //$conn->query('drop table users');
    $sql = "CREATE TABLE IF NOT EXISTS `users` (
      `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
      `created` datetime NOT NULL,
      `role` varchar(50) NOT NULL,
      `email` varchar(250) NOT NULL,
      `phone` varchar(50) NOT NULL,
      `firstname` varchar(250) NOT NULL,
      `lastname` varchar(250) NOT NULL,
      `username` varchar(250) NOT NULL,
      `passwordhash` varchar(250) NOT NULL );";
    if (mysqli_query($conn, $sql)) { }
    else { echo "Problem constructing TABLE 'users' <br>".mysqli_error($conn)."<br>"; }

    $now = new DateTime();
    $datetime = date_create()->format('Y-m-d H:i:s');
    $hash = hash('sha256', $password.$datetime);

    // Create TABLE users
    $sql = "INSERT INTO `users`(`created`, `role`, `email`, `phone`, `firstname`, `lastname`, `username`, `passwordhash`) VALUES ('$datetime','admin','example@domain.com','123-345-6789','firstname','lastname', '$username', '$hash');";
    if (mysqli_query($conn, $sql)) {
    ?> <h2> Installation Completed! </h2>
       An admin account has been created using the SQL Username and Password given. <br>
       You can change this and more settings once logged in. <br>
       Finish your install refreshing the page or by hitting the button below. <br><br>
       <a href="./index.php"</a><button>Log In</button></a><br><br>

        <details  style='padding:5px; margin:10px;'>
            <summary style='background:rgba(100,100,100,.5); padding:10px;'>
               How to Update the Connection Identifiers (re-install)
            </summary>
            <small style='padding:5px;'> <br>
              Either you can <br>
              A) Delete the stored (encrypted) variable values in the 'dbCredentials.php' file<br>
              or <br>
              B) Replace that file with a brand new one obtained from <a href=""> here</a>. <br>
              When you are done <br>
              Go to YourWebsite.com[/the/path/to/the/website]/install.php<br>
            </small>
        </details>
    <?php
    }
    else { echo "There was a problem creating user. <br>".mysqli_error($conn)."<br>"; }


    // Overwrite index.php to include the actual index.html page.
    // And overwrite the original file.
    $handle = fopen('index.php', 'w');
    fwrite($handle, "<?php $" );
    fwrite($handle, "my_file = 'index.html'; require_once($" );
    fwrite($handle, "my_file);" );
    fwrite($handle, " ?>" );
    fclose($handle); // Close

}
?>
    <!--
    //$dropdb = "DROP DATABASE IF EXISTS ".$dbName.";";
    //$conn->query($dropdb);
        // MIS to provide OLAP and DSS for OLTP
        $dropdb = "DROP DATABASE IF EXISTS ".$dbName.";";
    $conn->query($dropdb);
<div style='background:rgba(100,100,100,.5); padding:5px;'>
    <br>
</div>
    -->

</body>



