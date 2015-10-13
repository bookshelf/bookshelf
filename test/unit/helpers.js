var assert = require('assert');
var equal = assert.strictEqual;
var helpers = require('../../lib/helpers');

module.exports = function() {

  describe('Helpers', function() {

    describe('normalizeSaveMethod', function() {

      var normalizeSaveMethod = helpers.normalizeSaveMethod;

      it('converts "update" and "insert" to lowercase', function() {
        expect(normalizeSaveMethod('UPDATE')).to.equal('update');
        expect(normalizeSaveMethod('INSERT')).to.equal('insert');
      });

      it('throws on non-string or unrecognized string', function() {
        expect(normalizeSaveMethod.bind(null, '')).to.throw(TypeError);
        expect(normalizeSaveMethod.bind(null, 'some-other-string')).to.throw(TypeError);
        expect(normalizeSaveMethod.bind(null, 5)).to.throw(TypeError);
      });
  
      it('returns undefined for `null` or `undefined`', function() {
        expect(normalizeSaveMethod(null)).to.be.undefined;
        expect(normalizeSaveMethod(undefined)).to.be.undefined;
      });
        
    });
  });
};      
