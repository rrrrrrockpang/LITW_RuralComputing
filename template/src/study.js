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
	
		last_card = card;
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
		$("#splash-screen").modal({backdrop: "static"});
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
	}

	video = function() {
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

	selectCard = function() {
		if(cards.length < 3) {
			LITW.data.submitStudyData({
				"card": lastCard,
				"text": $("#" + lastCard + "-textarea").val()
			})
		}
		var card_id = get_random_cardId();
		LITW.tracking.recordCheckpoint(card_id);

		if(card_id === "card-1") {
			$("#card-1").html(card1Template);
			$("#card-1").i18n();
			LITW.utils.showSlide("card-1");
			if(cards.length > 0) {
				LITW.utils.showNextButton(selectCard);
			} else {
				LITW.utils.showNextButton(futureSurvey);
			}

		} else if (card_id === "card-2") {
			$("#card-2").html(card2Template);
			$("#card-2").i18n();
			LITW.utils.showSlide("card-2");
			if(cards.length > 0) {
				LITW.utils.showNextButton(selectCard);
			} else {
				LITW.utils.showNextButton(futureSurvey);
			}
		} else {
			$("#card-3").html(card3Template);
			$("#card-3").i18n();
			LITW.utils.showSlide("card-3");
			if(cards.length > 0) {
				LITW.utils.showNextButton(selectCard);
			} else {
				LITW.utils.showNextButton(futureSurvey);
			}
		}
	}

	futureSurvey = function() {
		LITW.tracking.recordCheckpoint("futureSurvey");
		$("#futureSurvey").html(futureSurveyTemplate);
		$("#futureSurvey").i18n();
		LITW.utils.showSlide("futureSurvey");

		LITW.utils.showNextButton(comments);
	}

	startTrials = function(demographicsData) {
		// send demographics data to the server
		LITW.data.submitDemographics(demographicsData);

		LITW.utils.showSlide("trials");
		jsPsych.init({
		  timeline: timeline,
		  on_finish: comments,
		  display_element: $("#trials")
		});
	},

	comments = function() {
		$("#progress-header").hide();
		LITW.utils.showSlide("comments");
		LITW.comments.showCommentsPage(results);
	},

	results = function(commentsData) {

		LITW.data.submitComments(commentsData);

		// get the trial data from jsPsych
		var studyData = jsPsych.data.getTrialsOfType("single-stim"),
		whichCat;

		// strip out the data generated from the practice trial
		studyData.splice(0, params.practiceStims.length);

		var numNiceCats = studyData.filter(function(item) {
			
			// the nice cats are always on the right!
			return item.key_press === 50;
		}).length;
		var numMeanCats = studyData.filter(function(item) {
			
			// the mean cats are always on the left!
			return item.key_press === 49;
		}).length;

		if (numNiceCats === numMeanCats) {
			whichCat = ["cat-nice.jpg", "cat-mean.jpg"];
		} else {
			whichCat = (numNiceCats > numMeanCats) ? 
				["cat-nice.jpg"] : 
				["cat-mean.jpg"];
		}

		LITW.utils.showSlide("results");
		$("#results").html(resultsTemplate({
			content: C.results,
			resultsExplanation: C.resultsExplanation,
			citations: C.citations,
			whichCat: whichCat,
			bothCats: (whichCat.length === 2)
		}));

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
			console.log(data);
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


