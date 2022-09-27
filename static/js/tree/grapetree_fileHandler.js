MSFileChooser.prototype = Object.create(null);
MSFileChooser.prototype.constructor= MSFileChooser;

function MSFileChooser(filter){
		var self = this;
		this.fileInput = $("<input>").attr("type","file").hide();
		this.callback=null;
		this.fileInput.attr("accept",filter);
		$('<body>').append(this.fileInput);
		this.fileInput.change(function(event){
				self.callback(event.target.files);

		});

}
MSFileChooser.prototype.setFilter=function(filter){
		this.fileInput.attr("accept", filter);
}
MSFileChooser.prototype.showOpenDialog=function(callback){
		this.callback=callback;
		this.fileInput.trigger("click");
}
function displayErrorMessage(msg){
	Enterobase.modalAlert(msg);
}


function getHelpBox(help_item){
if (help_item in help_text){
	document.getElementById("welcome-div-text").innerHTML = help_text[help_item];
}else {
	document.getElementById("welcome-div-text").innerHTML = "<b>No Help text available for this feature</b>";
}
$('#welcome-div').toggle();

}

function loadNetFiles() {
	function getJsonFromUrl(hashBased) {
		var query;
		if(hashBased) {
			var pos = location.href.indexOf("?");
			if(pos==-1) return [];
			query = location.href.substr(pos+1);
		} else {
			query = location.search.substr(1);
		}
		var result = {};
		query.split("&").forEach(function(part) {
			if(!part) return;
			part = part.split("+").join(" "); // replace every + with space, regexp-free version
			var eq = part.indexOf("=");
			var key = eq>-1 ? part.substr(0,eq) : part;
			var val = eq>-1 ? decodeURIComponent(part.substr(eq+1)) : "";
			var from = key.indexOf("[");
			if(from==-1) result[decodeURIComponent(key)] = val;
			else {
				var to = key.indexOf("]",from);
				var index = decodeURIComponent(key.substring(from+1,to));
				key = decodeURIComponent(key.substring(0,from));
				if(!result[key]) result[key] = [];
				if(!index) result[key].push(val);
				else result[key][index] = val;
			}
		});
		return result;
	}
	var params = getJsonFromUrl();
	/////////////////////////////////////
	// Modified to make available params in MSFileChooser
	// TODO: (ADP) query string hash of parameters should be made available to all the app objects 
	MSFileChooser.params = params;
	window.global_params = params;
	/////////////////////////////////////
	var tree = null, metadata = null;
	for (var key in params) {
		params[key] = params[key].replace('www.dropbox.com', 'dl.dropboxusercontent.com')
						.replace('drive.google.com/open?', 'drive.google.com/uc?')
						.replace('/blob/', '/').replace('github.com', 'raw.githubusercontent.com')
		if (key === 'tree') {
			tree = params[key];
		} else if (key == 'metadata') {
			metadata = params[key];
		}
	}
	if (tree) {
		$.ajax({
			type: "GET",
			url: tree,
			headers: {'X-Requested-With': 'XMLHttpRequest'},
			success: function(tree){
				try {
					data = typeof(tree) == 'string'? JSON.parse(tree) : tree;
				} catch(error) {
					data = {};
					if (tree.substring(0,6)==="#NEXUS"){
						data['nexus']=tree;
					}else{
						data['nwk']=tree;
					}
					data['layout_algorithm']=$("#layout-select").val();
				}
				finally {
					// tree_raw = data;
					// loadMSTree(tree_raw);
					// to use original tree button we need tree_raw populated with an object containing also metadata please find more in the README.md file under Dev notes paragraph
					loadMSTree(data);
				}
				if (the_tree && metadata) {
					$.ajax({
						type: "GET",
						url: metadata,
						headers: {'X-Requested-With': 'XMLHttpRequest'},
						success: function(data){
							loadMetadataText(data);
						}
					});
				}
			}
		});
	}
}

function dropFiles(div) {
	div.on('dragover',function(e) {
			e.preventDefault();
			e.stopPropagation();
		}
	)
	.on('dragenter',function(e) {
			e.preventDefault();
			e.stopPropagation();
		}
	)
	.on("drop",function(e){
			e.originalEvent.stopPropagation();
			e.originalEvent.preventDefault();
			var files = e.originalEvent.dataTransfer.files;
			filesDropped(files);
	});
}

function filesDropped(files){
	current_metadata_file = null;
	for (var id=0; id < files.length; id += 1) {
		var file = files[id];
		var reader = new FileReader();
		reader.onload = function(progressEvent) {
			distributeFile(this.result, this.filename);
		};
		reader.filename = file.name;
		reader.readAsText(file);
	};
}
function distributeFile(text, filename) {
	var head_line = text.substring(0, 2048).split(/[\n\r]/)[0];
	if (head_line.startsWith(">")  || (head_line.startsWith("#") && ! head_line.toUpperCase().startsWith("#NEXUS")) || (head_line.indexOf('\t') >=0 && ! the_tree)) {
		if (cannot_connect){
			loadFailed("Cannot Connect to the backend server");
			return;
		}
		profile_file=this.file;
		initiateLoading("Reading Profile File");
		$("#param-panel").show();
		$("#modal-ok-button").data("profile_file", text);
		$("#modal-ok-button").html("OK");
		$(waiting_spinner.el).hide();
		$("#modal-title").show().text("Parameters For Tree Creation");
		$("#waiting-information").hide();
		$("#headertag").text(filename);
	}

	else if ((head_line.indexOf(",") >=0 || head_line.indexOf("\t")>=0) && !head_line.startsWith("(") && !head_line.startsWith("[") && !head_line.startsWith(" ") && !head_line.startsWith("{")) {
		var dl = (head_line.indexOf(",") >= 0 ? "," : "\t");
		current_metadata_file = text;
		if (the_tree) {
			loadMetadataText(text);
		}
	}
	else {
		// enhances the_map.geojson with the geojson data if exists
		var text_obj = JSON.parse(text);
		var geojson_obj = text_obj.geoJson;
		var map_obj = text_obj.map_obj;
		var geojson_text;
		if (geojson_obj) {
			geojson_text = JSON.stringify(geojson_obj);
			the_map.geojson = geojson_text;
		}
		if (map_obj) {
			the_map.point_min_radius = map_obj.point_min_radius;
			the_map.point_max_radius = map_obj.point_max_radius;
			the_map.default_delta_type = map_obj.default_delta_type;
			the_map.metadata_delta_options = map_obj.metadata_delta_options;
			the_map.coordinates_delta = map_obj.coordinates_delta;
			the_map.metadata_delta = map_obj.metadata_delta;
			if (map_obj.default_delta_type == "geographical") {
				the_map.default_delta = map_obj.coordinates_delta;
			} else {
				the_map.default_delta = map_obj.metadata_delta;
			}
			the_map.setMapControlPanel();
		}
		loadTreeText(text);
		$("#headertag").text(filename);
	}
}

function loadMetadataText(text){
	var return_data=[];
	try{
		var lines =  text.split(/\r\n|\r|\n/g);
		var delimiter = (lines[0].indexOf(",") >= 0 ? "," : "\t");
		var header = lines[0].split(delimiter);
		for (var i=1;i<lines.length;i++){
			var map = {};
				var arr = lines[i].split(delimiter);
				for (var col in arr){
					map[header[col]]=arr[col];
				}
				return_data.push(map);
		}
		parseMetadata("OK",return_data,header);
	}catch(error){
		parseMetadata("Error",error.message)
	}
};

/**
 * 
 * Meta2GeoJSON 
 * Transform Meta Object in points geoJSON
 * 
 */
/////////////////////////////////////////////////////////////////
Meta2GeoJSON = {
	//---------------------------------------------
	// 
	//---------------------------------------------
	newGeoJson: function () {
		return {
			"features": [],
			"name": "geopoints",
			"type": "FeatureCollection",
			"id_dashboard": "grapetree-gis"
		};
	}, //-------------------------------------
	newPoint: function (h) {
		return {
			"geometry": {
				"coordinates": [
					h.x,
					h.y
				],
				"type": "Point"
			},
			"type": "Feature",
			"properties": {
				"codice": h.id
			}
		};
	}, //-------------------------------------

	addNewPoint: function (geoJson, h) { //id,x,y
		if (h == undefined || h.id == undefined || h.id.length == 0) {
			return
		};
		h.x = Number.parseFloat(h.x);
		h.y = Number.parseFloat(h.y);
		if (Number.isNaN(h.x) || Number.isNaN(h.y)) {
			console.log('Meta2GeoJSON.addNewPoint: lat lon not a number. lon:' + h.x + ' lat:' + h.y);
			return
		};
		geoJson.features.push(this.newPoint(h));
	}, //-------------------------------------

	checkMeta4geo: function (htitles) { //htitles=hash Of Metadata Titles (CSV titles)
		function chk(x, params, htitles) {
			if (x in params && params[x] in htitles) {
				console.log("(GEO) found metadata field '" + params[x] + "' as " + x);
				return params[x];
			}
			if (x in htitles) {
				console.log("(GEO) fallback: found metadata field '" + x + "' as " + x);
				return x;
			}
			if (x in params && !(params[x] in htitles)) {
				console.log("(GEO) WARNING: field NOT found in metadata: '" + params[x] + "' as " + x);
			}
			if (!(x in params) && !(x in htitles)) {
				console.log("(GEO) WARNING: fallback field NOT found in metadata: '" + x + "' as " + x);
			}
			return '';
		}

		var params = MSFileChooser.params;
		this.xName = chk("longitude", params, htitles);
		this.yName = chk("latitude", params, htitles);
		if (this.xName == '' || this.yName == '') {
			return false;
		}
		return true;
	}, //-------------------------------------

	meta2GeoJsonLonLat: function (hashOfHash, lonName, latName) {
		var geoJson = this.newGeoJson();
		for (var id in hashOfHash) {
			var h = hashOfHash[id]; //r=record
			this.addNewPoint(geoJson, {
				id: id,
				x: h[lonName],
				y: h[latName]
			});
		}
		return geoJson;
	}, //-------------------------------------

	meta2GeoJson: function (hashOfHash) {
		return this.meta2GeoJsonLonLat(hashOfHash, this.xName, this.yName);
	} //-------------------------------------

}
/////////////////////////////////////////////////////////////////

function parseMetadata (msg,lines,header_index){
	if( msg === 'Error') {
		alert('malformed metadata file');
	}
	var meta={};
	if (header_index.find(function(d) {return d == "ID"})) {
		id_name = 'ID';
	} else {
		id_name = header_index[0];
	}
	lines.forEach(function(line) {meta[line[id_name]]=line;});

	var category = 'nothing';
	var options={};
	category = header_index.length > 1 ? header_index[1] : header_index[0];
	for (var i in header_index){
		var header = header_index[i];
		options[header]=header;
	}
	the_tree.addMetadataOptions(options);
	$("#metadata-select").val(category);
	// $("#metadata-map-select").val(category);
	the_tree.addMetadata(meta);

	/////////////////////////////////////
	// to be changed in this way for parameters &x=title_name_longitute&y=title_name_latitudine
	if( Meta2GeoJSON.checkMeta4geo(options) ){ //options = hash of metadata titles 
		var geoJ=Meta2GeoJSON.meta2GeoJson( meta );
		// To be changed to not use global_geoJ as a global var but to use the_map object instead
		// for example the_map.setGeoJSON(geoJ);
		window.global_geoJ = geoJ;
	}else{
		console.log('(GEO)WARNING: titles not found in metadata:' + Meta2GeoJSON.xName +','+ Meta2GeoJSON.yName);
	}	
	/////////////////////////////////////

	the_tree.changeCategory(category);

	// to use original tree button we need tree_raw populated with an object containing also metadata, so we added the following line. Please find more in the README.md file under Dev notes paragraph
	tree_raw = the_tree.getTreeAsObject();
};


function loadTreeText(tree){
	initiateLoading("Processing tree file")
	//give time to dialog to display
	setTimeout(function(){
		try {
			data =JSON.parse(tree);
		} catch (e) {
			data = {};
			if ( tree.toUpperCase().startsWith('#NEXUS') ) {
				data['nexus'] = tree;
				data['layout_algorithm']=$("#layout-select").val();
			}
			else{
				data['nwk']=tree;
				data['layout_algorithm']=$("#layout-select").val();
			}
		}
		tree_raw = data;
		loadMSTree(tree_raw);
		// we need to (re)set the category list for selct box
		var metadata_options = data.metadata_options;
		if (metadata_options) {
			for (var i in metadata_options) {
				var cat = metadata_options[i].label;
				if (cat != "No Category") {
					$("#metadata-select").append($("<option>").attr("value", cat).text(cat));
					$("#metadata-map-select").append($("<option>").attr("value", cat).text(cat));
					$("#node-label-text").append($("<option>").attr("value", cat).text(cat));
				}
			}
		}
		var category = data.initial_category;
		if (category) {
			$("#metadata-select").val(category);
			// $("#metadata-map-select").val(category);
		}
		// we need to call map definition points method due with the load JSON functions we don't call the loadMetadataText() as colled by the loadNetFIles()
		// reset the_map.load_count allow us to give an initial fitbounds on markers
		the_map.load_count = 0;
		the_map.definePoints();
		/**
		 * 
		 * Add tools to legend
		 *
		 */
		var svg_legend = document.querySelector('#legend-svg');
		var svg_legend_parent = svg_legend.parentElement;
		svg_legend_parent.setAttribute('id', 'legend-tools-container');
		var legend_tools = document.querySelector('#legend-tools');
		if (!legend_tools) {
			legend_tools = document.createElement('div');
			legend_tools.setAttribute('id', 'legend-tools');
			legend_tools.innerHTML = '<div class="no-drag legend-tool legend-tool-settings" onclick="toggleLegendSettings()"></div><div class="no-drag legend-tool legend-tool-select-all" onclick="legendSelectAll()"></div><div class="no-drag legend-tool legend-tool-invert-selection" onclick="legendInvertSelection()"></div><div class="no-drag legend-tool legend-tool-clean-selection" onclick="legendCleanSelection()"></div><div class="no-drag legend-tool legend-tool-reset" onclick="legendReset()"></div>';
			svg_legend_parent.appendChild(legend_tools);
		}
	},500);
};

function saveTextAsFile (text,suggested_name){
	var save = $("<a download><button>Save</button></a>").click(function(){
		var name=$("#filename").val();
		if(!name){
			return;
		}
		//windows - don't actually use the file download anchor
		if(window.navigator.msSaveOrOpenBlob) {
			var data = new Blob([text], {type: 'text/plain'});
			window.navigator.msSaveBlob(data,name);
		}
		//others
		else{
			var data = new Blob([text], {type: 'text/plain'});

			this.textFile = window.URL.createObjectURL(data);
			//set file name and contents before click event propogates
			$(this).attr("download",name);
			$(this).attr("href",this.textFile);

		}
		$(this).parent().dialog().dialog("close");
	});
	/**
	 * 
	 * ## Bug fix - font size
	 * 
	 * from `var notification = "<p style='font-size:10'>` to `var notification = "<p style='font-size:10px'>`
	 * in any case we will hide this message via CSS
	 * 
	 */
	var notification = "<p style='font-size:10px'> Some browsers allow you to select a folder after you click the 'Save' Button.<br> Whereas many browsers, such as Chrome, by default save the downloaded file into:<br><b>Windows</b>: <code>'&#92;Users&#92;&lt;username&gt;&#92;Downloads'</code><br><b>Mac</b>: <code>'/Users/&lt;username&gt;/Downloads'</code><br><b>Linux</b>: <code>'home/&lt;username&gt;/Downloads'</code><br></p>";
	var filenamebar = $("<input title='Suffix will be automatically added in some browsers if you have got a file with the same name.' type='text' id ='filename' value='"+suggested_name+"'>");
	//the actual dailog box
	/**
	 * 
	 * ## UI improvement - adde label tag to fiel notification
	 * 
	 * from `.html(notification + "File Name: ")` to `.html(notification + "<label>File Name: </label>")'>`
	 * in any case we will hide this message via CSS
	 * 
	 */
	$("<div id ='savedailog'></div>")
	.html(notification + "<label>File Name: </label>")
	.dialog({
		autoOpen: true,
		modal: true,
		title: "Save File",
		buttons: {
			"Cancel": function () {
				$(this).dialog("close");
			}
		},
		close: function () {
			$(this).dialog('destroy').remove();
		},
		width: "400px",
	}).append(filenamebar).append(save);
};

function processProfileFile(profile){
	if ($("#check-memory").prop('checked')) {
		profile2check(profile);
	} else {
		profile2tree(profile);
	}
 };
 
function profile2check(profile) {
	  try{
		$.ajax({
				method: "POST",
				url: "/maketree",
				data: {
				profile:profile,
				method:$("#method-select").val(),
				checkEnv:1,
			},
			startTime : new Date(),
		}).done(function(result){
				$("#information-div").modal("hide");
				var sys_info = JSON.parse(result);
				var diag = $('<div id="send-to-tree" title="Estimated memory / time usage"></div>').appendTo($("body"));

				diag.append("<p><label>Memory (MB): </label>"+Math.round(sys_info.memory/1024/1024) + "</p>");
				var deltaTime = new Date() - this.startTime;
				diag.append("<p><label>Time (minutes): </label>"+Math.round((sys_info.time+deltaTime/1000)/6)/10 + "</p>");
				diag.append("<p>Numbers are raw estimates and may be different from your system. </p>");
				if (! sys_info.affordable) {
					diag.append("<p><label style='font-color:red'>WARNING: More memory are required than you current have. The tree may still be calculated because some system can automatically compress the memory. However the calculation will take more time and may crash! </label></p>");
				}
				diag.append("<p><label>Calculate the tree? </label></p>");
				
				diag.dialog({
					width: 400,
					resizable: false,
					height: "auto",
					modal: true,
					close : function(e) {
						diag.dialog('destroy').remove();
					}, 
					buttons: {
						Yes: function(){
							profile2tree(profile);
							$(this).dialog("close");
						},
						No: function() {
							$(this).dialog("close");
						}
					}
				});
	   }).fail(function( jqXHR, textStatus){
				if (jqXHR.status == 405 || jqXHR.status == 404) {
					loadFailed("Cannot reach the backend. Please download a FREE standalone version from https://github.com/achtman-lab/GrapeTree/");
				} else {
					console.log(textStatus);
					loadFailed("There server returned an error. Is the profile file in the right format?");
				}
	   });
	   }catch(e){
				loadFailed("The server could not be contacted");
	   }
		$("#waiting-information").text("Estimating memory / time usage...");
}
 
 function profile2tree(profile) {
 $("#information-div").modal("show");
              try{
                $.ajax({
                        method: "POST",
                        url: "/maketree",
                        data: {
						profile:profile,
						method:$("#method-select").val(),
						checkEnv: 0,
				}
                }).done(function(result){
						tree_raw = {"nwk":result,"layout_algorithm":$("#layout-select").val()};
						$("#headertag").text( $("#headertag").text() + ' (' + $("#method-select").val() + ')' );
						loadMSTree(tree_raw);
               }).fail(function( jqXHR, textStatus){
						if (jqXHR.status == 405 || jqXHR.status == 404) {
							loadFailed("Cannot reach the backend. Please download a FREE standalone version from https://github.com/achtman-lab/GrapeTree/");
						} else {
							console.log(textStatus);
							loadFailed("There server returned an error. Is the profile file in the right format?");
						}
               });
               }catch(e){
                        loadFailed("The server could not be contacted");
               }
                $("#waiting-information").text("Computing Tree");
 }

function loadFailed(msg){
	$("#information-div").modal("show");
	$(waiting_spinner.el).hide();
	$("#waiting-image").attr("src","static/js/img/ms_failed_1.png").show();
	$("#waiting-information").text(msg);
}
