<?php
//Controller to return data from VS utility class
//Takes an action and other optional parameters (year, boundary, section) via $_GET superglobal
try {
    error_reporting(E_ERROR | E_PARSE);
    require_once("backend_utils.php");

    $vsUtility = new BackendUtility();

    if( isset($_GET['action']) ) {
        switch($_GET['action']) {
            case "community":
                if(isset($_GET['bound']) && isset($_GET['iYear'])) { $data = $vsUtility->getIndicatorData($_GET['iYear'], $_GET['bound']); }
                break;
            case "single":
                if(isset($_GET['iName']) && isset($_GET['iYear'])) { $data = $vsUtility->getDataForIndicator($_GET['iYear'], $_GET['iName']); }
                break;
            case "definitions":
                if(isset($_GET['iType'])) { $data = $vsUtility->getIndicatorsInSection($_GET['iType']); }
                else { $data = $vsUtility->getIndicatorsInSection(); }
                break;
            case "neighborhoods":
                if(isset($_GET['sCom'])) { $data = $vsUtility->getNeigborhoods($_GET['sCom']); }
                break;
        }
        echo $data;
    }
    else {
        echo"Something went wrong";
    }
}
catch (Exception $e) {
    echo 'Error: ',  $e->getMessage(), "\n";
}
?>
