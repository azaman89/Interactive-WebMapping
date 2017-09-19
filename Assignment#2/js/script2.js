// This is the script for Assignment#2 using leaflet


var map = L.map('map').setView([40.71,-73.93], 10,);
map.options.minZoom = 11;
map.options.maxZoom = 15;

// set a tile layer to be CartoDB tiles 
var CartoDBTiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
  attribution: 'Map Data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors, Map Tiles &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
});

// add these tiles to our map
map.addLayer(CartoDBTiles);

// add in OSM Mapnik tiles
var OSMMapnikTiles = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',{
  attribution: 'Map Data and Tiles &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors'
});

// create global variables we can use for layer controls
var neighborhoodsGeoJSON;
var mcdGeoJSON; 

addMcdLocations();

function addMcdLocations() {
    // let's add mcdonalds restaurant data
    $.getJSON( "geojson/mcdonalds.geojson", function( data ) {
        // ensure jQuery has pulled all data out of the geojson file
        var mcd = data;

       // jsonQuery('mcd[state=NY].properties', {
        //    mcd: data
         // })

        // mcdonald location represented as dots
        var mcdPointToLayer = function (feature, latlng){
            var mcdMarker = L.circle(latlng, 100, {
                stroke: false,
                fillColor: '#2ca25f',
                fillOpacity: 0.75
            });
            
            return mcdMarker;  
        }

        var mcdClick = function (feature, layer) {

            // let's bind some feature properties to a pop up
            layer.bindPopup("<strong>Address:</strong> " + feature.properties.address + "<br /><strong>City:</strong> " + feature.properties.city + "<br /><strong>State:</strong> " + feature.properties.state);
        }

        // create Leaflet layer using L.geojson; don't add to the map just yet
        mcdGeoJSON = L.geoJson(mcd, {
            pointToLayer: mcdPointToLayer,
            onEachFeature: mcdClick
        });

        // don't add the pawn shop layer to the map yet

        // run our next function to bring in the Pawn Shop data
        addNeighborhoodData();


    });

}

function addNeighborhoodData() {

    // let's add neighborhood data
    $.getJSON( "geojson/NYC_neighborhood_data.geojson", function( data ) {
        // ensure jQuery has pulled all data out of the geojson file
        var neighborhoods = data;

        // neighborhood choropleth map
        // let's use % in poverty to color the neighborhood map
        var popDensityStyle = function (feature){
            var value = feature.properties.Pop/(feature.properties.sq_mile);
            var fillColor = null;
            if(value >= 0 && value <=5000){
                fillColor = "#ffffcc";
            }
            if(value > 5000 && value <=10000){
                fillColor = "#ffeda0";
            }
            if(value >10000 && value<=20000){
                fillColor = "#fed976";
            }
            if(value > 20000 && value <=30000){
                fillColor = "#feb24c";
            }
            if(value > 30000 && value <=40000) { 
                fillColor = "#fd8d3c";
            }
            if(value > 40000 && value <=50000) { 
                    fillColor = "#fc4e2a";
            }
            if(value > 50000 && value <=60000) { 
                fillColor = "#e31a1c";
            }
            if(value > 60000 && value <=70000) { 
                fillColor = "#bd0026";
            }
            if(value > 70000) { 
                fillColor = "#800026";
            }
     

            var style = {
                weight: 1,
                opacity: .1,
                color: 'black',
                fillOpacity: 0.75,
                fillColor: fillColor
            };

            return style;
        }

        var popDensityClick = function (feature, layer) {
            var popdens = feature.properties.Pop/(feature.properties.sq_mile);
            popdens = popdens.toFixed(2);
            // let's bind some feature properties to a pop up
            layer.bindPopup("<strong>Neighborhood:</strong> " + feature.properties.NYC_NEIG + "<br /><strong>Population Density(Sq. Miles): </strong>" + popdens);
        }

        // create Leaflet layer using L.geojson; don't add to the map just yet
        neighborhoodsGeoJSON = L.geoJson(neighborhoods, {
            style: popDensityStyle,
            onEachFeature: popDensityClick
        });

        // now lets add the data to the map in the order that we want it to appear

        // neighborhoods on the bottom
        neighborhoodsGeoJSON.addTo(map);

        // finally, the McDonald's dots
        mcdGeoJSON.addTo(map);


        // now create the layer controls!
        createLayerControls(); 

    });

}

function createLayerControls(){

    // add in layer controls
    var baseMaps = {
        "CartoDB": CartoDBTiles,
        "OSM Mapnik": OSMMapnikTiles, 
    };

    var overlayMaps = {
        "Location of McDonald's": mcdGeoJSON,
        "Population Density Map": neighborhoodsGeoJSON
    };

    // add control
    L.control.layers(baseMaps, overlayMaps).addTo(map);

}




// adding in new data with leaflet.omnivore
// omnivore.csv('csv/CheckCashing.csv').addTo(map);

// lets add these data with some styling base on two data attributes 
// and have a popup show up on hovering instead of clicking

// lets set up some global functions for setting styles for the dots
// we'll use these again in the legend
/*

function fillColor(d) {
    return d > 500000 ? '#006d2c' :
           d > 250000 ? '#31a354' :
           d > 100000 ? '#74c476' :
           d > 50000  ? '#a1d99b' :
           d > 10000  ? '#c7e9c0' :
                        '#edf8e9';
}

function radius(d) {
    return d > 9000 ? 20 :
           d > 7000 ? 12 :
           d > 5000 ? 8  :
           d > 3000 ? 6  :
           d > 1000 ? 4  :
                      2 ;
}


// first we need to define how we would like the layer styled
var checkCashingStyle = function (feature, latlng){
    //console.log(feature.properties.address);
    var checkCashingMarker = L.circleMarker(latlng, {
        stroke: false,
        fillColor: fillColor(feature.properties.amount),
        fillOpacity: 1,
        radius: radius(feature.properties.customers)
    });
    
    return checkCashingMarker;
    
}

var checkCashingInteraction = function(feature,layer){    
    var highlight = {
        stroke: true,
        color: '#ffffff', 
        weight: 3,
        opacity: 1,
    };

    var clickHighlight = {
        stroke: true,
        color: '#f0ff00', 
        weight: 3,
        opacity: 1,
    };

    var noHighlight = {
        stroke: false,
    };
    
    //add on hover -- same on hover and mousemove for each layer
    layer.on('mouseover', function(e) {
        //highlight point
        layer.setStyle(highlight);

        // ensure that the dot is moved to the front
        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }
        
    });
        
    layer.on('mouseout', function(e) {
        // reset style
        layer.setStyle(noHighlight); 
                        
    });
    
    // on click 
    layer.on("click",function(e){
        // bind popup and open on the map
        layer.bindPopup('<div class="popupStyle"><h3>' + feature.properties.name + '</h3><p>'+ feature.properties.address + '<br /><strong>Amount:</strong> $' + feature.properties.amount + '<br /><strong>Customers:</strong> ' + feature.properties.customers + '</p></div>').openPopup();

        // set new style for clicked point
        layer.setStyle(clickHighlight); 
    });
    
    
}


// next, we'll create a shell L.geoJson for omnivore to use to apply styling and interaction
var checkCashingCustomStuff = L.geoJson(null, {
    pointToLayer: checkCashingStyle,
    onEachFeature: checkCashingInteraction
});

// lastly, we'll call omnivore to grab the CSV and apply the styling and interaction
var checkCashingLayer = omnivore.csv('csv/CheckCashing.csv', null, checkCashingCustomStuff).addTo(map);






// add in a legend to make sense of it all
// create a container for the legend and set the location

var legend = L.control({position: 'bottomright'});

// using a function, create a div element for the legend and return that div
legend.onAdd = function (map) {

    // a method in Leaflet for creating new divs and setting classes
    var div = L.DomUtil.create('div', 'legend'),
        amounts = [0, 10000, 50000, 100000, 250000, 500000],
        customers = [0, 1000, 3000, 5000, 7000, 9000];

        div.innerHTML += '<p><strong>Amounts</strong></p>';

        for (var i = 0; i < amounts.length; i++) {
            div.innerHTML +=
                '<i style="background:' + fillColor(amounts[i] + 1) + '"></i> ' +
                amounts[i] + (amounts[i + 1] ? '&ndash;' + amounts[i + 1] + '<br />' : '+<br />');
        }

        div.innerHTML += '<p><strong>Customers</strong></p>';

        for (var i = 0; i < customers.length; i++) {
            var borderRadius = radius(customers[i] + 1);
            var widthHeight = borderRadius * 2;
            div.innerHTML +=
                '<i class="circle" style="width:' + widthHeight + 'px; height:' + widthHeight + 'px; -webkit-border-radius:' + borderRadius + 'px; -moz-border-radius:' + borderRadius + 'px; border-radius:' + borderRadius + 'px;"></i> ' +
                customers[i] + (customers[i + 1] ? '&ndash;' + customers[i + 1] + '<br />' : '+<br />');
        }

    return div;
};


// add the legend to the map
legend.addTo(map);

*/


