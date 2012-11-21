/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var util = require('util');
var Emitter = require('events').EventEmitter;

exports.create = function (options) {

  var _options = {
    'timeout' : 0,
    'maxitem' : -1,
  };
  for (var i in options) {
    _options[i] = options[i];
  }

  /**
   * @序列
   */
  var _sequence = [];

  /* {{{ private function build() */
  /**
   * To build a timeout item into _sequence
   */
  var build = function (item, tmout, _self) {
    var tmout = ~~(tmout || _options.timeout);
    var _item = [item, 0];
    if (tmout) {
      _item[1] = setTimeout(function () {
        var i = _sequence.indexOf(_item);
        if (i > -1) {
          _sequence.splice(i, 1);
          _self.emit('timeout', item, tmout, i);
        }
      }, tmout);
    }
    return _item;
  };
  /* }}} */

  /* {{{ private function parse() */
  /**
   * To parse and return a build-in item
   *
   * @ access private
   * @ param {Array} item
   * @ return {Object} or undefined
   */
  var parse = function (item) {
    if (item && Array.isArray(item)) {
      clearTimeout(item[1]);
      item = item[0];
    }

    return item;
  };
  /* }}} */

  var Queue = function () {
    Emitter.call(this);
  };
  util.inherits(Queue, Emitter);

  /* {{{ public prototype push() */
  /**
   * Push an item into sequence
   *
   * @ access public
   * @ param {Object} item
   * @ param {Integer} tmout
   * @ return {Number} length of the sequence
   */
  Queue.prototype.push = function (item, tmout) {
    if (_options.maxitem > 0 && _sequence.length >= _options.maxitem) {
      this.emit('full', _sequence.length, _options.maxitem);
      return -1;
    }

    var n = _sequence.push(build(item, tmout, this));
    if (1 === n) {
      this.emit('fill');
    }

    return n;
  };
  /* }}} */

  /* {{{ public prototype shift() */
  /**
   * shift an item from the sequence
   *
   * @ access public
   * @ return {Object} item or undefined
   */
  Queue.prototype.shift = function () {
    return parse(_sequence.shift());
  };
  /* }}} */

  /* {{{ public prototype pop() */
  /**
   * Pop up an item from the sequence
   */
  Queue.prototype.pop = function () {
    return parse(_sequence.pop());
  };
  /* }}} */

  /* {{{ public prototype size() */
  Queue.prototype.size = function () {
    return _sequence.length;
  };
  /* }}} */

  /* {{{ public prototype clean() */
  /**
   * Clean the sequence up
   */
  Queue.prototype.clean = function () {
    _sequence.forEach(function (item) {
      if (item[1]) {
        clearTimeout(item[1]);
      }
    });
    _sequence = [];
  };
  /* }}} */

  return new Queue();
};
