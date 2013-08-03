/**
* uShip namespace
* Defines a library of common utilities
*/

; (function (root) {

    var previousuShip = root.uship;

    var uship;
    if (typeof exports !== 'undefined') {
        uship = exports;
    } else {
        uship = root.uship = {};
    }

    /**
     * Returns a nested namespace. Takes three argument forms:
     *    var module = uship.namespace('path.to.module');
     *    var module = uship.namespace(['path', 'to', 'module']);
     *    var module = uship.namespace('path', 'to', 'module');
     * ...where the path to the module is a series of nested namespaces that may or may not have been initialized
     */
    uship.namespace = function (namespacePath) {
        var namespaceParts;

        if (arguments.length > 1) {
            namespaceParts = toArray(arguments);
        } else if (isArray(namespacePath)) {
            namespaceParts = namespacePath;
        } else if (typeof namespacePath === 'string') {
            namespaceParts = namespacePath.split('.');
        }

        if (!namespaceParts) throw new Error('Either pass in a single string with dot-separated namespaces, an array of namespace strings, or a separate string param for each namespace');

        if (namespaceParts[0].toLowerCase() === 'uship') {
            namespaceParts = namespaceParts.slice(1);
        }

        return addPartToNamespace(uship, namespaceParts);
    };

    function addPartToNamespace(ns, parts) {
        if (parts.length === 0) return ns;
        var first = parts.shift();
        if (!ns[first]) ns[first] = Object.create(nsProto);
        return addPartToNamespace(ns[first], parts);
    }

    var nsProto = {
        extend: function (source) {
            extend(this, source);
            return this;
        }
    };

    //Utilities

    var isArray = Array.isArray || function (obj) {
        return Object.prototype.toString.call(obj) == '[object Array]';
    };

    var toArray = function (args, ix) {
        return Array.prototype.slice.call(args, ix || 0);
    };

    var format = function (format /*, ...replacements*/) {
        var replacements = toArray(arguments, 1);
        for (var i = 0, j = replacements.length; i < j; i++) {
            format = format.replace(new RegExp('\\{' + (i) + '\\}', 'g'), replacements[i]);
        }
        return format;
    };

    var extend = function (target, source /*, ...sources */) {
        if (source) {
            for (var prop in source) {
                if (source.hasOwnProperty(prop)) {
                    target[prop] = source[prop];
                }
            }
        }

        //Recursively apply additional sources
        if (arguments.length > 2) {
            var args = toArray(arguments, 2);
            args.unshift(target);
            return extend.apply(this, args);
        }

        return target;
    };

    var forEach = function (obj, fn) {
        if (isArray(obj)) {
            obj.forEach(fn, this);
        } else {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    fn(prop, obj[prop]);
                }
            }
        }
    };

    var restParams = function (func, args) {
        if (typeof func !== 'function') return [];
        if (func.length >= args.length) return [];
        var restArgs = uship.utils.toArray(args, func.length);
        if (!restArgs || !restArgs.length) return [];
        return restArgs;
    };

    var flattenToArray = function (/* arguments */) {
        var acc = [],
            args = toArray(arguments);

        args.forEach(function (item) {
            if (isArray(item)) {
                acc = acc.concat(flattenToArray.apply(null, item));
            } else {
                acc.push(item);
            }
        });

        return acc;
    };

    var getUrlParam = function (key) {
        var result = new RegExp(key + "=([^&]*)", "i").exec(window.location.search);
        return result && result[1] || "";
    };

    //Based on curl.js loader -- simple injection with success/failure events translated to promise response
    var activeScripts = {},
        doc = window.document,
        head = doc && (doc['head'] || doc.getElementsByTagName('head')[0]),
        insertBeforeEl = head && head.getElementsByTagName('base')[0] || null,
        readyStates = 'addEventListener' in window ? {} : { 'loaded': 1, 'complete': 1 };

    var injectScript = function (src) {
        if (activeScripts[src]) return activeScripts[src].promise();

        var el = doc.createElement('script'),
            promise = $.Deferred();

        function process(ev) {
            ev = ev || window.event;
            if (ev.type == 'load' || readyStates[el.readyState]) {
                delete activeScripts[src];
                el.onload = el.onreadystatechange = el.onerror = '';
                promise.resolve();
            }
        }

        function fail(e) {
            promise.reject(new Error('Syntax or http error: ' + src));
        }

        el.onload = el.onreadystatechange = process;
        el.onerror = fail;
        el.type = 'text/javascript';
        el.charset = 'utf-8';
        el.src = src;

        activeScripts[src] = promise;

        head.insertBefore(el, insertBeforeEl);

        return promise.promise();
    };

    uship.namespace('utils').extend({
        isArray: isArray,
        toArray: toArray,
        format: format,
        extend: extend,
        forEach: forEach,
        flattenToArray: flattenToArray,
        getUrlParam: getUrlParam,
        injectScript: injectScript,
        restParams: restParams
    });

    //Polyfill helpers

    var placeholder = function (context, isSelf) {
        var $ = root.jQuery;
        if (!$ || !$.fn.placeholder) return;
        context = context || $(document);
        $(function () {
            (isSelf) ?
                context.placeholder() :
                context.find('input, textarea').placeholder();
        });
    };

    // IE8 Does not fire the change event before the submit event,
    // therefore the KO VM is stale and must be updated manually.

    var refreshModelFromDom = function (scope, model, callback) {
        var $ = root.jQuery;
        if (!$) return;

        scope = scope || 'body';

        var inputs = $(scope).find(':input');

        $.each(inputs, function (index, input) {
            var name = input.name;

            if (!model[name] || typeof model[name] !== 'function') return;

            if (input.value !== model[name]()) {
                model[name](input.value);
            }
        });  // $.each

        if (callback) callback();

    };

    uship.namespace('polyfills').extend({
        placeholder: placeholder,
        refreshModelFromDom: refreshModelFromDom
    });

    //Common helpers
    if (typeof root.console === 'undefined') {
        root.console = {
            log: function () { return; }
        };
    }

    var noopAlert = {
        log: function () { },
        success: function () { },
        error: function () { },
        debug: function () { }
    };

    uship.namespace('helpers').extend({
        alert: noopAlert,
        noopAlert: noopAlert
    });

    //log errors that happened before documentReady
    root.jQuery && root.jQuery(function () {
        root.errorLog && root.errorLog.logQueue;
    });

    if (previousuShip) {
        extend(uship, previousuShip);
    }

})(this);