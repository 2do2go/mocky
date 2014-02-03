'use strict';

var toString = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

exports.slice = function(obj, start, end) {
	return Array.prototype.slice.call(obj, start, end);
};

var has = exports.has = function(obj, key) {
	return hasOwnProperty.call(obj, key);
};

// Is a given value an array?
var isArray = exports.isArray = Array.isArray || function(obj) {
	return toString.call(obj) == '[object Array]';
};

// Is a given variable an object?
var isObject = exports.isObject = function(obj) {
	return obj === Object(obj);
};

var each = exports.each = function(obj, iterator, context) {
	if (!isObject(obj)) return;

	if (isArray(obj)) {
		obj.forEach(iterator, context);
	} else {
		for (var key in obj) {
			if (has(obj, key)) {
				if (iterator.call(context, obj[key], key, obj) === false) return;
			}
		}
	}
}

// isType methods: isFunction, isString, isNumber, isDate, isRegExp
each(['Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
	exports['is' + name] = function(obj) {
		return toString.call(obj) == '[object ' + name + ']';
	};
});

// Optimize `isFunction` if appropriate.
if (typeof (/./) !== 'function') {
	exports.isFunction = function(obj) {
		return typeof obj === 'function';
	};
}
