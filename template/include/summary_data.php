<?php

//IN: JSON - OUT:JSON
function summary($json_data) {
	$data = json_decode($json_data,true);
	// $cities = array();
	// foreach ($data as $value) {
	// 	$cities[$value['city']] = true;
	// }
	// $summary = array('city_number'=>sizeof($cities),'cities'=>array_keys($cities));
	// return json_encode($summary);
	$results = array(
		'future_1_answer'=>array('sum'=>0, 'count'=>0),
		'future_2_answer'=>array('sum'=>0, 'count'=>0)
	);

	foreach($data as $participant) {
		$future1result=intval($participant['future_1_answer']);
		$future2result=intval($participant['future_2_answer']);

		$results['future_1_answer']['sum'] += $future1result;
		$results['future_1_answer']['count']++;

		$results['future_2_answer']['sum'] += $future2result;
		$results['future_2_answer']['count']++;
	}

	return json_encode($results);
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