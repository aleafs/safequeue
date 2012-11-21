/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var should  = require('should');
var Queue = require(__dirname + '/../');

describe('queue with timeout', function () {

  /* {{{ queue_without_timeout_or_maxitem() */
  it('queue_without_timeout_or_maxitem', function (done) {
    var _me = Queue.create({'timeout' : 0, 'maxitem' : -1});

    var _messages = [];
    ['fill', 'full', 'timeout'].forEach(function (i) {
      _me.on(i, function () {
        _messages.push([i].concat(Array.prototype.slice.call(arguments)));
      });
    });

    _me.push(1).should.eql(1);
    _me.push('a').should.eql(2);
    _me.push('c', 5).should.eql(3);
    _me.push('d', 5).should.eql(4);

    _me.size().should.eql(4);
    process.nextTick(function () {
      _messages.should.eql([['fill']]);
      _me.shift().should.eql(1);
      _me.shift().should.eql('a');
      _me.pop().should.eql('d');
      _me.size().should.eql(1);

      setTimeout(function () {
        _me.size().should.eql(0);
        _messages.should.eql([['fill'],[
          'timeout', 'c', 5, 0
          ]]);
        should.ok(!_me.shift());
        done();
      }, 6);
    });
  });
  /* }}} */

  /* {{{ queue_with_timeout_and_maxitem() */
  it('queue_with_timeout_and_maxitem', function (done) {
    var _me = Queue.create({'timeout' : 5, 'maxitem' : 5});

    var _messages = [];
    ['fill', 'full', 'timeout'].forEach(function (i) {
      _me.on(i, function () {
        _messages.push([i].concat(Array.prototype.slice.call(arguments)));
      });
    });

    for (var i = 0; i < 5; i++) {
      _me.push(i).should.eql(i + 1);
    }

    _me.size().should.eql(5);
    _me.push(6).should.eql(-1);
    _me.size().should.eql(5);

    _messages.should.eql([['fill'],['full', 5, 5]]);
    _messages = [];

    _me.clean();  // XXX: make sure to clean all timer
    _me.size().should.eql(0);
    _me.push('x');
    _me.size().should.eql(1);
    setTimeout(function () {
      _messages.should.eql([['fill'],['timeout', 'x', 5, 0]]);
      done();
    }, 8);
  });
  /* }}} */

});

