var moduleUrl = world.children[0].getVar('__module__beetle__'),
    baseUrl = moduleUrl.substring(0, moduleUrl.lastIndexOf('/') + 1);

function loadSrc (url) {
    var url = baseUrl + url;
    return new Promise((resolve, reject) => {
        if (contains(SnapExtensions.scripts, url)) {
            reject();
        }
        scriptElement = document.createElement('script');
        scriptElement.onload = () => {
            SnapExtensions.scripts.push(url);
            resolve();
        };
        document.head.appendChild(scriptElement);
        scriptElement.src = url;
    });
};

loadSrc('babylon.js')
    .then(()=> loadSrc('babylonjs.loaders.min.js'))
    .then(()=> loadSrc('babylon.gridMaterial.min.js'))
    .then(()=> loadSrc('babylonjs.serializers.min.js'))
    .then(()=> loadSrc('earcut.min.js'))
    .then(()=> loadSrc('beetle.js'));
