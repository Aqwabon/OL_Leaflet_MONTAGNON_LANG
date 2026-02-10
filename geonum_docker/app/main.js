import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { ImageWMS, XYZ } from 'ol/source';
import ImageLayer from 'ol/layer/Image';
import { fromLonLat } from 'ol/proj';
import {Style, Circle, Fill, Stroke} from 'ol/style';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import GeoJSON from 'ol/format/GeoJSON';
import { ScaleLine, defaults as defaultControls } from 'ol/control';

const geoserverWms = 'http://localhost:8080/geoserver/dechets/wms';

// Ajout du fond de carte 
const layerOsm = new TileLayer({ source: new OSM(), visible: true });
const fondCarte = new TileLayer({ 
  source: new XYZ({ url: 'https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' }),
  visible: false 
});

// Ajout couche décheterie (en WMS)
const sourceComposteurs = new ImageWMS({
  url: geoserverWms,
  params: { 'LAYERS' : 'dechets:lyon_proprete' },
  serverType: 'geoserver',
  crossOrigin: 'anonymous',
});

const layercomposteurs = new ImageLayer({
  source: sourceComposteurs,
});

// Ajout couche décheterie (en WFS)
const layerdechet = new VectorLayer({
  source: new VectorSource({
    url: geoserverWms.replace('/wms', '/wfs') + 
         '?service=WFS&version=1.0.0&request=GetFeature&typeName=dechets%3Asite_collecte&maxFeatures=50&outputFormat=application%2Fjson&srsname=EPSG:3857',
    format: new GeoJSON()
  }),
});

// Ajout de la carte 
const map = new Map({
  target: 'map',
  layers: [ fondCarte, layerOsm, layercomposteurs, layerdechet ],
  view: new View({
    center: fromLonLat([4.8357, 45.7640]), 
    zoom: 13, 
  }),
  controls: defaultControls().extend([
    new ScaleLine({
      units: 'metric',    
      bar: true,          
      steps: 4,           // Nombre de cases dans l'échelle
      text: true,         
      minWidth: 150       // Largeur minimale
    })
  ])
});


// Boutons : 

// Fonds de carte (Radio)
document.getElementById('radioOsm').onchange = () => {
  layerOsm.setVisible(true);
  fondCarte.setVisible(false);
};
document.getElementById('radioDark').onchange = () => {
  layerOsm.setVisible(false);
  fondCarte.setVisible(true);
};

// Checkbox pour afficher les couches :

// Déchèterie
const checkDechet = document.getElementById('checkbox-dechet');
checkDechet.addEventListener('change', (event) => {
  // event.target.checked renvoie true ou false
  layerdechet.setVisible(event.target.checked);
});

// Composteur
const checkCompost = document.getElementById('checkbox-composteurs');
checkCompost.addEventListener('change', (event) => {
  layercomposteurs.setVisible(event.target.checked);
});


// Filtres : 

// Établissement
const boutonEta = document.getElementById('bouton-eta');
boutonEta.addEventListener('change', () => {
  sourceComposteurs.updateParams({ 'CQL_FILTER' : "typesite='Établissement'" }); 
});

// Quartier
const boutonQuar = document.getElementById('bouton-quar');
boutonQuar.addEventListener('change', () => {
  sourceComposteurs.updateParams({ 'CQL_FILTER' : "typesite='Quartier'" });
});

// Pied d'immeuble
const boutonPied = document.getElementById('bouton-pied');
boutonPied.addEventListener('change', () => {
  sourceComposteurs.updateParams({ 'CQL_FILTER' : "typesite LIKE 'Pied%'" }); 
});