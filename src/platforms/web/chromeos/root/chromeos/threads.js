Process.prototype.reportJSFunction = function (parmNames, body) {
	return document.getElementById("sandboxFrame").contentWindow.reportJSFunction(this, parmNames, body);
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
