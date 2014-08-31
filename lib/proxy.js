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
Proxy.prototype.get = function(key, callback, context){
	var value = this._cache.get(key);
	if(value == null){
		request(this, key, callback, context);
	}else{
		if(typeof callback === 'function') callback(value);
	}
}
Proxy.prototype.accept = function(acceptFunc){
	this._acceptFunc = acceptFunc;
	return this;
}
function request(self, key, callback, context){
	if(!self._waitingList.hasOwnProperty(key)){
		self._waitingList[key] = [callback];
		doProxy(self, key, context);
	}else{
		self._waitingList[key].push(callback);
	}

}
function doProxy(self, key, context){
	self._proxyFunc(key, function(){
		value = (arguments.length == 1) ? arguments[0]: arguments;

		if(doAccept(self, key, value, context)){
			self.set(key, value)
		}else{
			// this is neither a miss, nor a hit
			self._cache._misses--;
		} 
		notify(self, key, value);
	}, context);
}
function doAccept(self, key, value, context){
	if(typeof self._acceptFunc === 'function'){
		return self._acceptFunc(key, value, context);
	}else{
		return true;
	}
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