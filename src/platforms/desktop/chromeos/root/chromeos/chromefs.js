function saveFile(name, contents, extension, target) {
    chrome.fileSystem.chooseEntry(
        {
            type: 'saveFile',
            suggestedName: name + extension,
            accepts: [ { extensions: [extension]} ]
        },
        function(writableFileEntry) {
            writableFileEntry.createWriter(function(writer) {
                writer.onerror = errorHandler;
                writer.onwriteend = function(e) {
                    console.log(e);
                    target.showMessage('Exported!', 3);
                };
                writer.write(new Blob([contents], {type: 'text/plain'}));
            }, 
            function(err) { console.log(err) });
    });
};

