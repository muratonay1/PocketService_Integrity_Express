export default class Pocket {

	static create(){
		return new Pocket();
	}

	put(key, value) {
		let keyList = key.includes('.') ? key.split('.') : [key];
		let target = this;

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
		let keyList = key.split('.');
		let target = this;

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
							return target[prop](...args);
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
		let keyList = key.split('.');
		let target = this;

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

	static isPocket() {
		return this instanceof Pocket;
	}

	isEmpty() {
		return this.size() === 0;
	}
	itemEquals(key,value){
		if(this instanceof Pocket){
			return this.get(key,"") == value;
		}
		else{
			throw new Error('this metod using only Pocket Class.');
		}
	}
}