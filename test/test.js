(function () {
    'use strict';
    var assert = require('assert');
    var util = require('util');
    var Sequence = require('../src/in-sequence.js');

    describe('Positive Tests', function () {
        it('should do nothing if no callbacks are added', function () {
            (new Sequence()).run();
        });
        it('should invoke callback', function () {
            var didInvoke = false;
            (new Sequence()).add(function (next) {
                didInvoke = true;
                next();
            }).run();
            assert(didInvoke);
        });
        it('should invoke callbacks in order', function () {
            var seq, i, n, invocations;
            invocations = [];
            function step(id) {
                return function (next) {
                    invocations.push(id);
                    next();
                };
            }
            n = 10;
            seq = new Sequence();
            for (i=0; i < n; ++i) {
                seq.add(step(i));
            }
            seq.run();
            assert.equal(n, invocations.length);
            for (i=0; i < n; ++i) {
                assert.equal(i, invocations[i]);
            }
        });
        it('should jump to labels', function () {
            var invocations, seq;

            invocations = [];
            // create sequence 'seq' with 'first' and 'last' steps.
            seq = new Sequence();
            seq.add('first', function (next) {
               next('A');
            }).add('last', function () {
                // do nothing.
            });
            // insert labeled steps out of order.
            function addStep(seq, label, nextLabel) {
                seq.add(label, function (next) {
                    invocations.push(label);
                    next(nextLabel);
                });
            }
            addStep(seq, 'C', 'last');
            addStep(seq, 'A', 'B');
            addStep(seq, 'B', 'C');
            // run sequence...
            seq.run();
            ['A', 'B', 'C'].forEach(function (label, idx) {
                assert.equal(label, invocations[idx]);
            });
        });
        it('should start at labeled step, if a label is provided to run()', function () {
            (new Sequence()).add(function (next) {
                throw new Error('should not get here');
            }).add('begin', function (next) {
                next();
            }).run('begin');
        });
        it('should provide a context', function () {
            (new Sequence()).add(function (next, ctx) {
                ctx.secret = 10;
                setTimeout(next, 0);
            }).add(function (next, ctx) {
                assert(10, ctx.secret);
                setTimeout(next, 0);
            }).add(function (next, ctx) {
                assert(10, ctx.secret);
                setTimeout(next, 0);
            }).run();
        });
    });

    describe('Negative Tests', function () {
        it('should not allow labels to clash', function () {
            assert.throws(function () {
                (new Sequence()).add('foo', function (next) {
                    next();
                }).add('foo', function (next) {
                }).run();
            }, /bad_label/);
        });

        it('should not allow add() after run() has been invoked', function () {
            assert.throws(function () {
                var seq = new Sequence();
                seq.add(function (next) {
                    seq.add(function () {
                    });
                }).add(function (next) {
                }).run();
            }, /bad_state/);
        });

        /*
         * DESIGN NOTE: recursive calls into a sequence is not supported.
         * The problem we are trying to solve is flattening of asynchronous
         * calls. Should recursion be desired, the asynchronous calls should
         * be wrapped in a function and that function can recursively call
         * itself.
         */
        it('should not allow run() after run() has been invoked', function () {
            assert.throws(function () {
                var seq = new Sequence();
                seq.add(function (next) {
                    seq.run();
                }).add(function (next) {
                }).run();
            }, /bad_state/);
        });
        
        it('should throw bad_args if no callback is provided to add()', function () {
            assert.throws(function () {
                (new Sequence()).add();
            }, /bad_args/);
            assert.throws(function () {
                (new Sequence()).add('first');
            }, /bad_args/);
        });

        it('should throw bad_args if label provided to add() is not a string', function () {
            assert.throws(function () {
                (new Sequence()).add(1, function (next) {});
            }, /bad_args/);
        });
        
        it('should throw bad_args if label provided to next() is not a string', function () {
            assert.throws(function () {
                (new Sequence()).add(function (next) {
                    next(1);
                }).add('target', function (next) {
                }).run();
            }, /bad_args/);
        });

        it('should throw bad_label if label provided to next() is unknown', function () {
            assert.throws(function () {
                (new Sequence()).add(function (next) {
                    next('missed-target');
                }).add('target', function (next) {
                }).run();
            }, /bad_label/);
        });
        
        it('should throw bad_args if label provided to run() is not a string', function () {
            assert.throws(function () {
                (new Sequence()).add('first', function (next) {
                }).run(0);
            }, /bad_args/);
        });
        it('should throw bad_label if label provided to run() is unknown', function () {
            assert.throws(function () {
                (new Sequence()).add('first', function (next) {
                }).run('second');
            }, /bad_label/);
        });
    });

}());
