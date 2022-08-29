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

function showFooter() {
  /* window.open(
    'http://enterobase.readthedocs.io/en/latest/grapetree/grapetree-about.html',
    '_blank' // <- This is what makes it open in a new window.
  ); */
  let footer = document.querySelector('footer');
  let trigger_help = document.querySelector('.toogle-trigger-img-help');
  let trigger_close = document.querySelector('.toogle-trigger-img-close');
  footer.classList.toggle('show');
  trigger_help.classList.toggle('hidden');
  trigger_close.classList.toggle('hidden');
}

window.onload = function() {
  iframe.src = iframeSrc;
  bodyEl.classList.toggle("show-tree");
};
