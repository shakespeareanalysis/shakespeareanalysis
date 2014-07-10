$(document).ready(function() {

	/* MENU */
	$('#about').click(function() {
		showMenuItem($(this).attr('rel'));
	});

	$(".about").hide();

	function showMenuItem(what) {
		$('#blende').show();
		$('.' + what).show();
	}

	function hideMenuItem() {
		$('#blende').hide();
		$('.overlay').hide();
	}

	$('#blende').click(function(e) {
		hideMenuItem();
	});

	$('.close').click(function(e) {
		hideMenuItem();
	});

	$('#blende').hide();

	$('.close_overlay').click(function() {
		hideMenuItem();
	});


	/* Getter for metrics */
	function getAllLines() {
		return parseInt($("#generalstats").data("lines"));
	}
	function getActLines(act) {
		return parseInt($(".act[data-act='"+act+"']").data("lines"));
	}
	function getSceneLines(act, scene) {
		return parseInt($(".scene[data-act='"+act+"'][data-scene='"+scene+"']").data("lines"));
	}
	function getAllWords() {
		return parseInt($("#generalstats").data("words"));
	}
	function getActWords(act) {
		return parseInt($(".act[data-act='"+act+"']").data("words"));
	}
	function getSceneWords(act, scene) {
		return parseInt($(".scene[data-act='"+act+"'][data-scene='"+scene+"']").data("words"));
	}
	function getAllStagedirections() {
		return parseInt($(".stagedirection").size());
	}
	function getActStagedirections(act) {
		return parseInt($(".stagedirection[data-act='"+act+"']").size());
	}
	function getSceneStagedirections(act, scene) {
		return parseInt($(".stagedirection[data-act='"+act+"'][data-scene='"+scene+"']").size());
	}


	


	$(".character_name").hover(
		function () {
			if(!$(this).data('pinned')) {
				$(this).children(".char-more-info").addClass("visible");
				if($(this).parent().css('padding-top')=='25px'){
					$(this).addClass('character_name_hover');
				}

			}
		}, 
		function () {
			if(!$(this).data('pinned')) {
				$(this).children(".char-more-info").removeClass("visible");
				if($(this).parent().css('padding-top')=='25px'){
					$(this).removeClass('character_name_hover');
				}

			}
		}
		);



	$(".character_name").click(function() {
		
		// collect all the relevant data
		var data = $(this).data();

		// check for death
		var node = $(this).children("stat");
		if(node.attr('stat') != undefined) {
			data.dies = true;
			if(node.attr('when') != "NaN") {
				data.death = "dies in <a href='#' class='deathlink' onClick='goToDeath("+node.attr('when')+")'>line " + node.attr('when') + "</a>";
			}
			if(node.attr('notbefore') != "NaN" || node.attr('notafter') != "NaN") {
				data.death = "dies between line " + node.attr('notbefore') + " and " + node.attr('notafter');
			}
		} else {
			data.dies=false
		}

		data.color = $(this).css("background-color")

		// update inspectors
		inspectCharacter(data);
		inspectSpeeches({who: data.character});
	});



	// sending info to inspector
	$(".act_desc").click(function() {
		
		// collect all the relevant data
		var thisAct = $(this).parent().data();
		
		thisAct.active = splitActive(thisAct.active, ";");

		// show data
		inspectAct(thisAct);
		inspectSpeeches({act: thisAct.act})

	});

	$(".scene[data-scene]").click(function() {

		// collect all the relevant data
		var data = $(this).data();
		
		data.active =  splitActive(data.active, ";");

		// show data
		inspectScene(data);
		inspectSpeeches({act: data.act, scene: data.scene})
		
	});

	$(".stagedirection").click(function() {
		
		// collect all the relevant data
		var data = $(this).data();
		
		data.active = splitActive(data.active, " ");

		// show data
		updateInspectors(data);
	});

	$(".dialogue:not(.death)").click(function() {

		// make it active
		activateSpeech($(this));

		// update slider model
		currentSpeechNode = allSpeechElements.index($(this));
		
		// inspect speech
		inspectSpeech($(this));

	});

	function listLines(lines, from, to) {

		var temp = [];

		for(var i = 0; i < lines.length; i++) {
			temp.push({linenumber: i+from, line: lines[i]});
		}

		return temp;
	}

	function inspectCharacter(data) {

		// additional data
		var more = $(".character_name[id="+data.character+"]").children(".char-more-info").html();
		if(more != undefined) {
			data.about = true;
			data.more = more;
		} else {
			data.about = false;
		}
		if(data.sex != undefined) {
			if(data.sex.length > 1) {
				data.hassex = true;
			} else {
				data.hassex = false;
			}
		} 

		// active during
		data.activeIn = getCharactersParts(data.character);
		

		// update inspectors with data
		templateScript = $("#charactertmpl").html();
		template = Handlebars.compile(templateScript);
		$("#inspectorData > .inspectorContent").html(template(data));

		// prepare plots
		var net = list_network_neighbours(data.character);

		var plot2 = [ 
			{ "label": "play", "amount": getAllLines() },
			{ "label": data.character, "amount": countFor(data.character, {}, "lines") }
		]

		var plot3 = [
			{ "label": "all", "amount": countFor( data.character, {}, "lines") }
		]

		var plot4 = [
			{ "label": "all", "amount": countFor( data.character, {}, "lines") }
		]

		var plot5 = [ 
			{ "label": "play", "amount": getAllWords() },
			{ "label": data.character, "amount": countFor(data.character, {}, "words") }
		]

		var plot6 = [
			{ "label": "all", "amount": countFor( data.character, {}, "words") }
		]

		var plot7 = [
			{ "label": "all", "amount": countFor( data.character, {}, "words") }
		]

		// lines 
		countsForParts(plot3, data.character, "act", "lines");
		countsForParts(plot4, data.character, "scene", "lines");

		// words
		countsForParts(plot6, data.character, "act", "words");
		countsForParts(plot7, data.character, "scene", "words");

		// plot all
		plot_character_network(net, "plot1", 100);
		plot_speech_detail(plot2, "plot2")
		plot_speech_detail(plot3, "plot3")
		plot_speech_detail(plot4, "plot4")
		plot_speech_detail(plot5, "plot5")
		plot_speech_detail(plot6, "plot6")
		plot_speech_detail(plot7, "plot7")

		// register Listeners again
		registerListeners();

	}

	function countsForParts(plot, who, parts, what) {
		$("."+parts+"[data-"+parts+"]").each(function(i,e) {
			var currentNode = $(e);
			var currentActive = currentNode.data('active');		
			currentActive = splitActive(currentActive, ";");

			if(currentActive.indexOf(who) >= 0) {
				var hasScene = "";
				var amount;

				if(parts == "scene") {
					label = "a " + currentNode.data('act') + " s " + currentNode.data(parts);
					amount = countFor(who, {act: currentNode.data('act'), scene: currentNode.data(parts)}, what)
				} else {
					label = "a " + currentNode.data(parts);
					amount = countFor(who, {act: currentNode.data(parts)}, what)
				}

				plot.push({
					label: label,
					amount: amount
				});
			}
		});
	}

	function getCharactersParts(who) {
		var result = [];

		$(".act[data-act]").each(function(i, e) {
			var thisNode = $(e);
			var thisActive = thisNode.data('active');
			
			thisActive = splitActive(thisActive, ";")
			
			if(thisActive.indexOf(who) >= 0)  {

				var tempResult = {when: {act: thisNode.data('act'), scene: []}}
				result.push(tempResult);

				$(".scene[data-act="+thisNode.data('act')+"]").each(function(i, e) {
					var sceneNode = $(e);
					var sceneActive = $(e).data('active');
					
					sceneActive = splitActive(sceneActive, ";");

					if(sceneActive.indexOf(who) >= 0) {
						tempResult.when.scene.push(sceneNode.data('scene'))
					}
				});
			}

		});
		
		return result;
	}

	function splitSpeech(speech) {

		var temp = speech.html().split("<br>");

		var currentSpanType = "";

		for(var i = 0; i < temp.length; i++) {

			if(temp[i].indexOf("<span") >= 0 && temp[i].indexOf("</span>") == -1) { // Zeile beginnt mit <span und enthält kein </span
				temp[i] = temp[i] + "</span>";
				currentSpanType = temp[i].substring(temp[i].indexOf("<span"), temp[i].indexOf("\">")+2);
			} else if(currentSpanType != "" && temp[i].indexOf("<span") < 0 && temp[i].indexOf("</span>") < 0) {
				temp[i] = currentSpanType + temp[i] + "</span>";
			} else if(temp[i].indexOf("<span") < 0 && temp[i].indexOf("</span>") >= 0) {
				temp[i] = currentSpanType + temp[i];
				currentSpanType = "";
			}
		}

		console.log(temp)
		
		return temp;
	}

	function inspectSpeech(speech) {

		// collect all the relevant data
		var data = speech.data();
		data.color = speech.css("background-color");
		data.speech = listLines(splitSpeech(speech.children(".speech")), data.from, data.to);

		// update inspectors with data
		templateScript = $("#speechtmpl").html();
		template = Handlebars.compile(templateScript);
		$("#inspectorData > .inspectorContent").html(template(data));

		// prepare plots
		var plot1 = [
			{ "label": "play", "amount": getAllLines() },
			{ "label": "act", "amount": getActLines(data.act) },
			{ "label": "scene", "amount": getSceneLines(data.act, data.scene) },
			{ "label": "this", "amount": data.lines },
			{ "label": data.character + " (scene)", "amount": countFor( data.character, {act: data.act, scene: data.scene}, "lines") },
			{ "label": data.character + " (act)", "amount": countFor( data.character, {act: data.act}, "lines") },
			{ "label": data.character + " (play)", "amount": countFor( data.character, {}, "lines") }
		]
		var plot2 = [
			{ "label": "play", "amount": getAllWords() },
			{ "label": "act", "amount": getActWords(data.act) },
			{ "label": "scene", "amount": getSceneWords(data.act, data.scene) },
			{ "label": "this", "amount": data.words },
			{ "label": data.character + " (scene)", "amount": countFor( data.character, {act: data.act, scene: data.scene}, "words") },
			{ "label": data.character + " (act)", "amount": countFor( data.character, {act: data.act}, "words") },
			{ "label": data.character + " (play)", "amount": countFor( data.character, {}, "words") }
		]

		// plot all
		plot_speech_detail(plot1, "plot1");
		plot_speech_detail(plot2, "plot2");

		// show content
		showSpeechContent(data);

		// register Listeners again
		registerListeners();
		

	}

	function inspectSpeeches(constraint) {
		
		// reset inspector
		$("#inspectorText > .inspectorContent").html("");

		// prepare template for reuse
		templateS = $("#speechtexttmpl").html();
		templateB = Handlebars.compile(templateS);

		var allSpeeches;

		// switch constraints and collect data
		if(constraint.who) {
			allSpeeches = $(".dialogue:not(.death)[data-character="+constraint.who+"]");
		} else if(constraint.scene) {
			allSpeeches = $(".dialogue:not(.death)[data-act="+constraint.act+"][data-scene="+constraint.scene+"]");
		} else if(constraint.act) {
			allSpeeches = $(".dialogue:not(.death)[data-act="+constraint.act+"]");
		}

		// sort all speeches by "from" attribute
		allSpeeches.sort(function (a, b) {
			var contentA = parseInt( $(a).data('from'));
			var contentB = parseInt( $(b).data('from'));
			return (contentA < contentB) ? -1 : (contentA > contentB) ? 1 : 0;
		});
		
		// collect data
		var speech;
		allSpeeches.each(function(i, e) {
			var current = $(e);
			var speech = current.data();

			speech.color = current.css("background-color");
			speech.speech = current.children(".speech").html().split("<br>");
			speech.speech = listLines(speech.speech, speech.from, speech.to);

			$("#inspectorText > .inspectorContent").append(templateB(speech));

			
		});

		// highlight all the speeches
		resetActiveSpeeches()
		allSpeeches.addClass("active")


	}


	function registerListeners() {
		// refresh listeners for downloading the graphics
		$(".generateimage").click(function() { 
			download($(this).parent().children(".chart").attr('id'), $(this).parent().children("h4").html()); 
		});

	}


	function showSpeechContent(speech) {
		templateS = $("#speechtexttmpl").html();
		templateB = Handlebars.compile(templateS);
		$("#inspectorText > .inspectorContent").html(templateB(speech));		
	}

	function inspectAct(act) {

		// collect more data
		act.fromLine = allSpeechElements.filter("[data-act='"+act.act+"']").first().data('from');
		act.toLine = allSpeechElements.filter("[data-act='"+act.act+"']").last().data('from');

		// update inspectors with data
		var templateScript = $("#acttmpl").html();
		var template = Handlebars.compile(templateScript);
		$("#inspectorData > .inspectorContent").html(template(act));

		// prepare plots
		var net = {
			"nodes": list_network_characters(act.active, {"act": act.act}),
			"links": list_network_links(act.active, {"act": act.act})
		}

		var metricsLines = [
			{ "label": "play", "amount": getAllLines() },
			{ "label": "act", "amount": getActLines(act.act) }
		]

		var metricsWords = [
			{ "label": "play", "amount": getAllWords() },
			{ "label": "act", "amount": getActWords(act.act) }
		]

		var metricsStage = [
			{ "label": "play", "amount": getAllStagedirections() },
			{ "label": "act", "amount": getActStagedirections(act.act) }
		]

		// plot all
		plot_character_network(net, "plot1", 150);
		plot_speech_detail(metricsLines, "plot2");
		plot_speech_detail(metricsWords, "plot3");
		plot_speech_detail(metricsStage, "plot4");
		plot_pie(get_for_characters(act.act, act.active, "lines"), "plot5");
		plot_pie(get_for_characters(act.act, act.active, "words"), "plot6");
		
		/* stagedirections by character is not robust atm */
		//plot_pie(get_for_characters(act.act, act.active, "stagedirections"), "plot7");

		// register Listeners again
		registerListeners();

	}

	function get_for_characters(act, active, what, scene) {
		var result = [];

		for(character in active) {
			result.push({
				label: active[character],
				amount: countFor(active[character], {act:act, scene:scene}, what),
				bgcolor: $(".character_name[id='"+active[character]+"']").css("background-color")
			});
		}

		return result;
	}

	function list_network_characters(active, constraint) {

		var temp = [];
		for (key in active) {
			temp.push({
				"name": active[key],
				"lines": countFor(active[key], constraint, "lines"),
				"bgcolor": $(".character_name[id="+active[key]+"]").css("background-color")
			});
		}
		return temp;

	}

	function countFor(who, constraint, what) {
		
		var nodes;

		if(constraint.scene) {
			nodes = $(".dialogue:not(.death)[data-character="+who+"][data-act="+constraint.act+"][data-scene="+constraint.scene+"]");
		} else if (constraint.act) {
			nodes = $(".dialogue:not(.death)[data-character="+who+"][data-act="+constraint.act+"]");
		} else {
			nodes = $(".dialogue:not(.death)[data-character="+who+"]");
		}

		var sum = 0;
		nodes.each(function(i, e) {
			sum += parseInt($(e).data(what));
		});

		return sum;

	}

	function list_network_neighbours(who) {
		var result = {};
		var nodes = [{name: who, lines: countFor(who, {}, "lines"), bgcolor: $(".character_name[id="+who+"]").css("background-color")}];
		var neighbours = [];
		var links = []

		// find neighbours
		$(".scene[data-scene]").each(function(i,e) {
			var current = $(e);
			var currentActive = current.data('active');
			currentActive = splitActive(currentActive, ";")

			if(currentActive.indexOf(who) >= 0) {
				// who is active in this scene, collect all others
				for(character in currentActive) {
					if(currentActive[character] != who && neighbours.indexOf(currentActive[character]) == -1) {
						neighbours.push(currentActive[character]);
					}
				}
			}
		});

		// collect all neighbours and
		// find links to center (who)
		for(n in neighbours) {
			
			// collecting neighbours...
			nodes.push({
				name: neighbours[n],
				lines: countFor(neighbours[n], {}, "lines"), 
				bgcolor: $(".character_name[id="+neighbours[n]+"]").css("background-color")
			});

			// linking neighbours to center
			links.push({
				source: who,
				target: neighbours[n],
				scenes: []
			});
		}

		// find link-strengh (number of shared scenes)  for each link
		var scenes = $(".scene[data-scene]");
		
		find_links(scenes, links)

		// finish
		result.nodes = nodes;
		result.links = links;
		return result;
	}

	function find_links(scenes, links) {

		var sceneActive = [];
		scenes.each(function(i, e) {
			sceneActive.push({
				scene: $(e).data('scene'),
				active: splitActive($(e).data('active'), ";")					
			});
		});

		// find shared scenes
		for(scene in sceneActive) {
			// combine all characters in scene 
			for(var i = 0; i < sceneActive[scene].active.length; i++) {
				for(var j = 0; j < sceneActive[scene].active.length; j++) {
					var pair = links.filter(function(obj) {
						return obj.source == sceneActive[scene].active[i] && obj.target == sceneActive[scene].active[j];
					});

					// is there a matching pair?
					if(pair.length == 1) {
						// save scene number in the pair
						pair[0].scenes.push(sceneActive[scene].scene);
					}
				}
			}
		}

	}

	function splitActive(data, separator) {
		if( Object.prototype.toString.call( data ) !== '[object Array]' ) {
		    data = data.split(separator);
		}
		return data;
	}

	function list_network_links(active, constraint) {
		var temp = [];

		if(constraint.scene) {

			var scenes = $(".scene[data-act="+constraint.act+"][data-scene="+constraint.scene+"]");
			
			// all character combinations
			for(var i = 0; i < active.length; i++) {
				for(var j = i+1; j < active.length; j++) {
					temp.push({source: active[i], target: active[j], scenes: [1] });
				}
			}


		} else if (constraint.act) {
			
			var scenes = $(".scene[data-act="+constraint.act+"]");
			
			// all character combinations
			for(var i = 0; i < active.length; i++) {
				for(var j = i+1; j < active.length; j++) {
					temp.push({source: active[i], target: active[j], scenes: [] });
				}
			}

			find_links(scenes, temp)

		}		

		return temp;
	}

	function inspectScene(scene) {
		// collect more data
		scene.fromLine = allSpeechElements.filter("[data-act='"+scene.act+"'][data-scene='"+scene.scene+"']").first().data('from');
		scene.toLine = allSpeechElements.filter("[data-act='"+scene.act+"'][data-scene='"+scene.scene+"']").last().data('from');

		// update inspectors with data
		var templateScript = $("#scenetmpl").html();
		var template = Handlebars.compile(templateScript);
		$("#inspectorData > .inspectorContent").html(template(scene));

		// prepare plots
		var net = {
			"nodes": list_network_characters(scene.active, {"act": scene.act , "scene": scene.scene}),
			"links": list_network_links(scene.active, {"act": scene.act, "scene": scene.scene})
		}

		var metricsLines = [
			{ "label": "play", "amount": getAllLines() },
			{ "label": "act", "amount": getActLines(scene.act) },
			{ "label": "scene", "amount": getSceneLines(scene.act, scene.scene) }
		]

		var metricsWords = [
			{ "label": "play", "amount": getAllWords() },
			{ "label": "act", "amount": getActWords(scene.act) },
			{ "label": "scene", "amount": getSceneWords(scene.act, scene.scene) }
		]

		var metricsStage = [
			{ "label": "play", "amount": getAllStagedirections() },
			{ "label": "act", "amount": getActStagedirections(scene.act) },
			{ "label": "scene", "amount": getSceneStagedirections(scene.act, scene.scene) }
		]

		// plot all
		plot_character_network(net, "plot1", 150);
		plot_speech_detail(metricsLines, "plot2");
		plot_speech_detail(metricsWords, "plot3");
		plot_speech_detail(metricsStage, "plot4");
		plot_pie(get_for_characters(scene.act, scene.active, "lines", scene.scene), "plot5");
		plot_pie(get_for_characters(scene.act, scene.active, "words", scene.scene), "plot6");
		
		/* stagedirections by character is not robust atm */
		//plot_pie(get_for_characters(act.act, act.active, "stagedirections"), "plot7");

		// register Listeners again
		registerListeners();
	}


	$(".act_desc").hover(
		function () {

			// hide inactive characters
			var activeCharacters = $(this).parent().data('active');
			activeCharacters = splitActive(activeCharacters, ";");
					

			for(character in activeCharacters) {
				$(".character_name[id='"+activeCharacters[character]+"'").addClass("activeCharacter");
			}
			var inactiveCharacters = $(".character_name:not(.activeCharacter)");
			inactiveCharacters.addClass("inactive");
			inactiveCharacters.parent().next().children(".character_timeline").addClass("inactive");

		}, 
		function () {
			unhideCharacters();
		});



	$(".scene").hover(
		function () {
			
			var activeCharacters = $(this).data('active');
			activeCharacters = splitActive(activeCharacters, ";");

			for(character in activeCharacters) {
				$(".character_name[id='"+activeCharacters[character]+"'").addClass("activeCharacter");
			}

			var inactiveCharacters = $(".character_name:not(.activeCharacter)");
			inactiveCharacters.addClass("inactive");
			inactiveCharacters.parent().next().children(".character_timeline").addClass("inactive");

		}, 
		function () {
			unhideCharacters();
		});

	function unhideCharacters() {
		$(".character_name").removeClass("inactive");
		$(".character_timeline").removeClass("inactive");
		$(".activeCharacter").removeClass("activeCharacter");
	}


$(".stagedirection").hover(function () {
		
		$(this).children(".stagedetails").addClass("visible");
		
		if(parseInt($(this).css('left')) > $(this).parent().width() / 2) {
			$(this).children(".stagedetails").css("right", "0");
			$(this).children(".stagedetails").css("left", "auto");
		}

		var activeCharacters = $(this).data('characters');
		if(activeCharacters.length > 0) {
			
			activeCharacters = splitActive(activeCharacters, " ");
			
			for(character in activeCharacters) {

				if(activeCharacters[character].substring(0,1) == "#") {
					activeCharacters[character] = activeCharacters[character].substring(1,activeCharacters[character].length)
				}
				$(".character_name[id='"+activeCharacters[character]+"'").addClass("activeCharacter");
			}

			var inactiveCharacters = $(".character_name:not(.activeCharacter)");
			inactiveCharacters.addClass("inactive");
			inactiveCharacters.parent().next().children(".character_timeline").addClass("inactive");
		}



	}, function () {
		$(this).children(".stagedetails").removeClass("visible");
		unhideCharacters();		
	});


/* ZOOM MODE */
	// experimental
	var isZoomed = false;
	var nonZoomedWindowWidth = $(window).width();

	function zoom() {

		if(isZoomed) {
			$("#content").width(nonZoomedWindowWidth);
			$("header").width(nonZoomedWindowWidth);
			nonZoomedWindowWidth = $(window).width();
		} else {
			$("#content").width(nonZoomedWindowWidth*3);
			$("header").width(nonZoomedWindowWidth*3);
		}
		isZoomed=!isZoomed;
	}
	$(document).keydown(function(event) {
		if(event.which == 90) {
			zoom();
		}
	});


	/* SLIDER CONTROLS */

	var sticky = false;
	var sliderPos = 1;
	var leftmostPos = 154;
	var rightmostPos = $('body').width();
	var relativeSliderPos = 1;
	var speeches = $("#generalstats").data("lines");

	


	// slide Far left (10 instances)
	$("#slideFarLeft").click(
		function() {
			goToSpeech(-10);
		});
	$(document).keydown(function(event) {
		if(event.which == 49) {
			$("#slideFarLeft").addClass("highlight");
			goToSpeech(-10);
		}
	});
	$(document).keyup(function(event) {
		if(event.which == 49) {
			$("#slideFarLeft").removeClass("highlight");
		}
	});
	
	// slide left (1 instance)
	$("#slideLeft").click(
		function() {
			goToSpeech(-1);
		}); 
	$(document).keydown(function(event) {
		if(event.which == 37 || event.which == 50) {
			$("#slideLeft").addClass("highlight");
			goToSpeech(-1);
		}
	});
	$(document).keyup(function(event) {
		if(event.which == 37 || event.which == 50) {
			$("#slideLeft").removeClass("highlight");
		}
	});


	// slide right (1 instance)
	$("#slideRight").click(
		function() {
			goToSpeech(1);
		}); 
	$(document).keydown(function(event) {
		if(event.which == 39 || event.which == 51) {
			$("#slideRight").addClass("highlight");
			goToSpeech(1);
		}
	});
	$(document).keyup(function(event) {
		if(event.which == 39 || event.which == 51) {
			$("#slideRight").removeClass("highlight");
		}
	});


	// slide Far right (10 instances)
	$("#slideFarRight").click(
		function() {
			goToSpeech(10);
		});
	$(document).keydown(function(event) {
		if(event.which == 52) {
			$("#slideFarRight").addClass("highlight");
			goToSpeech(10);
		}
	});
	$(document).keyup(function(event) {
		if(event.which == 52) {
			$("#slideFarRight").removeClass("highlight");
		}
	});


	/* Speech Inspector < und > */
	$("span.prevspeech").click(function() {
		goToSpeech(-1);
	});
	$("span.nextspeech").click(function() {
		goToSpeech(1);
	});


	// slider
	var allSpeechElements = $(".dialogue:not(.death)");
	allSpeechElements.sort(function (a, b) {
		var contentA = parseInt( $(a).data('from'));
		var contentB = parseInt( $(b).data('from'));
		return (contentA < contentB) ? -1 : (contentA > contentB) ? 1 : 0;
	});

	
	var currentSpeechNode = -1; // at the start
	var maxSpeechNodes = allSpeechElements.length;
	var currentActiveSpeech = null;
	var lastActiveSpeech = null;


	function goToSpeech(to) {

		currentSpeechNode += to;

		if(currentSpeechNode > maxSpeechNodes-1) {
			//right of max
			currentSpeechNode = maxSpeechNodes-1;
		}
		if(currentSpeechNode < 0) {
			currentSpeechNode = 0;
		}

		activateSpeech($(allSpeechElements.get(currentSpeechNode)));
	}

	function moveSliderTo(speech) {
		$("#slider").css("left", speech.offset().left+"px");
	}

	function activateSpeech(speech) {

		// reset all other actives
		if(lastActiveSpeech != null) {
			lastActiveSpeech.removeClass('active');
		}
		resetActiveSpeeches();

		// activate this
		speech.addClass('active');

		// swap variables
		lastActiveSpeech = speech;

		// move slider
		moveSliderTo(speech);

		// show in inspector
		inspectSpeech(speech);

	}

	function resetActiveSpeeches() {
		$(".dialogue:not(.death)").removeClass("active")
	}



	/* tutorial stuff */
	$("#close").click(function() {
		$("#tutorial").fadeOut(200, null);
		$("#blende").fadeOut(200, null);
	});
	$("#finish").click(function() {
		$("#tutorial").fadeOut(200, null);
		$("#blende").fadeOut(200, null);
	});

	$("#next").click(function() {
		$("#step1").removeClass("visible");
		$("#step2").addClass("visible");
	});

	$("#back").click(function() {
		$("#step1").addClass("visible");
		$("#step2").removeClass("visible");
	});


	// inspector dragging and resizing (part of jquery UI)
	$(".draggable").draggable({
		scroll: false,
		containment: "body",
		cursor: "move",
		handle: ".inspectorHead",
		stop: function stop(event){
    		if(event.type === "resizestop") {
        		var topOff = $(this).offset().top - $(window).scrollTop()
        		$(this).css("top",topOff)
    		}
    		$(this).css("position","fixed")     
		}   
	});

	$(".resizable").resizable({
		minHeight: 20,
		containment: "body",
		start: function start(event) {
			if(event.type === "resizestart") {
				var topOff = $(this).offset().top - $(window).scrollTop()
        		$(this).css("top",topOff + $("#header").height)
			}
			$(this).css("position", "fixed")
		},
		stop: function stop(event){
    		if(event.type === "resizestop") {
        		var topOff = $(this).offset().top - $(window).scrollTop()
        		$(this).css("top",topOff + $("#header").height)
    		}
    		$(this).css("position","fixed")     
		}   
	});


	// Initialize page
	$("#inspectorText").css("left", resetInspectors($("#inspectorData"))+"px");
	$("#inspectorData").css("left", resetInspectors($("#inspectorText"))+"px");

	$("#inspectorText").css("top", "75px");
	$("#inspectorData").css("top", "400px");

	$("#inspectorText").css("position", "fixed");
	$("#inspectorData").css("position", "fixed");

	// Listener for Minimizer
	$(".inspectorControls").click(function() {
		$(this).parent().toggleClass("minimized", 100);
		return false;
	});


	
    });


function resetInspectors(element) {
	return $("body").width()-element.width()-20;
}


// downloading images

function download(id, name) {

	var svg_xml = (new XMLSerializer).serializeToString(document.getElementById(id));
	var form = document.getElementById("svgform");
	form['data'].value = svg_xml ;
	form['filename'].value = safeFilename(name)+".png";
	form.submit();
}

function safeFilename(name) {
	name = name.split(" ").join("_");
	name = name.split("'").join("-");
	return name;
}

// jump to death speech
function goToDeath(line) {
	var thing = $(".dialogue:not(.death)").filter(function(i) {
		return parseInt($(this).data('to')) >= line && parseInt($(this).data('from')) <= line
	}).click();
}

// jump to act / sceneActive
function goToScene(scene) {
	$(".scene[data-scene="+scene+"]").click();
}
function goToAct(act) {
	$(".act[data-act="+act+"]").children(".act_desc").click();
}

function printDataCSV() {
	var all = $(".dialogue:not(.death)");
	var delim = "\t";
	
	var output = "character\tact\tscene\tfromline\ttoline\tlines\twords\ttext\n";
	var current, data;

	all.each(function(i,e) {

		current = $(e);
		data = current.data();

		output += data.character;
		output += delim;
		output += data.act;
		output += delim;
		output += data.scene;
		output += delim;
		output += data.from;
		output += delim;
		output += data.to;
		output += delim;
		output += data.lines;
		output += delim;
		output += data.words;
		output += delim;
		output += current.children(".speech").html();
		output += "\n";
		
	});

	console.log(output)
}