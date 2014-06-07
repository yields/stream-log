
/**
 * Module dependencies.
 */

var max = require('max-component');
var fmt = require('util').format;
var assert = require('assert');

/**
 * Expose `Logger`
 */

module.exports = Logger;

/**
 * Initialize `Logger`
 * 
 * @param {Stream} stream
 * @api public
 */

function Logger(stream){
  if (!(this instanceof Logger)) return new Logger(stream);
  this.stream = stream;
  this.types = [];
}

/**
 * Add `type` with `color`.
 * 
 * Example:
 * 
 *    logger.type('log', '36m');
 *    logger.log('woot %d', 9);
 * 
 *    logger.type('error', '36m', function(){
 *      logger.end();
 *      process.exit(1);
 *    });
 * 
 *    logger.error('%s', err.stack);
 * 
 * @param {String} type
 * @param {String} color
 * @param {Function} fn
 * @return {Logger}
 * @api private
 */

Logger.prototype.type = function(type, color, fn){
  assert(!this[type], '.' + type + '() already exists');
  var color = color || '30m';
  var self = this;
  this.types.push(type);
  this[type] = function(){
    var args = [].slice.call(arguments);
    self.__log__(type, color, args);
    fn && fn();
  };
};

/**
 * Log `type`, `color` with `args`.
 * 
 * @param {String} type
 * @param {String} color
 * @param {Function} fn
 * @api private
 */

Logger.prototype.__log__ = function(type, color, args){
  if (!this.wrote) this.stream.write('\n');
  var pad = this.padleft(type);
  var msg = fmt.apply(null, ['%s\033[%s%s\033[m : %s', pad, color, type].concat(args));
  this.stream.write(msg);
  return this;
};

/**
 * Pad `type` left.
 * 
 * @param {String} type
 * @return {String}
 * @api private
 */

Logger.prototype.padleft = function(type){
  var len = max(this.types, '.length');
  return Array(4 + len - type.length).join(' ');
};

/**
 * End.
 * 
 * @api public
 */

Logger.prototype.end = function(){
  this.stream.write('\n\n');
  return this;
};
