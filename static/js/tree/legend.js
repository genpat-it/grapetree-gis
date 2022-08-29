var the_legend = {};

the_legend.cat = "";
the_legend.values = {};
the_legend.items = [];
the_legend.is_active = false;

/**
 * 
 * Toggle open/close legend settings
 * 
 */
the_legend.toggleLegendSettings = function() {
  var legend_tools = document.querySelector('#legend-tools');
  legend_tools.classList.toggle('active');
}

the_legend.legendHighlightSelection = function () {
  var msg = "";
  var fill_colors = [];
  var colors = [];
  var values = [];
  var path_parents = [];
  var original_color = "";
  var current_category = the_legend.cat;
  var nodes_paths = document.querySelectorAll('#vis .node-paths');
  var links = document.querySelectorAll('#vis .link');
  the_legend.is_active = true;
 
  for (var property in the_legend.values) {
    var value = `${property}`;
    var color = `${the_legend.values[property]}`;
    colors.push(color);
    values.push(value);
  }

  for (var i = 0; i < nodes_paths.length; i++) {
    var nodes_path_type = nodes_paths[i].__data__.data.type;
    if (values.includes(nodes_path_type)) {
      var fill_color = the_legend.values[nodes_path_type];
      nodes_paths[i].setAttribute('fill', fill_color);
      nodes_paths[i].setAttribute('style', 'stroke: black;');
      path_parents.push(nodes_paths[i].parentElement.id);
    } else {
      nodes_paths[i].setAttribute('fill', 'url(#pattern)');
      nodes_paths[i].setAttribute('style', 'stroke: rgba(0,0,0,0);');
    }
  }

  for (var i = 0; i < links.length; i++) {
    var line = links[i].querySelector('line');
    var link_id_arr = [];
    link_id_arr.push(links[i].__data__.source.id);
    link_id_arr.push(links[i].__data__.target.id);
    if (link_id_arr.every(item => path_parents.includes(item))) {
      line.setAttribute('style', 'stroke: black; stroke-dasharray: 0;');
    } else {
      line.setAttribute('style', 'stroke: rgba(0,0,0,0.2); stroke-dasharray: 2;');
    }
  }

  /**
   * 
   * Retrieve the nodes to pass as an argument to the the_map.definePoints() function, 
   * 
   */
  if (path_parents && path_parents.length > 0) {
    var all_filtered_nodes = the_tree.getAllFilteredNodesIDs(path_parents);
    var metadata = the_tree.getMetadata();
    filtered_nodes = [];
    for (var i = 0; i < all_filtered_nodes.length; i++) {
      var key = all_filtered_nodes[i];
      var value = metadata[key][current_category];
      if (values.includes(value)) {
        filtered_nodes.push(key);
      }
    }
  } else {
    filtered_nodes = ['none'];
  }
  the_map.defineMarkers(filtered_nodes);
}

the_legend.legendReset = function () {

  // clear legend
  the_legend.cat = "";
  the_legend.items = [];
  the_legend.values = {};
  the_legend.is_active = false;

  var nodes_paths = document.querySelectorAll('#vis .node-paths');
  var links = document.querySelectorAll('#vis .link');
  var legend_item_texts = document.querySelectorAll('.legend-item text');

  for (var i = 0; i < legend_item_texts.length; i++) {
    legend_item_texts[i].classList.remove('selected');
    var data_real = legend_item_texts[i].parentNode.getAttribute('data-real-group-izsam');
    var data_color = legend_item_texts[i].parentNode.getAttribute('data-group-colour-izsam');
    the_legend.values[data_real] = data_color;
  }

  // reset tree nodes
  for (var i = 0; i < nodes_paths.length; i++) {
    var nodes_path_type = nodes_paths[i].__data__.data.type;
    if (nodes_path_type in the_legend.values) {
      var fill_color = the_legend.values[nodes_path_type];
      nodes_paths[i].setAttribute('fill', fill_color);
      nodes_paths[i].setAttribute('style', 'stroke: black;');
    } else {
      nodes_paths[i].setAttribute('fill', "#ffffff");
      nodes_paths[i].setAttribute('style', 'stroke: black;');
    }
  }

  // reset tree links
  for (var i = 0; i < links.length; i++) {
    var line = links[i].querySelector('line');
    line.setAttribute('style', 'stroke: black; stroke-dasharray: 0;');
  }

  the_legend.values = {};
  filtered_nodes = [];
  the_map.defineMarkers();
}

the_legend.legendSelectAll = function () {
  var legend_item_texts = document.querySelectorAll('.legend-item text');
  for (var i = 0; i < legend_item_texts.length; i++) {
    var item_text = legend_item_texts[i].innerHTML;
    var data_value = legend_item_texts[i].innerHTML;
    var data_real = legend_item_texts[i].parentNode.getAttribute('data-real-group-izsam');
    var data_color = legend_item_texts[i].parentNode.getAttribute('data-group-colour-izsam');
    if (!the_legend.items.includes(item_text)) {
      legend_item_texts[i].classList.add('selected');
      the_legend.values[data_real] = data_color;
      the_legend.items.push(data_value);
    }
  }
  the_legend.legendHighlightSelection();
}

the_legend.legendRetrieveSelection = function () {
  if(the_legend.items.length != 0) {
    var legend_item_texts = document.querySelectorAll('.legend-item text');
    for (var i = 0; i < legend_item_texts.length; i++) {
      var item_text = legend_item_texts[i].innerHTML;
      var data_value = legend_item_texts[i].innerHTML;
      var data_real = legend_item_texts[i].parentNode.getAttribute('data-real-group-izsam');
      var data_color = legend_item_texts[i].parentNode.getAttribute('data-group-colour-izsam');
      if (the_legend.items.includes(item_text)) {
        legend_item_texts[i].classList.add('selected');
        the_legend.values[data_real] = data_color;
      } else {
        // delete values
        delete the_legend.values[data_real];
        // remove data.value from items array
        the_legend.items = the_legend.items.filter(function(item) {return item !== data_value});
      }
    }
  }
}

the_legend.legendInvertSelection = function () {
  if(the_legend.items.length != 0) {
    var legend_item_texts = document.querySelectorAll('.legend-item text');
    for (var i = 0; i < legend_item_texts.length; i++) {
      var item_text = legend_item_texts[i].innerHTML;
      var data_value = legend_item_texts[i].innerHTML;
      var data_real = legend_item_texts[i].parentNode.getAttribute('data-real-group-izsam');
      var data_color = legend_item_texts[i].parentNode.getAttribute('data-group-colour-izsam');
      if (the_legend.items.includes(item_text)) {
        legend_item_texts[i].classList.remove('selected');
        // delete values
        delete the_legend.values[data_real];
        // remove data.value from items array
        var index = the_legend.items.indexOf(data_value);
        if (index > -1) { // only splice array when item is found
          the_legend.items.splice(index, 1); // 2nd parameter means remove one item only
        }
      } else {
        legend_item_texts[i].classList.add('selected');
        the_legend.values[data_real] = data_color;
        the_legend.items.push(data_value);
      }
    }
    the_legend.legendHighlightSelection();
  } else {
    alert("Ops! Please select at least one item in the tree legend");
    return null;
  }
}

the_legend.legendCleanSelection = function () {
  the_legend.values = {};
  the_legend.items = [];
  var legend_item_texts = document.querySelectorAll('.legend-item text');
  for (var i = 0; i < legend_item_texts.length; i++) {
    legend_item_texts[i].classList.remove('selected');
  }
  the_legend.legendHighlightSelection();
}

the_legend.legendPlaySelection = function () {
  the_legend.values = {};
  the_legend.items = [];
  var legend_item_texts = document.querySelectorAll('.legend-item text');
  for (var i = 0; i < legend_item_texts.length; i++) {
    legend_item_texts[i].classList.remove('selected');
  }
  the_legend.legendHighlightSelection();
  
  function doSetTimeout(i) {
    setTimeout(function() { 
      var data_real = legend_item_texts[i].parentNode.getAttribute('data-real-group-izsam');
      var data_color = legend_item_texts[i].parentNode.getAttribute('data-group-colour-izsam');
      legend_item_texts[i].classList.add('selected');
      the_legend.values[data_real] = data_color;
      the_legend.items.push(legend_item_texts[i].innerHTML);
      the_legend.legendHighlightSelection();
    }, 1000);
  }

  for (var i = 0; i < legend_item_texts.length; i++) {
    doSetTimeout(i);
  }
}