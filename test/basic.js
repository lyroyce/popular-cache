var assert = require('assert'),
	pcache = require('../lib/cache')
describe('basic', function(){
	it('should be able to init cache and get size', function(){
		var cache1 = pcache();
		assert.equal(0, cache1.size());
		var cache2 = new pcache();
		assert.equal(0, cache2.size());
	})
	it('should be able to get/set cache', function(){
		var cache = pcache();
		assert.equal(null, cache.get('abc'));

		var obj = {'name':'abc'};
		cache.set('abc', obj)
		assert.equal(null, cache.get('def'));
		assert.equal(obj, cache.get('abc'));
		assert.equal(obj, cache.get('abc'));
	})
	it('should be able to reset cache', function(){
		var cache = pcache();
		cache.set('1', 1);
		cache.set('2', 2);
		cache.set('3', 3);
		assert.equal(3, cache.size());
		cache.reset();
		assert.equal(0, cache.size());
	})
	it('should be able to delete cache', function(){
		var cache = pcache();
		cache.set('1', 1);
		cache.set('2', 1);
		assert.equal(1, cache.get('1'));
		assert.equal(true, cache.del('1'));
		assert.equal(null, cache.get('1'));
		assert.equal(false, cache.del('1'));
		assert.equal(null, cache.get('1'));
	})
	it('should be able to init multiple cache instances', function(){
		var cache1 = pcache();
		var cache2 = pcache();
		var cache3 = new pcache();
		var cache4 = new pcache();
		cache1.set('1', 1);
		cache2.set('2', 2);
		cache3.set('3', 3);
		cache4.set('4', 4);
		assert.equal(1, cache1.size());
		assert.equal(1, cache2.size());
		assert.equal(1, cache3.size());
		assert.equal(1, cache4.size());
	})
	it('should support maxSize option', function(){
		var cache = pcache(3);
		cache.set('1', 1);
		cache.set('2', 2);
		cache.set('3', 3);
		assert.equal(3, cache.size());
		// should not grow beyond size limit
		cache.set('4', 4);
		assert.equal(3, cache.size());
		// old item should be deleted
		assert.equal(null, cache.get('1'));
		assert.equal(2, cache.get('2'));
		assert.equal(3, cache.get('3'));
		assert.equal(3, cache.size());
	})
	it('should delete least-recently-used item when reaching size limit', function(){
		var cache = pcache({maxSize: 3});
		cache.set('1', 1);
		cache.set('2', 2);
		cache.set('3', 3);

		cache.get('1')
		cache.set('4', 4);
		// least-recently-used item should be deleted
		assert.equal(null, cache.get('2'));
		assert.equal(1, cache.get('1'));
		assert.equal(3, cache.get('3'));
		assert.equal(4, cache.get('4'));
	})
	it('should support maxAge option', function(done){
		var cache = pcache({maxAge: 10});
		cache.set('1', 1);
		cache.set('2', 2);
		cache.set('3', 3);
		assert.equal(3, cache.size());
		setTimeout(function(){
			assert.equal(3, cache.size());
			// set an existing cache doesn't trigger cleaning
			cache.set('1', 1);
			assert.equal(3, cache.size());
			// get a cache doesn't trigger cleaning
			assert.equal(1, cache.get('1'));
			assert.equal(3, cache.size());
			// should not get an out-dated cache
			assert.equal(null, cache.get('2'));
			assert.equal(null, cache.get('3'));
			done();
		}, 20);
	})
	it('should clean out-dated cache first when reaching size limit and maxAge is set', function(done){
		var cache = pcache({maxSize: 3, maxAge: 10});
		cache.set('1', 1);
		cache.set('2', 2);
		cache.set('3', 3);
		setTimeout(function(){
			cache.set('1', 1);
			cache.set('4', 4);
			// out-dated cache should have been removed
			assert.equal(2, cache.size());
			assert.equal(null, cache.get('2'));
			assert.equal(null, cache.get('3'));
			done();
		}, 20);
	})
})
