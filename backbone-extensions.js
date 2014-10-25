/*jsl:option explicit*/
/// <reference path="backbone.js" />

/*
* GLOBAL EVENTS
*
* Add the ability to trigger/bind to global events to the Backbone.Events object, which in turn will give
* any model or view the ability to trigger/bind to global events.
*/
(function() {

    var globalEventFunctions = 
    {        
        triggerGlobal : function()
        {
            Backbone.trigger.apply(Backbone, arguments);
        },

        onGlobal : function()
        {
            Backbone.on.apply(Backbone, arguments);
        },

        offGlobal : function()
        {
            Backbone.off.apply(Backbone, arguments);
        },

        onceGlobal : function()
        {
            Backbone.once.apply(Backbone, arguments);
        },

        // Since listenTo() is like the inverted event binding version of on(), we have to have `this` listen to the global `Backbone` object.
        listenToGlobal : function()
        {
            var args = _.toArray(arguments);
            args.unshift(Backbone);
            this.listenTo.apply(this, args);
        },

        stopListeningGlobal : function()
        {
            var args = _.toArray(arguments);
            args.unshift(Backbone);
            this.stopListening.apply(this, args);
        }
    };

    // Now all models, views, collections and anything else using Backbone.Events will have the global events.
    _.extend(Backbone.Model.prototype, globalEventFunctions);
    _.extend(Backbone.Collection.prototype, globalEventFunctions);
    _.extend(Backbone.View.prototype, globalEventFunctions);
    _.extend(Backbone.Events, globalEventFunctions);
        
})();

/*
* toJSON()
*
* I don't know why Backbone doesn't do this by default. In addition to serializing all of the
* attributes of a model, also serialize any value that has a toJSON function of its own.
*/
Backbone.Model.prototype.toJSON = function()
{
    var json = _.clone(this.attributes);
    _.each(json, function(value, name) 
    {
        if (value && _.isFunction(value.toJSON))
        {
            json[name] = value.toJSON();
        }
    });
    return json;
};

/*
* ComputedPropertyMixin
*
* This allows you to set an attribute to have a function value and then use
* get to retrieve the evaluated function result, rather than just the function. You 
* cannot specify a computed setter.
*
* When one of the bindings changes, a change event will automatically be triggered
* for this property. That happens even if the result of the changed binding won't actually
* result in the computed property changing, but we don't want to recompute the getter
* on every change.
*
* Destroying this model will remove all of its bindings.

Usage:

var MyModel = Backbone.Model.extend({

    initialize : function() 
    {
        this.createComputedProperty({
                attr: "...",
                get: function() { ... },
                bindings: [
                    { model : ... },
                    { model : ..., attribute : ..., eventType : ... }
                ]
            });
    }
});

*/
Backbone.ComputedPropertyMixin =
{
    // Override get so that we call the computed function for this attribute.
    get : function(attr)
    {
        var computed = this._computed[attr];
        if (computed)
        {
            return computed.get.call(this);
        }
        return this.attributes[attr];
    },

    createComputedProperty : function(options)
    {
        var defaults = {
            attr : "",
            get : function() { },
            bindings : []
        };
        options = _.extend(defaults, options);
        
        // Any time one of the bound events fires, we'll call this function.
        var triggerChange = function()
        {
            this.trigger("change:" + options.attr);
            this.trigger("change");
        };

        // This is what we'll use to bind (method="on") or unbind (method="off") all of the specified events.
        var listen = function(method)
        {
            for (var i = 0; i < options.bindings.length; i++)
            {
                var eventType = options.bindings[i].eventType ? options.bindings[i].eventType : "change";

                if (options.bindings[i].attribute)
                {
                    options.bindings[i].model[method](eventType + ":" + options.bindings[i].attribute, triggerChange, this);
                }
                else
                {
                    options.bindings[i].model[method](eventType, triggerChange, this);
                }
            }
        };

        listen.call(this, "on");
        
        // Unbind everything on destroy.
        this.on("destroy", listen.bind(this, "off"));
        
        // Store our getter and bindings privately so that we can access them later.
        if (!this._computed)
        {
            this._computed = { };
        }
        this._computed[options.attr] = { get : options.get, bindings : options.bindings };
    }
};

/*
* bindAttribute()
*
*
* Binds the attribute to another model so that a change to it will automatically
* cause the other to change. This is a one way binding!
*/
Backbone.Model.prototype.bindAttribute = function(model, modelAttribute, myAttribute)
{
    if (!myAttribute)
    {
        myAttribute = modelAttribute;
    }
    
    var self = this;
    
    this.set(myAttribute, model.get(modelAttribute), { silent : true });

    this.listenTo(model, "change:" + modelAttribute, function ()
    {
         self.set(myAttribute, model.get(modelAttribute));
    });

    this.on("destroy", function() {
        this.stopListening(model, "change:" + modelAttribute);
    });
};

/*
* NESTED COLLECTION
*
* A nested collection should be created by a nested model. Once that happens, any model
* added to the collection (via add() or reset()) will be initialized to whatever instance
* is specified by the Model attribute in its JSON. It will also be given a reference to
* a parent, but NO reference to its collection.
*/
Backbone.NestedCollection = Backbone.Collection.extend({
    
    // Override the collections _prepareModel method - this is what is internally called
    // by add(), and it should deal with both JSON and already created Models.
    _prepareModel : function(model, options)
    {
        options = options || { };
        options.parent = this.parent;

        if (!(model instanceof Backbone.Model))
        {
            var attrs = model;
            if (attrs.Model)
            {
                model = new (eval(attrs.Model))(attrs, options);
            }
            else
            {
                model = new this.model(attrs, options);
            }
        }
        
        model.parent = this.parent;

        return model;
    }
});

/**
* Used by NestedCollections and NestedModels so that a child model can traverse up its parent chain.
*/
Backbone.AncestorByTypeMixin =
{
    getAncestorByType : function(type)
    {
        var parent = this.parent;
        
        while (parent)
        {
            if (parent instanceof type)
            {
                return parent;
            }
            parent = parent.parent;
        }

        return null;
    }
};

/*
* NESTED MODEL
*
* Models that extend this "class" should call this initialize function. It will loop through attributes
* and will convert arrays into collections (if the collections have already been created), and convert
* objects into models (if the model JSON specifies a Model attribute).
*/
Backbone.NestedModel = Backbone.Model.extend({
    
    initialize : function(attrs, options)
    {
        if (options && options.parent)
        {
            this.parent = options.parent;
        }
        
        for (var attrKey in this.attributes)
        {
            var attrValue = this.attributes[attrKey];
            if (_.isArray(attrValue) && this[attrKey])
            {
                var collection = this[attrKey];
                collection.parent = this;
                collection.reset(attrValue);
                
                // Set the attribute for the collection equal to the collection itself - this
                // is necessary for serialization.
                this.set(attrKey, collection, { silent : true });

                // Any event on a collection should propogate up to its parent.
                collection.on(
                    "change add remove reset",
                    function (model)
                    {
                        this.trigger("change", model);
                    }, 
                    this);
            }
            else if (_.isObject(attrValue) && attrValue.Model)
            {
                this[attrKey] = new (eval(attrValue.Model))(attrValue, { parent : this });
                this.set(attrKey, this[attrKey], { silent : true });
                this[attrKey].parent = this;

                // Propogate change events up to the parent.
                this[attrKey].on(
                    "change reset", 
                    function (model) 
                    {
                        this.trigger("change", model);
                    }, 
                    this);
            }
        }
    }
    
}); 

_.extend(Backbone.NestedModel.prototype, Backbone.AncestorByTypeMixin);

/*
* MAINTAIN SORT ORDER MIXIN
* 
* A mixin which helps maintain sort order in collections.
*
* This mixin automatically builds a comparator function from a sort order configuration
* object. This object supports arbitrary filtering of data for comparison.
*
* Example usage:
* This example sorts by Priority, Text (case insensitive), and DueDate:

initialize: function()
{
    Backbone.maintainSortOrder(
        this, 
        {
            "Priority": {order: "asc"}, 
            "Text": {order: "asc", filter: function(x) { return x ? x.toLowerCase() : ""; }}, 
            "DueDate": {order: "asc"}
        });
}

* Automatic re-sort and "sort" event
* Backbone will automatically insert newly added models into a collection in the right order,
* but will not automatically re-sort when properties on the model change that affect the sort order. 
* This mixin ensures that property changes to models in a collection will cause a re-sort if necessary.
* You should never actually have to call .sort().
* 
* When a re-sort occurs, the collection will fire the "sort" event. This event is only fired
* if the order of the items actually changes, not just if sort() is called.
*/
Backbone.maintainSortOrder = function(collection, sortOrder)
{
    // Create a sort token that can be used to compare the sort order
    // of the collection before and after a sort operation.
    var getSortToken = function()
    {
        return _.pluck(collection.models, "cid").join(",");
    };

    // Store the token for the current sort order
    var lastTaskSortToken = getSortToken();

    // Listen for changed models.
    collection.on(
        "change", 
        function() 
        {
            // Perform a sort
            collection.sort();

            // Check to see if the sort order has changed by
            // comparing the last and current sort tokens
            var newTaskSortToken = getSortToken();
            if (lastTaskSortToken != newTaskSortToken)
            {
                lastTaskSortToken = newTaskSortToken;

                collection.trigger("sort", collection);
            }
        }, 
        collection);

    //TODO: override sort to call the "sort" method?

    // In Backbone, defining a "comparator" function causes the model collection
    // to be kept in a sort order. "add" event handlers include the index of the new
    // model in the sort order.

    collection.comparator = function(a, b)
    {
        for (var prop in sortOrder)
        {
            var asc = (sortOrder[prop].order && sortOrder[prop].order == "desc") ? -1 : 1;
            var map = sortOrder[prop].map || function(x) { return x; };

            var valA = map(a.get(prop));
            var valB = map(b.get(prop));
                
            if (valA != valB)
            {
                return (valA > valB ? 1 : -1) * asc;
            }
        }

        return 0;
    };
};

/*
* Typically, backbone views create and "own" their DOM element.
* In this case, the element is created in a handlebars template.
* We need to create the element, replace the old one in the DOM,
* and then push it into the View via View.setElement()
*
* Usage:

var WidgetView = Backbone.View.extend({
    ...
});

_.extend(WidgetView.prototype, Backbone.ReplaceElementMixin);

*
*/
Backbone.ReplaceElementMixin = 
{
    replaceElement: function(htmlOrElement)
    {
        var $newEl = $(htmlOrElement);

        if (this.$el.length > 0)
        {
            this.$el.replaceWith($newEl);
        }

        this.setElement($newEl);
    }
};

/*
* BACKBONE.SYNC MS
*
* Backbone.sync implementation for Microsoft Web Services (ASMX and WCF)
* 
*/
(function()
{
    // Map from CRUD to HTTP verbs
    var methodMap = {
        'create': 'POST',
        'update': 'PUT',
        'delete': 'DELETE',
        'read':   'GET'
    };

    Backbone.syncMs = function(method, model, options) 
    {
        var params = {
            type: methodMap[method],
            data: model,
            url: model.url()
        };

        // Make the request, allowing the user to override any Ajax options.
        return $.msAjax(_.extend(params, options));
    };

})();

/*
* This is a really useful method for creating class hierarchies. I'm promoting it to
* the Backbone object so that we don't get confused about what we're extending.
*/
Backbone.extend = Backbone.Model.extend;

/*
* BACKBONE APPLICATION
*
* An utterly barebones object that has events and an initialize method and is intended
* to be used as the base class for Backbone App objects.
*/
Backbone.Application = function()
{
    this.initialize.apply(this, arguments);
};

Backbone.Application.extend = Backbone.Model.extend;

_.extend(Backbone.Application.prototype, Backbone.Events);

/**
* Backbone.js has decided that the query string doesn't matter:
* From https://github.com/documentcloud/backbone/pull/2126:
* "Backbone shouldn't be messing with the search params, as they don't have a valid semantic meaning from the point of view of a Backbone app."
*
* Thanks guys.
*/
(function()
{
    var routeStripper = /^[#\/]/ ;

    Backbone.History.prototype.getFragment = function(fragment, forcePushState)
    {
        if (fragment == null)
        {
            if (this._hasPushState || forcePushState)
            {
                fragment = window.location.pathname;
                var search = window.location.search;
                if (search) fragment += search;
            }
            else
            {
                fragment = window.location.hash;
            }
        }
        if (this.options && !fragment.indexOf(this.options.root)) fragment = fragment.substr(this.options.root.length);
        return fragment.replace(routeStripper, '');
    };

})();


/**
* Same issue as above, backbone introduced more code to prevent routing with query strings
*/
(function()
{
    Backbone.History.prototype.navigate = function(fragment, options)
  {
      if (!Backbone.History.started) return false;
      if (!options || options === true) options = {trigger: options};
      fragment = this.getFragment(fragment || '');
      if (this.fragment === fragment) return;
      this.fragment = fragment;
      var url = this.root + fragment;

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, fragment, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) this.loadUrl(fragment);
    };

})();
















/*
* Our servers prefer POSTs to PUTs.
*/
Backbone.emulateHTTP = true;