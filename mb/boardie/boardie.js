// Base64 Encoding/Decoding

Module.base64Encode = function (data, urlSafe) {
	// Encode the given data as base64. Data should be either a string or a uint8Array.

	var digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	if (urlSafe) {
		digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
	}
	if ('string' == typeof(data)) {
		data = new TextEncoder().encode(data); // convert to uint8 array
	}
	var result = [];
	var n;
	for (var i = 0, len = data.length - 2; i < len; i += 3) {
		n = (data[i] << 16) + (data[i + 1] << 8) + data[i + 2];
		result.push(
			digits[(n >> 18) & 63] +
			digits[(n >> 12) & 63] +
			digits[(n >> 6) & 63] +
			digits[n & 63]);
	}
	var extra = data.length % 3;
	var i = data.length - extra;
	if (2 == extra) {
		n = (data[i] << 16) + (data[i + 1] << 8);
		result.push(
			digits[(n >> 18) & 63] +
			digits[(n >> 12) & 63] +
			digits[(n >> 6) & 63] +
			'=');
	} else if (1 == extra) {
		n = data[i] << 16;
		result.push(
			digits[(n >> 18) & 63] +
			digits[(n >> 12) & 63] +
			'==');
	}
	return result.join('');
};

Module.base64Decode = function (s) {
	// Decode the base64 string, returning a uint8Array.

	const digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	var digitValue = [];
	for (var i = 0, len = digits.length; i < len; i++) {
		digitValue[digits.charCodeAt(i)] = i;
	}

	// also accept base64url encoding: allow - and _ as alternatives to + and /
	digitValue['-'.charCodeAt(0)] = 62
	digitValue['_'.charCodeAt(0)] = 63

	var inCount = s.length;
	if ('=' == s[inCount - 2]) { // two padding characters
		inCount -= 2;
	} else if ('=' == s[inCount - 1]) { // one padding character
		inCount -= 1;
	}
	var out = new Uint8Array(Math.floor((inCount * 3) / 4));
	var outIndex = 0;
	var buf = 0;
	var bufCount = 0;
	for (var i = 0; i < inCount; ++i) {
		let sixBits = digitValue[s.charCodeAt(i)];
		if (sixBits !== undefined) {
			buf = (buf << 6) | sixBits;
			bufCount += 1;
		}
		if (bufCount == 4) {
			out[outIndex++] = (buf >> 16) & 255;
			out[outIndex++] = (buf >> 8) & 255;
			out[outIndex++] = buf & 255;
			buf = 0;
			bufCount = 0;
		}
	}
	if (bufCount > 0) { // write partial buffer (bufCount = 2 or 3)
		buf = buf << ((4 - bufCount) * 6); // zero-pad on right
		out[outIndex++] = (buf >> 16) & 255;
		if (bufCount > 2) {
			out[outIndex++] = (buf >> 8) & 255;
		}
	}
	return out;
};

// Binary to String

Module.binaryToString = function (data) {
	var len = data.length;
	var result = [];
	for (var i = 0; i < len; i++) {
		result.push(String.fromCharCode(data[i]));
	}
	return result.join('');
};
