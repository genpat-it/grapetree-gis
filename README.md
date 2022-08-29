# COHESIVE - Grapetree with GIS integration

Project based on [GrapeTree](https://github.com/achtman-lab/GrapeTree), a fully interactive, tree visualization program within EnteroBase, which supports facile manipulations of both tree layout and metadata. Please see more info [here](https://enterobase.readthedocs.io/en/latest/grapetree/grapetree-about.html).

## Instruction to run it locally

To see the project locally we need to run a web server, node js works pretty fine.

### Install node js

Download the latest stable release of NodeJS from https://nodejs.org and install using all the default options.

### Install npm install -g http-server

Install the http-server globally on your machine using the node package manager (npm) command line tool, this will allow you to run a web server from anywhere on your computer.

Open the terminal and write:

`npm install -g http-server`

### Start a web server

In terminal open the directory containing your static web files and start the server with the following command:

`http-server`

#### Use live-server

npm install live-server -g

`live-server`

### Source file in place

You can load data by url, in `tmp` folder you will find some differents data to load:

```
?geo=/tmp/test_data/points.geojson&tree=/tmp/test_data/cgMLST.nwk&metadata=/tmp/test_data/cgMLST.tsv
?tree=/tmp/tree.nwk&metadata=/tmp/metadata.tsv&geo=/tmp/points.geojson
?tree=/tmp/adp/abruzzo/tree.nwk&metadata=/tmp/adp/abruzzo/meta.tsv&geo=/tmp/adp/abruzzo/points.geojson
```

Please make sure following files are in the right directory, according to the url.

### Load a compatible JSON file

Dashboard allows you to download a JSON file including metadata and configurations.

Generated JSON file can be loaded with the `Load GrapeTree` button present in `Inputs/Outputs` card.

## Dev notes

### Zoom behaviour

 To remove the mousewheel behaviour for zoom, add `.on("wheel.zoom", null)` to base_tree.js on line 931 after `.on("dblclick.zoom", null)`. 

### Original tree button: event behaviour description and changes - WIP

The `Original tree` button originally call `loadMSTree()` with the `tree_raw` object as an argument. The `tree_raw` is builded in `grapetree_fileHandler.js` depending on the load method. When we start loading a .nwk file we does not have metadata associated, so the `tree_raw` object will not have this kind of information in itself.

This will affect the go back behaviour that we expect from the `Original tree` button, in fact it will redraw te tree with no metadata information.

The behaviour change (and goes right) if we start loading a complete .json file (you could obtain it by clicking on `Save GrapeTree` or by code `the_tree.getTreeAsObject();`).

So to match our needs we changed a bit the `grapetree_fileHandler.js` as follow.

We basically use only the load from url method to serve our GrapeTrees, so we changed the `loadNetFiles()` function from:

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

And then we populate the `tree_raw` object after the `loadMetadataText()` function adding `tree_raw = the_tree.getTreeAsObject();` at the end of `parseMetadata()` operations:

```javascript
function parseMetadata (msg,lines,header_index){
  /* .... */
  tree_raw = the_tree.getTreeAsObject();
}
```

This allow us to save the initial state of the tree and retrieve when user click on `Original tree`. On `MSTree_object_holder.html` :

```javascript
$("#button-goback").click(function(e) {
  loadMSTree(tree_raw);
});
```

Not yet happy ending, problems on map still to be solved, and also static redraw is not working after the original tree button is clicked. For the moment we use a location reload to do the trick.

### Inconsistent behavior between hide and shorten functionalities in Branch style > branches longer than:

Reported an inconsistent behaviour: the hide option didn't work as the "shorten" and "collapse" options.

Changed:

```javascript
D3MSTree.prototype._drawLinks = function () {
  var self = this;
  this.link_elements.selectAll("line")
    .style('stroke', 'black')
    .style('opacity', function (it) {
      return (it.value >= self.hide_link_length) ? '0.0' : '1.0';
    })
    .attr('stroke-dasharray', function (it) {
      return (self.max_link_length && it.value > self.max_link_length) ? "3,5" : "";
    })
    .attr("stroke-width", "1px");

  this.link_elements.selectAll(".distance-label").attr("font-size", this.link_font_size);
}
```

in

```javascript
D3MSTree.prototype._drawLinks = function () {
  var self = this;
  this.link_elements.selectAll("line")
    .style('stroke', 'black')
    .style('opacity', function (it) {
      return (it.value > self.hide_link_length) ? '0.0' : '1.0'; // changed >= in > after inconsistent bug report with shorten and collapsed behaviour
    })
    .attr('stroke-dasharray', function (it) {
      return (self.max_link_length && it.value > self.max_link_length) ? "3,5" : "";
    })
    .attr("stroke-width", "1px");

  this.link_elements.selectAll(".distance-label").attr("font-size", this.link_font_size);
}
```

# Credits

## Tree

- [https://enterobase.readthedocs.io/en/latest/grapetree/grapetree-about.html](https://enterobase.readthedocs.io/en/latest/grapetree/grapetree-about.html)

## Map

- [https://leafletjs.com/](https://leafletjs.com/)
- [https://github.com/sashakavun/leaflet-piechart](https://github.com/sashakavun/leaflet-piechart)
- [https://github.com/sashakavun/leaflet-canvasicon](https://github.com/sashakavun/leaflet-canvasicon)
