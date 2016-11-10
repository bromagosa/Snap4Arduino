function saveFile (name, contents, extension, target) {
    chrome.fileSystem.chooseEntry(
            {
                type: 'saveFile',
                suggestedName: name + extension,
                accepts: [ { extensions: [extension]} ]
            },
            function (writableFileEntry) {
                writableFileEntry.createWriter(function (writer) {
                    writer.onerror = function (err) { target.showMessage(err); };
                    writer.onwriteend = function (e) { target.showMessage('Exported!', 3); };
                    writer.write(new Blob([contents], { type: 'text/plain' }));
                }, 
                function (err) { target.showMessage(err); });
            });
};
