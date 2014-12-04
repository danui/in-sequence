in-sequence
===========

This package provides a constructor for a Sequence object that executes
steps in sequence.

Sequence
--------

    +------------------------+
    | Sequence               |
    |------------------------|
    | + add(callback)        |
    | + add(label, callback) |
    | + run()                |
    | + run(label)           |
    +------------------------+

Creation
--------

A sequence is created using `new`.

    var Sequence = require('in-sequence');
    var s = new Sequence();

Step `callback()`
-----------------

Steps are defined as callback functions of the form:

    function (next, ctx) // callback

The 'next' parameter is function that, when invoked, causes the next step in the sequence to be executed.

The 'ctx' parameter is a context object created when a sequence is executed and is passed to all step callback functions. It serves as a shared object amongst steps for a particular sequence execution.

Methods `add()` and `run()`
---------------------------

Steps are added to a sequence using the `add()` method and the sequence is executed by calling `run()`. The `add()` method returns the sequence to allowing chaining of `add()` calls. The following code adds two steps to a new sequence and then executes it.

    (new Sequence()).add(function (next) {
        console.log('step one');
        next();
    }).add(function (next) {
        console.log('step two');
        next();
    }).run();
    
Output:

    step one
    step two

Steps with labels
-----------------

Steps can be labeled and we can provide a label when calling `next()` to jump to a step. In the following, the second step would be skipped.

    (new Sequence()).add(function (next) {
        console.log('step one');
        next('end');              // jump to 'end'
    }).add(function (next) {
        console.log('step two');
        next();
    }).add('end', function (next) {
        console.log('step three');
        next();
    }).run();

Output:

    step one
    step three

A label can also be specified with `run()` to start execution of a sequence from a specified step.

    var k = 0;
    (new Sequence()).add('try-again', function (next) {
        console.log('step try-again');
        next();
    }).add('begin', function (next) {
        console.log('step one');
        next();
    }).add(function (next) {
        console.log('step two');
        k += 1;
        if (k < 2) {
            next('try-again');
        }
        // else no next call terminates execution.
    }).run('begin');

Output:

    step one
    step two
    step try-again
    step one
    step two
