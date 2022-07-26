<?php

//IN: JSON - OUT:JSON
function summary($json_data) {
	$data = json_decode($json_data,true);
	
	$surveyResults = array(
		'card1'=>array('sum'=>0, "count"=>0),
		'card2'=>array('sum'=>0, "count"=>0),
		'card3'=>array('sum'=>0, "count"=>0)
	);

	foreach ($data as $response) {
		if(array_key_exists('card-1', $response)) {
			$card1 = $response['card-1-sentiment'];
			$surveyResults['card1']['sum'] += floatval($card1);
			$surveyResults['card1']['count']++;
		}

		if(array_key_exists('card-2', $response)) {
			$card2 = $response['card-2-sentiment'];
			$surveyResults['card2']['sum'] += floatval($card2);
			$surveyResults['card2']['count']++;
		}

		if(array_key_exists('card-3', $response)) {
			$card3 = $response['card-3-sentiment'];
			$surveyResults['card3']['sum'] += floatval($card3);
			$surveyResults['card3']['count']++;
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