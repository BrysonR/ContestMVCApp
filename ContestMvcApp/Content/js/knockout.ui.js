/**
* uShip UI Components
* Defines a library of common utilities
*/
 
; (function (root, ko, $) {
 
    var templateEngine = new ko.stringTemplateEngine();
 
    var templateConfig = { templateEngine: templateEngine };
 
    /*
     *   Checkbox List Binding
     *
     *   <div data-bind="checkboxlist: { options: myOptions, selectedOptions }"></div>
     */
 
    var checkboxListTemplateString = [
        '<!-- ko if: selectAllEnabled -->',
            '<div class="checkbox-list" data-bind="css: skin()">',
                '<label class="checkbox" data-bind="css: { checked: selectAll }" onclick="">',
                    '<span class="indicator"></span>',
                    '<input type="checkbox" value="true" name="selectAll" data-bind="checked: selectAll"/>',
                    '<!-- ko text: selectAllPrompt --><!-- /ko -->',
                '</label>',
            '</div>',
        '<!-- /ko -->',
 
        '<div class="checkbox-list" data-bind="foreach: options, css: skin()">',
            '<label class="checkbox" data-bind="click:$parent.clickCallback, css: { checked: isChecked }">',
                '<span class="indicator"></span>',
                '<input type="checkbox" data-bind="attr: { value: value, name: value }, checked: isChecked"/>',
                '<!-- ko text: label --><!-- /ko -->',
            '</label>',
        '</div>'
    ].join('');
 
    templateEngine.addTemplate('checkboxListTemplate', checkboxListTemplateString);
 
    var CheckboxModel = function (value, label, state, children) {
        var self = this;
 
        self.value = ko.observable(value || true);
        self.label = ko.observable(label || '');
        self.state = ko.observable(state || 'unchecked');
 
        self.isChecked = ko.computed({
            read: function () {
                return self.state() === 'checked';
            },
            write: function (checked) {
                var children = self.children();
                children && children.forEach(function (child) {
                    child.isChecked(checked);
                });
 
                self.state(checked ? 'checked' : 'unchecked');
            }
        });
        self.isIndeterminate = ko.computed({
            read: function () {
                return self.state() === 'indeterminate';
            },
            write: function (indeterminate) {
                self.state(indeterminate ? 'indeterminate' : 'unchecked');
            }
        });
 
        self.children = ko.computed(function () {
            var childOptions = ko.unwrap(children);
 
            if (!childOptions) return null;
 
            var mappedChildren = childOptions.map(function (child) {
                return new CheckboxModel(child.value, child.label, child.state, child.children);
            });
 
            return mappedChildren;
        });
 
        self.selected = ko.computed(function () {
            var value = self.value();
            if (self.isChecked()) {
                return value;
            }
 
            var children = self.children() || [];
 
            if (!children.length) {
                return null;
            }
 
            var selectedChildren = [];
 
            children.forEach(function (child) {
                var selected = child.selected();
                if (selected) selectedChildren.push(selected);
            });
 
            if (selectedChildren.length === children.length) {
                self.isChecked(true);
                return value;
            } else if (selectedChildren.length) {
                var valueToReturn = {};
                valueToReturn[value] = selectedChildren;
                self.isIndeterminate(true);
                return valueToReturn;
            }
        });
 
        self.tally = ko.computed(function () {
            if (self.isChecked()) return 'All';
 
            var selected = self.selected();
            var value = self.value();
            if (selected && selected[value]) return selected[value].length;
 
            return '';
        });
    };
 
    var CheckboxListViewModel = function (configuration) {
        var self = this;
 
        self.boundValue = configuration.boundValue;
        self.boundOptions = configuration.options;
 
        self.optionsText = ko.unwrap(configuration.optionsText);
        self.optionsValue = ko.unwrap(configuration.optionsValue);
        self.options = ko.observableArray();
        self.skin = ko.observable(configuration.skin);
        self.clickCallback  = configuration.clickCallback;
 
        self.handleChkClick = function (option) {
            self.clickCallback && self.clickCallback(option);
        };
 
        self.selected = ko.computed(function () {
            var options = self.options();
            var selected = [];
 
            if (!options.length) return selected;
 
            ko.utils.arrayForEach(options, function (option) {
                if (option.isChecked()) selected.push(option.value.peek());
            });
 
            uniqueSelected = ko.utils.arrayGetDistinctValues(selected).sort();
 
            self.boundValue(uniqueSelected);
 
            return uniqueSelected;
        });
 
        self.setOptions = function (options) {
            var selectedOptions = ko.unwrap(self.boundValue);
 
            myOptions = ko.utils.arrayMap(ko.unwrap(options), function (option) {
                var state = selectedOptions.indexOf(option[self.optionsValue]) > -1 ? 'checked' : 'unchecked';
                return new CheckboxModel(option[self.optionsValue], option[self.optionsText], state);
            });
            self.options(myOptions);
        };
 
        ko.isObservable(self.boundOptions) && self.boundOptions.subscribe(function (newOptions) {
            self.setOptions(newOptions);
        });
 
        self.setSelectedOptions = function (selectedOptions) {
            self.options().forEach(function (option) {
                option.isChecked(selectedOptions.indexOf(option.value()) > -1);
            });
        };
 
        self.setOptions(self.boundOptions);
 
        self.boundValue.subscribe(self.setSelectedOptions, self);
 
        self.selectAllEnabled = ko.observable(!!configuration.selectAll);
        self.selectAllPrompt = ko.observable(configuration.selectAll);
 
        self.selectAll = ko.computed({
            read: function () {
                return self.selected().length === self.options().length;
            },
            write: function (shouldSelectAll) {
                self.options().forEach(function (option) {
                    option.isChecked(shouldSelectAll);
                });
            }
        });
    };
 
    var checkboxListBindingHandler = {
        init: function (element, valueAccessor) {
 
            var value = valueAccessor();
            var template = value.template || 'checkboxListTemplate';
 
            var config = {
                element: element,
                boundValue: value.selected,
                options: value.options,
                optionsText: value.optionsText || 'label',
                optionsValue: value.optionsValue || 'value',
                selectAll: value.selectAll || false,
                skin : value.skin || '',
                clickCallback : value.clickCallback
            };
 
            var checkboxListViewModel = new CheckboxListViewModel(config);
 
            ko.renderTemplate(template, checkboxListViewModel, { templateEngine: templateEngine }, element, 'replaceChildren');
 
            return { controlsDescendantBindings: true };
        }
    };
 
    /*
     *  Drillable Checkbox List Binding
     *
     *  <div data-bind="drillable: { options: myOptions, selected: selectedOptions }"></div>
     */
 
    var drillableTemplateString = [
       '<div class="drillable">',
 
           '<!-- ko if: parents().length -->',
               '<div class="breadcrumbs" data-bind="foreach: parents">',
                   '<span class="breadcrumb" data-bind="text: label"></span> ',
               '</div>',
 
               '<div class="nav">',
                   '<div class="wrap">',
                       '<button class="button primary" data-bind="click: moveBack">',
                           '<span aria-hidden="true" class="icon-arrow-left"></span> Done',
                       '</button>',
                   '</div>',
               '</div>',
           '<!-- /ko -->',
 
           '<!-- ko if: selectAllEnabled -->',
               '<div class="checkbox-list shady">',
                   '<label class="checkbox" data-bind="css: { checked: selectAll }" onclick="">',
                       '<span class="indicator"></span>',
                       '<input type="checkbox" value="true" name="selectAll" data-bind="checked: selectAll"/>',
                       '<!-- ko text: selectAllPrompt --><!-- /ko -->',
                   '</label>',
               '</div>',
           '<!-- /ko -->',
 
           '<div class="checkbox-list shady" data-bind="foreach: options">',
               '<label class="checkbox" data-bind="css: { checked: isChecked, indeterminate: isIndeterminate }" onclick="">',
                   '<span class="indicator"></span>',
                   '<input type="checkbox" data-bind="attr: { value: value, name: value }, checked: isChecked"/>',
                   '<!-- ko text: label --><!-- /ko -->',
                   // ' - state: (<!-- ko text: state --><!-- /ko -->)',
                   // ' isChecked: (<!-- ko text: isChecked --><!-- /ko -->)',
 
                   '<!-- ko if: children -->',
                   '<span class="tally" data-bind="text: tally"></span>',
                   '<a class="drill" href="#" data-bind="click: function () { $parent.drillDown($data) }">',
                       '<span aria-hidden="true" class="icon-caret-right"></span>',
                   '</a>',
                   '<!-- /ko -->',
 
               '</label>',
           '</div>',
 
           '<!-- ko if: validate && !parents().length -->',
               '<small class="error" data-bind="validationMessage: validate"></small>',
           '<!-- /ko -->',
 
           '<!-- ko if: !parents().length && submit -->',
               '<button class="large button primary" data-bind="click: submit, loc: \'MainContinue\'"></button>',
           '<!-- /ko -->',
 
       '</div>'//,
       //'Drillable Selected: <pre data-bind="text: ko.toJSON(selected, null, 2)"></pre><hr />'
    ].join('');
 
    templateEngine.addTemplate('drillableTemplate', drillableTemplateString);
 
 
 
    var DrillableListViewModel = function (configuration) {
        var self = this;
 
        self.element = configuration.element;
        self.boundValue = configuration.boundValue;
        self.boundOptions = configuration.options;
 
        self.optionsText = ko.unwrap(configuration.optionsText);
        self.optionsValue = ko.unwrap(configuration.optionsValue);
        self.optionsChildren = ko.unwrap(configuration.optionsChildren);
        self.options = ko.observableArray();
 
        self.parents = ko.observableArray();
        self.parentLists = ko.observableArray();
 
        self.validate = configuration.validate;
 
        self.selected = ko.computed(function () {
            var options = self.options();
            var selected = [];
 
            if (!options.length) return selected;
 
            ko.utils.arrayForEach(options, function (option) {
                var value = option.value();
 
                if (option.isChecked()) {
                    selected.push(value);
 
                } else if (option.children) {
                    var optionSelected = option.selected();
 
                    if (optionSelected) {
                        if(configuration.flatten && typeof optionSelected !== 'string') {
                            selected = selected.concat(self.flattenSelected(optionSelected[value]));
                        } else {
                            selected.push(optionSelected);
                        }
                    }
                }
            });
 
            uniqueSelected = ko.utils.arrayGetDistinctValues(selected).sort();
 
            self.boundValue(uniqueSelected);
 
            return uniqueSelected;
 
        }).extend({ throttle: 1 });
 
        self.setOptions = function (options) {
            var selectedOptions = ko.unwrap(self.boundValue);
 
            var myOptions = ko.utils.arrayMap(ko.unwrap(options), function (option) {
                var state = selectedOptions.indexOf(option[self.optionsValue]) > -1 ? 'checked' : 'unchecked';
 
                var childOptions = ko.unwrap(option[self.optionsChildren]);
 
                if (childOptions) {
 
                    childOptions = ko.utils.arrayMap(childOptions, function (option) {
                        var label = option[self.optionsText];
                        var value = option[self.optionsValue];
                        var state = selectedOptions.indexOf(value) > -1 ? 'checked' : 'unchecked';
 
                        return { label: label, value: value, children: option.children, state: state};
                    });
 
                    return new CheckboxModel(option[self.optionsValue], option[self.optionsText], state, childOptions);
                } else {
                    return new CheckboxModel(option[self.optionsValue], option[self.optionsText], state);
                }
 
            });
 
            self.options(myOptions);
        };
 
        self.selectAllEnabled = ko.observable(!!configuration.selectAll);
        self.selectAllPrompt = ko.computed(function () {
            return self.parents().length ? uship.loc('Mobile_Select_All') || configuration.selectAll : configuration.selectAll;
        });
        self.selectAll = ko.computed({
            read: function () {
                return self.selected().length && self.selected().length === self.options().length;
            },
            write: function (shouldSelectAll) {
                self.options().forEach(function (option) {
                    option.isChecked(shouldSelectAll);
                });
 
                self.selectAll();
            }
        }).extend({ throttle: 1 });
 
        self.submit = configuration.submit;
 
        self.lockBackButton = function () {
            var topPostion = $(self.element).offset().top;
            var bottomPosition = topPostion + $(self.element).height();
            var scrollHeight = $(window).scrollTop();
 
            if (scrollHeight > topPostion && scrollHeight < bottomPosition) {
                $(self.element).find('.nav').addClass('lock');
            } else {
                $(self.element).find('.nav').removeClass('lock');
            }
        };
 
        self.drillDown = function (selected) {
            self.parents.push(selected);
            self.parentLists.push(self.options());
 
            var childOptions = ko.isObservable(selected[self.optionsChildren]) ? selected[self.optionsChildren]() : selected[self.optionsChildren];
            self.options(childOptions);
 
            if(selected.isChecked()) self.selectAll(true);
 
            $(window).on('scroll.drillable', self.lockBackButton);
        };
 
        self.moveBack = function () {
            var parent = self.parents.pop();
            var selected = self.selected();
 
            if (selected.length > 0 ) {
                if (self.selectAll()) {
                    parent.isChecked(true);
                } else {
                    parent.isIndeterminate(true);
                }
            } else {
                parent.isChecked(false);
            }
 
            var parentList = self.parentLists.pop();
 
            self.options(parentList);
 
            if (!self.parents().length) $(window).off('.drillable');
        };
 
        self.flattenSelected = function (selected) {
            var selectedArr = [];
 
            selected.forEach(function (item) {
                if (typeof item === 'string') {
                    selectedArr.push(item);
                } else {
                    selectedArr = selectedArr.concat(self.flattenSelected(item));
                }
            });
 
            return selectedArr;
        };
 
        self.boundOptions.subscribe(function (newOptions) {
            self.setOptions(newOptions);
        });
 
        self.setOptions(self.boundOptions);
 
    };
 
    var drillableBindingHandler = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
 
            var value = valueAccessor();
            var template = value.template || 'drillableTemplate';
 
            var config = {
                element: element,
                boundValue: value.selected,
                options: value.options,
                optionsText: value.optionsText || 'label',
                optionsValue: value.optionsValue || 'value',
                optionsChildren: value.optionsChildren || 'children',
                flatten: value.flatten || false,
                selectAll: value.selectAll || false,
                validate: value.validate,
                submit: value.submit && value.submit.bind(viewModel)
            };
 
            var drillableListViewModel = new DrillableListViewModel(config);
 
            ko.renderTemplate(template, drillableListViewModel, templateConfig, element, 'replaceChildren');
 
            return { controlsDescendantBindings: true };
        }
    };
 
    /*
     *  Dropdown Binding
     *
     *  <div data-bind="dropdown: { options: myOptions, selected: selectedOptions }"></div>
     */
 
    var dropdownTemplateString = [
        '<div class="custom dropdown" data-bind="css: css">',
        '    <!-- ko if: window.innerWidth > 321 || !window.innerWidth -->',
        '        <a href="#" class="current" data-bind="text: selectedText, click: toggle"></a>',
        '        <a href="#" class="selector" data-bind="click: toggle"></a>',
        '    <!-- /ko -->',
 
        '    <!-- ko if: window.innerWidth < 321  -->',
        '        <span class="current" data-bind="text: selectedText"></span>',
        '        <span class="selector"></span>',
        '    <!-- /ko -->',
 
        '    <ul data-bind="foreach: $data.options, visible: isOpen, attr: { name: name }" style="display: block;">',
        '        <li data-bind="text:$data[$parent.optionsText], click: $parent.selectOption"></li>',
        '    </ul>',
 
        '    <!-- ko if: window.innerWidth < 768 -->',
        '        <select data-bind="',
        '            value: selected,',
        '            options: options,',
        '            optionsValue : optionsValue,',
        '            optionsText: optionsText,',
        '            optionsCaption: optionsCaption,',
        '            attr: { name: name }',
        '            ">',
        '        </select>',
        '    <!-- /ko -->',
        '</div>'
    ].join('');
 
    templateEngine.addTemplate('dropdownTemplate', dropdownTemplateString);
 
    // click handler to close any open dropdowns
    var closeAllDropdowns = function(){
 
        var dropdowns = $('.dropdown');
 
        for (var i = 0; i< dropdowns.length; i++) {
            var context = ko.contextFor(dropdowns[i]);
 
            if (context) {
                var viewModel = context.$data;
                if (ko.isObservable(viewModel.isOpen) && viewModel.isOpen()) {
                    viewModel.close();
                }
            }
        }
    };
 
    var DropdownViewModel = function (configuration) {
        var self = this;
 
        self.selected = configuration.boundValue;
        self.options = configuration.options;
        self.optionsText = configuration.optionsText;
        self.optionsValue = configuration.optionsValue;
        self.optionsCaption = configuration.optionsCaption;
        self.name = configuration.name;
        self.css = configuration.css;
 
        self.selectedText = ko.computed(function () {
            var selectedText = self.optionsCaption;
 
            if (self.selected()){
                var selectedOption = ko.utils.arrayFirst(ko.unwrap(self.options), function(option){
                    return option[self.optionsValue] === self.selected();
                });
 
                if (selectedOption) selectedText = selectedOption[self.optionsText];
            }
 
            return selectedText;
        });
 
        self.isOpen = ko.observable(false);
 
        self.open = function (data, event) {
            self.isOpen(true);
            $(document).on('click.dropdown', closeAllDropdowns);
        };
        self.close = function (data, event) {
            self.isOpen(false);
            $(document).off('.dropdown');
        };
        self.toggle = function (data, event) {
            closeAllDropdowns();
            event.stopPropagation();
            !self.isOpen() ? self.open() : self.close();
        };
        self.selectOption = function (option) {
            var value = option[self.optionsValue];
            self.selected(value);
            self.close();
        };
    };
 
    var dropdownBindingHandler = {
        init: function (element, valueAccessor) {
            var value = ko.unwrap(valueAccessor());
            var template = value.template || 'dropdownTemplate';
 
            var config = {
                element: element,
                boundValue: value.selected,
                options: value.options,
                optionsText: value.optionsText || 'label',
                optionsValue: value.optionsValue || 'value',
                optionsCaption: value.optionsCaption || 'Select a value...',
                name: value.name,
                css: value.css
            };
 
            var dropdownViewModel = new DropdownViewModel(config);
 
            ko.renderTemplate(template, dropdownViewModel, { templateEngine: templateEngine }, element, 'replaceChildren');
 
            return { controlsDescendantBindings: true };
        }
    };
 
    /*
     *  Radio Button List Binding
     *
     *  <div data-bind="radiolist: { options: myOptions, selected: selectedOptions }"></div>
     */
 
    var radioListTemplateString = [
        '<div class="radio-list" data-bind="foreach: options, css: skin()">',
            '<label class="radio" data-bind="css: { checked: $parent.selected() == value }" onclick="">',
                '<input type="radio" data-bind="attr: { value: value, name: name }, checked: $parent.selected">',
                '<span class="indicator"></span>',
                '<!-- ko text: label --><!-- /ko -->',
            '</label>',
        '</div>'
    ].join('');
 
    templateEngine.addTemplate('radiolistTemplate', radioListTemplateString);
 
    var RadioListViewModel = function (configuration) {
        var self = this;
 
        self.name = configuration.name || 'radio';
        self.selected = configuration.boundValue;
        self.optionsText = ko.unwrap(configuration.optionsText);
        self.optionsValue = ko.unwrap(configuration.optionsValue);
        self.options = ko.observableArray();
        self.skin = ko.observable(configuration.skin);
 
        self.setOptions = function (options) {
            myOptions = ko.utils.arrayMap(ko.unwrap(options), function(option){
                return { value: option[self.optionsValue], label: option[self.optionsText] };
            });
            self.options(myOptions);
        };
 
        ko.computed(function () {
            self.setOptions(configuration.options);
        });
    };
 
    var radioListBindingHandler = {
        init: function (element, valueAccessor) {
            var value = valueAccessor();
            var template = value.template || 'radiolistTemplate';
 
            var config = {
                element: element,
                boundValue: value.selected,
                options: value.options,
                optionsText: value.optionsText || 'label',
                optionsValue: value.optionsValue || 'value',
                name: value.name || 'radio-group',
                skin: value.skin || ''
            };
 
            var radioListViewModel = new RadioListViewModel(config);
 
            ko.renderTemplate(template, radioListViewModel, { templateEngine: templateEngine }, element, 'replaceChildren');
 
            return { controlsDescendantBindings: true };
        }
    };
 
    /*
     *  Twitter Typeahead Binding
     *
     *  <input data-bind="typeahead: { local: myOptions }, value: selectedOption""></div>
     */
 
    var typeaheadBindingHandler = {
        init: function(element, valueAccessor, allBindingsAccessor){
            var value = valueAccessor(),
                allBindings = allBindingsAccessor(),
                boundValue = allBindings.value,
                config = ko.toJS(value),
                $element = $(element);
 
 
            $element.typeahead(config);
 
            if (!boundValue) return;
 
            // set the bound value when something is selected from the typeahead
            ko.utils.registerEventHandler(element,'typeahead:selected typeahead:autocompleted', function(event, input){
                ko.isObservable(boundValue) ? boundValue(input.value) : boundValue = input.value;
            });
 
            // remove typeahead event handlers
            ko.utils.domNodeDisposal.addDisposeCallback(element, function(){
                $(element).typeahead('destroy');
            });
        }
    };
 
    // extend knockout
    ko.bindingHandlers.checkboxlist = checkboxListBindingHandler;
    ko.bindingHandlers.drillable = drillableBindingHandler;
    ko.bindingHandlers.dropdown = dropdownBindingHandler;
    ko.bindingHandlers.radiolist = radioListBindingHandler;
    ko.bindingHandlers.typeahead = typeaheadBindingHandler;
 
 
})(this, ko);