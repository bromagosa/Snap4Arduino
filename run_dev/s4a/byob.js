BlockExportDialogMorph.prototype.exportBlocks = function () {
    var str = this.serializer.serialize(this.blocks);

    if (this.blocks.length > 0) {
        var contents = '<blocks app="'
            + this.serializer.app
            + '" version="'
            + this.serializer.version
            + '">'
            + str
            + '</blocks>';

		var inp = document.createElement('input');
		if (this.filePicker) {
			document.body.removeChild(this.filePicker);
			this.filePicker = null;
		}
		inp.nwsaveas = homePath() + 'blocks.xml';
		inp.type = 'file';
		inp.style.color = "transparent";
		inp.style.backgroundColor = "transparent";
		inp.style.border = "none";
		inp.style.outline = "none";
		inp.style.position = "absolute";
		inp.style.top = "0px";
		inp.style.left = "0px";
		inp.style.width = "0px";
		inp.style.height = "0px";
		inp.addEventListener(
			"change",
			function (e) {
				document.body.removeChild(inp);
				this.filePicker = null;
				
				var fs = require('fs');
				fs.writeFileSync(e.target.files[0].path, contents);
			},
			false
			);
		document.body.appendChild(inp);
		this.filePicker = inp;
		inp.click();
    } else {
        new DialogBoxMorph().inform(
            'Export blocks',
            'no blocks were selected',
            this.world()
        );
    }
};

