; (function (root, ko, $) {

    var uship = root.uship;

    var extendSubscribable = function (requestedExtenders) {
        var target = this;
        var extensions = {};

        if (requestedExtenders) {
            if (ko.isObservable(this.extensions)) {
                extensions = this.extensions();
            } else {
                this.extensions = ko.observable(extensions);
            }

            uship.utils.forEach(requestedExtenders, function (key, value) {
                var extenderHandler = ko.extenders[key];

                extensions[key] = value;

                if (typeof extenderHandler == 'function') {
                    target = extenderHandler(target, value);
                }
            });
            this.extensions(extensions);
        }

        return target;
    }; // extend

    //Allow an observable to update automatically from a published topic
    var subscribeTo = function (from, topic) {
        from.subscribe(this, null, topic);
        return this;
    };


    var navigateSubObservables = function (properties, target) {
        if (typeof properties === 'string') properties = properties.split('.');

        for (var i = 0; i < properties.length - 1; i++) {
            target = target[properties[i]];
        }

        return target;
    };

    //Referenced observables shadow a property on an underlying viewModel
    var referencedObservable = function (property, target, deferred) {
        if (!property || !target) throw new Error('You must pass in a property to be referenced and the model that contains the property');

        var properties;

        if (typeof property === 'string' && property.indexOf('.')) {
            properties = property.split('.');
            property = properties[properties.length - 1];
        }

        var unwrappedTarget = ko.unwrap(target);

        unwrappedTarget = navigateSubObservables(properties, unwrappedTarget);

        if (!unwrappedTarget[property]) throw new Error('The passed-in model has no property ' + property + ' to reference');
        if (!ko.isObservable(unwrappedTarget[property])) throw new Error(property + ' is not an observable');

        var extensions = ko.isObservable(unwrappedTarget[property].extensions) ?
            unwrappedTarget[property].extensions() : {};

        deferred = deferred || true;

        var reference = ko.computed({
            read: function () {
                var self = ko.unwrap(this);

                var nestedTarget = navigateSubObservables(properties, self);

                if (nestedTarget && ko.isObservable(nestedTarget[property])) {
                    return nestedTarget[property]();
                } else {
                    return undefined;
                }

            },
            write: function (value) {
                var self = ko.unwrap(this);

                var nestedTarget = navigateSubObservables(properties, self);

                if (nestedTarget && ko.isObservable(nestedTarget[property])) {
                    return nestedTarget[property](value);
                }
            },
            owner: target,
            deferEvaluation: deferred
        });
        reference.extend(extensions);

        return reference;
    };

    var toFormatted = function (target, pattern) {
        if (!pattern instanceof RegExp) throw new Error('Pattern parameter must be a regular expression');

        target.userInput = ko.observable();
        target.formatted = ko.computed({
            read: function () {
                return target.userInput();
            },
            write: function (value) {
                if (typeof value === 'undefined' || value === null) return;
                target.userInput(value);

                var numericMcNumber = value.replace(pattern, '');
                target(numericMcNumber);
            },
            owner: target,
            deferEvaluation: true
        });

        target.formatted(target());
        return target;
    };

    /* Placeholder Binding Handler
 
    Allows you to add a placeholder binding which brings backwards compatability for using placeholder
    text inside inputs. Required for IE8 & IE9 */

    var placeholderShim = {
        update: function (element, valueAccessor) {

            var value = valueAccessor();
            var placeholder = ko.unwrap(value);
            var $element = $(element);

            element.setAttribute('placeholder', placeholder);

            setTimeout(function () {
                if ($element.val() === '') {
                    $element.val(placeholder);
                    $element.addClass('placeholder');
                }
            }, 1);

            $element.focus(
                function () {
                    $element.removeClass('placeholder');
                    if ($element.val() === placeholder) {
                        $element.val("");
                    }
                }).blur(function () {
                    if ($element.val() === '') {
                        $element.val(placeholder);
                        $element.addClass('placeholder');
                    }
                });


        }
    };

    var placeholderSimple = {
        update: function (element, valueAccessor) {
            var value = valueAccessor();
            var placeholder = ko.unwrap(value);

            element.setAttribute('placeholder', placeholder);
        }
    };

    // Set the placeholder attr if support, if not use the shim
    var hasPlaceholder = 'placeholder' in document.createElement('input');
    var placeholderBindingHandler = hasPlaceholder ? placeholderSimple : placeholderShim;


    var localizationBindingHandler = {
        update: function (element, valueAccessor) {
            var translator = function () {
                return uship.loc(valueAccessor());
            };
            ko.bindingHandlers.text.update(element, translator);
        }
    };


    /**
    External templating provider
 
    Modifies the native template binding to accept a url option, which if present, will attempt to load the template
    via AJAX request from the specified url.
    */

    // Suppress JSHint warnings for [] notation -- this is to be consistent with Knockout's code style
    /*jshint sub:true */

    var externalTemplatePublisher = new ko.subscribable();

    //Create the template engine override
    var externalTemplateEngine = function () {
        ko.nativeTemplateEngine.call(this);
        this.externalTemplateCache = {};
    };

    var externalTemplateSettings = {
        baseUrl: ''
    };

    externalTemplateEngine.prototype = Object.create(ko.nativeTemplateEngine.prototype);

    externalTemplateEngine.prototype['makeTemplateSource'] = function (template, templateDocument, options) {
        //Remote template that hasn't already been pre-fetched
        if (options && options.url && !document.getElementById(template)) {
            return this.fetch(template, options);
        }

        //Otherwise call the native method
        return ko.templateEngine.prototype['makeTemplateSource'].call(this, template, templateDocument, options);
    };

    externalTemplateEngine.prototype['fetch'] = function (template, options) {
        return this.externalTemplateCache[options.url] ||
            (this.externalTemplateCache[options.url] = new ko.templateSources.remoteTemplate(template, options));
    };

    externalTemplateEngine.prototype['renderTemplate'] = function (template, bindingContext, options, templateDocument) {
        var templateSource = this['makeTemplateSource'](template, templateDocument, options);
        return this['renderTemplateSource'](templateSource, bindingContext, options);
    };

    var externalTemplatePlaceholders = {
        loading: '<div class="ko-template-placeholder">' + 'Main Loading' + '</div>',
        error: '<div class="ko-template-error">' + 'Default Template Error Message' + '</div>'
    };

    //Create an additional templateSource
    var remoteTemplate = function (templateName, options) {
        this.templateName = templateName;
        this.options = options;
        if (!this.options.placeholders) this.options.placeholders = {};

        this.template = ko.observable(this.options.placeholders.loading || externalTemplatePlaceholders.loading || undefined);
        this.template.data = {};
        this.isLoaded = false;
    };

    remoteTemplate.prototype['text'] = function (/* value */) {
        this.load();

        if (arguments.length === 0) {
            return this.template();
        }

        //For unknown reasons an extremely fast response from the server can cause
        //some kind of a race condition when updating the observable. Setting a
        //minimal timeout seems to fix this
        var value = arguments[0];
        setTimeout(function () {
            this.template(value);
        }.bind(this), 1);
    };

    remoteTemplate.prototype['data'] = function (key /*, value */) {
        if (arguments.length === 1) {
            return this.template.data[key];
        } else {
            this.template.data[key] = arguments[1];
        }
    };

    remoteTemplate.prototype['load'] = function (url, isFallback) {
        if (this.isLoaded) return;

        var self = this;
        url = url || self.options.url;

        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'html',
            timeout: isFallback ? 20000 : 2000,
            data: isFallback ? { url: self.options.url } : {}
        }).then(function (data) {
            self.done(data);
        }, function (xhr, status, err) {
            return self.fallback(isFallback, url, err);
        });
    };

    remoteTemplate.prototype['fallback'] = function (isFallback, url, err) {
        var fallbackUrl = this.options.templateFallbackUrl || externalTemplateSettings.baseUrl;
        if (isFallback || !fallbackUrl) {
            this.fail(url, err);
            return;
        }
        this.load(fallbackUrl, true);
    };

    remoteTemplate.prototype['done'] = function (data) {
        this.isLoaded = true;
        this.text(data);
        externalTemplatePublisher.notifySubscribers(this.templateName, 'templateload');
    };

    remoteTemplate.prototype['fail'] = function (url, err) {
        var logMsg = uship.utils.format('Remote template load failed with {0} for url {1}', err, url);
        root.errorLog.soft(logMsg, 'uship.knockout.extensions@externalTemplateEngine');

        this.isLoaded = true;
        this.text(this.options.placeholders.error || externalTemplatePlaceholders.error);
        externalTemplatePublisher.notifySubscribers(this.templateName, 'templateloadfail');
    };

    externalTemplateEngine.instance = new externalTemplateEngine();

    //Helper function wraps an external template provider instance's fetch method
    var fetchInstanceTemplate = function (template, options) {
        if (!externalTemplateEngine.instance) return;
        return externalTemplateEngine.instance.fetch(template, options);
    };



    /*
    String Templating Provider
 
    Overrides Knockouts native provider by adding string templating support
    */

    var StringTemplate = function (text) {
        var _data = {};
        var _text = text;
        this.data = function (key, value) {
            if (!value) return _data[key];
            _data[key] = value;
        };
        this.text = function (newValue) {
            if (!newValue) return _text;
            _text = newValue;
        };
    };

    var stringTemplateEngine = function () {
        var _templates = {};
        var _nativeEngine = new ko.nativeTemplateEngine();

        _nativeEngine.makeTemplateSource = function (templateName) {
            return _templates[templateName];
        };

        _nativeEngine.addTemplate = function (name, body) {
            _templates[name] = new StringTemplate(body);
        };

        return _nativeEngine;
    };

    uship.utils.extend(ko.extenders, {
        toFormatted: toFormatted
    });

    //Override/extend native Knockout
    ko.referencedObservable = referencedObservable;
    ko.subscribable.fn.subscribeTo = subscribeTo;
    ko.subscribable.fn.extend = extendSubscribable;
    ko.bindingHandlers.placeholder = placeholderBindingHandler;
    ko.bindingHandlers.loc = localizationBindingHandler;
    ko.templateSources.remoteTemplate = remoteTemplate;
    ko.setTemplateEngine(externalTemplateEngine.instance);
    ko.stringTemplateEngine = stringTemplateEngine;

    ko.externalTemplate = {
        instance: externalTemplateEngine.instance,
        settings: externalTemplateSettings,
        publisher: externalTemplatePublisher,
        placeholders: externalTemplatePlaceholders,
        fetch: fetchInstanceTemplate
    };

    ko.unwrap = ko.unwrap || ko.utils.unwrapObservable;

})(this, ko, jQuery);