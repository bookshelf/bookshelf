// Events
// ---------------

var Promise     = require('./promise');
var Backbone    = require('backbone');
var triggerThen = require('trigger-then');
var _           = require('lodash');

Backbone.Events.once = function(name, callback, context) {
    //if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
    var self = this;
    var once = _.once(function() {
        self.off(name, once);
        return callback.apply(this, arguments);
    });
    once._callback = callback;
    return this.on(name, once, context);
};

// Mixin the `triggerThen` function into all relevant Backbone objects,
// so we can have event driven async validations, functions, etc.
triggerThen(Backbone, Promise);

module.exports = Backbone.Events;