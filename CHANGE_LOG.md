# GrapeTree, changeLog

## grapetree_fileHandler.js

### Line 38

Added to `loadNetFiles()`:

```javascript
function loadNetFiles() {
  /* .... */
  
  // query string hash of parameters should be made available to all the app objects
  MSFileChooser.params = params;
	window.global_params = params;

  /* .... */
}
```

### Line 89

From `url: 'https://enterobase.warwick.ac.uk/grapetree_remote/'+tree,` to `url: tree,` it allows to use relative url to get nwk file

### Line 112

From `url: 'https://enterobase.warwick.ac.uk/grapetree_remote/'+metadata,` to `url: metadata,` it allows to use relative url for meta tsv file

### Line 103

From:
```javascript
function loadNetFiles() {
  /* .... */
  finally {
    tree_raw = data;
    loadMSTree(tree_raw);
  }
  /* .... */
}
```

To:
```javascript
function loadNetFiles() {
  /* .... */
  finally {
    // tree_raw = data;
    // loadMSTree(tree_raw);
    // to use original tree button we need tree_raw populated with an object containing also metadata. Please find more in the README.md file under Dev notes paragraph
    loadMSTree(data);
  }
  /* .... */
}
```
### Line 236

Added Meta2GeoJSON Object to transform meta object in geoJSON points.

### Line 325

Added to `parseMetadata()`:

```javascript
function parseMetadata (msg,lines,header_index){
  /* .... */
  
  if( Meta2GeoJSON.checkMeta4geo(options) ){ //options = hash of metadata titles 
		var geoJ=Meta2GeoJSON.meta2GeoJson( meta );
		window.global_geoJ = geoJ;
	}else{
		console.log('(GEO)WARNING: titles not found in metadata:' + Meta2GeoJSON.xName +','+ Meta2GeoJSON.yName);
	}

  /* .... */
}
```

and:

```javascript
function parseMetadata (msg,lines,header_index){
  /* .... */
  // to use original tree button we need tree_raw populated with an object containing also metadata, so we added the following line. Please find more in the README.md file under Dev notes paragraph
  tree_raw = the_tree.getTreeAsObject();
}
```

### Line 456
Fixed bug from `var notification = "<p style='font-size:10'>` to `var notification = "<p style='font-size:10px'>`

### Line 468
From `.html(notification + "File Name: ")` to `.html(notification + "<label>File Name: </label>")'>` for ui improvement


## base_tree.js

### Line 783
Added `no-drag` parameter in draggable function, if a class `no-drag` will be added on an element, the drag will not works when palyed in that element
```javascript
this.legend_div=$("<div>").css({"position":"absolute","overflow-x":"hidden"}).css({"top":"0px","right":"0px"}).draggable({ cancel: '.no-drag' });
```

### Line 814
Added pattern element to be used as a fill attribute for node paths.
```javascript
this.svg.append('defs').html('<pattern id="pattern" patternUnits="userSpaceOnUse" width="18" height="18"> <image xlink:href="./img/pattern.svg" x="0" y="0" width="18" height="18"> </image> </pattern>');
```

### Line 820
Added object declaration to make category colors available outside the function used to set them (please see below: [Line 1185](#line-1185) and [Line 1670](#line-1670))
```javascript
this.objColors = {};
```

### Line 941
Commented resize call, we are calling it in the page and we call a refreshed version added in `d3_m_tree.js`.

```javascript
//resize
$(window).resize(function() {
	setTimeout(function() {
		self.resize();
  }, 100);
});
```

### Line 1064
Commented `resize()` function. A refreshed version was added in `d3_m_tree.js`.
```javascript
/**
 * Resizes the tree components based on the size of the container
 * This method is automatically called if the window is resized,
 * but should be called if the container is resized manually
 */

D3BaseTree.prototype.resize = function() {
  this.width = this.container.width();
  this.height = this.container.height();
  this.svg.attr('width', this.width).attr('height', this.height);
  var x_scale = d3.scale.linear().domain([0, this.width]).range([0, this.width]);
  var y_scale = d3.scale.linear().domain([0, this.height]).range([0, this.height]);
  var temp_scale = this.zoom.scale();
  var temp_trans = this.zoom.translate();
  this.zoom.x(x_scale).y(y_scale);
  this.zoom.scale(temp_scale);
  this.zoom.translate(temp_trans);
  this.background_rect.attr('height', this.height).attr('width', this.width);
  //this.legend_div.css({"top":"0px","right":"0px"});
  if (this.legend_div.position().top < 0) {
    this.legend_div.css({ "top": "0px" });
  }
  if (this.legend_div.position().left > this.width - 300) {
    this.legend_div.css({ "left": this.width - 300 });
  }
  //this.updateScaleDiv();
  if (this.scale_div.position().top < 0) {
    this.scale_div.css({ "top": "0px" });
  }
  if (this.scale_div.position().left > this.width - 300) {
    this.scale_div.css({ "left": this.width - 300 });
  }
};
```

### Line 1187
Added in `D3BaseTree.prototype._changeCategory` a call to make available an object with category and colors association (see also [Line 818](#line-818) and [Line 1670](#line-1670)).

Added code:
```javascript
this.setCategoryColors(category, cat_count_list);
```

### Line 1293
Changed font weight (from bold to normal) for scale title and stroke width for scale sign (from 2 to 1).

```javascript
D3BaseTree.prototype.updateScaleDiv = function() {
  [...]
  scale.append('text').attr('class', 'scale-title').attr('x', 30).attr('y', 20).attr('font-weight', 'normal').attr("font-family", "Arial")
  .text(dim.scaleValue);
  scale.append('line').attr('x1', 0).attr('y1', 25).attr('x2', dim.scaleLength).attr('y2', 25).attr("stroke-width", 1).attr("stroke", "black");
  scale.append('line').attr('x1', 0).attr('y1', 20).attr('x2', 0).attr('y2', 25).attr("stroke-width", 1).attr("stroke", "black");
  scale.append('line').attr('x1', dim.scaleLength).attr('y1', 20).attr('x2', dim.scaleLength).attr('y2', 25).attr("stroke-width", 1).attr("stroke", "black");
  [...]
}
```

### Line 1392
Changed legend width attrubute from 300 to 240.
```javascript
legend_svg.attr('width', 240).attr('height', legend_dim.height + 10);
this.legend_div.width(240);
```

### Line 1345
Extended `legend_items` by adding `data` attributes:this will allow to retreive these information in the front end.

Before: 

```javascript
legend_items = legend_items.enter().append('g').attr('class', 'legend-item').attr('transform', function(d, i){
  return "translate(0," + ((i + 1) * 20 + 10) + ")";
});
```

After:

```javascript
legend_items = legend_items.enter().append('g').attr('class', 'legend-item').attr('transform', function(d, i){
  return "translate(0," + ((i + 1) * 20 + 10) + ")";
}).attr('data-real-group-izsam',  function(it){
  return it.real_group;
}).attr('data-group-colour-izsam',  function(it){
  return it.group_colour;
});
```

### Line 1375
Added on click function to text legend item similar to the one used for circle.
```javascript
}).on("click",function(data){
  var obj={
    category:self.display_category,
    value:data.group,
    target: $(this),
    real: data.real_group,
    colour:data.group_colour
  };
  self.legendTextClicked(obj)  
});
```

### Line 1673
Added function.
```javascript
D3BaseTree.prototype.legendItemTextClicked= function(obj){};
```

### Line 1686

Added a method to create an object containing category and colors association (see above [Line 818](#line-818) and [Line 1185](#line-1185)).

Added code:
```javascript
/**
* Retreives category colors
* @returns {object} An object containing id to a list of key value pairs see {@link D3BaseTree#addMetadata}

*/
D3BaseTree.prototype.setCategoryColors = function(cat, col) {
  if (col.length == 0) {
    return;
  } // protect function if col is undefined, it could happen when categories are not defined
  var obj = {};
  var h = {};
  for (var i = 0; i < col.length; i++) {
    var k = col[i][0];
    var v = col[i][2];
    h[k] = v;
  }
  obj[cat] = h;
  this.objColors = obj;
};
```


## d3_m_tree.js

### Line 874
From 
```javascript
.attr("stroke-width","3px");
````
to 
```javascript
.attr("stroke-width","1px");
```
Reduced stroke size for nodes links.

### Line 1518
From 
```javascript
var [newX, newY] = [(this.width * 1.0 / scale - wdiff) / 4.0, (this.height * 1.0 / scale - hdiff) / 2.0];
````
to 
```javascript
var [newX, newY] = [(this.width * 1.0 / scale - wdiff) / 2.0, (this.height * 1.0 / scale - hdiff) / 2.0];
```
The tree was not centered.


### Line 2354
Moved code from `base_tree.js` and fixed: resize formulas for the tree was not working so now we call `centerGraph();` instead. Please refer to base_tree.js/Line 1061 of this changeLog.

```javascript
/**
 * Resizes the tree components based on the size of the container
 * This method is automatically called if the window is resized,
 * but should be called if the container is resized manually
 * 
 * moved from `base_tree.js` and fixed: resize formulas for the tree was not working so now we call `centerGraph();`
 * 
 * changeLog: please refer to change_log.md file
 * 
 */

D3MSTree.prototype.resize = function() {
  this.width = this.container.width();
  this.height = this.container.height();
  this.svg.attr('width', this.width).attr('height', this.height);
  this.background_rect.attr('height', this.height).attr('width', this.width);
  this.legend_div.css({ "top": "0px" });
  this.legend_div.css({ "left": this.width - 300 });
  this.scale_div.css({ "bottom": "100px" });
  this.scale_div.css({ "left": 0 });
  this.centerGraph();
};
```

### Line 2366
Added functions able to:

* retrieve alle the ids of the nodes:

```javascript
/**
 * Returns the ids of all the nodes
 * @returns {list}An array of node ids
 */
D3MSTree.prototype.getAllNodesIDs = function() {
  var g_nodes_ids = [];
  var nodes_ids = [];
  for (var i in this.force_nodes) {
    var node = this.force_nodes[i];
    nodes_ids.push(node.id);
  }
  for (var i = 0; i < nodes_ids.length; i++) {
    g_nodes_ids.push(this._getIDsForNode(nodes_ids[i]));
    g_nodes_ids = g_nodes_ids.flat(1);
  }
  return g_nodes_ids;
}
```

* retreive all the ids of the selected nodes:

```javascript
/**
 * Returns all the ids of selected nodes
 * @returns {list}An array of node ids
 */
D3MSTree.prototype.getAllSelectedNodesIDs = function() {
  var g_nodes_ids = [];
  var nodes_ids = this.getSelectedNodeIDs();
  console.log("---------------");
  console.log(nodes_ids);
  for (var i = 0; i < nodes_ids.length; i++) {
    g_nodes_ids.push(this._getIDsForNode(nodes_ids[i]));
    g_nodes_ids = g_nodes_ids.flat(1);
  }
  return g_nodes_ids;
}
```

* retreive all the ids related to a given listo of nodes:

```javascript
/**
 * Returns all the ids of a given nodes list
 * @returns {list}An array of node ids
 */
D3MSTree.prototype.getAllFilteredNodesIDs = function(nodes) {
  var g_nodes_ids = [];
  var nodes_ids = nodes;
  for (var i = 0; i < nodes_ids.length; i++) {
    g_nodes_ids.push(this._getIDsForNode(nodes_ids[i]));
    g_nodes_ids = g_nodes_ids.flat(1);
  }
  return g_nodes_ids;
}
```

## tree_extended.js and tree_interceptor.js
These scripts extend D3MSBase and D3MSTree to intercept and to share node selection events (and information on nodes selected) between GIS Map and Tree.

Use: `tree_interceptor(tree, callback);`

```javascript
// tree_interceptor(the_tree, (groupedNods) => console.log(groupedNods));
tree_interceptor(the_tree, (groupedNods) => findNodesInMap(groupedNods));
```

`findNodesInMap(groupedNods))` is defined in `map.js`


