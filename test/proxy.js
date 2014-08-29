var assert = require('assert'),
	pcache = require('../lib/cache')
describe('proxy', function(){
	it('should be able to use proxy', function(done){
		// some time consuming process like HTTP request
		var httpRequest = function(key, callback){
			setTimeout(function(){
				if(key=='popular-cache') callback('I am popular-cache');
				else callback('others');
			}, 10);
		}
		var cache = pcache(50).proxy(httpRequest);

		cache.get('popular-cache', function(value){
			assert.equal('I am popular-cache', value);
		});
		cache.get('another key', function(value){
			assert.equal('others', value);
			done();
		});
	})
	it('should not use proxy for existing value', function(done){
		var cache = pcache(10).proxy(function(key, callback){
			if(key=='key') callback('value');
		});
		cache.set('key', 'modified value');
		cache.get('key', function(value){
			assert.equal('modified value', value);
		});
		cache.del('key');
		cache.get('key', function(value){
			assert.equal('value', value);
			done();
		});
	})
	it('should have statistics for proxy', function(){
		var cache = pcache(10).proxy(function(key, callback){
			if(key=='key') callback('value');
		});
		cache.set('1', 1);
		cache.get('1');
		cache.get('key');
		cache.get('key');
		cache.get('2'); // null value will not be cached
		cache.get('key');
		assert.equal(2, cache.size());
		assert.equal(2, cache.misses());
		assert.equal(3, cache.hits());

		// popular
		var expectedKeys = ['key', '1'],
			expectedHits = [2, 1];
		var i = 0;
		cache.popular(function(key, value, hits){
			assert.equal(expectedKeys[i], key);
			assert.equal(expectedHits[i], hits);
			i++;
		});
		assert.equal(2, i);

		// recent
		var expectedKeys = ['key', '1'],
			expectedHits = [2, 1];
		var i = 0;
		cache.recent(function(key, value, hits){
			assert.equal(expectedKeys[i], key);
			assert.equal(expectedHits[i], hits);
			i++;
		});
		assert.equal(2, i);
	})
	it('should only do one proxy call for multiple same requests', function(done){
		var proxyCalls = 0;
		var cache = pcache(10).proxy(function(key, callback){
			// time consuming process
			setTimeout(function(){
				callback(++proxyCalls);
			}, 10);
		});
		cache.get('key', function(value){
			assert.equal(1, value);
		});
		cache.get('key', function(value){
			assert.equal(1, value);
		});
		cache.get('another key', function(value){
			assert.equal(2, value);
		});
		cache.get('another key', function(value){
			assert.equal(2, value);
		});
		// Here we should get proxyCalls=1
		// because the proxy call for 'key' has already been made
		cache.get('key', function(value){
			assert.equal(1, value);
			done();
		});
	})
	it('should use proxy when requested key is expired', function(done){
		var proxyCalls = 0;
		var cache = pcache({maxAge: 20}).proxy(function(key, callback){
			// time consuming process
			setTimeout(function(){
				callback(++proxyCalls);
			}, 10);
		});
		cache.set('key', 'value')
		cache.get('key', function(value){
			assert.equal('value', value);
		});
		setTimeout(function(){
			// the key should have expired
			cache.get('key', function(value){
				assert.equal(1, value);
				done();
			});
		},50);
	})
	it('should be able to pass in context', function(done){
		var cache = pcache().proxy(function(key, callback, context){
			callback(key + ' proxy ' + context);
		});
		cache.get('hello', function(value){
			assert.equal('hello proxy world', value);
			done();
		}, 'world');
	})
	it('should pass along all arguments from proxy function to get', function(done){
		var cache = pcache().proxy(function(key, callback, context){
			callback(200, null, key + ' proxy ' + context);
		});
		cache.get('hello', function(value){
			assert.equal(200, value[0]);
			assert.equal(null, value[1]);
			assert.equal('hello proxy world', value[2]);
			
			assert.equal(1, cache.size());
			// get directly from cache
			cache.get('hello', function(value){
				assert.equal(200, value[0]);
				assert.equal(null, value[1]);
				assert.equal('hello proxy world', value[2]);
				done();
			}, 'world');
		}, 'world');
	})
	it('should support accept function', function(done){
		var cache = pcache().proxy(function(key, callback, context){
			callback(key);
		}).accept(function(key, value, context){
			return context != 'dont cache me';
		});
		// should set cache
		cache.get('hello', function(value){
			assert.equal('hello', value);
			assert.equal(1, cache.size());
		}, 'world');
		// should not set cache
		cache.get('popular', function(value){
			assert.equal('popular', value);
			assert.equal(1, cache.size());

		}, 'dont cache me');
		// should set cache
		cache.get('cache', function(value){
			assert.equal('cache', value);
			assert.equal(2, cache.size());
			done();
		}, '');
	})
})
