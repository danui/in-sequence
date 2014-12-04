(function () {

    'use strict';
    
    module.exports = function () {
        var self = this;
        var chain = [];
        var labels = {};
        var ctx = {};
        
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
                throw new Error('bad inputs');
            }
            
            if (label) {
                if (label in labels) {
                    throw new Error('bad label, not unique');
                }
                labels[label] = chain.length;
            }
            chain.push(callback);
        };
        
        self.run = function () {
            var n;
            
            n = chain.length;
            
            // Nothing to do if chain is empty.
            if (n === 0) return;

            function invoke(idx) {
                var callback;
                if (idx < n) {
                    callback = chain[idx];
                    callback(function (label) {
                        if (label) {
                            if (!(label in labels)) {
                                throw new Error('unknown label: ' + label);
                            }
                            invoke(labels[label]);
                        } else {
                            invoke(idx+1);
                        }
                    }, ctx);
                }
            }
            invoke(0);
        };
    };
    
}());
