// alert('mochup plugin loaded');

(function($){

$.fn.mochup = function( options, args ){

	var undefined,			// Used when testing for undefined variables.
		mochup	= {			// Hash of settings and flags for internal use: (Not to be confused with jQuery.fn.mochup.defaults)
			startTime		: 0,
			pauseTime		: 0,
			playedTime		: 0,
			pauseDuration	: 0,
			$context		: this || $(document),	// Reference to the current context element.
			$pointer		: null,		// Will be a reference to the fake mouse pointer element during playback.
			eventType		: {},		// Will be populated with event specs at run time.
			eventLog		: {},		// Will store recorded events.
			logPosition		: 0,
			freshEventLog	: { size:0, startTime:0, endTime:0, selectors:{}, data:[] },
			pulseTimerID	: null,		// Will store a reference to the interval timer "pulse" used during recording and playback.
			nextSelectorIdx	: 1,		// Incremented internally while building lookup list of element selectors.
			abbrLookup		: { s:'selector', e:'type', id:'id', n:'name', k:'keyCode', ak:'altKey', ck:'ctrlKey', mk:'metaKey', sk:'shiftKey', b:'button', x:'pageX', y:'pageY', d:'wheelDelta' },
			isPaused		: false,
			isPlaying		: false,
			isRecording		: false,
			isMethod		: { play:true,record:true,pause:true,stop:true,reset:true,destroy:true },		// List of valid mochup plugin method names.
			namespace		: 'mochup',
			document		: window.document,
			body			: window.document.body,
			timeNow			: function(){ return new Date().getTime(); }
		};

	// Prevent calls to console.log() causing error when firebug is not available:
	//if( !window.console ) var console = {}; if( !console.log ) console.log = function(){};


	// Initialise eventLog: (and ensure options is not undefined so that the first call to doReset does not balk)
	options	= options || {};
	doReset();
	
	// Setup sample data for testing:
	//mochup.eventLog = {"size":145,"startTime":0,"endTime":0,"selectors":{"#mochupRecord":1,"BODY":2,"#txt1":3,"#mochupStop":4},"data":{"279":{"e":5,"s":1,"x":1128,"y":11},"295":{"e":5,"s":1,"x":1121,"y":12},"311":{"e":5,"s":1,"x":1114,"y":14},"328":{"e":5,"s":2,"x":1094,"y":20},"744":{"e":5,"s":3,"x":66,"y":22},"843":{"e":5,"s":3,"x":65,"y":25},"860":{"e":5,"s":3,"x":65,"y":26},"1042":{"e":5,"s":3,"x":65,"y":25},"1058":{"e":5,"s":3,"x":65,"y":24},"1075":{"e":5,"s":3,"x":65,"y":23},"1109":{"e":5,"s":3,"x":66,"y":22},"1175":{"e":5,"s":3,"x":66,"y":21},"1224":{"e":5,"s":3,"x":66,"y":20},"1286":{"e":8,"s":3},"1362":{"e":"click","s":3,"x":66,"y":20,"b":0},"2437":{"e":2,"s":3,"k":"H"},"2438":{"e":3,"s":3,"k":104,"shiftKey":false},"2492":{"e":4,"s":3,"k":"H"},"2668":{"e":2,"s":3,"k":"E"},"2669":{"e":3,"s":3,"k":101,"shiftKey":false},"2725":{"e":4,"s":3,"k":"E"},"2868":{"e":2,"s":3,"k":"L"},"2869":{"e":3,"s":3,"k":108,"shiftKey":false},"2916":{"e":4,"s":3,"k":"L"},"3036":{"e":2,"s":3,"k":"L"},"3037":{"e":3,"s":3,"k":108,"shiftKey":false},"3092":{"e":4,"s":3,"k":"L"},"3228":{"e":2,"s":3,"k":"O"},"3229":{"e":3,"s":3,"k":111,"shiftKey":false},"3292":{"e":4,"s":3,"k":"O"},"3444":{"e":2,"s":3,"k":32},"3445":{"e":3,"s":3,"k":32,"shiftKey":false},"3524":{"e":4,"s":3,"k":32},"4036":{"e":2,"s":3,"k":"G"},"4038":{"e":3,"s":3,"k":103,"shiftKey":false},"4124":{"e":4,"s":3,"k":"G"},"4244":{"e":2,"s":3,"k":"E"},"4245":{"e":3,"s":3,"k":101,"shiftKey":false},"4340":{"e":4,"s":3,"k":"E"},"4364":{"e":2,"s":3,"k":"O"},"4365":{"e":3,"s":3,"k":111,"shiftKey":false},"4444":{"e":4,"s":3,"k":"O"},"4460":{"e":2,"s":3,"k":"R"},"4461":{"e":3,"s":3,"k":114,"shiftKey":false},"4557":{"e":4,"s":3,"k":"R"},"4628":{"e":2,"s":3,"k":"G"},"4629":{"e":3,"s":3,"k":103,"shiftKey":false},"4685":{"e":4,"s":3,"k":"G"},"4716":{"e":2,"s":3,"k":"E"},"4717":{"e":3,"s":3,"k":101,"shiftKey":false},"4789":{"e":4,"s":3,"k":"E"},"5236":{"e":2,"s":3,"k":8},"5237":{"e":3,"s":3,"k":8,"shiftKey":false},"5302":{"e":4,"s":3,"k":8},"5420":{"e":2,"s":3,"k":8},"5422":{"e":3,"s":3,"k":8,"shiftKey":false},"5532":{"e":4,"s":3,"k":8},"5596":{"e":2,"s":3,"k":8},"5598":{"e":3,"s":3,"k":8,"shiftKey":false},"5652":{"e":4,"s":3,"k":8},"5764":{"e":2,"s":3,"k":8},"5766":{"e":3,"s":3,"k":8,"shiftKey":false},"5836":{"e":4,"s":3,"k":8},"5957":{"e":2,"s":3,"k":8},"5958":{"e":3,"s":3,"k":8,"shiftKey":false},"6013":{"e":4,"s":3,"k":8},"6124":{"e":2,"s":3,"k":8},"6126":{"e":3,"s":3,"k":8,"shiftKey":false},
	//	"6197":{"e":4,"s":3,"k":8},"6804":{"e":2,"s":3,"k":"F"},"6806":{"e":3,"s":3,"k":102,"shiftKey":false},"6852":{"e":4,"s":3,"k":"F"},"6999":{"e":2,"s":3,"k":"R"},"7000":{"e":3,"s":3,"k":114,"shiftKey":false},"7053":{"e":2,"s":3,"k":"E"},"7054":{"e":3,"s":3,"k":101,"shiftKey":false},"7076":{"e":4,"s":3,"k":"R"},"7188":{"e":2,"s":3,"k":"D"},"7189":{"e":3,"s":3,"k":100,"shiftKey":false},"7212":{"e":4,"s":3,"k":"E"},"7276":{"e":4,"s":3,"k":"D"},"8696":{"e":2,"s":3,"k":16},"8796":{"e":2,"s":3,"k":49},"8798":{"e":3,"s":3,"k":33,"shiftKey":true},"8876":{"e":4,"s":3,"k":49},"8964":{"e":4,"s":3,"k":16},"9013":{"e":5,"s":3,"x":86,"y":20},"9035":{"e":5,"s":3,"x":101,"y":20},"9045":{"e":5,"s":3,"x":125,"y":20},"9062":{"e":5,"s":3,"x":151,"y":20},"9079":{"e":5,"s":2,"x":173,"y":20},"9096":{"e":5,"s":2,"x":208,"y":18},"9112":{"e":5,"s":2,"x":223,"y":18},"9129":{"e":5,"s":2,"x":261,"y":18},"9145":{"e":5,"s":2,"x":302,"y":16},"9162":{"e":5,"s":2,"x":320,"y":16},"9178":{"e":5,"s":2,"x":357,"y":14},"9195":{"e":5,"s":2,"x":399,"y":13},"9212":{"e":5,"s":2,"x":416,"y":13},"9228":{"e":5,"s":2,"x":449,"y":12},"9245":{"e":5,"s":2,"x":482,"y":11},"9261":{"e":5,"s":2,"x":496,"y":11},"9278":{"e":5,"s":2,"x":525,"y":10},"9295":{"e":5,"s":2,"x":549,"y":10},"9311":{"e":5,"s":2,"x":558,"y":10},"9328":{"e":5,"s":2,"x":581,"y":10},"9344":{"e":5,"s":2,"x":606,"y":10},"9361":{"e":5,"s":2,"x":615,"y":10},"9377":{"e":5,"s":2,"x":638,"y":10},"9394":{"e":5,"s":2,"x":660,"y":10},"9411":{"e":5,"s":2,"x":666,"y":10},"9427":{"e":5,"s":2,"x":687,"y":10},"9444":{"e":5,"s":2,"x":694,"y":10},"9461":{"e":5,"s":2,"x":710,"y":10},"9478":{"e":5,"s":2,"x":722,"y":10},"9494":{"e":5,"s":2,"x":728,"y":10},"9510":{"e":5,"s":2,"x":740,"y":10},"9527":{"e":5,"s":2,"x":760,"y":10},"9543":{"e":5,"s":2,"x":768,"y":10},"9560":{"e":5,"s":2,"x":791,"y":10},"9577":{"e":5,"s":2,"x":815,"y":10},"9593":{"e":5,"s":2,"x":824,"y":10},"9610":{"e":5,"s":2,"x":847,"y":10},"9626":{"e":5,"s":2,"x":874,"y":10},"9643":{"e":5,"s":2,"x":884,"y":10},"9660":{"e":5,"s":2,"x":906,"y":10},"9676":{"e":5,"s":2,"x":923,"y":10},"9693":{"e":5,"s":2,"x":926,"y":10},"9710":{"e":5,"s":2,"x":938,"y":10},"9726":{"e":5,"s":2,"x":945,"y":10},"9743":{"e":5,"s":2,"x":946,"y":10},"9759":{"e":5,"s":2,"x":950,"y":10},"9776":{"e":5,"s":2,"x":955,"y":10},"9792":{"e":5,"s":2,"x":956,"y":10},"9809":{"e":5,"s":2,"x":960,"y":10},"9826":{"e":5,"s":2,"x":963,"y":10},"9842":{"e":5,"s":2,"x":968,"y":10},"9860":{"e":5,"s":4,"x":975,"y":10},"9875":{"e":5,"s":4,"x":979,"y":10},"9893":{"e":5,"s":4,"x":986,"y":10},"9909":{"e":5,"s":4,"x":987,"y":10},"9926":{"e":5,"s":4,"x":988,"y":10},"10130":{"e":5,"s":4,"x":992,"y":12},"10160":{"e":7,"s":3},"10250":{"e":"click","s":4,"x":992,"y":12,"b":0}}};
	mochup.eventLog = {
		"size":154,
		"startTime":0,
		"endTime":0,
		"selectors":{"#mochupRecord":1,"#mochupPlay":2,"#body":3,"#txt1":4,"#mochupStop":5},
		"data":{
			"201":{"e":5,"s":1,"b":0,"x":900,"y":13},"218":{"e":5,"s":1,"b":0,"x":894,"y":13}
			//,"234":{"e":11,"s":1,"b":0,"x":882,"y":13},"235":{"e":10,"s":2,"b":0,"x":882,"y":13},"236":{"e":5,"s":2,"b":0,"x":882,"y":13},"251":{"e":5,"s":2,"b":0,"x":839,"y":13},"267":{"e":11,"s":2,"b":0,"x":779,"y":13},"268":{"e":10,"s":3,"b":0,"x":779,"y":13},"269":{"e":5,"s":3,"b":0,"x":779,"y":13},"284":{"e":5,"s":3,"b":0,"x":716,"y":13},"300":{"e":5,"s":3,"b":0,"x":656,"y":13},"317":{"e":5,"s":3,"b":0,"x":600,"y":13},"334":{"e":5,"s":3,"b":0,"x":572,"y":19},"350":{"e":5,"s":3,"b":0,"x":551,"y":22},"367":{"e":5,"s":3,"b":0,"x":542,"y":24},"550":{"e":5,"s":3,"b":0,"x":528,"y":24},"566":{"e":5,"s":3,"b":0,"x":502,"y":24},"583":{"e":5,"s":3,"b":0,"x":464,"y":24},"599":{"e":5,"s":3,"b":0,"x":406,"y":24},"616":{"e":5,"s":3,"b":0,"x":344,"y":22},"633":{"e":5,"s":3,"b":0,"x":304,"y":19},"650":{"e":5,"s":3,"b":0,"x":266,"y":18},"666":{"e":5,"s":3,"b":0,"x":256,"y":18},"683":{"e":5,"s":3,"b":0,"x":248,"y":18},"848":{"e":5,"s":3,"b":0,"x":242,"y":18},"865":{"e":5,"s":3,"b":0,"x":231,"y":18},"883":{"e":5,"s":3,"b":0,"x":219,"y":19},"898":{"e":5,"s":3,"b":0,"x":209,"y":20},"915":{"e":5,"s":3,"b":0,"x":201,"y":22},"932":{"e":5,"s":3,"b":0,"x":183,"y":23},"948":{"e":5,"s":3,"b":0,"x":170,"y":23},"965":{"e":11,"s":3,"b":0,"x":160,"y":23},"966":{"e":10,"s":4,"b":0,"x":160,"y":23},"967":{"e":5,"s":4,"b":0,"x":160,"y":23},"981":{"e":5,"s":4,"b":0,"x":152,"y":23},"998":{"e":5,"s":4,"b":0,"x":145,"y":23},"1014":{"e":5,"s":4,"b":0,"x":140,"y":23},"1032":{"e":5,"s":4,"b":0,"x":135,"y":21},"1048":{"e":5,"s":4,"b":0,"x":131,"y":21},"1064":{"e":5,"s":4,"b":0,"x":127,"y":21},"1081":{"e":5,"s":4,"b":0,"x":125,"y":21},"1097":{"e":5,"s":4,"b":0,"x":123,"y":21},"1115":{"e":5,"s":4,"b":0,"x":122,"y":21},"1131":{"e":5,"s":4,"b":0,"x":121,"y":21},"1147":{"e":5,"s":4,"b":0,"x":120,"y":21},"1164":{"e":5,"s":4,"b":0,"x":119,"y":21},"1181":{"e":5,"s":4,"b":0,"x":118,"y":21},"1197":{"e":5,"s":4,"b":0,"x":117,"y":21},"1214":{"e":5,"s":4,"b":0,"x":116,"y":21},"1230":{"e":5,"s":4,"b":0,"x":116,"y":21},"1250":{"e":5,"s":4,"b":0,"x":115,"y":20},"1255":{"e":9,"s":4,"b":0,"x":115,"y":20},"1257":{"e":8,"s":4},"1330":{"e":12,"s":4,"b":0,"x":115,"y":20},"1334":{"e":"click","s":4,"b":0,"x":115,"y":20},"1349":{"e":2,"s":4,"k":"D","sk":false},"1351":{"e":3,"s":4,"k":"d","sk":false},"1364":{"e":2,"s":4,"k":"S","sk":false},"1365":{"e":3,"s":4,"k":"s","sk":false},"1379":{"e":2,"s":4,"k":"A","sk":false},"1381":{"e":3,"s":4,"k":"a","sk":false},"1396":{"e":2,"s":4,"k":"F","sk":false},"1397":{"e":3,"s":4,"k":"f","sk":false},"1452":{"e":4,"s":4,"k":"A","sk":false},"1454":{"e":4,"s":4,"k":"S","sk":false},"1491":{"e":4,"s":4,"k":"D","sk":false},"1548":{"e":2,"s":4,"k":32,"sk":false},"1549":{"e":3,"s":4,"k":32,"sk":false},"1555":{"e":2,"s":4,"k":"A","sk":false},"1557":{"e":3,"s":4,"k":"a","sk":false},"1563":{"e":4,"s":4,"k":"F","sk":false},"1643":{"e":2,"s":4,"k":"D","sk":false},"1645":{"e":3,"s":4,"k":"d","sk":false},"1650":{"e":2,"s":4,"k":"S","sk":false},"1652":{"e":3,"s":4,"k":"s","sk":false},"1683":{"e":2,"s":4,"k":"F","sk":false},"1685":{"e":3,"s":4,"k":"f","sk":false}
			//,"1748":{"e":4,"s":4,"k":32,"sk":false},"1771":{"e":2,"s":4,"k":32,"sk":false},"1772":{"e":3,"s":4,"k":32,"sk":false},"1779":{"e":4,"s":4,"k":"S","sk":false},"1788":{"e":4,"s":4,"k":"D","sk":false},"1795":{"e":4,"s":4,"k":"F","sk":false},"1911":{"e":5,"s":4,"b":0,"x":116,"y":20},"1923":{"e":2,"s":4,"k":"S","sk":false},"1925":{"e":3,"s":4,"k":"s","sk":false},"1934":{"e":5,"s":4,"b":0,"x":132,"y":20},"1936":{"e":2,"s":4,"k":"D","sk":false},"1937":{"e":3,"s":4,"k":"d","sk":false},"1945":{"e":5,"s":4,"b":0,"x":147,"y":19},"1961":{"e":11,"s":4,"b":0,"x":178,"y":17},"1962":{"e":5,"s":3,"b":0,"x":178,"y":17},"1971":{"e":2,"s":4,"k":"F","sk":false},"1973":{"e":3,"s":4,"k":"f","sk":false},"1981":{"e":4,"s":4,"k":32,"sk":false},"1982":{"e":5,"s":3,"b":0,"x":197,"y":17},"1994":{"e":5,"s":3,"b":0,"x":209,"y":17},"2003":{"e":4,"s":4,"k":"S","sk":false},"2012":{"e":5,"s":3,"b":0,"x":216,"y":17},"2014":{"e":4,"s":4,"k":"A","sk":false},"2022":{"e":4,"s":4,"k":"D","sk":false},"2023":{"e":2,"s":4,"k":32,"sk":false},"2025":{"e":3,"s":4,"k":32,"sk":false},"2060":{"e":4,"s":4,"k":"F","sk":false},"2131":{"e":2,"s":4,"k":"A","sk":false},"2133":{"e":3,"s":4,"k":"a","sk":false},"2139":{"e":2,"s":4,"k":"D","sk":false},"2141":{"e":3,"s":4,"k":"d","sk":false},"2147":{"e":2,"s":4,"k":"S","sk":false},"2149":{"e":3,"s":4,"k":"s","sk":false},"2179":{"e":4,"s":4,"k":"A","sk":false},"2187":{"e":4,"s":4,"k":"S","sk":false},"2193":{"e":5,"s":3,"b":0,"x":217,"y":17},"2203":{"e":4,"s":4,"k":"D","sk":false},"2210":{"e":5,"s":3,"b":0,"x":221,"y":17},"2227":{"e":5,"s":3,"b":0,"x":230,"y":17},"2244":{"e":5,"s":3,"b":0,"x":254,"y":17},"2259":{"e":4,"s":4,"k":32,"sk":false},"2261":{"e":5,"s":3,"b":0,"x":341,"y":17},"2276":{"e":5,"s":3,"b":0,"x":425,"y":15},"2293":{"e":5,"s":3,"b":0,"x":482,"y":15},"2309":{"e":5,"s":3,"b":0,"x":530,"y":24},"2326":{"e":5,"s":3,"b":0,"x":545,"y":29},"2492":{"e":5,"s":3,"b":0,"x":547,"y":29},"2509":{"e":5,"s":3,"b":0,"x":562,"y":29},"2525":{"e":5,"s":3,"b":0,"x":584,"y":29},"2542":{"e":5,"s":3,"b":0,"x":612,"y":28},"2559":{"e":5,"s":3,"b":0,"x":674,"y":23},"2575":{"e":5,"s":3,"b":0,"x":730,"y":22},"2592":{"e":5,"s":3,"b":0,"x":761,"y":22},"2609":{"e":5,"s":3,"b":0,"x":788,"y":22},"2808":{"e":5,"s":3,"b":0,"x":789,"y":22},"2824":{"e":5,"s":3,"b":0,"x":792,"y":22},"2841":{"e":5,"s":3,"b":0,"x":795,"y":21},"2858":{"e":5,"s":3,"b":0,"x":799,"y":20},"2874":{"e":5,"s":3,"b":0,"x":801,"y":19},"2892":{"e":11,"s":3,"b":0,"x":804,"y":17},"2893":{"e":10,"s":5,"b":0,"x":804,"y":17},"2894":{"e":5,"s":5,"b":0,"x":804,"y":17},"2907":{"e":5,"s":5,"b":0,"x":805,"y":16},"2924":{"e":5,"s":5,"b":0,"x":806,"y":14},"2941":{"e":5,"s":5,"b":0,"x":806,"y":14},"2957":{"e":5,"s":5,"b":0,"x":806,"y":13},"2974":{"e":5,"s":5,"b":0,"x":806,"y":12},"2991":{"e":5,"s":5,"b":0,"x":806,"y":11},"3007":{"e":5,"s":5,"b":0,"x":806,"y":10},"3024":{"e":5,"s":5,"b":0,"x":806,"y":8},"3040":{"e":5,"s":5,"b":0,"x":806,"y":8},"3058":{"e":5,"s":5,"b":0,"x":806,"y":7},"3107":{"e":5,"s":5,"b":0,"x":806,"y":6},"3244":{"e":9,"s":5,"b":0,"x":806,"y":6},"3246":{"e":7,"s":4},"3310":{"e":12,"s":5,"b":0,"x":806,"y":6},"3314":{"e":"click","s":5,"b":0,"x":806,"y":6}
		}
	};



	// Respond when a command string is provided instead of options:

		// Parse any special method name that has been provided as a string instead of options, then execute the method:
		// Eg: $(...).mochup('destroy') becomes equivalent to: $(...).mochup({ destroy:true })
		if( options && typeof(options) === 'String' && mochup.isMethod[options] ){
			var method = options;
			options = {}; options[method] = true;
		};

		// Bail-out immediately if instructed to do so:
		if( options.destroy && onDestroy() ){
			return this;
		}

		// Play immediately if instructed to do so:
		if( options.play ){	// TODO:

			if( args ){
				onLoad( args, options.username, options.password, doPlay );
				return this;
			} else {
				return doPlay();
			}
		
		}


	// Assume defaults where options not specified:
	var defaults = $.fn.mochup.defaults;
	options      = $.extend( false, {}, defaults, options );
	extendOrReplace( options, 'player',   'events'     );
	extendOrReplace( options, 'player',   'attributes' );
	extendOrReplace( options, 'recorder', 'events'     );
	extendOrReplace( options, 'recorder', 'attributes' );

	// Make aliases for our event specs:
	var playerEvents		= options.player.events,
		recorderEvents		= options.recorder.events,
		playerAttributes	= options.player.attributes,
		recorderAttributes	= options.recorder.attributes;


	// Ensure any custom mochup callbacks are genuine functions: (So we don't waste time later having to check them while busy recording etc)
	// Eg: If options.onplay is not a function then change it to undefined.
	$.each( mochup.isMethod, function(methodName){
		var callback = methodName.replace( /^([a-z])/, 'on$1' );	// Eg: 'play' => 'onplay'
		if( options[callback] && !$.isFunction(options[callback]) ){ options[callback] = undefined }
	});


	// Copy any attribute reader functions into the event specs so we don't waste time looking for them during record or play:
	$.each( playerAttributes, function(attr,fn){
		$.each( playerEvents, function(name,eventSpec){
			if( eventSpec && eventSpec.data && eventSpec.data[attr] === true ){
				eventSpec.data[attr] = fn;
			}
		});
	});
	$.each( recorderAttributes, function(attr,fn){
		$.each( recorderEvents, function(name,eventSpec){
			if( eventSpec && eventSpec.data && eventSpec.data[attr] === true ){
				eventSpec.data[attr] = fn;
			}
		});
	});


	// Load JSON library for serialising Event logs, unless it is already available:
	// (Event logs cannot be saved unless this library has loaded or the browser has native JSON methods)
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

		}else if( options.controlPanel ){

			$(options.controlPanel).show();

		}
	};


	// Start the playback timer:
	mochup.pulseTimerID = window.setInterval(pulse,100);

	// Bind or delegate each event recorder handler and generate a reverse-lookup hash for each event-type id:
	// (We namespace the events (eg "click.mochup") to make life easier when we need to unbind them later.)
	$.each( recorderEvents, function(type,eventSpec){

		var typeId	= recorderEvents[type].id;
		var bind	= recorderEvents[type].delegate ? 'live' : 'bind';

		$( eventSpec.target )[bind]( type + '.' + mochup.namespace, recordEvent );
		mochup.eventType[typeId] = type;

	});


	// Generate a reverse lookup for every event property abbreviation and event type id:
	invertHash( mochup.eventType );
	invertHash( mochup.abbrLookup );


	// Wire up the mochup ui control buttons:
	$(options.stopButton).live('click.'+mochup.namespace,doStop);
	$(options.playButton).live('click.'+mochup.namespace,doPlay);
	$(options.pauseButton).live('click.'+mochup.namespace,doPause);
	$(options.recordButton).live('click.'+mochup.namespace,doRecord);
	$(window).bind('unload.'+mochup.namespace,onDestroy);

	// Do the next playback or recording step:
	function pulse(){

		if( mochup.isPaused ){
			return;
		}else if( mochup.isPlaying ){
			// Play the next event(s):
			var startTime = mochup.timeNow() - mochup.startTime;
			//window.status = new Date(startTime).toLocaleTimeString();
			playEvent();
			updateProgressBar();
		}else if( mochup.isRecording ){
			// No need to do anything special during recording:
			var startTime = mochup.timeNow() - mochup.startTime;
			window.status = new Date(startTime).toLocaleTimeString();
		};

	}



	// Called during recording in response to each of the specified record events:
	function recordEvent(e){

		if( mochup.isRecording && !mochup.isPaused && e.target ){

			// Fetch spec for this event: (Eg: options.recorder.events.click)
			var eventSpec = recorderEvents[e.type];

			// Derive a css selector that describes where to find this element in the dom:
			var	sel	= e.target.id									// Test whether element has an id and
					? '#' + e.target.id								// use the id if it has one.
					: { 'BODY':1,'body':1 }[ e.target.tagName ]		// Test for body element and
						? 'BODY'									// return a body selector if applicable
						: deriveSelector.call( e.target );			// otherwise derive a css selector.

			// Lookup an index for this element's selector: (Add a new one to the lookup if necessary. Storing the selector index alongside each recorded event helps reduce the log size)
			// This only serves to keep the log file smaller by storing the selector once and referring to an index repeatedly instead.
			var selIdx   = mochup.eventLog.selectors[sel] || ( mochup.eventLog.selectors[sel] = mochup.nextSelectorIdx++ );

			// Initialise a new log entry with standard attributes:
			var timestamp = mochup.timeNow() - mochup.startTime;
			var	snapshot  = {
				t : timestamp,
				e : ( !options.verboseLog && eventSpec && eventSpec.id ) || e.type,	// Event type (id or name).
				s : options.verboseLog ? sel : selIdx										// Element selector lookup index.
			}

			// Ensure we record every event attribute that the eventSpec tells us to:
			// (Eg: options.recorder.events.click.data.button and options.recorder.events.click.data.pageX)
			if( eventSpec ){

				$.each( eventSpec.data, function(attr,get) {

					// The get argument should be a function or non-falsey: 
					if( get ){

						// Lookup the short name (abbreviation) for this attribute and log the event attribute:
						// (If a function has been specified then call it and log its return value instead)
						var abbr = ( !options.verboseLog && mochup.abbrLookup[attr] ) || attr;

						// Set the attribute value:
						// We use call() so that the handler can use 'this' to refer to event.target element. The Event object is passed in as an argument.
						snapshot[abbr] = ( get === true || !$.isFunction(get) ) ?
								recorderAttributes[abbr] ?
								recorderAttributes[abbr].call( e.target, e ) :
								e[attr] :
							get.call( e.target, e );

					}

				})

			}

			mochup.eventLog.data.push(snapshot);
			//mochup.eventLog.data[timestamp] = snapshot;
			mochup.eventLog.size++;
			if( mochup.eventLog.size >= mochup.cacheLimit ){
				//doSave();	// TODO: Calculate nextCacheLimit
			}

		};
	}


	// Play (simulate) one event from the event log:
	function playEvent(){

		var snapshot, type, val, chr,
			selectors	= mochup.eventLog.selectors,
			data		= mochup.eventLog.data,
			now			= mochup.timeNow() - mochup.startTime;

		// Attempt to trigger all events recorded in this timeframe:
		for( var timestamp = mochup.playedTime; timestamp <= now; timestamp++ ){

			snapshot = data[timestamp];

			if( snapshot ){

				type = mochup.eventType[snapshot.e];

				if( type ) {

					var $elem = $( selectors[snapshot.s] );

					if( $elem.length ){

						// Move our fake mouse pointer:
						if( snapshot.x && snapshot.y && mochup.$pointer.length ){
							mochup.$pointer.css({ left:snapshot.x, top:snapshot.y });
						}

						// Create a new event object: (And remove our custom selector "s" attribute because it seems to upset things)
						delete snapshot.s;
						var Event = new $.Event(type);

						// Copy snapshot event attributes to our new event object:
						$.each( snapshot, function(abbr,val){
							var attr = mochup.abbrLookup[abbr] || abbr;
							if( playerAttributes[attr] ){
								val = playerAttributes[attr].call( $elem[0], snapshot );
							}
							Event[ attr ] = val;
						});


						// TODO: Make these customisable options:
						// Also set browser-specific alternatively-named attibutes: (Taking care not to override any that already have a value)
						if( Event.keyCode ){
							if( !Event.which ){ Event.which = Event.keyCode }
							if( !Event.charCode ){ Event.charCode = Event.keyCode }
						}
						if( Event.button && Event.which === undefined ){
							Event.which = (Event.button & 1 ? 1 : ( Event.button & 2 ? 3 : ( Event.button & 4 ? 2 : 0 ) ));
						}
						if( Event.relatedTarget ){
							if( !Event.toElement   ){ Event.toElement   = Event.relatedTarget }
							if( !Event.fromElement ){ Event.fromElement = Event.relatedTarget }
						}
						if( !Event.srcElement ){
							Event.srcElement = Event.target;
						}

						// If this event's spec has a playback handler defined then run it now:
						if( playerEvents[type] ){
							playerEvents[type].call( Event.target, Event );
						}

						// FIRE the event:
						// TODO: Think about triggering live events too.
						// TODO: Figure out why Event.type is sometimes an event index number instead of an event name.
						if( isNaN(Event.type) ){
							//window.setTimeout( function(){
								log(Event.type, $elem)
								if( $elem ){ $elem.trigger(Event) }
							//}, 0 );
						}

					}
					$elem = null;
				}
			}

			// Check whether we have reached the end of the eventLog:
			if( timestamp >= mochup.eventLog.endTime ){ doStop(); break; }

		}

		// Note how far playback has progressed and clear object references:
		mochup.playedTime = now;
		data = selectors = snapshot = null;
	}


	// Load log file and make it ready to play:
	// The source can be a url or a log data hash.
	function onLoad( source, username, password, callback ){

		if( typeof(source) === 'String' ){

			// source is a url:
			$.getJSON( source, { usr:username, pwd:password }, function(data, status){
				
				
				
			});

		} else {

			// source is a hash of log data:
			
		}

	}


	// Save current session's eventLog and clear memory to make room for more: 
	function doSave(){

		log('doSave...');

		var time			= mochup.timeNow() - mochup.startTime
			//,json			= JSON.stringify(mochup.eventLog)
			//,eventLogSlice	= $.extend( true, {}, mochup.eventLog );
			//for( var ev in mochup.eventLog.data)
			//	console.log(ev,mochup.eventLog.data[ev])
		//log( JSON.stringify(mochup.eventLog) );
		$("#output").text( JSON.stringify(mochup.eventLog) )
		//console.log( time, json );

		// Because of browser same-domain security policy we can only submit data using GET instead of POST:
		// (XMLHTTPRequest cannot do this)
//		$.getScript( options.saveToUrl, eventLogSlice, onAfterSave );

		// Increment the cache limit so the next chunk of the log will be saved when limit is reached:
//		mochup.cacheLimit += options.cacheLimit;

		log('...after doSave.');

	}


	// Called after every eventLog save to the database:
	function onAfterSave(data,status){
		
		//alert(status + '\n' + data)
		
	}


	// Re-initialise the eventLog and flags:
	function doReset(){
		// Proceed if no callback was specified in the options OR the callback does not return false to cancel this event:
		log('before doReset');
		if( !options.onReset || options.onReset() ){
			mochup.isPaused = mochup.isPlaying = mochup.isRecording = false;
			mochup.eventLog = $.extend( {}, mochup.freshEventLog );
			mochup.logPosition = 0;
		}
		log('after doReset');
	}


	// Stop Playing/Recording:
	function doStop(){
		// Proceed if no callback was specified in the options OR the callback does not return false to cancel this event:
		console.log(mochup.eventLog);
		log('before doStop');
		if( !options.onStop || options.onStop() ){
			mochup.isPaused = mochup.isPlaying = mochup.isRecording = false;
			mochup.$pointer	= null;
			updateUI();
			doSave();
		}
		log('after doStop');
		return !mochup.isPlaying && !mochup.isRecording;
	}


	// Pause the Playing/Recording:
	function doPause(){
		// Proceed if no callback was specified in the options OR the callback does not return false to cancel this event:
		log('before doPause');
		if( !options.onPause || options.onPause() ){
			mochup.isPaused  = true;
			mochup.pauseTime = mochup.timeNow();
			updateUI();
		}
		log('after doPause');
		return mochup.isPaused;
	}


	// Start playing:
	function doPlay(){
		// Proceed if no callback was specified in the options OR the callback does not return false to cancel this event:
		log('before doPlay');
		if( !options.onPlay || options.onPlay() ){

			// Stop any recording immediately:
			if( mochup.isRecording ){ doStop() }

			// Ensure the event log is in good shape:
			preprocessEventLog();

			// Clear outputs and reset start time:
			if( !mochup.isPaused && !mochup.isPlaying ){
				if(options.clearFields){ mochup.$context.find('INPUT:text,TEXTBOX,SELECT').andSelf().val('') }
				mochup.startTime  = mochup.timeNow();
				mochup.endTime    = mochup.startTime + ( mochup.eventLog.endTime - mochup.eventLog.startTime );
				mochup.cacheLimit = options.cacheLimit;
				mochup.$pointer	  = $(options.pointer);	// Cache a reference to our fake pointer element.
			};

			mochup.isPaused		= false;
			mochup.isPlaying	= true;
			mochup.isRecording	= false;	
			updateUI();

		}
		log('after doPlay');
		return mochup.isPlaying;
	}


	// Start recording:
	function doRecord(){

		// Proceed if no callback was specified in the options OR the callback does not return false to cancel this event:
		log('before doRecord');
		if( !options.onRecord || options.onRecord() ){

			// Cancel any active playback and reset the eventLog:
			if( mochup.isPlaying || mochup.isRecording ){ doStop() }
			if( !mochup.isPaused ){ doReset() }

			mochup.startTime	= mochup.timeNow();
			mochup.isPaused		= false;
			mochup.isPlaying	= false;
			mochup.isRecording	= true;
			updateUI();

		}
		log('after doRecord');
		return mochup.isRecording;
	}


	// Update the status bar during playback:
	function updateProgressBar(){

		var scale     = 50,
		    progress  = mochup.timeNow() - mochup.startTime,
		    percent   = scale * progress / ( mochup.endTime - mochup.startTime ),
			time      = new Date(progress).toLocaleTimeString();

		window.status = time + ' ' + Array( safe(percent) ).join('|') + Array( safe(scale-percent)+1 ).join('"');

		// Little diddy helper method for ensuring percent is an integer between 0 and 100:
		function safe(percent){
			return parseInt( Math.min( Math.max( percent, 0 ), scale ) );
		}

	}


	// Update style of Mochup UI elements according to our current Play/Record/Pause/Stop status:
	function updateUI(){
		$(document.body)
			.add(options.controlPanel)
			.add(options.pauseButton)
			.add(options.stopButton)
			.add(options.playButton)
			.add(options.recordButton)
			.toggleClass('mochup-is-paused', mochup.isPaused)
			.toggleClass('mochup-is-playing', mochup.isPlaying)
			.toggleClass('mochup-is-recording', mochup.isRecording);
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
			favicon		: $('link[href *= favicon]').attr('href') || ''
		};

		// Derive start and end time of the recording if not already explicitly provided in the eventLog:
		if( !mochup.eventLog.startTime || !mochup.eventLog.endTime ){

			var startTime = 0, endTime = 0;
			//var timeSlots = {}, timeSlot = 0, nextTimeSlot = options.playbackInterval;

			$.each( mochup.eventLog.data, function(time,logEntry){

				if( !isNaN(time) ){
					endTime = time;
					if( !startTime ){ startTime = time }
				}

				//if( time > nextTimeSlot ){
				//	timeSlot = nextTimeSlot;
				//	nextTimeSlot += options.playbackInterval
				//}
				//timeSlots[timeSlot][time] = logEntry;
			});
			if( !mochup.eventLog.startTime ){ mochup.eventLog.startTime = startTime }
			if( !mochup.eventLog.endTime   ){ mochup.eventLog.endTime   = endTime   }
		};

		// Ensure we can use the Selectors hash as a reverse lookup: (To return an element-selector given its index)
		invertHash( mochup.eventLog.selectors, isFinite );

	}

	// Clear up all evidence of this mochup plugin: (Because we namespaced our events they are easy to unbind)
	function onDestroy(){

		// Proceed if no callback was specified in the options OR the callback does not return false to cancel this event:
		if( !options.onDestroy || options.onDestroy() ) return false;

		window.clearInterval(mochup.pulseTimerID);
		doStop();
		mochup.$context.find('*').add(window).unbind('.'+mochup.namespace).die('.'+mochup.namespace);

		if( options.ui && options.uiUrl   ){ $( options.controlPanel ).remove() }
		if( options.ui && options.pointer ){ $( options.pointer      ).remove() }

		// Explicitly discard all our object references:
		$ = options = mochup = mochup.$pointer = mochup.$context = playerEvents = playerAttributes = recorderEvents = recorderAttributes = null;

		return true;

	}


	// Helper to generate a reverse lookup for every key/value pair in the hash object:
	// (Apply filter function if provided. The value and key will be passed to it as parameters)
	function invertHash(hash, optionalFilterFn){
		return $.each(hash, function(key,val){
			if( val !== undefined && ( !optionalFilterFn || optionalFilterFn(val,key) ) ){
				hash[val] = key;
			}
		})
	}


	// A wrapper for jQuery.extend() that conditionally replaces or extends a subset of options:
	// The condition depends on the replaceDefaults option on each sub-group, eg: options.player.events.replaceDefaults.
	// Sample usage: extendOrReplace('player','events');
	function extendOrReplace(options,grp,subgrp){

		var optGrp = options[grp] = ( options[grp] || {} ),
		    optSub = optGrp[subgrp];

		return options[grp][subgrp] = ( optSub && optSub.replaceDefaults ) ? optSub : $.extend( {}, defaults[grp][subgrp], optSub );

	}


	// Helper function to generate a selector string for locating an element in the dom: (Only used when elem has no id or name)
	function deriveSelector(){

		var doc = this.ownerDocument, body = doc.body;
		if ( this === body ) return 'BODY';
		var elem = this, sel = getNodeSyntax(elem), context = mochup.$context[0], docElem = doc.documentElement;

		// Search up the DOM until we reach either the root or a parent that has an ID:
		while( (elem = elem.parentNode) && !elem.id && elem !== context && elem !== body && elem !== docElem ){
			sel = getNodeSyntax(elem) + '>' + sel;
		}

		if( elem.id ){
			sel = '#' + elem.id + '>' + sel;
		}
		return sel;

		function getNodeSyntax(elem){
			return elem.nodeName + ':eq(' + $(elem).prevAll(elem.nodeName).length + ')';
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
$.fn.mochup.defaults = {

	session				: 'guest',
	sessionName			: 'Guest recording session',

	play				: false,	// Action method: Specify true to Play immediately.
	record				: false,	// Action method: Specify true to Record immediately.
	pause				: false,	// Action method: Specify true to Pause immediately.
	stop				: false,	// Action method: Specify true to Stop immediately.
	destroy				: false,	// Action method: Specify true to Un-apply mochup plugin immediately.

	stopButton			: '#mochupStop',
	pauseButton			: '#mochupPause',
	playButton			: '#mochupPlay',
	recordButton		: '#mochupRecord',
	pointer				: '#mochupPointer',
	controlPanel		: 'DIV.mochupControlPanel',

	mimicMouse			: true,		// Attempt to simulate mouse movement when playback log does not include any mousemove events.


	recorder			: {

		// Define how to RECORD events that you wish to be logged, and specify attributes to log with each event:
		events			: {

			replaceDefaults	: false,		// Specify false to extend defaults instead of overriding them completely.

			click			: { id:0,  delegate:true,  target:'INPUT,TEXTAREA,SELECT,A',	data:{ button:true,  pageX:true, pageY:true } },
			dblclick		: { id:1,  delegate:true,  target:'INPUT,TEXTAREA,SELECT,A',	data:{ button:true,  pageX:true, pageY:true } },
			keydown			: { id:2,  delegate:true,  target:'INPUT,TEXTAREA,SELECT',		data:{ keyCode:true, shiftKey:true } },
			keypress  		: { id:3,  delegate:true,  target:'INPUT,TEXTAREA,SELECT',		data:{ keyCode:true, shiftKey:function(e){ return e.shiftKey || undefined; } } },	// Custom function ignores shiftKey unless it is pressed.
			keyup	  		: { id:4,  delegate:true,  target:'INPUT,TEXTAREA,SELECT',		data:{ keyCode:true, shiftKey:true } },
			paste	  		: { id:6,  delegate:false, target:'INPUT,TEXTAREA',				data:{ } },
			blur	  		: { id:7,  delegate:false, target:'INPUT,TEXTAREA,SELECT,A',	data:{ } },
			focus	  		: { id:8,  delegate:false, target:'INPUT,TEXTAREA,SELECT,A',	data:{ } },
			//mousemove 		: { id:5,  delegate:true,  target:'*',							data:{ button:true, pageX:true, pageY:true } },
			mousedown 		: { id:9,  delegate:true,  target:'*',							data:{ button:true, pageX:true, pageY:true } },
			mouseover 		: { id:10, delegate:true,  target:'*',							data:{ button:true, pageX:true, pageY:true } },
			mouseout  		: { id:11, delegate:true,  target:'*',							data:{ button:true, pageX:true, pageY:true } },
			mouseup	  		: { id:12, delegate:true,  target:'*',							data:{ button:true, pageX:true, pageY:true } },
			mousewheel		: { id:13, delegate:true,  target:'*',							data:{ button:true, wheelDelta:true } },
			resize	  		: { id:14, delegate:false, target:document.window,				data:{ button:true, offsetHeight:true, offsetWidth:true } },	// Don't use window object on its own because it causes "too much recursion" error in $.extend()
			scroll	  		: { id:15, delegate:false, target:'BODY,DIV,SPAN,TEXTAREA,SELECT[multiple]',	data:{ scrollTop:true, scrollLeft:true } }
		},

		// Define GETTER methods for reading attributes that cannot simply be fetched from the event object during record:
		// These methods will be called for each attribute listed in the "data" hash of the event specs above.
		attributes		: {

			replaceDefaults	: false,		// Specify false to extend defaults instead of overriding them completely.

			scrollTop		: function(e){ return this.nodeName!='BODY' ? this.scrollTop  : (document.body.scrollTop  || document.documentElement.scrollTop  || window.pageYOffset || 0) },
			scrollLeft		: function(e){ return this.nodeName!='BODY' ? this.scrollLeft : (document.body.scrollLeft || document.documentElement.scrollLeft || window.pageXOffset || 0) },
			wheelDelta		: function(e){ return e.orignalEvent.wheelDelta || e.wheelDelta },
			keyCode			: function(e){

				// Allow for browser differences (Mozilla provide charCode in keypress event).
				// When logging alpha keys store a character instead of a char code. (Makes log file slighty more readable but not necessarily smaller because of the quotes around them )
				var key = e.keyCode || e.charCode;
				var chr = String.fromCharCode(key);

				return /[a-z]/i.test(chr) ? chr : key;

			}
		}
	},


	player				: {

		// Define custom event PLAYBACK HANDLERS for some events in order to recreate playback,
		// because it's not always enough to just trigger the events, sometimes we have to mimic the behaviour:
		events			: {

			replaceDefaults	: false,		// Specify false to extend defaults instead of overriding them completely.

			keypress	: function(e){
				// Allow for browser differences (Mozilla etc provide charCode in keypress event).
				e.which = e.charCode = e.keyCode;
				if( e.keyCode !== 8 ){
					// Emulate user typing keys: (Skip backspace-delete because Mozilla actually adds it to the text string)
					var val = $(this).val() || '';
					var chr = isNaN(e.keyCode) ? e.keyCode : String.fromCharCode(e.keyCode);
					$(this).val( val + chr );
				}
			},

			keyup		: function(e){
				// Allow for browser differences (Mozilla etc provide charCode in keypress event).
				e.which = e.charCode = e.keyCode;
				if( e.keyCode === 8 ){
					// Emulate backspace delete by removing the last character:
					var val = $(this).val() || '';
					if( val ){
						$(this).val( val.replace(/\S$/,'') );
					}
				}
			}

		},

		// Define SETTER methods to reproduce attributes that cannot simply be set on the event object during playback:
		// Functions receive a custom fabricated Event object as first argument.
		attributes		: {

			replaceDefaults	: false,		// Specify false to extend defaults instead of overriding them completely.

			scrollTop		: function(e){
				if( this.nodeName !== 'BODY'){
					this.scrollTop = e.scrollTop;
				}else{
					var undefined;
					if( document.body.scrollTop  !== undefined ){ document.body.scrollTop = e.scrollTop } else
					if( document.documentElement !== undefined ){ document.documentElement.scrollTop = e.scrollTop } else
					if( window.pageYOffset       !== undefined ){ window.pageYOffset = e.scrollTop }
				}
			}

		}
	},

	clearFields			: true,
	verboseLog			: true,	// Specify true to produce a more readable but larger log when recording.
	cacheLimit			: 1000,
	playbackInterval	: 250,
	jsonUrl				: 'json2.js',	//'http://www.json.org/json2.js'
	saveToUrl			: 'http://localhost:4000/splats/create',
	uiUrl				: 'mochup.controlpanel.js',
	//uiUrl				: 'http://www.softwareunity.com/mochup/mochup.controlpanel.js',
	ui					: true,
	uiOptions			: { stop:true, play:false, pause:false, record:false, statusBar:true, pointer:true },
	recorderUrl			: 'http://recorder.mochup.com'

};

// Pass a jQuery reference into the mochup plugin script:
// (This is necessary in case the mochupLoader needed to load a compatible version of jQuery onto the page especially for mochup)
})( window.jQuery_loadedByMochup || window.jQuery );
