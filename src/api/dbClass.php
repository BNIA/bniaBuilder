<?php
//Vital Signs Utility Functions
//Miscallenous functions used throughout the site
class VitalSignsUtility  {
	var $server = "localhost";
	var $dbuser = "root";
	var $dbpass = "karpati";
	var $database = "bniajfi_vsigns";
	
	//Empty constructor - for now
	public function __construct () {
   
	}
		
	
	//Returns JSON representation of PHP array of indicator definition and data
	function getIndicatorData($iYear, $bound) {	
		if($iYear >= 2010 && $iYear <= 2015) {
			$shortYear = substr($iYear, -2);
			$iTable = "vs_" . $iYear;
			$con=mysqli_connect($this->server,$this->dbuser,$this->dbpass,$this->database);

			$sqlCols = "SELECT `COLUMN_NAME` 
						FROM `INFORMATION_SCHEMA`.`COLUMNS` 
						WHERE `TABLE_SCHEMA`='bniajfi_vsigns' 
						AND `TABLE_NAME`='$iTable';";
			
			$result = mysqli_query($con, $sqlCols);
			
			$x=0;
			while($row = mysqli_fetch_array($result)) 
			{
				$arrCols[$x] = $row['COLUMN_NAME'];
				$x++;
			}			

			unset($arrCols[0]);
			unset($arrCols[1]);
			$arrCols = array_values($arrCols);
			mysqli_close($con);
						
			$count = 0;
			$arrRes = array();
			$cona=mysqli_connect($this->server,$this->dbuser,$this->dbpass,$this->database);
			for($x=0;$x<count($arrCols);$x++) {
				
				$iName = substr_replace($arrCols[$x], "XX", -2);
				
				$sql = "SELECT Indicator, ShortName, Section, Full_Source as Source, Definition, Years FROM vs_details_14 WHERE ShortName = '$iName';";
				
				$results = mysqli_query($cona, $sql);
				while($row = mysqli_fetch_array($results)) 
				{
					$arrRes[$count]['IndicatorName'] = $row['Indicator'];
					$arrRes[$count]['ShortName'] = str_replace("XX", $shortYear, $iName);
					$arrRes[$count]['IndicatorSection'] = $row['Section'];
					$arrRes[$count]['IndicatorSource'] = $row['Source'];
					$arrRes[$count]['Definition'] = utf8_encode($row['Definition']);
					$arrRes[$count]['Years'] = $row['Years'];
					$arrRes[$count]['IndicatorYear'] = $iYear;
				}
				$count++;
				
			}					
			mysqli_close($cona);
			$arrRes = array_values($arrRes);
			
			
			$conb=mysqli_connect($this->server,$this->dbuser,$this->dbpass,$this->database);
			for($x=0;$x<count($arrRes);$x++) {

				$iName = $arrRes[$x]['ShortName'];
				
				$iTable = "vs_20" . $shortYear;
					
				if (!empty($bound) && strlen($bound) > 5) {
					if( $this->checkBound($bound) ) {
						$strBound = $bound;
						$sql = "SELECT CSA2010, $iName FROM $iTable WHERE CSA2010 = '$strBound';";
					}
					else {
						return("Invalid boundary.");
					}
				}
				else {
					$sql = "SELECT CSA2010, $iName FROM $iTable;";
				}
				$result = mysqli_query($conb, $sql);
				$count = 0;
				while($row = mysqli_fetch_array($result)) 
				{			
					$strCSA = $row['CSA2010'];
					$arrRes[$x]['Data'][$count]["Boundary"] = $row['CSA2010'];
					
					$valcheck = $row[$iName];
	
					if( is_float( floatval($valcheck)) && strpos(",",$valcheck) === true ) {
						$arrRes[$x]['Data'][$count]["Result"] = floatval($row[$iName]);
					}
					elseif( $valcheck === "--" ) {
						$arrRes[$x]['Data'][$count]["Result"] = "";
					}
					elseif( $valcheck === "x" ) {
						$arrRes[$x]['Data'][$count]["Result"] = "";
					}
					elseif( strpos($valcheck, "$") !== false) {
						$arrRes[$x]['Data'][$count]["Result"] = substr($row[$iName], 1);
					}
					else {
						$arrRes[$x]['Data'][$count]["Result"] = $row[$iName];
					}
					$count++;
				}
			}
			mysqli_close($conb);
			return json_encode($arrRes);
		}
		else {
			return "Invalid Indicator Year. Please try your query again with a correct year.";
		}
	}		
		
	//Returns JSON representation of data for a single indicator in a single year (all CSAs)
	function getDataForIndicator($iYear, $iName) {
		
		if(is_numeric($iYear) && ($iYear >= 2010 && $iYear <= 2015)) {
						
			$mysqli = new mysqli($this->server,$this->dbuser,$this->dbpass,$this->database);
						
			$strSName = substr($iName, 0, -2); 
			$strSName = $strSName . "xx";
						
			if($stmt = $mysqli->prepare("SELECT Indicator, ShortName, Section, Full_Source as Source, Definition, Years FROM vs_details_14 WHERE ShortName = ?;")) {
				$stmt->bind_param("s", $strSName);
				$stmt->execute();
				$stmt->store_result();
			
				$data = array();
				while($row = $this->fetchAssocStatement($stmt)) {
					$data['Indicator']['IndicatorName'] = $row['Indicator'];
					$data['Indicator']['ShortName'] = $row['ShortName'];
					$data['Indicator']['Section'] = $row['Section'];
					$data['Indicator']['Source'] = $row['Source'];
					$data['Indicator']['Definition'] = $row['Definition'];
					$data['Indicator']['Years'] = $row['Years'];
					$data['Indicator']['DNC'] = '';
					$data['Indicator']['Year'] = $iYear;
				}
				
			}
			
			$sName = substr($iName, -2); 
			if(! is_numeric($sName) ) {
				$iTable = "vs_" . substr($iYear, -2);
				$strCol = substr($iName, 0, -2) . substr($iYear, -2);
			}
			$iTable = "vs_" . $iYear;
						
			$sql = "SELECT CSA2010, $strCol FROM $iTable ORDER BY CSA2010;";

			$result = $mysqli->query($sql);
			
			$x=0;			
			while($row = $result->fetch_assoc()) 
			{
				$strCSA = $row['CSA2010'];
				$data['Indicator']['Data'][$x]["Boundary"] = $row['CSA2010'];
				
				$valcheck = $row[$strCol];
		
				if( is_float( floatval($valCheck)) && strpos(",",$valCheck) === true ) {
					$data['Indicator']['Data'][$x]["Result"] =  floatval(  $row[$strCol] ) ;
				}
				elseif( $valcheck === "x" ) {
					$data['Indicator']['Data'][$x]["Result"] = "";
				}
				elseif( strpos($valcheck, "$") !== false ) {
					$data['Indicator']['Data'][$x]["Result"] = substr($row[$strCol], 1);
				}
				else {
					$data['Indicator']['Data'][$x]["Result"] = $row[$strCol];
				}
					
				$x++;
			}
			
			$result->close();
			$mysqli->close();
		
			return json_encode($data);
			
		}
		else {
			return "Invalid Indicator Year. Please try your query again with a correct year.";
		}
	}
	
	//Returns JSON representation of all indicator definitions in a specified topic-area/section
	function getIndicatorsInSection($iType) {
		$mysqli = new mysqli($this->server,$this->dbuser,$this->dbpass,$this->database);
				
		if( isset($iType) && strlen($iType) > 5) {
			$iType = str_replace("%20", " ", $iType);
			
			if($stmt = $mysqli->prepare("SELECT Indicator, ShortName, Section, Full_Source as Source, Definition, Years FROM vs_details_14 WHERE Section = ? ORDER BY Indicator;")) {
				$stmt->bind_param("s", $iType);
				$stmt->execute();
				$stmt->store_result();
				
				$x=0;
				$data = array();
				while($row = $this->fetchAssocStatement($stmt)) {
					if( !empty($row['ShortName']) ) {
						$data[$x]['Indicator']['IndicatorName'] = $row['Indicator'];
						$data[$x]['Indicator']['ShortName'] = $row['ShortName'];
						$data[$x]['Indicator']['Section'] = $this->getSection($row['Section']);
						$data[$x]['Indicator']['Source'] = $row['Source'];
						$data[$x]['Indicator']['IndicatorPath'] = "/indicators/" . $this->getSection($row['Section']) . "/" . str_replace("XX", "", $row['ShortName']);	
						$data[$x]['Indicator']['Definition'] = utf8_encode($row['Definition']);			
						$data[$x]['Indicator']['Years'] = $row['Years'];	
						$x++;
					}
				}			
			
			}
			
		}
		else {
			$sql = "SELECT Indicator, ShortName, Section, Full_Source as Source, Definition, Years FROM vs_details_14 ORDER BY Indicator;";
			$result = $mysqli->query($sql);
			$x=0;
			$data = array();
			while($row = $result->fetch_assoc()) 
			{
				if( !empty($row['ShortName']) ) {
					$data[$x]['Indicator']['IndicatorName'] = $row['Indicator'];
					$data[$x]['Indicator']['ShortName'] = $row['ShortName'];
					$data[$x]['Indicator']['Section'] = $this->getSection($row['Section']);
					$data[$x]['Indicator']['Source'] = $row['Source'];
					$data[$x]['Indicator']['IndicatorPath'] = "/indicators/" . $this->getSection($row['Section']) . "/" . str_replace("XX", "", $row['ShortName']);	
					$data[$x]['Indicator']['Definition'] = utf8_encode($row['Definition']);			
					$data[$x]['Indicator']['Years'] = $row['Years'];	
					$x++;
				}
			}
			$result->close();
		}	
		
		$mysqli->close();
		return json_encode($data);
	}
	

	
	//Gets info about neighborhoods in specified community and population
	function getNeigborhoods($strCom) {
		$arrData = array(1);
		$arrData["community"] = array(1);	
				
		$mysqli = new mysqli($this->server,$this->dbuser,$this->dbpass,$this->database);
		if($stmt = $mysqli->prepare("SELECT neigh FROM csa_nsa WHERE community = ? LIMIT 1")) {
			$stmt->bind_param("s", $strCom);
			$stmt->execute();
			$stmt->bind_result($neigh);
			
			while($stmt->fetch()) {
				$strData = $neigh;
			}
		}	
			$stmt->close();
			//$mysqli->close();
		
		$arrData["community"]["neighs"] = $strData;
				
	
		if($stmt = $mysqli->prepare("SELECT tpop10 FROM vs_2010 WHERE csa2010 = ? LIMIT 1")) {
			$stmt->bind_param("s", $strCom);
			$stmt->execute();
			$stmt->bind_result($tpop);
			
			while($stmt->fetch()) {
				$strDataT = $tpop;
			}
			
			$stmt->close();
			$mysqli->close();
		
			if( strlen($strDataT) > 0) {
				$arrData["community"]["pop"] = $strDataT;
			}
		
		}
		
		return json_encode($arrData);
		
	}
	
	//Ensure that the selected CSA exists
	function checkBound($strBound) {
		$mysqli = new mysqli($this->server,$this->dbuser,$this->dbpass,$this->database);
		if($stmt = $mysqli->prepare("SELECT csa2010 FROM vs_2010 WHERE csa2010 = ?;")) {
			$stmt->bind_param("s", $strBound);
			$stmt->execute();
			$stmt->store_result();
			$num_of_rows = $stmt->num_rows;
				
			$stmt->close();
			$mysqli->close();
			
			if($num_of_rows > 0) {
				return true;
			}
			else {
				return false;
			}
			
		}
		else {
			return false;
		}
	}
	
	function getSection($sSection) {
		$psel = $sSection;
		switch ($sSection) {
			case "Socioeconomic/Demographics":
				$psel = "Census Demographics";
				break;
			case "Health and Human Welfare":
				$psel = "Children And Family Health";
				break;
			case "Economic and Workforce Development":
				$psel = "Workforce And Economic Development";
				break;
			case "Housing":
				$psel = "Housing And Community Development";
				break;
			case "Education":
				$psel = "Education And Youth";
				break;
		}
		return $psel;
	}
	
	function fetchAssocStatement($stmt)
	{
		if($stmt->num_rows>0)
		{
			$result = array();
			$md = $stmt->result_metadata();
			$params = array();
			while($field = $md->fetch_field()) {
				$params[] = &$result[$field->name];
			}
			call_user_func_array(array($stmt, 'bind_result'), $params);
			if($stmt->fetch())
				return $result;
		}

		return null;
	}
	
}

?>
