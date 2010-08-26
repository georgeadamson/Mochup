// alert("mochup plugin loaded");

(function($){

$.fn.mochup = function( options, args ){

	var undefined,		// Used when testinf for undefined variables.
		mochup	= {		// Hash of settings and flags for internal use: (Not to be confused with jQuery.fn.mochup.defaults)
			startTime		: 0,
			pauseTime		: 0,
			playedTime		: 0,
			pauseDuration	: 0,
			$context		: this || $(document),	// Reference to the current context element.
			$pointer		: null,		// Will be a cached reference to the fake mouse pointer element during playback.
			eventType		: {},		// Will be populated with event specs at run time.
			eventLog		: {},		// Will store recorded events.
			freshEventLog	: { size:0, startTime:0, endTime:0, selectors:{}, data:{} },
			pulseIntervalID	: null,		// Will store a reference to the interval timer "pulse" used during recording and playback.
			nextSelectorIdx	: 1,		// Incremented internally while building lookup list of element selectors.
			abbrLookup		: { s:"selector", t:"type", id:"id", n:"name", k:"keyCode", ak:"altKey", ck:"ctrlKey", mk:"metaKey", sk:"shiftKey", b:"button", x:"pageX", y:"pageY", d:"wheelDelta" },
			isPaused		: false,
			isPlaying		: false,
			isRecording		: false,
			isMethod		: { play:1,record:1,pause:1,stop:1,reset:1,destroy:1 },		// List of valid mochup plugin method names (Assume 1 means true here. Just used 1 because it is shorter).
			eventNamespace	: "mochup",
			document		: window.document,
			body			: window.document.body,
			timeNow			: function(){ return new Date().getTime(); }
		};
	options	= options || {};			// Ensure options is not undefined (so that the first call to onReset does not blow up).

	// Prevent calls to console.log() causing error when firebug is not available:
	//if( !window.console ) var console = {}; if( !console.log ) console.log = function(){};

	// Initialise eventLog:
	onReset();
	
	// Setup sample data for testing:
	//mochup.eventLog = {"size":145,"startTime":0,"endTime":0,"selectors":{"#mochupRecord":1,"BODY":2,"#txt1":3,"#mochupStop":4},"data":{"279":{"t":5,"s":1,"x":1128,"y":11},"295":{"t":5,"s":1,"x":1121,"y":12},"311":{"t":5,"s":1,"x":1114,"y":14},"328":{"t":5,"s":2,"x":1094,"y":20},"744":{"t":5,"s":3,"x":66,"y":22},"843":{"t":5,"s":3,"x":65,"y":25},"860":{"t":5,"s":3,"x":65,"y":26},"1042":{"t":5,"s":3,"x":65,"y":25},"1058":{"t":5,"s":3,"x":65,"y":24},"1075":{"t":5,"s":3,"x":65,"y":23},"1109":{"t":5,"s":3,"x":66,"y":22},"1175":{"t":5,"s":3,"x":66,"y":21},"1224":{"t":5,"s":3,"x":66,"y":20},"1286":{"t":8,"s":3},"1362":{"t":"click","s":3,"x":66,"y":20,"b":0},"2437":{"t":2,"s":3,"k":"H"},"2438":{"t":3,"s":3,"k":104,"shiftKey":false},"2492":{"t":4,"s":3,"k":"H"},"2668":{"t":2,"s":3,"k":"E"},"2669":{"t":3,"s":3,"k":101,"shiftKey":false},"2725":{"t":4,"s":3,"k":"E"},"2868":{"t":2,"s":3,"k":"L"},"2869":{"t":3,"s":3,"k":108,"shiftKey":false},"2916":{"t":4,"s":3,"k":"L"},"3036":{"t":2,"s":3,"k":"L"},"3037":{"t":3,"s":3,"k":108,"shiftKey":false},"3092":{"t":4,"s":3,"k":"L"},"3228":{"t":2,"s":3,"k":"O"},"3229":{"t":3,"s":3,"k":111,"shiftKey":false},"3292":{"t":4,"s":3,"k":"O"},"3444":{"t":2,"s":3,"k":32},"3445":{"t":3,"s":3,"k":32,"shiftKey":false},"3524":{"t":4,"s":3,"k":32},"4036":{"t":2,"s":3,"k":"G"},"4038":{"t":3,"s":3,"k":103,"shiftKey":false},"4124":{"t":4,"s":3,"k":"G"},"4244":{"t":2,"s":3,"k":"E"},"4245":{"t":3,"s":3,"k":101,"shiftKey":false},"4340":{"t":4,"s":3,"k":"E"},"4364":{"t":2,"s":3,"k":"O"},"4365":{"t":3,"s":3,"k":111,"shiftKey":false},"4444":{"t":4,"s":3,"k":"O"},"4460":{"t":2,"s":3,"k":"R"},"4461":{"t":3,"s":3,"k":114,"shiftKey":false},"4557":{"t":4,"s":3,"k":"R"},"4628":{"t":2,"s":3,"k":"G"},"4629":{"t":3,"s":3,"k":103,"shiftKey":false},"4685":{"t":4,"s":3,"k":"G"},"4716":{"t":2,"s":3,"k":"E"},"4717":{"t":3,"s":3,"k":101,"shiftKey":false},"4789":{"t":4,"s":3,"k":"E"},"5236":{"t":2,"s":3,"k":8},"5237":{"t":3,"s":3,"k":8,"shiftKey":false},"5302":{"t":4,"s":3,"k":8},"5420":{"t":2,"s":3,"k":8},"5422":{"t":3,"s":3,"k":8,"shiftKey":false},"5532":{"t":4,"s":3,"k":8},"5596":{"t":2,"s":3,"k":8},"5598":{"t":3,"s":3,"k":8,"shiftKey":false},"5652":{"t":4,"s":3,"k":8},"5764":{"t":2,"s":3,"k":8},"5766":{"t":3,"s":3,"k":8,"shiftKey":false},"5836":{"t":4,"s":3,"k":8},"5957":{"t":2,"s":3,"k":8},"5958":{"t":3,"s":3,"k":8,"shiftKey":false},"6013":{"t":4,"s":3,"k":8},"6124":{"t":2,"s":3,"k":8},"6126":{"t":3,"s":3,"k":8,"shiftKey":false},
	//	"6197":{"t":4,"s":3,"k":8},"6804":{"t":2,"s":3,"k":"F"},"6806":{"t":3,"s":3,"k":102,"shiftKey":false},"6852":{"t":4,"s":3,"k":"F"},"6999":{"t":2,"s":3,"k":"R"},"7000":{"t":3,"s":3,"k":114,"shiftKey":false},"7053":{"t":2,"s":3,"k":"E"},"7054":{"t":3,"s":3,"k":101,"shiftKey":false},"7076":{"t":4,"s":3,"k":"R"},"7188":{"t":2,"s":3,"k":"D"},"7189":{"t":3,"s":3,"k":100,"shiftKey":false},"7212":{"t":4,"s":3,"k":"E"},"7276":{"t":4,"s":3,"k":"D"},"8696":{"t":2,"s":3,"k":16},"8796":{"t":2,"s":3,"k":49},"8798":{"t":3,"s":3,"k":33,"shiftKey":true},"8876":{"t":4,"s":3,"k":49},"8964":{"t":4,"s":3,"k":16},"9013":{"t":5,"s":3,"x":86,"y":20},"9035":{"t":5,"s":3,"x":101,"y":20},"9045":{"t":5,"s":3,"x":125,"y":20},"9062":{"t":5,"s":3,"x":151,"y":20},"9079":{"t":5,"s":2,"x":173,"y":20},"9096":{"t":5,"s":2,"x":208,"y":18},"9112":{"t":5,"s":2,"x":223,"y":18},"9129":{"t":5,"s":2,"x":261,"y":18},"9145":{"t":5,"s":2,"x":302,"y":16},"9162":{"t":5,"s":2,"x":320,"y":16},"9178":{"t":5,"s":2,"x":357,"y":14},"9195":{"t":5,"s":2,"x":399,"y":13},"9212":{"t":5,"s":2,"x":416,"y":13},"9228":{"t":5,"s":2,"x":449,"y":12},"9245":{"t":5,"s":2,"x":482,"y":11},"9261":{"t":5,"s":2,"x":496,"y":11},"9278":{"t":5,"s":2,"x":525,"y":10},"9295":{"t":5,"s":2,"x":549,"y":10},"9311":{"t":5,"s":2,"x":558,"y":10},"9328":{"t":5,"s":2,"x":581,"y":10},"9344":{"t":5,"s":2,"x":606,"y":10},"9361":{"t":5,"s":2,"x":615,"y":10},"9377":{"t":5,"s":2,"x":638,"y":10},"9394":{"t":5,"s":2,"x":660,"y":10},"9411":{"t":5,"s":2,"x":666,"y":10},"9427":{"t":5,"s":2,"x":687,"y":10},"9444":{"t":5,"s":2,"x":694,"y":10},"9461":{"t":5,"s":2,"x":710,"y":10},"9478":{"t":5,"s":2,"x":722,"y":10},"9494":{"t":5,"s":2,"x":728,"y":10},"9510":{"t":5,"s":2,"x":740,"y":10},"9527":{"t":5,"s":2,"x":760,"y":10},"9543":{"t":5,"s":2,"x":768,"y":10},"9560":{"t":5,"s":2,"x":791,"y":10},"9577":{"t":5,"s":2,"x":815,"y":10},"9593":{"t":5,"s":2,"x":824,"y":10},"9610":{"t":5,"s":2,"x":847,"y":10},"9626":{"t":5,"s":2,"x":874,"y":10},"9643":{"t":5,"s":2,"x":884,"y":10},"9660":{"t":5,"s":2,"x":906,"y":10},"9676":{"t":5,"s":2,"x":923,"y":10},"9693":{"t":5,"s":2,"x":926,"y":10},"9710":{"t":5,"s":2,"x":938,"y":10},"9726":{"t":5,"s":2,"x":945,"y":10},"9743":{"t":5,"s":2,"x":946,"y":10},"9759":{"t":5,"s":2,"x":950,"y":10},"9776":{"t":5,"s":2,"x":955,"y":10},"9792":{"t":5,"s":2,"x":956,"y":10},"9809":{"t":5,"s":2,"x":960,"y":10},"9826":{"t":5,"s":2,"x":963,"y":10},"9842":{"t":5,"s":2,"x":968,"y":10},"9860":{"t":5,"s":4,"x":975,"y":10},"9875":{"t":5,"s":4,"x":979,"y":10},"9893":{"t":5,"s":4,"x":986,"y":10},"9909":{"t":5,"s":4,"x":987,"y":10},"9926":{"t":5,"s":4,"x":988,"y":10},"10130":{"t":5,"s":4,"x":992,"y":12},"10160":{"t":7,"s":3},"10250":{"t":"click","s":4,"x":992,"y":12,"b":0}}};
	mochup.eventLog = {
		"size":154,
		"startTime":0,
		"endTime":0,
		"selectors":{"#mochupRecord":1,"#mochupPlay":2,"#body":3,"#txt1":4,"#mochupStop":5},
		"data":{
			"201":{"t":5,"s":1,"b":0,"x":900,"y":13},"218":{"t":5,"s":1,"b":0,"x":894,"y":13}
			//,"234":{"t":11,"s":1,"b":0,"x":882,"y":13},"235":{"t":10,"s":2,"b":0,"x":882,"y":13},"236":{"t":5,"s":2,"b":0,"x":882,"y":13},"251":{"t":5,"s":2,"b":0,"x":839,"y":13},"267":{"t":11,"s":2,"b":0,"x":779,"y":13},"268":{"t":10,"s":3,"b":0,"x":779,"y":13},"269":{"t":5,"s":3,"b":0,"x":779,"y":13},"284":{"t":5,"s":3,"b":0,"x":716,"y":13},"300":{"t":5,"s":3,"b":0,"x":656,"y":13},"317":{"t":5,"s":3,"b":0,"x":600,"y":13},"334":{"t":5,"s":3,"b":0,"x":572,"y":19},"350":{"t":5,"s":3,"b":0,"x":551,"y":22},"367":{"t":5,"s":3,"b":0,"x":542,"y":24},"550":{"t":5,"s":3,"b":0,"x":528,"y":24},"566":{"t":5,"s":3,"b":0,"x":502,"y":24},"583":{"t":5,"s":3,"b":0,"x":464,"y":24},"599":{"t":5,"s":3,"b":0,"x":406,"y":24},"616":{"t":5,"s":3,"b":0,"x":344,"y":22},"633":{"t":5,"s":3,"b":0,"x":304,"y":19},"650":{"t":5,"s":3,"b":0,"x":266,"y":18},"666":{"t":5,"s":3,"b":0,"x":256,"y":18},"683":{"t":5,"s":3,"b":0,"x":248,"y":18},"848":{"t":5,"s":3,"b":0,"x":242,"y":18},"865":{"t":5,"s":3,"b":0,"x":231,"y":18},"883":{"t":5,"s":3,"b":0,"x":219,"y":19},"898":{"t":5,"s":3,"b":0,"x":209,"y":20},"915":{"t":5,"s":3,"b":0,"x":201,"y":22},"932":{"t":5,"s":3,"b":0,"x":183,"y":23},"948":{"t":5,"s":3,"b":0,"x":170,"y":23},"965":{"t":11,"s":3,"b":0,"x":160,"y":23},"966":{"t":10,"s":4,"b":0,"x":160,"y":23},"967":{"t":5,"s":4,"b":0,"x":160,"y":23},"981":{"t":5,"s":4,"b":0,"x":152,"y":23},"998":{"t":5,"s":4,"b":0,"x":145,"y":23},"1014":{"t":5,"s":4,"b":0,"x":140,"y":23},"1032":{"t":5,"s":4,"b":0,"x":135,"y":21},"1048":{"t":5,"s":4,"b":0,"x":131,"y":21},"1064":{"t":5,"s":4,"b":0,"x":127,"y":21},"1081":{"t":5,"s":4,"b":0,"x":125,"y":21},"1097":{"t":5,"s":4,"b":0,"x":123,"y":21},"1115":{"t":5,"s":4,"b":0,"x":122,"y":21},"1131":{"t":5,"s":4,"b":0,"x":121,"y":21},"1147":{"t":5,"s":4,"b":0,"x":120,"y":21},"1164":{"t":5,"s":4,"b":0,"x":119,"y":21},"1181":{"t":5,"s":4,"b":0,"x":118,"y":21},"1197":{"t":5,"s":4,"b":0,"x":117,"y":21},"1214":{"t":5,"s":4,"b":0,"x":116,"y":21},"1230":{"t":5,"s":4,"b":0,"x":116,"y":21},"1250":{"t":5,"s":4,"b":0,"x":115,"y":20},"1255":{"t":9,"s":4,"b":0,"x":115,"y":20},"1257":{"t":8,"s":4},"1330":{"t":12,"s":4,"b":0,"x":115,"y":20},"1334":{"t":"click","s":4,"b":0,"x":115,"y":20},"1349":{"t":2,"s":4,"k":"D","sk":false},"1351":{"t":3,"s":4,"k":"d","sk":false},"1364":{"t":2,"s":4,"k":"S","sk":false},"1365":{"t":3,"s":4,"k":"s","sk":false},"1379":{"t":2,"s":4,"k":"A","sk":false},"1381":{"t":3,"s":4,"k":"a","sk":false},"1396":{"t":2,"s":4,"k":"F","sk":false},"1397":{"t":3,"s":4,"k":"f","sk":false},"1452":{"t":4,"s":4,"k":"A","sk":false},"1454":{"t":4,"s":4,"k":"S","sk":false},"1491":{"t":4,"s":4,"k":"D","sk":false},"1548":{"t":2,"s":4,"k":32,"sk":false},"1549":{"t":3,"s":4,"k":32,"sk":false},"1555":{"t":2,"s":4,"k":"A","sk":false},"1557":{"t":3,"s":4,"k":"a","sk":false},"1563":{"t":4,"s":4,"k":"F","sk":false},"1643":{"t":2,"s":4,"k":"D","sk":false},"1645":{"t":3,"s":4,"k":"d","sk":false},"1650":{"t":2,"s":4,"k":"S","sk":false},"1652":{"t":3,"s":4,"k":"s","sk":false},"1683":{"t":2,"s":4,"k":"F","sk":false},"1685":{"t":3,"s":4,"k":"f","sk":false}
			//,"1748":{"t":4,"s":4,"k":32,"sk":false},"1771":{"t":2,"s":4,"k":32,"sk":false},"1772":{"t":3,"s":4,"k":32,"sk":false},"1779":{"t":4,"s":4,"k":"S","sk":false},"1788":{"t":4,"s":4,"k":"D","sk":false},"1795":{"t":4,"s":4,"k":"F","sk":false},"1911":{"t":5,"s":4,"b":0,"x":116,"y":20},"1923":{"t":2,"s":4,"k":"S","sk":false},"1925":{"t":3,"s":4,"k":"s","sk":false},"1934":{"t":5,"s":4,"b":0,"x":132,"y":20},"1936":{"t":2,"s":4,"k":"D","sk":false},"1937":{"t":3,"s":4,"k":"d","sk":false},"1945":{"t":5,"s":4,"b":0,"x":147,"y":19},"1961":{"t":11,"s":4,"b":0,"x":178,"y":17},"1962":{"t":5,"s":3,"b":0,"x":178,"y":17},"1971":{"t":2,"s":4,"k":"F","sk":false},"1973":{"t":3,"s":4,"k":"f","sk":false},"1981":{"t":4,"s":4,"k":32,"sk":false},"1982":{"t":5,"s":3,"b":0,"x":197,"y":17},"1994":{"t":5,"s":3,"b":0,"x":209,"y":17},"2003":{"t":4,"s":4,"k":"S","sk":false},"2012":{"t":5,"s":3,"b":0,"x":216,"y":17},"2014":{"t":4,"s":4,"k":"A","sk":false},"2022":{"t":4,"s":4,"k":"D","sk":false},"2023":{"t":2,"s":4,"k":32,"sk":false},"2025":{"t":3,"s":4,"k":32,"sk":false},"2060":{"t":4,"s":4,"k":"F","sk":false},"2131":{"t":2,"s":4,"k":"A","sk":false},"2133":{"t":3,"s":4,"k":"a","sk":false},"2139":{"t":2,"s":4,"k":"D","sk":false},"2141":{"t":3,"s":4,"k":"d","sk":false},"2147":{"t":2,"s":4,"k":"S","sk":false},"2149":{"t":3,"s":4,"k":"s","sk":false},"2179":{"t":4,"s":4,"k":"A","sk":false},"2187":{"t":4,"s":4,"k":"S","sk":false},"2193":{"t":5,"s":3,"b":0,"x":217,"y":17},"2203":{"t":4,"s":4,"k":"D","sk":false},"2210":{"t":5,"s":3,"b":0,"x":221,"y":17},"2227":{"t":5,"s":3,"b":0,"x":230,"y":17},"2244":{"t":5,"s":3,"b":0,"x":254,"y":17},"2259":{"t":4,"s":4,"k":32,"sk":false},"2261":{"t":5,"s":3,"b":0,"x":341,"y":17},"2276":{"t":5,"s":3,"b":0,"x":425,"y":15},"2293":{"t":5,"s":3,"b":0,"x":482,"y":15},"2309":{"t":5,"s":3,"b":0,"x":530,"y":24},"2326":{"t":5,"s":3,"b":0,"x":545,"y":29},"2492":{"t":5,"s":3,"b":0,"x":547,"y":29},"2509":{"t":5,"s":3,"b":0,"x":562,"y":29},"2525":{"t":5,"s":3,"b":0,"x":584,"y":29},"2542":{"t":5,"s":3,"b":0,"x":612,"y":28},"2559":{"t":5,"s":3,"b":0,"x":674,"y":23},"2575":{"t":5,"s":3,"b":0,"x":730,"y":22},"2592":{"t":5,"s":3,"b":0,"x":761,"y":22},"2609":{"t":5,"s":3,"b":0,"x":788,"y":22},"2808":{"t":5,"s":3,"b":0,"x":789,"y":22},"2824":{"t":5,"s":3,"b":0,"x":792,"y":22},"2841":{"t":5,"s":3,"b":0,"x":795,"y":21},"2858":{"t":5,"s":3,"b":0,"x":799,"y":20},"2874":{"t":5,"s":3,"b":0,"x":801,"y":19},"2892":{"t":11,"s":3,"b":0,"x":804,"y":17},"2893":{"t":10,"s":5,"b":0,"x":804,"y":17},"2894":{"t":5,"s":5,"b":0,"x":804,"y":17},"2907":{"t":5,"s":5,"b":0,"x":805,"y":16},"2924":{"t":5,"s":5,"b":0,"x":806,"y":14},"2941":{"t":5,"s":5,"b":0,"x":806,"y":14},"2957":{"t":5,"s":5,"b":0,"x":806,"y":13},"2974":{"t":5,"s":5,"b":0,"x":806,"y":12},"2991":{"t":5,"s":5,"b":0,"x":806,"y":11},"3007":{"t":5,"s":5,"b":0,"x":806,"y":10},"3024":{"t":5,"s":5,"b":0,"x":806,"y":8},"3040":{"t":5,"s":5,"b":0,"x":806,"y":8},"3058":{"t":5,"s":5,"b":0,"x":806,"y":7},"3107":{"t":5,"s":5,"b":0,"x":806,"y":6},"3244":{"t":9,"s":5,"b":0,"x":806,"y":6},"3246":{"t":7,"s":4},"3310":{"t":12,"s":5,"b":0,"x":806,"y":6},"3314":{"t":"click","s":5,"b":0,"x":806,"y":6}
		}
	};


	// Parse any special method name provided as a string in the options argument, then execute the method:
	// Eg: $(...).mochup("destroy")  becomes equivalent to:  $(...).mochup({ destroy:true })
	if( options && typeof(options) === "String" && mochup.isMethod[options] ){
		method = options;
		options = {}; options[method] = true;
	};

	// Bail-out immediately if instructed to do so:
	if( options.destroy && onDestroy() ){
		return this;
	}

	if( options.play ){	// TODO:

		if( args ){
			onLoad( args, options.username, options.password, onPlay );
			return this;
		} else {
			return onPlay();
		}
		
	}

	// A wrapper for jQuery.extend() that conditionally replaces or extends a subset of options: (Eg: options.player.events)
	function extendOrReplace(grp,subgrp){

		var optGrp = options[grp] = ( options[grp] || {} );

		return options[grp][subgrp] = ( optGrp[subgrp] && optGrp[subgrp].replaceDefaults )
				? optGrp[subgrp]
				: $.extend( {}, $.fn.mochup.defaults[grp][subgrp], optGrp[subgrp] );

	}

	// Assume defaults where options not specified:
	extendOrReplace('player','events');
	extendOrReplace('player','attributes');
	extendOrReplace('recorder','events');
	extendOrReplace('recorder','attributes');

	/*
	var playerEvents       = ( options && options.recorder && options.player.events )       || {};
	var recorderEvents     = ( options && options.recorder && options.recorder.events )     || {};
	var playerAttributes   = ( options && options.player   && options.player.attributes )   || {};
	var recorderAttributes = ( options && options.recorder && options.recorder.attributes ) || {};
	options = $.extend( {}, defaults, options );
	options.player.events       = playerEvents.replaceDefaults       ? playerEvents       : $.extend( {}, defaults.player.events,       playerEvents   );
	options.recorder.events     = recorderEvents.replaceDefaults     ? recorderEvents     : $.extend( {}, defaults.recorder.events,     recorderEvents );
	options.player.attributes   = playerAttributes.replaceDefaults   ? playerAttributes   : $.extend( {}, defaults.player.attributes,   playerAttributes );
	options.recorder.attributes = recorderAttributes.replaceDefaults ? recorderAttributes : $.extend( {}, defaults.recorder.attributes, recorderAttributes );
	playerEvents = recorderEvents = playerAttributes = recorderAttributes = null;
	// Use the code above instead if extend() raises "too much recursion" error (Caused by object reference such as window in defaults tree)
	// options = $.extend( true, {}, $.fn.mochup.defaults );
	*/

	// Make aliases for our event specs:
	var playerEvents		= options.player.events,
		recorderEvents		= options.recorder.events,
		playerAttributes	= options.player.attributes,
		recorderAttributes	= options.recorder.attributes;

	// Ensure any custom mochup callbacks are genuine functions: (So we don't waste time later having to check them while busy recording etc)
	// Eg: If options.onPlay is not a function then change it to undefined.
	$.each( mochup.isMethod, function(methodName){
		//var callback = "on" + methodName.substr(0,1).toUpperCase() + methodName.substr(1);
		var callback = methodName.replace( /^([a-z])/, 'on$1' );	// Eg: 'play' => 'onPlay'
		if( options[callback] && !$.isFunction(options[callback]) ) options[callback] = undefined;
	});


	// Load JSON library for serialising Event logs: (Event logs cannot be saved unless this library has loaded or the browser has native JSON methods)
	if( !(window.JSON && window.JSON.stringify) && options.jsonUrl ){
		$.getScript(options.jsonUrl);
	}

	// Load Mochup Control Panel UI:
	if( options.ui ){
		if( options.uiUrl ){
			$.ajaxSetup({
				dataType	: "html",
				contentType	: "text/html"
			});
			$.getScript( options.uiUrl, function(html,txt){ $(html).appendTo(document.body).fadeIn("fast"); } );
		}else
			$(options.controlPanel).show();
	};


	// Start the playback timer:
	mochup.pulseIntervalID = window.setInterval(pulse,100);

	// Bind or delegate each event recorder handler and generate a reverse-lookup hash for each event-type id:
	// (We namespace the events (eg "click.mochup") to make life easier when we need to unbind them later.)
	$.each( recorderEvents, function(type,eventSpec){

		var typeId		= recorderEvents[type].id;
		var delegate	= recorderEvents[type].delegate;

		$( eventSpec.target )[ delegate ? "live" : "bind" ]( type + "." + mochup.eventNamespace, recordEvent );

		mochup.eventType[typeId] = type;

	});


	// Generate a reverse lookup for every event property abbreviation and event type id:
	invertHash( mochup.eventType );
	invertHash( mochup.abbrLookup );


	// Wire up the mochup ui control buttons:
	$(options.stopButton).live("click."+mochup.eventNamespace,onStop);
	$(options.playButton).live("click."+mochup.eventNamespace,onPlay);
	$(options.pauseButton).live("click."+mochup.eventNamespace,onPause);
	$(options.recordButton).live("click."+mochup.eventNamespace,onRecord);
	$(window).bind("unload."+mochup.eventNamespace,onDestroy);

	function pulse(){

		if( mochup.isPaused ){
			return;
		}else if( mochup.isPlaying ){
			var startTime = mochup.timeNow() - mochup.startTime;
			window.status = new Date(startTime).toLocaleTimeString();
			playEvent();
		}else if( mochup.isRecording ){
			var startTime = mochup.timeNow() - mochup.startTime;
			window.status = new Date(startTime).toLocaleTimeString();
		};

	}

	function recordEvent(e){

		if( mochup.isRecording && !mochup.isPaused && e.target ){

			// Fetch spec for this event: (Eg: options.recorder.events.click)
			var eventSpec	= delegate[e.type];

			// Derive a css selector that describes where to find this element in the dom:
			var	sel			= e.target.id
								? "#" + e.target.id
								: { "BODY":1,"body":1 }[ e.target.tagName ]
									? "BODY"
									: deriveSelector.apply( e.target );

			// Lookup the index for this element's selector: (Add a new one to the lookup if necessary. Storing the selector index alongside each recorded event helps reduce the log size)
			var selIdx		= mochup.eventLog.selectors[sel] || ( mochup.eventLog.selectors[sel] = mochup.nextSelectorIdx++ );

			// Initialise a new log record with the standard attributes:
			var	snapshot	= {
				t : ( eventSpec && eventSpec.id ) || e.type,	// Event type (id or name).
				s : selIdx										// Element selector lookup index.
			}

			// Ensure we record every event attribute that the eventSpec tells us to:
			// (Eg: options.recorder.events.click.data.button and options.recorder.events.click.data.pageX)
			if( eventSpec ){
				$.each(eventSpec.data, function(attr,val){ if( val ){

					// Lookup the short name (abbreviation) for this attribute and log the event attribute:
					// (If a function has been specified then log its return value instead)
					var chr, abbr = mochup.abbrLookup[attr] || attr;

					snapshot[abbr] = $.isFunction(val) ?
						val(e) :
						( attr === "keyCode" ? (e.keyCode || e.charCode) : e[attr] );	// Allow for browser differences (Mozilla provide charCode in keypress event).

					// When logging alpha keys store a character instead of a char code. (Makes log file slighty more readable but not necessarily smaller because of the quotes around them )
					if( attr=="keyCode" && /[a-z]/i.test( chr = String.fromCharCode(e.keyCode || e.charCode) ) ){
						snapshot[abbr] = chr;
					};

				} })
			}

			var timestamp = mochup.timeNow() - mochup.startTime;
			mochup.eventLog.data[timestamp] = snapshot;
			mochup.eventLog.size++;
			if( mochup.eventLog.size >= mochup.cacheLimit )
				onSave();	// TODO: Calculate nextCacheLimit

		};
	}

	function playEvent(){

		var snapshot, type, val, chr,
			selectors	= mochup.eventLog.selectors,
			data		= mochup.eventLog.data,
			now			= mochup.timeNow() - mochup.startTime;

		// Attempt to trigger all events recorded in this timeframe:
		for( var timestamp = mochup.playedTime; timestamp <= now; timestamp++ ){

			snapshot = data[timestamp];

			if( snapshot ){

				type = mochup.eventType[snapshot.t];

				if( type ) {

					var $elem = $( selectors[snapshot.s] );

					if( $elem.length ){

						// Move our fake mouse pointer:
						if( snapshot.x && snapshot.y && mochup.$pointer.length ){
							mochup.$pointer.css({ left:snapshot.x, top:snapshot.y });
						}

						// Create a new event object: (And remove our custom selector "s" attribute because it seems to upset things)
						var Event = $.Event(type);
						delete snapshot.s;

						// Copy recorded event attributes to our new event object:
						$.each( snapshot, function(abbr,val){
							var attr = mochup.abbrLookup[abbr] || abbr;
							if( playerAttributes[attr] ){
								val = playerAttributes[attr].apply( $elem[0], [snapshot] );
							}
							Event[ attr ] = val;
						});

						// Also set browser-specific alternatively-named attibutes: (Taking care not to override any that already have a value)
						if( Event.keyCode ){
							if( !Event.which ){ Event.which = Event.keyCode }
							if( !Event.charCode ){ Event.charCode = Event.keyCode }
						}
						if( Event.button && Event.which === undefined ){
							Event.which = (Event.button & 1 ? 1 : ( Event.button & 2 ? 3 : ( Event.button & 4 ? 2 : 0 ) ));
						}
						if( Event.relatedTarget ){
							if( !Event.toElement ){ Event.toElement = Event.relatedTarget }
							if( !Event.fromElement ){ Event.fromElement = Event.relatedTarget }
						}
						if( !Event.srcElement ){
							Event.srcElement = Event.target
						}

						// If this event's spec has a playback handler defined then run it now:
						var eventSpec = playerEvents[type];
						if( eventSpec ){
							eventSpec.apply( Event.target, [Event] )
						}

						// FIRE the event:
						window.setTimeout( function(){ 
							if( $elem ){ $elem.trigger(Event) }
						}, 0 );

					}
					$elem = null;
				}
			}

			// Check whether we have reached the end of the eventLog:
			if( timestamp >= mochup.eventLog.endTime ){ onStop(); break }

		}

		// Note how far playback has progressed and clear object references:
		mochup.playedTime = now;
		data = selectors = snapshot = null;
	}


	// Load log file and make it ready to play:
	// The source can be a url or a log data hash.
	function onLoad( source, username, password, callback ){

		if( typeof(source) === "String" ){

			// source is a url:
			$.getJSON( source, { usr:username, pwd:password }, function(data, status){
				
				
				
			});

		} else {

			// source is a hash of log data:
			
		}

	}


	// Save current session's eventLog and clear memory to make room for more: 
	function onSave(){

		log('onSave...');

		var time			= mochup.timeNow() - mochup.startTime
			//,json			= JSON.stringify(mochup.eventLog)
			//,eventLogSlice	= $.extend( true, {}, mochup.eventLog );
			//for( var ev in mochup.eventLog.data)
			//	console.log(ev,mochup.eventLog.data[ev])
		log(mochup.eventLog);
		//console.log( time, json );

		// Because of browser same-domain security policy we can only submit data using GET instead of POST:
		// (Only IMG or SCRIPT elements can do this)
//		$.getScript( options.saveToUrl, eventLogSlice, onAfterSave );

		// Increment the cache limit so the next chunk of the log will be saved when limit is reached:
//		mochup.cacheLimit += options.cacheLimit;

		log('...after onSave.');

	}


	// Called after every eventLog save to the database:
	function onAfterSave(data,status){
		
		//alert(status + '\n' + data)
		
	}


	// Re-initialise the eventLog and flags:
	function onReset(){
		// Proceed if no callback was specified in the options OR the callback does not return false to cancel this event:
		log("before onReset");
		if( !options.onReset || options.onReset() ){
			mochup.isPaused = mochup.isPlaying = mochup.isRecording = false;
			mochup.eventLog = $.extend( {}, mochup.freshEventLog );
		}
		log("after onReset");
	}

	// Stop Playing/Recording:
	function onStop(){
		// Proceed if no callback was specified in the options OR the callback does not return false to cancel this event:
		log("before onStop");
		if( !options.onStop || options.onStop() ){
			mochup.isPaused = mochup.isPlaying = mochup.isRecording = false;
			mochup.$pointer	= null;
			updateUI();
			onSave();
		}
		log("after onStop");
		return !mochup.isPlaying && !mochup.isRecording;
	}

	// Pause the Playing/Recording:
	function onPause(){
		// Proceed if no callback was specified in the options OR the callback does not return false to cancel this event:
		log("before onPause");
		if( !options.onPause || options.onPause() ){
			mochup.isPaused  = true;
			mochup.pauseTime = mochup.timeNow();
			updateUI();
		}
		log("after onPause");
		return mochup.isPaused;
	}

	function onPlay(){
		// Proceed if no callback was specified in the options OR the callback does not return false to cancel this event:
		log("before onPlay");
		if( !options.onPlay || options.onPlay() ){

			// Stop any recording immediately:
			if( mochup.isRecording ){
				mochup.isRecording	= false;
				mochup.isPaused		= false;
			}

			// Ensure the event log is in good shape:
			preprocessEventLog();

			// Clear outputs and reset start time:
			if( !mochup.isPaused && !mochup.isPlaying ){
				if(options.clearFields) mochup.$context.find("INPUT:text,TEXTBOX,SELECT").andSelf().val("");
				mochup.startTime  = mochup.timeNow();
				mochup.cacheLimit = options.cacheLimit;
				mochup.$pointer	  = $(options.pointer);	// Cache a reference to the fake pointer element.
			};

			mochup.isPaused		= false;
			mochup.isPlaying	= true;
			mochup.isRecording	= false;	
			updateUI();

		}
		log("after onPlay");
		return mochup.isPlaying;
	}

	function onRecord(){

		// Proceed if no callback was specified in the options OR the callback does not return false to cancel this event:
		log("before onRecord");
		if( !options.onRecord || options.onRecord() ){

			// Cancel any active playback and reset the eventLog:
			if( mochup.isPlaying ){
				mochup.isPlaying	= false;
				mochup.isPaused		= false;
			}
			if( !mochup.isPaused ){
				onReset();
			}

			mochup.startTime	= mochup.timeNow();
			mochup.isPaused		= false;
			mochup.isPlaying	= false;
			mochup.isRecording	= true;
			updateUI();

		}
		log("after onRecord");
		return mochup.isRecording;
	}

	// Update style of Mochup UI elements according to our current Play/Record/Pause/Stop status:
	function updateUI(){
		$(document.body)
			.add(options.controlPanel)
			.add(options.pauseButton)
			.add(options.stopButton)
			.add(options.playButton)
			.add(options.recordButton)
			.toggleClass("mochup-is-paused", mochup.isPaused)
			.toggleClass("mochup-is-playing", mochup.isPlaying)
			.toggleClass("mochup-is-recording", mochup.isRecording);
	}

	// Prepare the event log ready to be played back: (This reduces delays caused by processing during playback)
	function preprocessEventLog(){

		mochup.eventLog.title  = document.title;
		mochup.eventLog.url    = document.location.href;
		mochup.eventLog.window = {
			//left		: $(window).position().left, 
			//top		: $(window).position().top,
			width		: $(document).width(),
			height		: $(document).height(),
			scrollLeft	: document.body.scrollLeft || document.documentElement.scrollLeft || window.pageXOffset || 0,
			scrollTop	: document.body.scrollTop  || document.documentElement.scrollTop  || window.pageYOffset || 0,
			favicon		: $("link[href *= favicon]").attr("href") || ''
		};

		// Derive start and end time of the recording if not already explicitly provided in the eventLog:
		if( !mochup.eventLog.startTime || !mochup.eventLog.endTime ){

			var startTime = 0, endTime = 0;
			//var timeSlots = {}, timeSlot = 0, nextTimeSlot = options.playbackInterval;

			$.each( mochup.eventLog.data, function(time,logEntry){

				if( !isNaN(time) ){
					endTime = time;
					if( !startTime ) startTime = time;
				}

				//if( time > nextTimeSlot ){
				//	timeSlot = nextTimeSlot;
				//	nextTimeSlot += options.playbackInterval
				//}
				//timeSlots[timeSlot][time] = logEntry;
			});
			if( !mochup.eventLog.startTime ) mochup.eventLog.startTime = startTime;
			if( !mochup.eventLog.endTime   ) mochup.eventLog.endTime   = endTime;
		};

		// Ensure we can use the Selectors hash as a reverse lookup: (To return an element-selector given its index)
		invertHash( mochup.eventLog.selectors, isFinite );

	}

	// Clear up all evidence of this mochup plugin: (Because we namespaced our events they are easy to unbind)
	function onDestroy(){

		// Proceed if no callback was specified in the options OR the callback does not return false to cancel this event:
		if( !options.onDestroy || options.onDestroy() ) return false;

		window.clearInterval(mochup.pulseIntervalID);
		onStop();
		mochup.$context.find("*").add(window).unbind(mochup.eventNamespace).die(mochup.eventNamespace);

		if( options.ui && options.uiUrl   ){ $( options.controlPanel ).remove() }
		if( options.ui && options.pointer ){ $( options.pointer      ).remove() }

		// Explicitly discard all our object references:
		$ = options = mochup = mochup.$pointer = mochup.$context = playerEvents = recorderEvents = playerAttributes = recorderAttributes = nnull;

		return true;

	}

	// Helper to generate a reverse lookup for every key/value pair in the hash object: (Apply filter function if provided)
	function invertHash(hash, filterFn){
		return $.each(hash, function(key,val){
			if( val !== undefined && ( !filterFn || filterFn(val,key) ) ){
				hash[val] = key;
			}
		})
	}

	// Helper function to generate a selector string for locating an element in the dom: (Only used when elem has no id or name)
	function deriveSelector(){

		var doc = this.ownerDocument, body = doc.body;
		if ( this === body ) return "BODY";
		var elem = this, sel = getNodeSyntax(elem), context = mochup.$context[0], docElem = doc.documentElement;

		// Search up the DOM until we reach either the root or a parent that has an ID:
		while( (elem = elem.parentNode) && !elem.id && elem !== context && elem !== body && elem !== docElem ){
			sel = getNodeSyntax(elem) + ">" + sel;
		}

		if( elem.id ){
			sel = "#" + elem.id + ">" + sel;
		}
		return sel;

		function getNodeSyntax(elem){
			return elem.nodeName + ":eq(" + $(elem).prevAll(elem.nodeName).length + ")";
		}
	}

	// Helper for logging an debugging:
	function log(args){
		if( window.console && window.console.log ){
			window.console.log.apply( this, ['Mochup:'].concat( $.makeArray(arguments) ) );
		}
	}

	// Finally, retain jQuery chaining after a call to mochup plugin method:
	return this;
};


// Set plugin defaults: (Defined down here so that a programmer may alter defaults if desired, before calling .mochup() plugin method.)
jQuery.fn.mochup.defaults = {

	session				: "guest",
	sessionName			: "Guest recording session",

	play				: false,	// Action method: Specify true to Play immediately.
	record				: false,	// Action method: Specify true to Record immediately.
	pause				: false,	// Action method: Specify true to Pause immediately.
	stop				: false,	// Action method: Specify true to Stop immediately.
	destroy				: false,	// Action method: Specify true to Un-apply mochup plugin immediately.

	stopButton			: "#mochupStop",
	pauseButton			: "#mochupPause",
	playButton			: "#mochupPlay",
	recordButton		: "#mochupRecord",
	pointer				: "#mochupPointer",
	controlPanel		: "DIV.mochupControlPanel",

	mimicMouse			: true,		// Attempt to simulate mouse movement when playback log does not include any mousemove events.


	recorder			: {

		// Define custom RECORDING Event Specs for all events that need to be logged:
		events			: {
			click		: { id:0,  delegate:true,  target:"INPUT,TEXTAREA,SELECT,A",	data:{ button:true,  pageX:true, pageY:true } },
			dblclick	: { id:1,  delegate:true,  target:"INPUT,TEXTAREA,SELECT,A",	data:{ button:true,  pageX:true, pageY:true } },
			keydown		: { id:2,  delegate:true,  target:"INPUT,TEXTAREA,SELECT",		data:{ keyCode:true, shiftKey:true } },
			keypress	: { id:3,  delegate:true,  target:"INPUT,TEXTAREA,SELECT",		data:{ keyCode:true, shiftKey:true } },
			keyup		: { id:4,  delegate:true,  target:"INPUT,TEXTAREA,SELECT",		data:{ keyCode:true, shiftKey:true } },
			paste		: { id:6,  delegate:false, target:"INPUT,TEXTAREA",				data:{ } },
			blur		: { id:7,  delegate:false, target:"INPUT,TEXTAREA,SELECT,A",	data:{ } },
			focus		: { id:8,  delegate:false, target:"INPUT,TEXTAREA,SELECT,A",	data:{ } },
			mousemove	: { id:5,  delegate:true,  target:"*",							data:{ button:true, pageX:true, pageY:true } },
			mousedown	: { id:9,  delegate:true,  target:"*",							data:{ button:true, pageX:true, pageY:true } },
			mouseover	: { id:10, delegate:true,  target:"*",							data:{ button:true, pageX:true, pageY:true } },
			mouseout	: { id:11, delegate:true,  target:"*",							data:{ button:true, pageX:true, pageY:true } },
			mouseup		: { id:12, delegate:true,  target:"*",							data:{ button:true, pageX:true, pageY:true } },
			mousewheel	: { id:13, delegate:true,  target:"*",							data:{ button:true, wheelDelta:true } },
			resize		: { id:14, delegate:false, target:document.window,				data:{ button:true, offsetHeight:true, offsetWidth:true } },	// Don't use window object on its own because it causes "too much recursion" error in $.extend()
			scroll		: { id:15, delegate:false, target:"BODY,DIV,SPAN,TEXTAREA,SELECT[multiple]",	data:{ scrollTop:true, scrollLeft:true } },
			replaceDefaults	: false		// Specify false to extend defaults instead of replacing them.
		},

		// Define GETTER functions for reading attributes that cannot simply be fetched from the event object:
		attributes		: {
			scrollTop	: function(e){ return this.nodeName!="BODY" ? this.scrollTop  : (document.body.scrollTop  || document.documentElement.scrollTop  || window.pageYOffset || 0) },
			scrollLeft	: function(e){ return this.nodeName!="BODY" ? this.scrollLeft : (document.body.scrollLeft || document.documentElement.scrollLeft || window.pageXOffset || 0) },
			wheelDelta	: function(e){ return e.orignalEvent.wheelDelta || e.wheelDelta },
			replaceDefaults	: false		// Specify false to extend defaults instead of replacing them.
		}
	},


	player				: {

		// Define custom event PLAYBACK HANDLERS for some events in order to recreate playback, because it's not always enough to just trigger them:
		events			: {
			keypress	: function(e){
				// Allow for browser differences (Mozilla etc provide charCode in keypress event).
				e.which = e.charCode = e.keyCode;
				if( e.keyCode !== 8 ){
					// Emulate user typing keys: (Skip backspace-delete because Mozilla actually adds it to the text string)
					var val = $(this).val() || "";
					var chr = isNaN(e.keyCode) ? e.keyCode : String.fromCharCode(e.keyCode);
					$(this).val( val + chr );
				}
			},
			keyup		: function(e){
				// Allow for browser differences (Mozilla etc provide charCode in keypress event).
				e.which = e.charCode = e.keyCode;
				if( e.keyCode === 8 ){
					// Emulate backspace delete by removing the last character:
					var val = $(this).val() || "";
					if( val ){
						$(this).val( val.replace(/\S$/,"") );
					}
				}
			},
			replaceDefaults	: false		// Specify false to extend defaults instead of replacing them.
		},

		// Define SETTER functions to reproduce attributes that cannot simply be set on the event object:
		// Functions receive custom recorded event-spec object as first argument.
		attributes		: {
			scrollTop	: function(e){
				if( this.nodeName !== "BODY"){
					this.scrollTop = e.scrollTop;
				}else{
					var undefined;
					if( document.body.scrollTop !== undefined ) document.body.scrollTop = e.scrollTop; else
					if( document.documentElement !== undefined ) document.documentElement.scrollTop = e.scrollTop; else
					if( window.pageYOffset !== undefined ) window.pageYOffset = e.scrollTop;
				}
			},
			replaceDefaults	: false		// Specify false to extend defaults instead of replacing them.
		}
	},

	eventIDs			: { click:1, dblclick:2, keydown:3, keypress:4, keyup:5, mousemove:6, paste:7, blur:8, focus:9, mousedown:10, mouseover:11, mouseout:12, mouseup:13, mousewheel:14, resize:15, scroll:16 },
	clearFields			: true,
	verboseSelectors	: false,
	cacheLimit			: 1000,
	playbackInterval	: 250,
	jsonUrl				: "json2.js",	//"http://www.json.org/json2.js"
	saveToUrl			: "http://localhost:4000/splats/create",
	uiUrl				: "mochup.controlpanel.js",
	ui					: true,
	uiOptions			: { stop:true, play:false, pause:false, record:false, statusBar:true, pointer:true },
	//uiUrl				: "http://www.softwareunity.com/mochup/mochup.controlpanel.js",
	recorderUrl			: "http://recorder.mochup.com"
};

// Pass a jQuery reference into the mochup plugin script:
// (This is necessary in case the mochupLoader needed to load a compatible version of jQuery onto the page especially for mochup)
})( window.jQuery_loadedByMochup || window.jQuery );
