# Popular Cache

An in-memory LRU cache with easy statistics and smart proxy mode.

# Installation

	npm install popular-cache --save

# Basic Usage

	var pcache = require('popular-cache');
		cache = pcache({
			maxSize: 500,
			maxAge: 1000 * 60 * 60	// in millisecond
		}),
		smallCache = pcache(50);	// or simply sets max size

	// basic usage
	cache.set("key", "value")
	cache.get("key")
	cache.del("key")	// delete key
	cache.size()		// get size
	cache.reset()   	// resets cache

	cache.hits()		// get total hits
	cache.misses()		// get total misses

	// print the most popular keys and the number of hits
	cache.popular(function(key, value, hits){
		console.log(key + ': ' + hits);
	}, 5);

	// print the most recently used keys and the number of hits
	cache.recent(function(key, value, hits){
		console.log(key + ': ' + hits);
	}, 10);

# Proxy Mode

Proxy mode is as simple as telling popular-cache what you want and then you just get and get. Cache misses and concurrent requests are handled automatically.

	// some time consuming process like HTTP request
	var httpRequest = function(key, callback, context){
		setTimeout(function(){
			callback(key + ' proxy ' + context);
		}, 1000);
	}
	// define the proxied cache
	var cache = pcache(50).proxy(httpRequest)
		.accept(function(key, value, context){
			return key.length > 5; 		// don't cache key that is too short
		});
	 
	cache.get('hello', function(value){
		console.log(value); 		// hello proxy world
		console.log(cache.size()); 	// 0
	}, 'world');
	cache.get('longer key', function(value){
		console.log(value); 		// longer key proxy anything
		console.log(cache.size()); 	// 1
	}, 'anything');

Note that the value is not returned directly in proxy mode. Instead, it's returned via callback.

# APIs

- **set(key, value)**

	- Stores a value. 
	- Updates the "recently used"-ness of the entry.
	- Resets the age of the entry.

- **get(key)** (normal Mode)

	- Gets a value for a given key. Returns null if not found.
	- Updates the "recently used"-ness of the entry.
	- Increases the hits of the entry

- **del(key)**
	
	- Deletes an entry for a given key.

- **size()**
	
	- Gets the current number of entries in the cache.

- **reset()**
	
	- Deletes all entries in the cache.

- **hits()**
	
	- Gets the total hits.

- **misses()**
	
	- Gets the total misses.

- **recent(function(key, value, hits), [limit])**

	- Iterates over recent used entries in reverse chronological order.
	- `key`: the key of the entry.
	- `value`: the value of the entry.
	- `hits`: the number of hits of the entry.
	- `limit`: optional, the maximum number of iterations.

- **popular(function(key, value, hits), [limit])**

	- Iterates over most popular entries in descending order of hits.
	- `key`: the key of the entry.
	- `value`: the value of the entry.
	- `hits`: the number of hits of the entry.
	- `limit`: optional, the maximum number of iterations.

- **proxy(function(key, callback(value), [context]))**

	- Sets a proxy function and returns the proxied cache.
	- The proxy function `function(key, callback(value), [context])` will be called when cache misses occur to retrieve the latest value. `key` and `context` is passed from `get(key, function(value), [context])` directly. See the example below.

- **accept(function(key, value, context))** (proxy mode)

	- Sets an acceptance function in proxy mode.
	- The acceptance function `function(key, value, context)` will be called after the latest value is retrieved to determine whether or not the value should be cached. 

- **get(key, function(value), [context])** (proxy mode)

	- Gets a value for a given key in proxy mode. Note that `function(value)` is required here to receive the value.
	- `context` is optional and could be anything that is helpful for the proxy function. It will only be passed to the proxy function when cache misses occur. 
