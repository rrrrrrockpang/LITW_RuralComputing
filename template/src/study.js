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
const data = require("./data");
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

		$(".motivation-question").on("click", function() {
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

	submitCardData = function() {
		var card_data = {}; 
		var answer = lastCard + "-answer";
		card_data[lastCard] = lastCard;
		card_data[answer] = $("#" + lastCard + "-textarea").val();

		if(lastCard === "card-1") {
			var radio_answer = lastCard + "-radio-answer";
			card_data[radio_answer] = $("#litw-card1-question1 input[name='likert4']:checked").val();
		} 

		// in case we need questions in card-2
		// else if (lastCard === "card-2") {
		// 	var radio_answer = lastCard + "-radio-answer";
		// 	card_data[radio_answer] = $("#litw-card2-question1 input[name='likert5']:checked").val();
		// }

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

		$(".future-question").on("click", function() {
			if($("select[name='future-years-available'] option:selected").val() &&
				$("#litw-futuresurvey-question2 input[name='likert6']:checked").val()){
					LITW.utils.showNextButton(comments);
					$("#fill-future-survey").hide();
			} else {
				LITW.utils.hideNextButton(comments);
				$("#fill-future-survey").show();
			}
		})
		LITW.utils.showNextButton(comments);
	},

	submitFutureStudy = function() {
		LITW.data.submitStudyData({
			"future_study": "success",
			"future_1_answer": $("select[name='future-years-available'] option:selected").val(),
			"future_2_answer": $("#litw-futuresurvey-question2 input[name='likert6']:checked").val()
		});
	},

	comments = function() {
		submitFutureStudy();

		$("#progress-header").hide();
		LITW.utils.showSlide("comments");
		LITW.comments.showCommentsPage(results);
	},

	wrangleSummaryData = function(data, userAnswer) {
		var fs = data["futureSurvey2"];
		console.log(fs);
		var retData = [];
		// Total number of participants
		var total = 0; 

		for(var i in fs) {
			if(userAnswer == i) {
				data["futureSurvey2"][i]++;
			}
			total += fs[i]
		}

		console.log(data);

		var x1 = total === 0 ? 20 : data["futureSurvey2"]["1"]; 
		var x2 = total === 0 ? 20 : data["futureSurvey2"]["2"];
		var x3 = total === 0 ? 20 : data["futureSurvey2"]["3"];
		var x4 = total === 0 ? 20 : data["futureSurvey2"]["4"];
		var x5 = total === 0 ? 20 : data["futureSurvey2"]["5"];

		console.log(x1);

		var text1 = total !== 0 ? String(Math.round((x1 / total) * 100).toFixed(2)) : "20";
		var text2 = total !== 0 ? String(Math.round((x2 / total) * 100).toFixed(2)) : "20";
		var text3 = total !== 0 ? String(Math.round((x3 / total) * 100).toFixed(2)) : "20";
		var text4 = total !== 0 ? String(Math.round((x4 / total) * 100).toFixed(2)) : "20";
		var text5 = total !== 0 ? String(Math.round((x5 / total) * 100).toFixed(2)) : "20";

		total = total === 0 ? 100 : total;

		var retData = [
			[{ "scale": 1, "y": x1, "text": "1 (" + text1 + "%)", "total": total }], 
			[{ "scale": 2, "y": x2, "text": "2 (" + text2 + "%)", "total": total }], 
			[{ "scale": 3, "y": x3, "text": "3 (" + text3 + "%)", "total": total }], 
			[{ "scale": 4, "y": x4, "text": "4 (" + text4 + "%)", "total": total }], 
			[{ "scale": 5, "y": x5, "text": "5 (" + text5 + "%)", "total": total }], 
		];

		return retData;
	},

	createVisualizationForFutureStudy1 = function(data) {
		var mean = data['futureSurvey1']['count'] === 0 ? 1 : data['futureSurvey1']['sum'] / data['futureSurvey1']['count'];
		var selected = parseFloat($("select[name='future-years-available'] option:selected").val());

		var margin = { top: 50, left: 60, right: 60, bottom: 50 };
		
		var w = 600 - margin.left - margin.right;
		var h = 150 - margin.top - margin.bottom;

		var xScale = d3.scale.linear()
			.domain([0, 51])
			.range([0, w])
		
		var svg = d3.select("#vis_anchor_1")
			.append("svg")
			.attr("width", w + margin.left + margin.right)
			.attr("height", h + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		//gradient color
		var grad = svg.append("defs")
			.append("linearGradient")
			.attr({
				"id" : "grad",
				"x1" : "0%",
				"x2" : "100%",
				"y1" : "0%",
				"y2" : "0%"
			});
		
		grad.append("stop")
			.attr("offset", "30%")
			.style("stop-color", "#FF6200");
		
		grad.append("stop")
			.attr("offset", "70%")
			.style("stop-color", "#FDB777");
		
		// draw a rectangle
		var rect = svg
			.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("height", 50)
			.attr("width", w)
			.style("fill", "url(#grad)")
		
		// draw where the line is
		var meanLine = svg.append('g');
		meanLine
			.append("rect")
			.attr("x", mean * w / 51 - 5)
			.attr("y", -5)
			.attr("height", 60)
			.attr("width", 10)
			.style({
				"fill": "white",
				"stroke": "black",
				"stroke-width": "1px",
			});
		meanLine
			.append('text')
			.attr('class', 'barsEndlineText')
			.attr('text-anchor', 'middle')
			.attr("x", mean * w / 51 - 5)
			.attr("y", 75)
			.text('Average Year: ' + String(mean.toFixed(2)));

		var responseLine = svg.append('g');
		var triangle = d3.svg.symbol().type("triangle-down");

		responseLine.append("path")
			.attr('d', triangle)
			.attr("stroke", "green")
			.attr("fill", "black")
			.attr("transform", "translate(" + (xScale(selected)) + ", 0)")

		responseLine
			.append('text')
				.attr('class', 'barsEndlineText')
				.attr('text-anchor', 'middle')
				.attr("x", xScale(selected))
				.attr("y", -12)
				.text('Your Prediction');

	}

	createVisualizationForFutureStudy2 = function(data) {
		var userAnswer = parseInt($("#litw-futuresurvey-question2 input[name='likert6']:checked").val());
		var dataset = wrangleSummaryData(data, userAnswer);		

		var margin = { top: 5, left: 60, right: 60, bottom: 12 };
		
		var w = 600 - margin.left - margin.right;
		var h = 150 - margin.top - margin.bottom;

		var stack = d3.layout.stack();
		stack(dataset);

		var xScale = d3.scale.linear()
			.domain([0, d3.max(dataset, function (d) {
				return d3.max(d, function (d) {
					return d.y0 + d.y;
				});
			})]) // default domain
			.range([0, w]);

		var colors = d3.scale.ordinal()
			.range(["#FF6200", "#FD7F2C", "#FD9346", "#FDA766", "#FDB777"]);
		
		var svg = d3.select("#vis_anchor_2")
			.append("svg")
			.attr("width", w + margin.left + margin.right)
			.attr("height", h + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// Add a group for each row of data
		var groups = svg.selectAll("g")
			.data(dataset)
			.enter()
			.append("g")
			.style("fill", function (d, i) { return colors(i); });

		// Add a rect for each data value
		var rects = groups.selectAll("rect")
			.data(function (d) { return d; })
			.enter()
			.append("rect")
			.attr("x", function (d) { return xScale(d.y0); })
			.attr("y", 30)
			.attr("height", 50)
			.attr("width", function (d) { return xScale(d.y); });

		var text = groups.append("g")
			.selectAll("text")
			.data(function (d) { return d; })
		  	.enter()
		 	.append("text")
			.attr("class", "text")
			.attr("x", function (d) { return xScale(d.y0) + (xScale(d.y) / 2) - 10; })
			.attr("y", function (d) {
				if(d.scale === 1 || d.scale === 3 || d.scale === 5) {
					return 30 + 50 + 13;
				} else {
					return 24;
				}
			})
			.text(function(d) { return d.text; })
			.style("font-size", "10px");
			
		var selectedDataPoint = "";
		for(var i = 1; i <= 5; i++) {
			if(dataset[i-1][0]["scale"] === userAnswer) {
				selectedDataPoint = dataset[i-1][0];
			} 
		}

		// default if not selected. sanity check
		if(selectedDataPoint === "") {
			selectedDataPoint = dataset[2][0];
		}

		var highlight = svg.append("rect")
			.attr("x", xScale(selectedDataPoint['y0']))
			.attr("y", 30)
			.attr("width", xScale(selectedDataPoint['y']))
			.attr("height", 50)     
			.style("fill", "transparent")
			.style("stroke", "black")
			.style("stroke-width", 5)
	}

	results = function(commentsData) {
		// Need to restore this
		LITW.data.submitComments(commentsData);
		LITW.tracking.recordCheckpoint("results");
		LITW.utils.showSlide("results");
		LITW.results.insertFooter();

		$.getJSON( "summary.json", function( data ) {
			$("#results").html(resultsTemplate({
				numYear: $("select[name='future-years-available'] option:selected").text(),
				rating: $("#litw-futuresurvey-question2 input[name='likert6']:checked").val()
			}));
			createVisualizationForFutureStudy1(data);
			createVisualizationForFutureStudy2(data);
		});
	
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
		// readSummaryData();

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
