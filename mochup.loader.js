// Mochup Loader.
// Loads the jquery.mochup.js plugin after ensuring we have a compatible version of jQuery loaded.
// Also loads json2.js utility so that mochup can serialise objects to JSON.

(function(options){

	var undefined,
		$			= window.jQuery,
		doc			= window.document,
		head		= doc.getElementsByTagName("head")[0] || doc.documentElement,

		defaults	= {
			scope		: doc.body,
			jsonUrl		: "http://www.json.org/json2.js",
			jqueryUrl	: "jquery-1.3.1.js",
			mochupUrl	: "jquery.mochup.js",
			//jqueryUrl	: "http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js",
			//mochupUrl	: "http://www.softwareunity.com/mochup/jquery.mochup.js",
			eventLog	: null,
			eventLogID	: null,
			userID		: null
		};

	// TODO: Read options from url params into js options.
	options = options || {};

	// Assume defaults where options not specified:
	for(var name in defaults){
		if( options[name]===undefined ){ options[name] = defaults[name] }
	}

	// If a compatible version of jQuery is already loaded then use it, otherwise load the one we need:
	// Test for compatible jQuery versions by testing for live(), extend(deep) and toggleClass() methods that the mochup plugin uses.
	if( $ && $.fn && $.fn.live												// Test for live() method for handling event deligation.
		&& $.extend && $.extend( true, {a:{ok:1}}, {a:{b:1}} ).a.ok 		// Test for extend() method capable of deep extend.
		&& $('<div>').addClass('ok').toggleClass('ok',true).is('.ok') ){	// Test for toggleClass() method that accepts boolean switch.
			options.jqueryUrl.wasAlreadyLoaded = true;
			onScriptLoaded();
	}else{
		if( $ && $.fn ){ options.jqueryUrl.isConflict = true }				// Flag whether an incompatible (probably older) version of jQuery was already loaded.
		loadScript( options.jqueryUrl, onScriptLoaded );
	}

	// Load remote script from specified url: (Execute callback when loaded)
	function loadScript(url,onScriptLoaded){

		var s	= doc.createElement("SCRIPT"),
			has	= {loaded:1,complete:1,run:0};

		s.onload = onScriptLoaded;				// Mozilla.
		s.onreadystatechange = function(){		// IE, Opera.
			if( has[this.readyState] && !has.run ){
				has.run = true;
				onScriptLoaded();
			};
		};

		s.setAttribute("type","text/javascript");
		s.setAttribute("src",url);

		head.appendChild(s);
	};

	function onScriptLoaded(){

		// One way or another, jQuery is now available so use it to load and initialise mochup plugin:
		// Our options.jqueryUrl.isConflict flag tells us whether an older version of jQuery is already loaded, necessitating the noConflict "extreme" argument.
		if( options.jqueryUrl.wasAlreadyLoaded )
			loadPlugin($);
		else
			jQuery.noConflict( options.jqueryUrl.isConflict )( loadPlugin );

		// This function gets called with jQuery as an argument:
		function loadPlugin($){

			if( !options.jqueryUrl.wasAlreadyLoaded ){
				window.jQuery_loadedByMochup = $;
			}

			if( !(window.JSON && JSON.stringify) && options.jsonUrl ){
				$.getScript( options.jsonUrl );
			}

			if( $.fn.mochup ){
				$(options.scope).mochup();
			}else{
				$.getScript( options.mochupUrl, function(){
					$(options.scope).mochup();
				});
			}
		}

	};

})({
	// Custom options while testing!
	jsonUrl		: "json2.js",
	jqueryUrl	: "jquery-1.3.1.js",
	mochupUrl	: "jquery.mochup.js"
});
