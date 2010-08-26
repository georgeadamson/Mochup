
jQuery.fn.mochup = function(options){

	var $ = jQuery;
	var defaults = {
		record			: true,
		play			: false,
		session			: "guest",
		sessionName		: "Guest recording session",
		stopButton		: "A.mochupStop, INPUT.mochupStop",
		playButton		: "A.mochupPlay, INPUT.mochupPlay",
		recordButton	: "A.mochupRecord, INPUT.mochupRecord",
		events			: {
			click		:{ id:0, deligate:true,	target:"INPUT,TEXTAREA,SELECT,A",	handler:function(e){ capture({ t:options.events[e.type].id, target:e.target, x:e.pageX, y:e.pageY, b:e.button}); } },
			dblclick	:{ id:1, deligate:true,	target:"INPUT,TEXTAREA,SELECT,A",	handler:function(e){ capture({ t:options.events[e.type].id, target:e.target, x:e.pageX, y:e.pageY, b:e.button}); } },
			keydown		:{ id:2, deligate:true,	target:"INPUT,TEXTAREA,SELECT",		handler:function(e){ capture({ t:options.events[e.type].id, target:e.target, k:e.keyCode}); } },
			keypress	:{ id:3, deligate:true,	target:"INPUT,TEXTAREA,SELECT",		handler:function(e){ capture({ t:options.events[e.type].id, target:e.target, k:e.keyCode}); } },
			keyup		:{ id:4, deligate:true,	target:"INPUT,TEXTAREA,SELECT",		handler:function(e){ capture({ t:options.events[e.type].id, target:e.target, k:e.keyCode}); } },
			//mousemove	:{ id:5, deligate:true,	target:"BODY",						handler:function(e){ capture({ t:options.events[e.type].id, target:e.target, x:e.pageX, y:e.pageY }); } },
			paste		:{ id:6, deligate:false,target:"INPUT,TEXTAREA",			handler:function(e){ capture({ t:options.events[e.type].id, target:e.target, x:e.pageX, y:e.pageY }); } }
		},
		jsonUrl			: "http://www.json.org/json2.js"
	}
	var mochup = {
		startTime		: new Date().getTime(),
		isRecording		: false,
		isPlaying		: false,
		eventLog		: {length:0}	
	};

	// Assume defaults where options not specified, and load JSON library:
	// (Event logs cannot be saved until this library has loaded)
	options = $.extend({},defaults,options);

	if( !(window.JSON && window.JSON.stringify) ){ $.getScript(options.jsonUrl, function(){alert(JSON)}); };

	// Bind each event handler:
	$.each(options.events, function(name,e){
		$(e.target)[e.deligate ? "live" : "bind"](name,e.handler);
	});

	// Wire up the mochup control buttons:
	$(options.stopButton).live("click",onStop);
	$(options.playButton).live("click",onTogglePlay);
	$(options.recordButton).live("click",onToggleRecord);

	// Handler for any event that we want to capture: (Receives an object rather like the standard event object)
	function capture(e){

		if( mochup.isRecording && e.target && (e.target.id || e.target.name) ){
			var time = new Date().getTime() - mochup.startTime;
			var target = e.target;
			delete e.target;
			if(target.id){ e.id = target.id; }else{ e.n = target.name; }
			if(e.b===0){ delete e.b; }	// Save log space by not logging button-type for left clicks.
			mochup.eventLog[time] = e;
			mochup.eventLog.length++;
			$("#output").text($("#output").text() + ' ' + time + $.param(e));
		};

	}


	function onStop(){
		mochup.isPlaying = false;
		mochup.isRecording = false;
	}
	function onPlay(){
		mochup.isPlaying = true;
	}
	function onRecord(){
		mochup.isRecording = true;
	}

	function onToggleRecord(){
		if(mochup.isRecording){
			onStop();
		}else{
			onRecord();
		};
	}

	function onTogglePlay(){
		if(mochup.isRecording){ onStop(); };
		if(mochup.isPlaying){
			onStop();
		}else{
			onPlay();
		};
	}

};