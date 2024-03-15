export default class Pocket {
	constructor () { }

	static create(){
		return new Pocket();
	}

	put(key, value) {
		var keyList = key.includes('.') ? key.split('.') : [key];
		var target = this;

		for (let i = 0; i < keyList.length - 1; i++) {
			if (!target[keyList[i]]) {
				target[keyList[i]] = {};
			}
			target = target[keyList[i]];
		}

		target[keyList[keyList.length - 1]] = value;
		return this;
	}

	putAs(key, creator) {
		this[key] = creator;
	}

	get(key, defaultValueOrClass = undefined) {
		var keyList = key.split('.');
		var target = this;

		for (let k of keyList) {
			if (target[k] === undefined) {
				if (typeof defaultValueOrClass === 'string' && defaultValueOrClass.trim() !== '' && typeof global[defaultValueOrClass] === 'function') {
					throw new Error(`Invalid defaultValueOrClass: ${defaultValueOrClass}. It should not be a class name.`);
				}
				else if(target[k] == undefined && typeof defaultValueOrClass != 'string'){
					throw new Error(`Invalid key: ${k}. It should not be a path.`);
				}
				return defaultValueOrClass instanceof Function ? new defaultValueOrClass() : defaultValueOrClass;
			}
			target = target[k];
		}

		if (typeof target === 'object' && defaultValueOrClass instanceof Function && !(target instanceof defaultValueOrClass)) {
			throw new Error(`${key} is not of type ${defaultValueOrClass.name}. It's of type ${typeof target}`);
		}

		if (typeof target === 'object') {
			const getProxy = new Proxy(target, {
				get: function (target, prop) {
					if (typeof target[prop] === 'function') {
						return function (...args) {
							return target[prop].call(target, ...args);
						};
					} else {
						return target[prop];
					}
				}
			});
			return getProxy;
		} else {
			return target;
		}
	}


	merge(pocket) {
		Object.assign(this, pocket);
	}

	exist(key) {
		return this.get(key,"") !== "";
	}

	remove(key) {
		var keyList = key.split('.');
		var target = this;

		for (let i = 0; i < keyList.length - 1; i++) {
			target = target[keyList[i]];
		}

		delete target[keyList[keyList.length - 1]];
	}

	size() {
		return Object.keys(this).length;
	}

	getKeys() {
		return Object.keys(this);
	}

	clone() {
		return JSON.parse(JSON.stringify(this));
	}

	isPocket() {
		return this instanceof Pocket;
	}

	isEmpty() {
		return this.size() === 0;
	}
	itemEquals(key,value){
		if(this instanceof Pocket){
			if(this.get(key,"") == value){
				return true;
			}
			return false;
		}
		else{
			throw new Error('this metod using only Pocket Class.');
		}
	}
}