# COHESIVE - Grapetree with GIS integration

Project based on [GrapeTree](https://github.com/achtman-lab/GrapeTree), a fully interactive, tree visualization program within EnteroBase, which supports facile manipulations of both tree layout and metadata. Please see more info [here](https://enterobase.readthedocs.io/en/latest/grapetree/grapetree-about.html).

# Instruction to run it locally

To see the project locally we need to run a web server, node packages http-server or live-server work pretty fine.

## Prerequisites

### Node js

Download the latest stable release of NodeJS from https://nodejs.org and install it using all the default options.

### Install and use http-server or live-server

Now you will be able to install http-server or live-server globally on your machine using the node package manager (npm) command line tool, this will allow you to run a web server from anywhere on your computer.

**http-server**

Open the terminal and write:

`npm install -g http-server`

To start a web server, in terminal open the directory containing your static web files and start the server with the following command:

`http-server`

**live-server**

`npm install live-server -g`

To start a web server, in terminal open the directory containing your static web files and start the server with the following command:

`live-server`

## Run GrapeTree locally

Download the .zip of the code from this repository, then unzip on a directorry `DIR_GRAPETREE` (for example: `/tmp/grapetree-gis-main`).

### Source files in place

Produce your newick (`tree.nwk`) and metadata (`meta.tsv`) files and copy them inside `DIR_GRAPETREE`, then on terminal:

`live-server DIR_GRAPETREE`

Now you will be able to load data by url in your web browser, for example:

`http://localhost:8080?tree=tree.nwk&metadata=metadata.tsv`

In the project you will find a `tmp` folder with some example data to load, you can use url to see them as well:

`http://localhost:8080?tree=/tmp/tree.nwk&metadata=/tmp/metadata.tsv&geo=/tmp/points.geojson`

### Load geoJSON data

The dashboard is able to interpret `.geojson` file passed as `geo` parameter by query string:

`http://localhost:8080?tree=tree.nwk&metadata=metadata.tsv&geo=points.geojson`

Alternatively you can integrate in `metadata.tsv` longitute and latitude values and pass them as query string parameters in the place of geoJSON. 

For example, if in the `.tsv` you define `x` for longitude and `y` for latitude, just add `&longitude=x&latitude=y` in the url:

`http://localhost:8080?tree=tree.nwk&metadata=metadata.tsv&longitude=x&latitude=y`

Using our data example:

`http://localhost:8080?tree=/tmp/tree.nwk&metadata=/tmp/metadata.tsv&longitude=x&latitude=y`

**Important**
If you use `longitude` and `latitude` to name coordinates in the `.tsv` file, there is no need to pass them as query string parameters, so simply use:

`http://localhost:8080?tree=tree.nwk&metadata=metadata.tsv`

### Load a compatible JSON file

Dashboard allows you to download a JSON file including metadata and configurations. Generated JSON file can be loaded with the `Load GrapeTree` button present in `Inputs/Outputs` card.

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