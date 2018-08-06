<?php
//Backend Utility Functions
class BackendUtility  {

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
       die( "Problem constructing DATABASE. <br>". $conn->connect_error );
    }
    else{
        echo 'connectedsuc';
    }

    //Empty constructor - for now
    public function __construct () {
    }

    //Returns JSON representation of PHP array of indicator definition and data
    function getIndicatorData($iYear, $bound) {
    }

    //Returns JSON representation of data for a single indicator in a single year (all CSAs)
    function getDataForIndicator($iYear, $iName) {
    }

    // Check Login Credentials
    function checkBound($strBound) {
        $mysqli = new mysqli($this->server,$this->dbuser,$this->dbpass,$this->database);
        if($stmt = $mysqli->prepare("SELECT csa2010 FROM vs_2010 WHERE csa2010 = ?;")) {
            $stmt->bind_param("s", $strBound);
            $stmt->execute();
            $stmt->store_result();
            $num_of_rows = $stmt->num_rows;

            $stmt->close();
            $mysqli->close();

            if($num_of_rows > 0) { return true; }
            else { return false; }
        }
        else { return false; }
    }
}
?>
