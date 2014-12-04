(function () {

    'use strict';

    module.exports = function () {
        var self = this;
        var chain = [];
        var labels = {};

        self.add = function (x, y) {
            var label, callback;

            // sort out what the arguments are.
            if (typeof x === 'string' && typeof y === 'function') {
                label = x;
                callback = y;
            } else if (typeof x === 'function' && !y) {
                label = undefined;
                callback = x;
            } else {
                throw new Error('bad_args');
            }

            if (label) {
                if (label in labels) {
                    throw new Error('bad_label, not unique');
                }
                labels[label] = chain.length;
            }
            chain.push(callback);
            return self;
        };

        self.run = function (firstLabel) {
            var n, ctx;

            self.add = function () {
                throw new Error('bad_state, already called run()');
            };

            self.run = function () {
                throw new Error('bad_state, already called run()');
            };

            n = chain.length;

            // Nothing to do if chain is empty.
            if (n === 0) return;

            ctx = {};

            function invoke(idx) {
                var callback;
                if (idx < n) {
                    callback = chain[idx];
                    callback(function (label) {
                        if (label) {
                            if (!(label in labels)) {
                                throw new Error('bad_label, unknown label: ' + label);
                            }
                            invoke(labels[label]);
                        } else {
                            invoke(idx+1);
                        }
                    }, ctx);
                }
            }
            if (firstLabel === undefined) {
                invoke(0);
            } else if (typeof firstLabel !== 'string') {
                throw new Error('bad_args, label should be a string');
            } else if (!(firstLabel in labels)) {
                throw new Error('bad_label, unknown label: ' + label);
            } else {
                invoke(labels[firstLabel]);
            }
        };
    };
}());
