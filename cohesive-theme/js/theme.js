/*
 * This JavaScript doesn't do anything. The file exists just to demonstrate
 * including static assets from the HTML in themes.
 */
const url = location.href;
const bodyEl = document.body;
const iframe = document.getElementById("mst-object");

var fileToLoad = url.substring(url.indexOf("?")+1);
var iframeSrc = "MSTree_object_holder.html?"+fileToLoad;
// i

function navigateToGrapeTreeHelp() {
  window.open(
    'http://enterobase.readthedocs.io/en/latest/grapetree/grapetree-about.html',
    '_blank' // <- This is what makes it open in a new window.
  );
}

window.onload = function() {
  iframe.src = iframeSrc;
  bodyEl.classList.toggle("show-tree");
};
