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
var demographicsTemplate = require("../templates/demographics.html");
var instructionsTemplate = require("../templates/instructions.html");
var loadingTemplate = require("../templates/loading.html");
var resultsTemplate = require("../templates/results.html");
var motivationSurveyTemplate = require("../templates/motivationSurvey.html");
var futureSurveyTemplate = require("../templates/futureSurvey.html");
var videoTemplate = require("../templates/video.html");
var commentsTemplate = require("../templates/comments.html");

var card1Template = require("../templates/card-1.html");
var card2Template = require("../templates/card-2.html");
var card3Template = require("../templates/card-3.html");

var progressTemplate = require("../templates/progress.html");
var i18n = require("../js/i18n");
const data = require("./data");
require("./jspsych-display-info");
require("./jspsych-display-slide");

module.exports = (function() {

	window.litwWithTouch = false;

	window.cardCounter = 0;
	window.cardWordList = ["null", "first", "second", "third and final"];

	var timeline = [],
	cards = ["card-1", "card-2", "card-3"],
	sentimentScores = {"card-1": 0, "card-2": 0, "card-3": 0},
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
		cardCounter++;
		lastCard = card;
		return card;
	},


	irb = function() {
		LITW.tracking.recordCheckpoint("irb");
		// $("#irb").html(irbTemplate());
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
		$("#demographics").html(demographicsTemplate());
		$("#demographics").i18n();
		LITW.utils.showSlide("demographics");
		LITW.utils.showNextButton(motivationSurvey);
	},

	motivationSurvey = function() {
		// LITW.data.submitDemographics();
		// Submit demographic data
		var dem_data = $('#demographicsForm').alpaca().getValue();
		jsPsych.data.addProperties({demographics:dem_data});
		LITW.data.submitDemographics(dem_data);

		LITW.tracking.recordCheckpoint("motivationalSurvey");
		$("#motivationsurvey").html(motivationSurveyTemplate());
		$("#motivationsurvey").i18n();
		LITW.utils.showSlide("motivationsurvey");

		$("#motivation-questions").on("click", function() {
			if($("#question1-1 input[name='likert1']:checked").val() &&
				$("#question1-2 input[name='likert2']:checked").val() && 
				$("#question1-3 input[name='likert3']:checked").val()) {
					LITW.utils.showNextButton(video);
					$("#fill-motivational-survey").hide();
			} else {
				LITW.utils.hideNextButton(video);
				$("#fill-motivational-survey").show();
			}
		})
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
		// stop youtube video
		$(".youtube-video")[0].contentWindow.postMessage('{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*');

		LITW.tracking.recordCheckpoint("instructions");
		$("#instructions").html(instructionsTemplate);
		$("#instructions").i18n();
		LITW.utils.showSlide("instructions");

		LITW.utils.showNextButton(selectCard);
	}

	getSentiment = function(card, card_data) {
		console.log(lastCard);
		var text = $("#" + lastCard + "-textarea").val();
		console.log(text);
		// API call to get the sentiment
		var url = "https://nlp-server-wild.herokuapp.com/sentiment_analysis/?text=" + text;
		var settings = {
			'type': "GET",
			"url": url,
			"contentType": 'application/json',
			success: function(data) {
				console.log("SUCESS....=================");
			},
			error: function(error) {
				console.log("FAIL....=================");
			}
		}

		$.ajax(settings).done(function(response){
			console.log(response);
			var score = parseFloat(response['score']).toFixed(4);
			if(response['label'] === 'NEGATIVE') {
				score = 1 - score;
			}
			sentimentScores[card] = parseFloat(score * 100).toFixed(2);
			card_data[card + '-sentiment'] = sentimentScores[card];
			card_data['card_info'] = 'success';
			console.log(card_data);
			LITW.data.submitStudyData(card_data);
		});
	}

	submitCardData = function() {
		var card_data = {}; 
		var answer = lastCard + "-answer";
		card_data[lastCard] = lastCard;
		card_data[answer] = $("#" + lastCard + "-textarea").val();
		getSentiment(lastCard, card_data);
		LITW.data.submitStudyData(card_data);

		// if(lastCard === "card-1") {
		// 	var radio_answer = lastCard + "-radio-answer";
		// 	card_data[radio_answer] = $("#litw-card1-question1 input[name='likert4']:checked").val();
		// } 

		// in case we need questions in card-2
		// else if (lastCard === "card-2") {
		// 	var radio_answer = lastCard + "-radio-answer";
		// 	card_data[radio_answer] = $("#litw-card2-question1 input[name='likert5']:checked").val();
		// }

		// LITW.data.submitStudyData(card_data);
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
			
			$("#card-1").html(card1Template({
				order: cards.length + 1
			}))
		} else if (card_id === "card-2") {
			$("#card-2").html(card2Template);
			$("#card-2").i18n();
			LITW.utils.showSlide("card-2");

			$("#card-2").html(card2Template({
				order: cards.length + 1
			}))
		} else {
			$("#card-3").html(card3Template);
			$("#card-3").i18n();
			LITW.utils.showSlide("card-3");
			$("#card-3").html(card3Template({
				order: cards.length + 1
			}))
		}
		
		$(".agree-to-continue").on("click", function() {
			if ($(this).prop("checked")) {
				if(cards.length > 0) {
					LITW.utils.showNextButton(selectCard);
				} else {
					$("#btn-next-page").hide();
					LITW.utils.showNextButton(futureSurvey);
				}
				$(".approve-continue").hide();
			} else {
				LITW.utils.hideNextButton();
				$(".approve-continue").show();
			}
		});
	}

	futureSurvey = function() {
		submitCardData();

		LITW.tracking.recordCheckpoint("futureSurvey");
		$("#futureSurvey").html(futureSurveyTemplate);
		$("#futureSurvey").i18n();
		LITW.utils.showSlide("futureSurvey");

		$(".future-question").on("change", function() {
			if($("#litw-futuresurvey-question1 input[name='future-years-available']:checked").val() &&
				$("#litw-futuresurvey-question2 input[name='likert6']:checked").val()){
					LITW.utils.showNextButton(comments);
					$("#fill-future-survey").hide();
			} else {
				LITW.utils.hideNextButton(comments);
				$("#fill-future-survey").show();
			}
		})
		
	},

	submitFutureStudy = function() {
		LITW.data.submitStudyData({
			"future_study": "success",
			"future_1_answer": $("#litw-futuresurvey-question1 input[name='future-years-available']:checked").val(),
			"future_2_answer": $("#litw-futuresurvey-question2 input[name='likert6']:checked").val()
		});
	},

	comments = function() {
		submitFutureStudy();

		$("#progress-header").hide();
		LITW.tracking.recordCheckpoint("comments");
		$("#comments").html(commentsTemplate());
		$("#comments").i18n();
		LITW.utils.showSlide("comments");
		LITW.utils.showNextButton(results);
	},

	getSentimentText = function(score) {
		if(score < 5) {
			return "concerned";
		} else if(score > 95) {
			return "optimistic";
		} else {
			return "neutral";
		}
	}

	results = function() {
		var commentsData = $('#commentsForm').alpaca().getValue();
		LITW.data.submitComments(commentsData);
		LITW.tracking.recordCheckpoint("results");
		LITW.utils.showSlide("results");
		
		$.getJSON("summary.json", function(data) {
			var view;
			
			var tmpSentiments = [sentimentScores['card-1'], sentimentScores['card-2'], sentimentScores['card-3']];
			var posCount = 0;
			for(var i = 0; i < tmpSentiments.length; i++) {
				if(tmpSentiments[i] > 0.5) {
					posCount += 1;
				}
			}

			var technoText = posCount > 1 ? "techno-utopianist" : "techno-skeptic";
			$("#results").html(resultsTemplate({
				technoText: technoText,
				bff_sentiment: getSentimentText(sentimentScores['card-1']), bff: sentimentScores['card-1'],
				catalyst_sentiment: getSentimentText(sentimentScores['card-2']), catalyst: sentimentScores['card-2'],
				forgotten_sentiment: getSentimentText(sentimentScores['card-3']), forgotten: sentimentScores['card-3']
			}));

			fetch('bar.vg.json')
				.then(function(res) { return res.json() })
				.then(function(vlSpec){
					vlSpec["datasets"]["medians"][0]["median"] = data['card1']['count'] === 0 ? 0 : data['card1']['sum'] / data['card1']['count'];
					vlSpec["datasets"]["values"][0]["value"] = sentimentScores['card-1'];
					vlSpec["datasets"]["medians"][1]["median"] = data['card2']['count'] === 0 ? 0 : data['card2']['sum'] / data['card2']['count'];
					vlSpec["datasets"]["values"][1]["value"] = sentimentScores['card-2'];
					vlSpec["datasets"]["medians"][2]["median"] = data['card3']['count'] === 0 ? 0 : data['card3']['sum'] / data['card3']['count'];		
					vlSpec["datasets"]["values"][2]["value"] = sentimentScores['card-3'];
					
					var vgSpec = vegaLite.compile(vlSpec).spec;
					render(vgSpec);
					LITW.results.insertFooter();
				}).catch(console.warn);
			
				function render(spec) {
					view = new vega.View(vega.parse(spec), {
						renderer:  'canvas',  // renderer (canvas or svg)
						container: '#vlcanvas',   // parent DOM container
						hover:     true       // enable hover processing
					});
					return view.runAsync();
				}
		});
	}

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
		// readSummaryData();

		// detect touch devices
		window.litwWithTouch = ("ontouchstart" in window);

		// determine and set the study language
		$.i18n().locale = i18n.getLocale();

		$.i18n().load(
			{
				'en': 'src/i18n/en.json'
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
				// configureStudy();
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
