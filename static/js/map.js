const map = L.map('map-div').setView([42.00, 13.00], 5);

const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// console.log('map loaded');

// Layer vuoto per ospitare i punti
// ********************************
const normalStyle = {
	radius: 9,
	fillColor: "#00679c",
	color: "#00679c",
	weight: 1,
	opacity: 1,
	fillOpacity: 0.5
};

const pointLayer = L.geoJSON(null,{
	pointToLayer: (feature, latlng) => {
		return L.circleMarker(latlng, normalStyle);
	},
	onEachFeature: (feature, layer) => {
		let cod = feature.properties.codice;
		layer.bindPopup(feature.properties.codice+"<br/><a onclick='the_tree.selectNodesByIds(\""+cod+"\");'>Select on tree</a>");
		/*layer.on('click', evt => {
			window.the_tree.selectNodesByIds(feature.properties.codice);
		});*/
		
	}
}).addTo(map);

// Aggiunta dati alla mappa da file geojson
const urlParams = new URLSearchParams(window.location.search);
const geoPath   = urlParams.get('geo')
$.getJSON(geoPath, (data) => {
	// console.log(data)
	pointLayer.addData(data);
	map.fitBounds(pointLayer.getBounds(),  {padding: [25,25]});
});


// Layer vuoto per ospitare la selezione
// *************************************
const selectedStyle = {
	radius: 13,
	fillColor: "#00679c",
	color: "red",
	weight: 2,
	opacity: 1,
	fillOpacity: 0.8
};

const pointLayer_selected = L.geoJSON(null,{
	pointToLayer: (feature, latlng) => {
		return L.circleMarker(latlng, selectedStyle);
	},
	onEachFeature: (feature, layer) => {
		let cod = feature.properties.codice;
		layer.bindPopup(feature.properties.codice+"<br/><a onclick='the_tree.unselectNodesByIds(\""+cod+"\")'>Unselect on tree</a>");
		// window.the_tree.unselectNodesByIds(feature.properties.codice);
	}
	
}).addTo(map)


// Selezione ALBERO -> MAPPA
// ************************************
// Gli id selezionati e passati a questa funzione da tree_interceptor vengono usati per filtrare l'array delle feature (punti) del layer sulla mappa
// e popolare un layer vuoto, utilizzato appositamente per mostrare la selezione.
 
const findNodesInMap = (selected_groups) => {

	// console.log(selected_groups)

	let selected_ids = [], 
		selected_features = [];

	pointLayer_selected.clearLayers();
	
	if (selected_groups !== 'unselect_all') {
		for (let [key, value] of Object.entries(selected_groups)) {
			// console.log(key, value);
			selected_ids.push(...value);
		}
		if (selected_ids.length > 0) {
			selected_ids.map(id => {
				pointLayer.eachLayer((layer) => {
					if (layer.feature.properties.codice == id) {
						selected_features.push(layer.feature);
						layer.closePopup();
					}
				});
			});
		} else {
			pointLayer_selected.clearLayers();
		}
	}

	// console.log(selected_ids);
	// console.log(selected_features);
	
	if (selected_groups == 'unselect_all') {
		console.log('Tutto deselezionato da menu contestuale');
		pointLayer_selected.clearLayers();
	}

	if (selected_groups == 'select_all') {
		console.log('Tutto selezionato da menu contestuale');
		pointLayer.eachLayer((layer) => {
			selected_features.push(layer.feature)
		});
	}

	pointLayer_selected.addData({type:'FeatureCollection', features: selected_features});
};

/* 
const arrayRemove = (arr, value) => {
	return arr.filter(elem => elem != value);
};

const arrayRemoveDuplicates = (arr) => {
	return arr.filter((value, index) => arr.indexOf(value) === index);
};
*/