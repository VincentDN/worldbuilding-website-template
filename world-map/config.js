/* Add a scenario here; all paths resolve from world-map/, including subpages. */
window.ATLAS_SCENARIOS = {
  europe: {
    title: 'Kaiserreich · Europe, 1936', short: 'Europe 1936', crs: 'image',
    bounds: [[0, 0], [1548, 1600]], data: 'data/europe/',
    image: 'assets/europe-reference.webp', liteImage: 'assets/europe-reference-lite.webp',
    description: 'An illustrative 1936 scenario traced from the supplied Kaiserreich / 1914 reference. Borders, allegiances, flags, cities, and river guides are examples, not verified Kaiserreich canon.',
    note: 'Reference art includes baked-in rivers and colors. Toggle Reference image to inspect only the editable overlays.',
    credit: 'Reference artwork supplied by Vincent De Nil',
    alliances: {reichspakt:'#9863c6',international:'#bd465a',entente:'#3c689a',austria:'#4b9279',russia:'#458faf',ottoman:'#839449',independent:'#bead85'}
  },
  'north-america': {
    title: 'American Kingdoms · North America, 1477', short: 'North America 1477', crs: 'polar',
    center: [48,-100], zoom: 4, data: 'data/north-america/',
    description: 'A 1477 demonstration using American Kingdoms geography and lore. The source atlas currently depicts 1377; this example changes the displayed date, not the source timeline. Modern cities and provisional borders are geographic references.',
    note: 'Explore a realm, then open Massachusetts for its duchy and county map.',
    credit: 'Example setting: American Kingdoms · Geography: Natural Earth / US Census',
    alliances: {union:'#476fbb',crown:'#ad354c'},
    submaps: {massachusetts:'massachusetts/'}
  },
  massachusetts: {
    title: 'Massachusetts · Counties, 1477', short: 'Massachusetts counties', crs:'earth',
    bounds:[[41.1,-73.55],[42.9,-69.8]],data:'data/massachusetts/',parent:'north-america',
    description:'Fourteen modern Massachusetts counties with fictional titles and placeholder heraldry. Filter the subregions or select a county to explore.',
    note:'County geometry is fetched only on this page. Return to the atlas to restore your previous view.',
    credit:'County boundaries: US Census Bureau, 2024',alliances:{}
  },
  blank: {
    title:'Your World · Blank atlas',short:'Blank world',crs:'earth',
    bounds:[[-58,-175],[80,175]],data:'data/blank/',
    description:'Start a new setting here. Open the editor to draw your first territory, add its details, and export it for your own website.',
    note:'No fictional territories or places have been added.',credit:'Geography: Natural Earth',alliances:{}
  }
};
