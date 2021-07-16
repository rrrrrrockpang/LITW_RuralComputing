/*************************************************************
 * test.js
 *
 * Main experiment file for the LITW demo study.
 *
 * Author: Trevor Croxson
 *       : Nigini A. Oliveira
 * 
 * Last Modified: February 5, 2017
 * 
 * © Copyright 2017 LabintheWild.
 * For questions about this file and permission to use
 * the code, contact us at info@labinthewild.org
 *************************************************************/

// load webpack modules
window.$ = window.jQuery = require("jquery");
require("bootstrap");
require("jquery-ui-bundle");
var LITW_STUDY_CONTENT = require("./data");
var irbTemplate = require("../templates/irb.html");
var instructionsTemplate = require("../templates/instructions.html");
var loadingTemplate = require("../templates/loading.html");
var resultsTemplate = require("../templates/results.html");
var motivationSurveyTemplate = require("../templates/motivationSurvey.html");
var futureSurveyTemplate = require("../templates/futureSurvey.html");
var videoTemplate = require("../templates/video.html");

var card1Template = require("../templates/card-1.html");
var card2Template = require("../templates/card-2.html");
var card3Template = require("../templates/card-3.html");

var progressTemplate = require("../templates/progress.html");
var i18n = require("../js/i18n");
require("./jspsych-display-info");
require("./jspsych-display-slide");

module.exports = (function() {

	window.litwWithTouch = false;

	var timeline = [],
	cards = ["card-1", "card-2", "card-3"],
	lastCard = "",

	self = this,
	C,
	params = {
		stims: [],
		practiceStims: [],
		currentProgress: 0
	},

	get_random_cardId = function() {
		var index = Math.floor(Math.random() * cards.length);
		var card = cards[index];
		if(index > -1) {
			cards.splice(index, 1);
		}
	
		lastCard = card;
		return card;
	},


	irb = function() {
		LITW.tracking.recordCheckpoint("irb");
		$("#irb").html(irbTemplate());
		$("#irb").i18n();
		LITW.utils.showSlide("irb");
		$("#agree-to-study").on("click", function() {
			if ($(this).prop("checked")) {
				LITW.utils.showNextButton(demographics);
				$("#approve-irb").hide();
			} else {
				LITW.utils.hideNextButton();
				$("#approve-irb").show();
			}
		});

		// show the introductory splash screen
		// $("#splash-screen").modal({backdrop: "static"});
	},

	demographics = function() {
		LITW.tracking.recordCheckpoint("demographics");
		LITW.forms.newForm("demographics", {
			autocomplete: true
		})
		.add("retake", {
			required: true
		})
		.add("gender")
		.add("age", { 
			style: "numericalFreeText", 
			prompt: "How old are you? (Please type a number)",
			boundsMessage: "Are you really %s years old? If not, please make sure to enter the correct age so that your data contributes to our research.",
			minValue: 6,
			maxValue: 99
		})
		.add("ethnicity")
		.add("multinational")
		.add("country")
		.add("education", {
			style: "numericalFreeText",
			prompt: "How many years of education have you completed, starting from primary school?",
			boundsMessage: "Have you really completed %s years of education? If not, please make sure to enter the correct value so that your data contributes to our research.",
			minValue: 6,
			maxValue: 30
		})
		.render(motivationSurvey);

		LITW.utils.showSlide("demographics");
	},

	motivationSurvey = function(demographicsData) {
		LITW.data.submitDemographics(demographicsData);

		LITW.tracking.recordCheckpoint("motivationalSurvey");
		$("#motivationsurvey").html(motivationSurveyTemplate());
		$("#motivationsurvey").i18n();
		LITW.utils.showSlide("motivationsurvey");

		LITW.utils.showNextButton(video);

	},

	submitMotivationStudy = function() {
		LITW.data.submitStudyData({
			"motivation_1_answer": $("#question1-1 input[name='likert1']:checked").val(),
			"motivation_2_answer": $("#question1-2 input[name='likert2']:checked").val(),
			"motivation_3_answer": $("#question1-3 input[name='likert3']:checked").val(),	
		});
	},

	video = function() {
		submitMotivationStudy();
		LITW.tracking.recordCheckpoint("video");

		$("#video").html(videoTemplate);
		$("#video").i18n();
		LITW.utils.showSlide("video");

		LITW.utils.showNextButton(instructionPage);
	}

	instructionPage = function() {
		LITW.tracking.recordCheckpoint("instructions");
		$("#instructions").html(instructionsTemplate);
		$("#instructions").i18n();
		LITW.utils.showSlide("instructions");

		LITW.utils.showNextButton(selectCard);
	}

	submitCardData = function() {
		var card_data = {}; 
		var answer = lastCard + "-answer";
		card_data[lastCard] = lastCard;
		card_data[answer] = $("#" + lastCard + "-textarea").val();

		if(lastCard === "card-1") {
			var radio_answer = lastCard + "-radio-answer";
			card_data[radio_answer] = $("#litw-card1-question1 input[name='likert4']:checked").val().trim();
		} else if (lastCard === "card-2") {
			var radio_answer = lastCard + "-radio-answer";
			card_data[radio_answer] = $("#litw-card2-question1 input[name='likert5']:checked").val().trim();
		}
		console.log(card_data);

		LITW.data.submitStudyData(card_data);
	}

	selectCard = function() {
		// Submit both card input text and multiple choice questions
		if(cards.length < 3) { // Only in condition when some card has been selected
			submitCardData();
		}

		// Randomly shuffle the cards and pick one
		var card_id = get_random_cardId();
		LITW.tracking.recordCheckpoint(card_id);

		if(card_id === "card-1") {
			$("#card-1").html(card1Template);
			$("#card-1").i18n();
			LITW.utils.showSlide("card-1");
		} else if (card_id === "card-2") {
			$("#card-2").html(card2Template);
			$("#card-2").i18n();
			LITW.utils.showSlide("card-2");
		} else {
			$("#card-3").html(card3Template);
			$("#card-3").i18n();
			LITW.utils.showSlide("card-3");
		}

		// Next card or enter futureSurvey
		if(cards.length > 0) {
			LITW.utils.showNextButton(selectCard);
		} else {
			LITW.utils.showNextButton(futureSurvey);
		}
	}

	futureSurvey = function() {
		submitCardData();

		LITW.tracking.recordCheckpoint("futureSurvey");
		$("#futureSurvey").html(futureSurveyTemplate);
		$("#futureSurvey").i18n();
		LITW.utils.showSlide("futureSurvey");

		LITW.utils.showNextButton(comments);
	},

	submitFutureStudy = function() {
		LITW.data.submitStudyData({
			"future_study": {
				"future_1_answer": $("select[name='future-years-available'] option:selected").val(),
				"future_2_answer": $("#litw-futuresurvey-question2 input[name='likert6']:checked").val()
			}
		});
	},

	comments = function() {
		submitFutureStudy();

		$("#progress-header").hide();
		LITW.utils.showSlide("comments");
		LITW.comments.showCommentsPage(results);
	},

	showResults = function(data) {
		// var average_future_2 = data['future_2_answer']['sum'] / data['future_2_answer']['count'];
		$("#results").html(resultsTemplate({
			answer: 123
		}));
	},

	results = function(commentsData) {
		LITW.data.submitComments(commentsData);
		LITW.utils.showSlide("results");

		$.getJSON('summary.json', {_: new Date().getTime()}, function(data) {
			showResults(data);
		})
		
		LITW.results.insertFooter();
	};

	summaryInitialData = function(json_data){
		var summary = {};
		for (count in json_data) {
			var country = json_data[count].country;
			if( country in summary){
				summary[country] = summary[country]+1;
			} else {
				summary[country] = 1;
			}
		};
		var data = {summary : true};
		data.data = summary;
		LITW.data.submitStudyData(data);
	}

	readSummaryData = function() {
		$.getJSON( "summary.json", function( data ) {
			//TODO: 'data' contains the produced summary form DB data 
			//      in case the study was loaded using 'index.php'
			//SAMPLE: The example code gets the cities of study partcipants.
			showResults(data);
		});
	}

	// when the page is loaded, start the study!
	$(document).ready(function() {
		// get initial data from database (nmaybe needed for the results page!?)
		readSummaryData();

		// detect touch devices
		window.litwWithTouch = ("ontouchstart" in window);

		// determine and set the study language
		//$.i18n().locale = i18n.getLocale();

		$.i18n().load(
			{
				'en': 'src/i18n/en.json',
				'pt-BR': 'src/i18n/pt-br.json'
			}
		).done(
			function(){
				$('head').i18n();
				$('body').i18n();
			}
		);

		// generate unique participant id and geolocate participant
		LITW.data.initialize();
		LITW.share.makeButtons("#header-share");

		// shortcut to access study content
		C = LITW_STUDY_CONTENT;

		// Load the trial configuration data for the practice
		// trials and the real trials
		// params.practiceStims = C.practiceCats;
		params.stims = C.trialCards;

		// shuffle the order of the trials
		// params.practiceStims = LITW.utils.shuffleArrays(params.practiceStims);
		params.stims = LITW.utils.shuffleArrays(params.stims);
		
		LITW.utils.showSlide("img-loading");
		
		// preload images
		jsPsych.pluginAPI.preloadImages(params.stims,
			
			// initialize the jsPsych timeline and
			// proceed to IRB page when loading has finished
			function() { 
				// initJsPsych();
				irb(); 
			},
			
			// update loading indicator as stims preload
			function(numLoaded) { 
				$("#img-loading").html(loadingTemplate({
					msg: C.loadingMsg,
					numLoaded: numLoaded,
					total: params.stims.length
				}));
			}
		);
	});
})();
