Process.prototype.reportJSFunction = function (parmNames, body) {
	try {
		return document.getElementById("sandboxFrame").contentWindow.reportJSFunction(this, parmNames, body);
	}
	catch(error) {
		throw new Error("To run JS in this ChomeOS app, you must launch Chrome/Chromium with this parameters: --disable-web-security --user-data-dir");
	}
	
};
Process.prototype.originalEvaluate = Process.prototype.evaluate;
Process.prototype.evaluate = function (context, args, isCommand) {
	if (typeof context == 'function') {
		return context.apply(
            this.blockReceiver(),
            args.asArray().concat([this])
		);
	}
	this.originalEvaluate(context, args, isCommand);
};
