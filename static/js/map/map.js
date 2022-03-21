var the_map = {};

the_map.load_count = 0;

/**
 * 
 * HEX to RGB converter
 * [https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb](https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb)
 * 
 */
the_map.hexToRgb = function (hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * 
 * Show/Hide sample list in the point popup
 * 
 */
the_map.toggleSampleListView = function (e) {
  var pu_contents = e.target.parentNode.parentNode;
  var samples_list_container = pu_contents.querySelector(".pu-samples-list-container");
  if (e.target.classList.contains('shown')) {
    samples_list_container.classList.remove('show');
    e.target.classList.remove('shown');
    e.target.innerHTML = 'Mostra lista campioni';
  } else {
    e.target.classList.add('shown');
    e.target.innerHTML = 'Nascondi lista campioni';
    samples_list_container.classList.add('show');
  }
} // toggleSampleListView

/**
 * 
 * Select all samples in a point
 * 
 */
the_map.samplesSelection = function (e) {
  var pu_contents = e.target.parentNode.parentNode;
  var pu_info = pu_contents.querySelector('ul.point-popup-info');
  var pu_info_selected = pu_info.querySelector('.point-popup-info-selected');
  var samples_list = pu_contents.querySelectorAll('a.pu-sample-link');
  var samples_selected_number = 0;
  var codes = [];
  for (var i = 0; i < samples_list.length; i++) {
    var code = samples_list[i].getAttribute('data-code');
    if (code) {
      codes.push(code);
      samples_list[i].classList.add('p-selected');
    }
  }
  the_tree.selectNodesByIds(codes);
  // Here we update information about selcetd samples
  samples_selected_number = pu_contents.getElementsByClassName("p-selected").length;
  if (samples_selected_number != 0) {
    pu_info_selected.innerHTML = 'Campioni Selezionati <span class="info-number">' + samples_selected_number + '</span>';
  } else {
    pu_info_selected.innerHTML = 'Nessun campione selezionato  <span class="info-number"></span>';
  }
} // samplesSelection

/**
 * 
 * Deselect all samples in a point
 * 
 */
the_map.samplesDeselection = function (e) {
  var pu_contents = e.target.parentNode.parentNode;
  var pu_info = pu_contents.querySelector('ul.point-popup-info');
  var pu_info_selected = pu_info.querySelector('.point-popup-info-selected');
  var samples_list = pu_contents.querySelectorAll('a.pu-sample-link');
  var codes = [];
  for (var i = 0; i < samples_list.length; i++) {
    var code = samples_list[i].getAttribute('data-code');
    if (code) {
      codes.push(code);
      samples_list[i].classList.remove('p-selected');
    }
  }
  the_tree.unselectNodesByIds(codes);
  // Here we update information about selcetd samples
  pu_info_selected.innerHTML = 'Nessun campione selezionato  <span class="info-number"></span>';
} // samplesDeselection

/**
 * 
 * Sample selection
 * 
 */
the_map.sampleSelection = function (id, code, ctrl) {
  var selector = "#"+id;
  var sample = document.querySelector(selector);
  var pu_contents = sample.parentNode.parentNode;
  var pu_info = pu_contents.querySelector('ul.point-popup-info');
  var pu_info_selected = pu_info.querySelector('.point-popup-info-selected');
  var samples_selected_number = 0;
  if (!sample.classList.contains("p-selected")) {
    if (ctrl) {
      sample.classList.add("p-selected");
      the_tree.selectNodesByIds(code);
      /**
       * 
       * We need to detect which of the other samples in the pop up is selected when we click on a sample link.
       * 
       * So we match if samples contained in the popup corresponds to the samples selected on the tree. If yes we assign a `p-selected` class witch control the aspect.
       * 
       */
      var s_nodes = the_tree.getAllSelectedNodesIDs();
      var sample_parent = sample.parentNode;
      var sample_a = sample_parent.querySelectorAll('a.pu-sample-link');
      for (var i = 0; i < sample_a.length; i++) {
        var sample_a_code = sample_a[i].getAttribute('data-code');
        if (s_nodes.includes(sample_a_code) && !sample_a[i].classList.contains('p-selected')) {
          sample_a[i].classList.add('p-selected');
        }
      }
    } else {
      // insert here a modal box with the alert message
      alert("Ops! Sembra che il campione selezionato non abbia una corrispondenza su GrapeTree.");
    }
  } else {
    sample.classList.remove("p-selected");
    the_tree.unselectNodesByIds(code);
    /**
     * 
     * We need to detect which of the other samples in the pop up is not selected when we click on a sample link to deselcet it.
     * 
     * So we match if samples contained in the popup not corresponds to the samples selected on the tree. If yes we remove the `p-selected` class witch control the aspect.
     * 
     */
    var s_nodes = the_tree.getAllSelectedNodesIDs();
    var sample_parent = sample.parentNode;
    var sample_a = sample_parent.querySelectorAll('a.pu-sample-link');
    for (var i = 0; i < sample_a.length; i++) {
      var sample_a_code = sample_a[i].getAttribute('data-code');
      if (!s_nodes.includes(sample_a_code) && sample_a[i].classList.contains('p-selected')) {
        sample_a[i].classList.remove('p-selected');
      }
    }
  }
  // Here we update information about selcetd samples
  samples_selected_number = pu_contents.getElementsByClassName("p-selected").length;
  if (samples_selected_number != 0) {
    pu_info_selected.innerHTML = 'Campioni Selezionati <span class="info-number">' + samples_selected_number + '</span>';
  } else {
    pu_info_selected.innerHTML = 'Nessun campione selezionato  <span class="info-number"></span>';
  }
} // sampleSelection

/**
 * 
 * Init map
 * 
 */
the_map.initMap = () => {
  if (this.map) {
    this.map.off();
    this.map.remove();
  }
  this.map = L.map('map-div').setView([42.00, 13.00], 5);
  this.osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(this.map);
} // initMap

/**
 * 
 * Calculate point radius
 * 
 * 
 */
the_map.calculatePointRadius = (samples_amount) => {
  // get min and max interval from samples_amount
  var min_samples = Math.min(...samples_amount);
  var max_samples = Math.max(...samples_amount);
  var min_radius = 13;
  var max_radius = 34;
  var samples_interval = max_samples - min_samples;
  var radius_interval = max_radius - min_radius;
  var point_radius;
  this.pointLayer.eachLayer((layer) => {
    var samples_number = layer.feature.properties.samples.length;
    if (samples_number == min_samples) {
      point_radius = min_radius;
    }
    if (samples_number == max_samples) {
      point_radius = max_radius;
    }
    if ((samples_number < max_samples) && (samples_number > min_samples)){
      point_radius = ((samples_number * radius_interval) / samples_interval) + min_radius;
    }
    var icon = layer.options.icon;
    icon.options.iconSize = [point_radius*2, point_radius*2];
    icon.options.iconAnchor = [point_radius, point_radius];
    layer.setIcon(icon);
  });
} // calculatePointRadius

/**
 * 
 * Add data to map from geoJSON file.
 * 
 */
the_map.loadGeoJson = (samples_amount, delta, type) => {
  /**
   * 
   * We need to rebuild the GeoJSON provided as an url parameter to merge samples codes with same coordinates, first of all this will avoid the marker overlap but also get the basis to make (and color) pie chart when multiple samples are present in the same point.
   * 
   * When rebuilding the GeoJSON we hold a point clustering system in order to allow users to aggregate point in two ways: with a simple numeric delta (this will reduce geographical nearest points) or with metadata (this will aggregate point by samples properties). We apply the given delta (numeric or string) on coordinates before rebuild a new object.
   * 
   */
  this.urlParams = new URLSearchParams(window.location.search);
  this.geoPath = this.urlParams.get('geo');
  $.getJSON(this.geoPath, (data) => {
    var r_obj = {
      "features": [],
      "name": data.name,
      "type": data.type,
      "id_dashboard": data.id_dashboard
    };
    var d_coordinates;
    var d_data = [];
    var d_code = [];
    var ctrl = [];
    var clusters = {};
    
    // check if delta is number (then it comes from aggregation select box) or string (then it comes from metedata select box), to be improved after test
    if (type == "number") {
      /**
       * 
       * First of all we build an object containing cooridnates cluster grouped by a key given with the "reduced" lat and lng. We create also a new parameter to data object `data.features[i].properties.kstr` with same value of the cluster[key], this will allow us to make a match between objects later in the code.
       * 
       */
      for (var i = 0; i < data.features.length; i++) {
        var key = "";
        var base = 2; // changing the base value will change also the sensibility of the delta
        var node = data.features[i].geometry.coordinates;
        var lat = 0;
        var lng = 0;

        lat = parseInt(node[0] * Math.pow(base, delta)) / Math.pow(base, delta);
        lng = parseInt(node[1] * Math.pow(base, delta)) / Math.pow(base, delta);
        key = lat + "-" + lng;
        data.features[i].properties.kstr = key;

        if(clusters[key] == undefined) {
          clusters[key]=[];
        }
        clusters[key].push(node);
      }

      /**
       * 
       * Then we loop clusters object to make the average of lat and lng grouped for each key, the results will be used to place the cluster in the map by giving it as coordinates to the `data.features[i].geometry.coordinates`.
       * 
       */
      Object.keys(clusters).forEach(key => {
        var initial_value = 0;
        var lat_sum = clusters[key].reduce(
          (previous_value, current_value) => {
            return previous_value + current_value[0];
          },
          initial_value
        );
        var lng_sum = clusters[key].reduce(
          (previous_value, current_value) => {
            return previous_value + current_value[1];
          },
          initial_value
        );
        var lat_average = lat_sum / clusters[key].length;
        var lng_average = lng_sum / clusters[key].length;

        for (var i = 0; i < data.features.length; i++) {
          if (data.features[i].properties.kstr == key) {
            data.features[i].geometry.coordinates[0] = lat_average;
            data.features[i].geometry.coordinates[1] = lng_average;
          }
        }
      });
    } else {
      /**
       * 
       * If the delta is a metadata we will build an object containing cooridnates cluster grouped by a key given by the delta value string get from tree metadata. We create also a new parameter to data object `data.features[i].properties.kstr` with same value of the cluster[key], this will allow us to make a match between objects later in the code.
       * 
       */
      var md = the_tree.getMetadata();
      for (var i = 0; i < data.features.length; i++) {
        var key = "";
        var sample = data.features[i].properties.codice;
        var node = data.features[i].geometry.coordinates;
        if (md[sample]) {
          if (md[sample][delta]) {
            key = md[sample][delta];
            data.features[i].properties.kstr = key;
            if(clusters[key] == undefined) {
              clusters[key]=[];
            }
            clusters[key].push(node);
          }
        }
      }
      /**
       * 
       * Then in the same way we did for delta number, we loop clusters object to make the average of lat and lng grouped for each key, the results will be used to place the cluster in the map by giving it as coordinates to the `data.features[i].geometry.coordinates`.
       * 
       * TO BE IMPROVED, CREATE AN UNIQUE FUNCTION TO REDUCE CLUSTERS
       * 
       */
      Object.keys(clusters).forEach(key => {
        var initial_value = 0;
        var lat_sum = clusters[key].reduce(
          (previous_value, current_value) => {
            return previous_value + current_value[0];
          },
          initial_value
        );
        var lng_sum = clusters[key].reduce(
          (previous_value, current_value) => {
            return previous_value + current_value[1];
          },
          initial_value
        );
        var lat_average = lat_sum / clusters[key].length;
        var lng_average = lng_sum / clusters[key].length;

        for (var i = 0; i < data.features.length; i++) {
          if (data.features[i].properties.kstr == key) {
            data.features[i].geometry.coordinates[0] = lat_average;
            data.features[i].geometry.coordinates[1] = lng_average;
          }
        }
      });
    }
    

    /**
     * 
     * Finally we build the new GeoJSON starting from `data` object to merge samples codes with same coordinates. 
     * 
    */
    for (var i = 0; i < data.features.length; i++) {
      /**
       * 
       * We retrieve all the coordinates, convert them in string and push in a controller array. If a coordinate do not exists in this array we build a new object and push it into new geoJSON (r_obj) if it already exists we do not build a new object to push but we will push directly data and codes in the existing object.
       * 
      */
      var d_str = JSON.stringify(data.features[i].geometry.coordinates);
      // d_str is used to build an array to control duplicates and to give an id to the object
      // we will use the id later to retreive the existing object and push samples
      if (!ctrl.includes(d_str)) {
        ctrl.push(d_str);
        var obj = {
          "geometry": 
          {
            "coordinates": [],
            "type": "Point",
          },
          "type": "Feature",
          "properties": 
          {
            "samples": []
          }
        };
        obj.geometry.coordinates = data.features[i].geometry.coordinates;
        obj.kstr = key;
        obj.id = d_str;
        var sample = {
          "data": data.features[i].properties.data,
          "codice": data.features[i].properties.codice
        };
        obj.properties.samples.push(sample);
        r_obj.features.push(obj);
      } else {
        // here we use id to get the existing object and push samples that share same coordinates
        var foundIndex = r_obj.features.findIndex(x => x.id == d_str);
        var sample = {
          "data": data.features[i].properties.data,
          "codice": data.features[i].properties.codice
        };
        r_obj.features[foundIndex].properties.samples.push(sample);
      }
    }
    // this.pointLayer.addData(data);
    this.pointLayer.addData(r_obj);
    the_map.calculatePointRadius(samples_amount);
    the_map.updateNodesInMap();
    the_map.load_count++;
    if (the_map.load_count == 1) {
      // fitBounds force the map to zoom and allow the view of all the point, padding add a space around
      this.map.fitBounds(this.pointLayer.getBounds(), { padding: [42, 42] });
    }
  });
} // loadGeoJson

/**
 * 
 * Define point layers
 * 
 */
the_map.definePoints = (delta, type) => {
  /**
   * 
   * If point layer exists clear layers.
   * 
   */
  var point_layer = this.pointLayer;
  if (point_layer) {
    point_layer.clearLayers();
  }

  var md = the_tree.getMetadata();
  var nodes = the_tree.getAllNodesIDs();
  var selected_nodes = the_tree.getSelectedNodeIDs();
  // simple array to store how many samples we have on each point
  var samples_amount =[];

  /**
   * 
   * Empty layer to host points
   * 
   */
  this.pointLayer = L.geoJSON(null, {
    pointToLayer: (feature, latlng) => {
      return L.piechartMarker(latlng, {
        radius: 13,
        data: []
      });
    },
    onEachFeature: (feature, layer) => {
      var feat_samples = feature.properties.samples;
      var popup_contents = "";
      var samples_list = "";
      var point_data = [];
      var samples_number = feature.properties.samples.length;
      // get data from the tree: metadata and colors for categories
      var colors = the_tree.objColors;
      // get the active category name
      var cat;
      cat = Object.keys(colors)[0];
      for (var i = 0; i < feat_samples.length; i++) {
        // get the code
        var code = feat_samples[i].codice;
        // get the sample category to use it as a key to get color code
        var fill_color;
        var stroke_color;
        if (md[code]) {
          var key_color = md[code][cat];
          // get color code for the sample
          var sample_color;
          if (colors[cat]) {
            sample_color = colors[cat][key_color];
          }
          if (sample_color) {
            // convert hex to rgb
            var sc_rgb = the_map.hexToRgb(sample_color).r + ", " + the_map.hexToRgb(sample_color).g + ", " + the_map.hexToRgb(sample_color).b;
            fill_color = sc_rgb + ", 0.9";
            stroke_color = sc_rgb + ", 0.9";
          } else {
            fill_color = "255, 255, 255, 0.9";
            stroke_color = "255, 255, 255, 0.9";
          }
        } else {
          fill_color = "255, 255, 255, 0";
          stroke_color = "255, 255, 255, 0";
        }
        // create data object
        var point_data_object = {
          name: code,
          value: 100,
          style: {
            fillStyle: "rgba(" + fill_color + ")",
            strokeStyle: "rgba(" + stroke_color + ")"
          }
        };
        point_data.push(point_data_object);
        /**
         * 
         * Build popups contents
         * 
         */
        var str_code = code.replaceAll(/[./]/g, '');
        var code_link;
        var ctrl;
        if (nodes.includes(code)) {
          ctrl = true;
          code_link = "<a id='p-" + str_code + "' data-code='" + code + "' class='pu-sample-link' onclick='the_map.sampleSelection(this.id, \"" + code + "\", " + ctrl + ");'> <span style='background-color: rgba(" + fill_color + ");'></span> " + code + "</a>";
        } else {
          ctrl = false;
          code_link = "<a id='p-" + str_code + "' class='pu-sample-link warning' onclick='the_map.sampleSelection(this.id, \"" + code + "\", " + ctrl + ");'> <span></span> " + code + "</a>";
        }
        if (samples_list == "") {
          samples_list = code_link;
        } else {
          samples_list += ", " + code_link;
        }
      }
      popup_contents = '<div class="point-popup-contents"> <ul class="point-popup-info"> <li>Totale campioni <span class="info-number">' + samples_number + '</span> </li> <li class="point-popup-info-selected"></li> </ul> <div class="point-popup-utilities"> <a onclick="the_map.samplesSelection(event);">Seleziona tutti</a> <a onclick="the_map.samplesDeselection(event);">Deseleziona tutti</a> </div> <div class="point-popup-utilities"> <a id="point-popup-toggle-sample-view" onclick="the_map.toggleSampleListView(event);">Mostra lista campioni</a> </div> <div class="pu-samples-list-container"> <div class="label label-select-tree">Seleziona un campione per vederlo in GrapeTree</div> ' + samples_list + ' </div> </div> </div>';
      // assign percentage value based on samples numbers
      var c_value = 100 / samples_number;
      for (var i = 0; i < point_data.length; i++) {
        point_data[i].value = c_value;
      }
      samples_amount.push(samples_number);
      layer.options.data = point_data;
      layer.options.icon.options.data = point_data;
      layer.bindPopup(popup_contents).on('click', function(e) {
        
        var pu_c = e.target._popup._container.querySelector('.point-popup-contents');
        var pu_a_selected_number = 0;
        var pu_a_warning_number = 0;
        var s_nodes = the_tree.getAllSelectedNodesIDs();
        var pu_a = pu_c.querySelectorAll('a.pu-sample-link');
        var ul = pu_c.querySelector("ul");
        /**
         * 
         * We need to detect which of the single sample are selected when pupup is binded, the bind action seems to build popup in that specific moment so we don't have memory of the click event on the sample. Anyway this kind of control is needed also because the selection could happen in the tree :)
         * 
         * So we control if samples contained in the popup corresponds to the samples selected on the tree. If yes we assing a `p-selected` class witch control the aspect and also the `the_map.sampleSelection()`.
         * 
         * In the same for loop we count how many selected samples is in there and also mismatching sample marked with `warning` class in popup construction to give some information and utilities to the users.
         * 
         */
        for (var i = 0; i < pu_a.length; i++) {
          var pu_a_code = pu_a[i].getAttribute('data-code');
          if (s_nodes.includes(pu_a_code)) {
            pu_a[i].classList.add('p-selected');
          }
        }

        /**
         * 
         * Here we add information about samples and utilities to work with them.
         * 
         */
        pu_a_selected_number = pu_c.getElementsByClassName("p-selected").length;
        if (pu_a_selected_number != 0) {
          var selected_info = ul.querySelector(".point-popup-info-selected");
          selected_info.innerHTML = 'Campioni Selezionati <span class="info-number">' + pu_a_selected_number + '</span>';
        } else {
          var selected_info = ul.querySelector(".point-popup-info-selected");
          selected_info.innerHTML = 'Nessun campione selezionato  <span class="info-number"></span>';
        }

        pu_a_warning_number = pu_c.getElementsByClassName("warning").length;
        if (pu_a_warning_number != 0) {
          var warning_info = document.createElement("li");
          warning_info.classList.add("point-popup-info-warning");
          warning_info.innerHTML = 'Campioni non presenti in GrapeTree <span class="info-number">' + pu_a_warning_number + '</span>';
          ul.appendChild(warning_info);
        }

        /**
         * 
         * Center and zoom on point clicked
         * 
         */
        var lat = e.latlng.lat;
        var lng = e.latlng.lng;
        var lat_lng = [];
        lat_lng.push(lat, lng);
        map.setView(lat_lng)
      });
    }
  }).addTo(this.map);
  
  the_map.loadGeoJson(samples_amount, delta, type);
} // definePoints

/**
 * 
 * Update point layers
 * 
 */
the_map.updatePoints = () => {

  var md = the_tree.getMetadata();
  var nodes = the_tree.getAllNodesIDs();
  var selected_nodes = the_tree.getSelectedNodeIDs();
  // simple array to store how many samples we have on each point
  var samples_amount =[];
  // get data from the tree: metadata and colors for categories
  var colors = the_tree.objColors;
  var cat = Object.keys(colors)[0];

  this.pointLayer.eachLayer((layer) => {
    var feat_samples = layer.feature.properties.samples;
    var popup_contents = "";
    var samples_list = "";
    var point_data = [];
    var samples_number = layer.feature.properties.samples.length;
    for (var i = 0; i < feat_samples.length; i++) {
      // get the code
      var code = feat_samples[i].codice;
      // get the sample category to use it as a key to get color code
      var fill_color;
      var stroke_color;
      if (md[code]) {
        var key_color = md[code][cat];
        // get color code for the sample
        var sample_color = colors[cat][key_color];
        if (sample_color) {
          // convert hex to rgb
          var sc_rgb = the_map.hexToRgb(sample_color).r + ", " + the_map.hexToRgb(sample_color).g + ", " + the_map.hexToRgb(sample_color).b;
          fill_color = sc_rgb + ", 0.9";
          stroke_color = sc_rgb + ", 0.9";
        } else {
          fill_color = "255, 255, 255, 0.9";
          stroke_color = "255, 255, 255, 0.9";
        }
      } else {
        fill_color = "255, 255, 255, 0";
        stroke_color = "255, 255, 255, 0";
      }
      // create data object
      var point_data_object = {
        name: code,
        value: 100,
        style: {
          fillStyle: "rgba(" + fill_color + ")",
          strokeStyle: "rgba(" + stroke_color + ")"
        }
      };

      point_data.push(point_data_object);
      /**
       * 
       * Build popups contents
       * 
       */
      var str_code = code.replaceAll(/[./]/g, '');
      var code_link;
      var ctrl;
      if (nodes.includes(code)) {
        ctrl = true;
        code_link = "<a id='p-" + str_code + "' data-code='" + code + "' class='pu-sample-link' onclick='the_map.sampleSelection(this.id, \"" + code + "\", " + ctrl + ");'> <span style='background-color: rgba(" + fill_color + ");'></span> " + code + "</a>";
      } else {
        ctrl = false;
        code_link = "<a id='p-" + str_code + "' class='pu-sample-link warning' onclick='the_map.sampleSelection(this.id, \"" + code + "\", " + ctrl + ");'> <span></span> " + code + "</a>";
      }
      if (samples_list == "") {
        samples_list = code_link;
      } else {
        samples_list += ", " + code_link;
      }
    }
    popup_contents = '<div class="point-popup-contents"> <ul class="point-popup-info"> <li>Totale campioni <span class="info-number">' + samples_number + '</span> </li> <li class="point-popup-info-selected"></li> </ul> <div class="point-popup-utilities"> <a onclick="the_map.samplesSelection(event);">Seleziona tutti</a> <a onclick="the_map.samplesDeselection(event);">Deseleziona tutti</a> </div> <div class="point-popup-utilities"> <a id="point-popup-toggle-sample-view" onclick="the_map.toggleSampleListView(event);">Mostra lista campioni</a> </div> <div class="pu-samples-list-container"> <div class="label label-select-tree">Seleziona un campione per vederlo in GrapeTree</div> ' + samples_list + ' </div> </div> </div>';
    // assign percentage value based on samples numbers
    var c_value = 100 / samples_number;
    for (var i = 0; i < point_data.length; i++) {
      point_data[i].value = c_value;
    }
    samples_amount.push(samples_number);
    layer.options.data = point_data;
    layer.options.icon.options.data = point_data;
    layer.setIcon(layer.options.icon);
    layer.bindPopup(popup_contents).on('click', function(e) {
      var pu_c = e.target._popup._container.querySelector('.point-popup-contents');
      var pu_a_selected_number = 0;
      var pu_a_warning_number = 0;
      var s_nodes = the_tree.getAllSelectedNodesIDs();
      var pu_a = pu_c.querySelectorAll('a.pu-sample-link');
      var ul = pu_c.querySelector("ul");
      /**
       * 
       * We need to detect which of the single sample are selected when pupup is binded, the bind action seems to build popup in that specific moment so we don't have menmory of the click event on the sample. Anyway this kind of control is needed also because the selection could happen in the tree :)
       * 
       * So we control if samples contained in the popup corresponds to the samples selected on the tree. If yes we assing a `p-selected` class witch control the aspect and also the `the_map.sampleSelection()`.
       * 
       * In the same for loop we count how many selected samples is in there and also mismatching sample marked with `warning` class in popup construction to give some information and utilities to the users.
       * 
       */
      for (var i = 0; i < pu_a.length; i++) {
        var pu_a_code = pu_a[i].getAttribute('data-code');
        if (s_nodes.includes(pu_a_code)) {
          pu_a[i].classList.add('p-selected');
        }
      }

      /**
       * 
       * Here we add information about samples and utilities to work with them.
       * 
       */
      pu_a_selected_number = pu_c.getElementsByClassName("p-selected").length;
      if (pu_a_selected_number != 0) {
        var selected_info = ul.querySelector(".point-popup-info-selected");
        selected_info.innerHTML = 'Campioni Selezionati <span class="info-number">' + pu_a_selected_number + '</span>';
      } else {
        var selected_info = ul.querySelector(".point-popup-info-selected");
        selected_info.innerHTML = 'Nessun campione selezionato  <span class="info-number"></span>';
      }
    });
  });

  the_map.updateNodesInMap();
} // updatePoints

/**
 * 
 * ## Selections Tree -> Map
 * 
 * Selected ids and passed to this function from tree_interceptor are used to filter features (points) array of the map layer and populate the empty layer for the selection
 * 
 */
the_map.findNodesInMap = (selected_groups) => {

  var selected_ids = [];

  this.pointLayer.eachLayer((layer) => {
    layer._icon.classList.remove('selected');
    layer._icon.classList.remove('fully-selected');
    layer._icon.classList.remove('partially-selected');
  });

  if (selected_groups !== 'unselect_all') {
    for (let [key, value] of Object.entries(selected_groups)) {
      // console.log(key, value);
      selected_ids.push(...value);
    }
    if (selected_ids.length > 0) {

      this.pointLayer.eachLayer((layer) => {
        var feat_samples = layer.feature.properties.samples;
        var feat_samples_codes = [];
        for (var i = 0; i < feat_samples.length; i++) {
          feat_samples_codes.push(feat_samples[i].codice);
        }
        var contains_all = feat_samples_codes.every(element => {
          return selected_ids.includes(element);
        });
        var contains_some = feat_samples_codes.some(element => {
          return selected_ids.includes(element);
        });

        if (contains_all) {
          // layer._icon is the canvas containing the pie chart
          layer._icon.classList.add('selected');
          layer._icon.classList.add('fully-selected');
        } else {
          if (contains_some) {
            // layer._icon is the canvas containing the pie chart
            layer._icon.classList.add('selected');
            layer._icon.classList.add('partially-selected');
          }
        }
      });
    } else {
      this.pointLayer.eachLayer((layer) => {
        layer._icon.classList.remove('selected');
        layer._icon.classList.remove('fully-selected');
        layer._icon.classList.remove('partially-selected');
      });
    }
  }

  if (selected_groups == 'unselect_all') {
    console.log('Tutto deselezionato da menu contestuale');
    this.pointLayer.eachLayer((layer) => {
      layer._icon.classList.remove('selected');
      layer._icon.classList.remove('fully-selected');
      layer._icon.classList.remove('partially-selected');
    });
  }

  if (selected_groups == 'select_all') {
    console.log('Tutto selezionato da menu contestuale');
    this.pointLayer.eachLayer((layer) => {
      layer._icon.classList.remove('selected');
      layer._icon.classList.remove('fully-selected');
      layer._icon.classList.remove('partially-selected');
    });
  }
} // findNodesInMap

/**
 * 
 * Update style for nodes in map.
 * 
 */
the_map.updateNodesInMap = () => {
  var grouped_nodes_obj = {};
  var selected_nodes = the_tree.getSelectedNodeIDs();
  var selected_ids = [];
  for (selected_node of selected_nodes) {
    grouped_nodes_obj[selected_node] = the_tree.grouped_nodes[selected_node];
  }
  for (let [key, value] of Object.entries(grouped_nodes_obj)) {
    // console.log(key, value);
    selected_ids.push(...value);
  }

  this.pointLayer.eachLayer((layer) => {
    layer._icon.classList.remove('selected');
    layer._icon.classList.remove('fully-selected');
    layer._icon.classList.remove('partially-selected');
  });

  if (selected_ids.length > 0) {
      this.pointLayer.eachLayer((layer) => {
        var feat_samples = layer.feature.properties.samples;
        var feat_samples_codes = [];
        for (var i = 0; i < feat_samples.length; i++) {
          feat_samples_codes.push(feat_samples[i].codice);
        }
        var contains_all = feat_samples_codes.every(element => {
          return selected_ids.includes(element);
        });
        var contains_some = feat_samples_codes.some(element => {
          return selected_ids.includes(element);
        });

        if (contains_all) {
          // layer._icon is the canvas containing the pie chart
          layer._icon.classList.add('selected');
          layer._icon.classList.add('fully-selected');
        } else {
          if (contains_some) {
            // layer._icon is the canvas containing the pie chart
            layer._icon.classList.add('selected');
            layer._icon.classList.add('partially-selected');
          }
        }
      });
    } else {
      this.pointLayer.eachLayer((layer) => {
        layer._icon.classList.remove('selected');
        layer._icon.classList.remove('fully-selected');
        layer._icon.classList.remove('partially-selected');
      });
    }
} // updateNodesInMap
