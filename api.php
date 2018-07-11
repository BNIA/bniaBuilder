<?php
date_default_timezone_set('America/New_York');
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Max-Age: 3600");

// Connect to the DB
$con = new mysqli("localhost","bniajfi_karpatic","BniaD3v3lop3r", "bniajfi_bold");
if ($conn->connect_error) { die("Connection failed: " . $conn->connect_error); }

// Get the Query from the URI
$url = $_SERVER['REQUEST_URI']; // Query Parameters - http://php.net/manual/en/reserved.variables.server.php
$p = parse_url( $url );         // Parse URL - http://php.net/manual/en/function.parse-url.php
$q = explode('&', $p['query']);
// Store Query parameters
$parameters = (object) [];
foreach ($q as $pair){
  list($key, $value) = explode('=', $pair);
  $key = str_replace("%20", " ", $key);
  $value = str_replace("%20", " ", $value);
  //echo ', key : '.$key;
  //echo ', value : '.$value;
  $parameters->$key = $value;
};
// Sanitize - http://php.net/manual/en/filter.filters.sanitize.php
$table = $parameters -> table;
// Fields and Fieldsvals may be an array or const.
$fields = $parameters -> fields;
$fieldsVals = $parameters -> fieldsVals;
$purpose = $parameters -> purpose;


// Account ID - For Future Use.
if( isset($_GET['ACCOUNT_ID'])) { $ACCOUNT_ID = $_GET['ACCOUNT_ID']; }
else{ $ACCOUNT_ID = false; }

if (substr($_SERVER['SCRIPT_NAME'], 1, -4)=="api"){
  if ($_SERVER['REQUEST_METHOD']=='GET') {
    $PROP_INFO=array();
    if( $purpose == 'display'){
      $fields = explode("END", $fields);
      $fieldsVals = explode("END", $fieldsVals);

      // Base Query
      $sql = "SELECT * FROM `" . $table . "` WHERE " . $fields[0] ." LIKE '" . trim($fieldsVals[0], " ") . "%' ";
      $recurse = '';

      // Add Nested FieldVals to Query
      for ($x = 1; $x <= count($fields)-1; $x++) { if($fieldsVals[$x] != ''){ $recurse = $recurse . "AND " . $fields[$x] . " LIKE '" . $fieldsVals[$x] . "%' "; } }

      // Sort ( ? Year) & add query Limits
      if (in_array("year", $fields)) { $sql = $sql . $recurse . ' ORDER BY year DESC limit 100'; }
      else if (in_array("notice_yr", $fields)) { $sql = $sql . $recurse . ' ORDER BY notice_yr DESC limit 100'; }
      else if (in_array("tax_yr", $fields)) { $sql = $sql . $recurse . ' ORDER BY tax_yr DESC limit 100'; }
      else if (in_array("lic_yr", $fields)) { $sql = $sql . $recurse . ' ORDER BY lic_yr DESC limit 100'; }
      else if (in_array("Year", $fields)) { $sql = $sql . $recurse . ' ORDER BY Year DESC limit 100'; }
      else{ $sql = $sql . $recurse . ' limit 100'; }

      // Perform the query
      if ($result = mysqli_query($con, $sql) ) { while($row = mysqli_fetch_assoc($result)) {
          // For every result, append basic_prop_info to the record -> which is our primary key.
          if($table != 'basic_prop_info'){
            $getCoordinatesSQL = "SELECT * FROM `basic_prop_info` WHERE block_lot = '".$row[block_lot]."'";
            if ($result2 = mysqli_query($con, $getCoordinatesSQL) ) { while($row2 = mysqli_fetch_assoc($result2)) {
                $PROP_INFO[]=(object) array_merge((array) $row, (array) $row2);
              }
            }
            else{ echo var_dump($row); $PROP_INFO[] = $row; }
          }
          else{ $PROP_INFO[]=$row; }
        }
      }
    }
    if( $purpose == 'suggestions'){
      $sql = "SELECT `".$fields."`, `block_lot` FROM `".$table."` WHERE `".$fields."` like '".$fieldsVals."%' GROUP BY `".$fields."` ORDER BY `block_lot` ASC limit 10";
      if ($result = mysqli_query($con, $sql) ) { while($row = mysqli_fetch_assoc($result)) { $PROP_INFO[]=$row; } }
      $sql = "SELECT `".$fields."`, `block_lot` FROM `".$table."` WHERE `".$fields."` like '%".$fieldsVals."' GROUP BY `".$fields."` ORDER BY `block_lot` ASC limit 10";
      if ($result = mysqli_query($con, $sql) ) { while($row = mysqli_fetch_assoc($result)) { $PROP_INFO[]=$row; } }
      $sql = "SELECT `".$fields."`, `block_lot` FROM `".$table."` WHERE `".$fields."` like '%".$fieldsVals."%' GROUP BY `".$fields."` ORDER BY `block_lot` ASC limit 10";
      if ($result = mysqli_query($con, $sql) ) { while($row = mysqli_fetch_assoc($result)) { $PROP_INFO[]=$row; } }
    }
    echo json_encode($PROP_INFO);
  }
}
mysqli_close($con);
?>
