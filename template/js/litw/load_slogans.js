/*************************************************************
 * A/B slogan testing plugin
 *
 * Plugin for placing a footer on the results page that includes email signup
 * sharing buttons, and more studies to take. The main point of the plugin is to A/B test
 * different slogans. Any clickthroughs on the  study links are
 * saved and stored. Main file for displaying footer.
 *
 * Code requires LITW jquery, jquery i18n, handlebars, LITW.noapi.data and LITW.locale
 *
 * Last Modified : May 27, 2018. Tal August.
 *
 *
 * Author: Tal August
 * Last Modified: Feb 26, 2018
 *
 * © Copyright 2018 WildLab, University of Washington
 * For questions about this file and permission to use
 * the code, contact us at info@labinthewild.org
 *************************************************************/

// Possible studies to display, will display studies passed in from ShowFinalPage
var possible_studies = ["implicit_memory", "color_age", "thinking_style", "perceptual-models", "privacy-iot", "virtual-chinrest", "comp-behaviors" ];
var litw_locale = LITW.locale.getLocale();


// vars from the experiment
var EXP_VARS = {
	participant_id: 0,
	study_name: "",
	show_where: "",
	slogan_1: "",
	slogan_2: "",
	study_1: "",
	study_2: "",
	timestamp: null
};

// Creates and returns a json object storing the results display information
function save_footer_set_up(data_type) {
	var study_data= {};

	// We are shifting towards saving data in a json field as used below,
	// but I am also keeping previous columns for backwards compatibility
	study_data.data_type = data_type;
	EXP_VARS.timestamp = new Date().getTime();
	study_data.slogan_1 = EXP_VARS.slogan_1;
	study_data.study_1 = EXP_VARS.study_1;
	study_data.slogan_2 = EXP_VARS.slogan_2;
	study_data.study_2 = EXP_VARS.study_2;
	study_data.participant_id = EXP_VARS.participant_id;
	study_data.study_name = EXP_VARS.study_name;
	study_data.timestamp = EXP_VARS.timestamp; 
	study_data.locale = litw_locale; 

	return study_data;

}

// Function for saving slogans and studies presented if a user does not click on a link
function save_footer_config() {
	var study_data = save_footer_set_up('tracking:setup');

	$.ajax({
		type: 'POST',
		url: 'include/save_slogan_data.php',
		data: {
			participant_id: study_data.participant_id,
			data: JSON.stringify(study_data)
		}
	}).done(function(response) {
	});

}
// Function to record when a participant clicks on a link for a new study,
// slogan is passed back and participant/study information is added here to be saved to the database
// Requires litw.data.noapi.0.1.js functions
function submit_slogan_choice(slogan_text) {
	var study_data = {};

	study_data.data_type = 'tracking:a_b_clickthrough';
	study_data.participant_id = EXP_VARS.participant_id;
	study_data.study_name = EXP_VARS.study_name;

	study_data.chosen_slogan = slogan_text;
	study_data.timestamp = new Date().getTime();
	study_data.locale = litw_locale; 

	$.ajax({
		type: 'POST',
		url: 'include/save_slogan_data.php',
		data: {
			participant_id: study_data.participant_id,
			data: JSON.stringify(study_data)
		}
	}).done(function(response) {
	});
}

function get_random_slogan(slogans){
	return  slogans[Math.floor(Math.random()*slogans.length)];
}

// Helper function for saving order of study and slogan used for POST
function set_study_and_slogan(index, study, slogan) {
	if (index === 0) {
		EXP_VARS.study_1 = study;
		EXP_VARS.slogan_1 = slogan;
	} else if (index === 1) {
		EXP_VARS.study_2 = study;
		EXP_VARS.slogan_2 = slogan;
	} else {
		// currently this throws an error since only two studies are expected to be displayed
		throw("Error in indexing studies in results footer");
	}
}

// Function for creating and populating template for footer, returns html for footer
getFinalPageHTML = function(share_title, share_text, studies, template) {

	// Possible slogans for all three studies that have alternate slogans
	var thinking_style_slogans = [
		$.i18n('litw-more-study-thinking-slogan1'),
		$.i18n('litw-more-study-thinking-slogan2'),
		$.i18n('litw-more-study-thinking-slogan3'),
		$.i18n('litw-more-study-thinking-slogan4'),
		$.i18n('litw-more-study-thinking-slogan5'),
		$.i18n('litw-more-study-thinking-slogan6')
	];
	var memory_slogans = [
		$.i18n('litw-more-study-memory-slogan1'),
		$.i18n('litw-more-study-memory-slogan2'),
		$.i18n('litw-more-study-memory-slogan3'),
		$.i18n('litw-more-study-memory-slogan4'),
		$.i18n('litw-more-study-memory-slogan5'),
		$.i18n('litw-more-study-memory-slogan6')
	];
	var color_slogans = [
		$.i18n('litw-more-study-color-slogan1'),
		$.i18n('litw-more-study-color-slogan2'),
		$.i18n('litw-more-study-color-slogan3'),
		$.i18n('litw-more-study-color-slogan4'),
		$.i18n('litw-more-study-color-slogan5'),
		$.i18n('litw-more-study-color-slogan6')
	];

	var template_data = {};
	var studies_to_display = [];
	template_data.share_title = share_title;
	template_data.share_text = share_text;
	var study_url = window.location.origin + window.location.pathname;
	template_data.share_url = study_url + "?locale=" + "en";
	var litw_studies = [];

	// # check if studies were supplied
	if (studies !== undefined){
		if(studies.length <= 2){
			studies_to_display = LITW.utils.shuffleArrays(studies);
		} else {
			studies_to_display = LITW.utils.shuffleArrays(studies).slice(0, 2);
		}
	} else {
		studies_to_display = LITW.utils.shuffleArrays(possible_studies).slice(0, 2);
	}

	// Push slogans for specific study on
	for (var i = 0; i < studies_to_display.length; i++) {
		var rand_slogan = "";
		switch (studies_to_display[i]) {
			case "implicit_memory":
				rand_slogan = get_random_slogan(memory_slogans);
				litw_studies.push(
					{
						'study_slogan': rand_slogan,
						'study_description': $.i18n('litw-more-study-memory-description'),
						'study_logo': $.i18n('litw-more-study-memory-logo'),
						'study_url': $.i18n('litw-more-study-memory-url')
					});
				set_study_and_slogan(i, studies_to_display[i], rand_slogan);
				break;
			case "color_age":
				rand_slogan = get_random_slogan(color_slogans);
				litw_studies.push(
					{
						'study_slogan': rand_slogan,
						'study_description': $.i18n('litw-more-study-color-description'),
						'study_logo': $.i18n('litw-more-study-color-logo'),
						'study_url': $.i18n('litw-more-study-color-url')
					});
				set_study_and_slogan(i, studies_to_display[i], rand_slogan);

				break;
			case "thinking_style":
				rand_slogan = get_random_slogan(thinking_style_slogans);
				litw_studies.push(
					{
						'study_slogan': rand_slogan,
						'study_description': $.i18n('litw-more-study-thinking-description'),
						'study_logo': $.i18n('litw-more-study-thinking-logo'),
						'study_url': $.i18n('litw-more-study-thinking-url')
					});
				set_study_and_slogan(i, studies_to_display[i], rand_slogan);
				break;
			case "virtual-chinrest":
				litw_studies.push(
					{
						'study_slogan': $.i18n('litw-more-study-crowding-slogan'),
						'study_description': $.i18n('litw-more-study-crowding-description'),
						'study_logo': $.i18n('litw-more-study-crowding-logo'),
						'study_url': $.i18n('litw-more-study-crowding-url')
					});
				set_study_and_slogan(i, studies_to_display[i], $.i18n('litw-more-study-crowding-slogan'));
				break;
			case "privacy-iot":
				litw_studies.push(
					{
						'study_slogan': $.i18n('litw-more-study-privacy-iot-slogan'),
						'study_description': $.i18n('litw-more-study-privacy-iot-description'),
						'study_logo': $.i18n('litw-more-study-privacy-iot-logo'),
						'study_url': $.i18n('litw-more-study-privacy-iot-url')
					});
				set_study_and_slogan(i, studies_to_display[i], $.i18n('litw-more-study-privacy-iot-slogan'));
				break;
			case "perceptual-models":
				litw_studies.push(
					{
						'study_slogan': $.i18n('litw-more-study-perceptual-models-slogan'),
						'study_description': $.i18n('litw-more-study-perceptual-models-description'),
						'study_logo': $.i18n('litw-more-study-perceptual-models-logo'),
						'study_url': $.i18n('litw-more-study-perceptual-models-url')
					});
				set_study_and_slogan(i, studies_to_display[i], $.i18n('litw-more-study-perceptual-models-slogan'));
				break;
			case "comp-behaviors":
				litw_studies.push(
					{
						'study_slogan': $.i18n('litw-more-study-risk-preference-slogan'),
						'study_description': $.i18n('litw-more-study-risk-preference-description'),
						'study_logo': $.i18n('litw-more-study-risk-preference-logo'),
						'study_url': $.i18n('litw-more-study-risk-preference-url')
					});
				set_study_and_slogan(i, studies_to_display[i], $.i18n('litw-more-study-risk-preference-slogan'));
				break;
			default:
				throw "Study not recognized";
		}
	}

	template_data.more_litw_studies = litw_studies;
	// var finalTemplate = Handlebars.getTemplate('final_template');
	return template(template_data);
};

// Function for displaying a results footer, pulls random slogans form whatever is specified in the json_path
// study_name is for internal purposes, study_share_title and share_text are what will be displayed
// when the study is shared
showFinalPage = function(show_where, participant_id, study_name, study_share_title, share_text, studies, template) {
	// Save experiment variables
	EXP_VARS.participant_id = participant_id;
	EXP_VARS.study_name = study_name;
	var html_footer = "";
	$.i18n().locale = "en"; // for testing, can just put english, this returns a string specifying the language
	var languages = {};
	languages["en"] = 'src/i18n/en-more-studies.json';
	// determine and set the study language
	$.i18n().load(languages).done(
		function () {
			$(show_where).html(getFinalPageHTML(study_share_title, share_text, studies, template));
			$(show_where).i18n();
			$(show_where).show();
			// save footer configuration 
			save_footer_config();

		}
	);
	// add listener for if a user leaves without clicking on an additional study link
	// window.onbeforeunload = function () {
	// 	save_footer_config();
	// }
};

