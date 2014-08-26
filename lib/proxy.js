function Proxy(cache, proxyFunc) {
	this._cache = cache;
	this._proxyFunc = proxyFunc;
	this._waitingList = {};
	for(var key in cache){
		if(typeof(cache[key]) !== 'function' || this[key])
			continue;
		// add each methods
		var that = this;
        (function (methodName) {
            that[methodName] = function () {
                return cache[methodName].apply(cache, arguments);
            };
        }(key));
	}
}
Proxy.prototype.get = function(key, callback){
	var value = this._cache.get(key);
	if(value == null){
		request(this, key, callback);
	}else{
		if(typeof callback === 'function') callback(value);
	}
}
function request(self, key, callback){
	if(!self._waitingList.hasOwnProperty(key)){
		self._waitingList[key] = [callback];
		doProxy(self, key, function(value){
			notify(self, key, value);
		});
	}else{
		self._waitingList[key].push(callback);
	}

}
function doProxy(self, key, done){
	self._proxyFunc(key, function(value){
		if(value !== null) self.set(key, value);
		done(value);
	});
}
function notify(self, key, value){
	if(self._waitingList.hasOwnProperty(key)){
		var callbacks = self._waitingList[key];
		for(var i in callbacks){
			if(typeof callbacks[i] === 'function') callbacks[i](value);
		}
		delete self._waitingList[key];
	}
}
module.exports = Proxy;