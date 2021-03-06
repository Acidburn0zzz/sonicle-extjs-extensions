/*
 * Sonicle ExtJs UX
 * Copyright (C) 2015 Sonicle S.r.l.
 * sonicle@sonicle.com
 * http://www.sonicle.com
 * Inspired by:
 *	https://github.com/crypto-browserify/randombytes
 */
Ext.define('Sonicle.Crypto', {
	
	statics: {
		getRandomBytes: function(size) {
			var win = window,
					crypto = (win.crypto || win.msCrypto),
					bytes = new Uint8Array(size),
					QUOTA = 65536;
			
			for (var i = 0; i < size; i += QUOTA) {
				crypto.getRandomValues(bytes.subarray(i, i + Math.min(size - i, QUOTA)));
			}
			return bytes;
		},
		
		md5: function(s) {
			if (!window['SparkMD5']) Ext.raise('Library SparkMD5 is required (see https://github.com/satazor/js-spark-md5).');
			return SparkMD5.hash(s);
		},
		
		sha256: function(s) {
			var win = window,
					crypto = (win.crypto || win.msCrypto),
					buf = new TextEncoder("utf-8").encode(s),
					hex;
			crypto.subtle.digest("SHA-256", buf).then(function (hash) {
				hex = Sonicle.Crypto.hex(hash);
			});
			return hex;
		},
		
		hex: function(buffer) {
			var view = new DataView(buffer), hexCodes = [],
					value, svalue, pad, padvalue;
			for (var i = 0; i < view.byteLength; i += 4) {
				 // Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
				 value = view.getUint32(i);
				 // toString(16) will give the hex representation of the number without padding
				 svalue = value.toString(16);
				 // We use concatenation and slice for padding
				 pad = '00000000';
				 padvalue = (pad + svalue).slice(-pad.length);
				 hexCodes.push(padvalue);
			}
			return hexCodes.join('');
		}
	}
});
