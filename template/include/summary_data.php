<?php

//IN: JSON - OUT:JSON
function summary($json_data) {
	$data = json_decode($json_data,true);
	
	$surveyResults = array(
		'futureSurvey1'=>array('sum'=>0, "count"=>0),
		'futureSurvey2'=>array(1=>0, 2=>0, 3=>0, 4=>0, 5=>0)
	);

	foreach ($data as $response) {
		if(array_key_exists('future_1_answer', $response)) {
			$futureSurvey1Response = $response['future_1_answer'];
			$surveyResults['futureSurvey1']['sum'] += intval($futureSurvey1Response);
			$surveyResults['futureSurvey1']['count']++;
		}
		
		if(array_key_exists('future_2_answer', $response)) {
			for($i=0; $i<=5;$i++) {
				$futureSurvey2Response = $response['future_2_answer'];
				if(intval($futureSurvey2Response) === $i) {
					$surveyResults['futureSurvey2'][$i]++;
					break;
				}
			}
		}
	}
	
	return json_encode($surveyResults);
}

//READ db_data.json
$json_data = file_get_contents("db_data.json");
//PROCESS DATA
$json_summary = summary($json_data);
//SAVE summary.json
$f_summary = fopen('summary.json', 'w');
fwrite($f_summary, $json_summary);
fclose($f_summary);
?>