export default class PocketList {
	constructor () {
		/**
		 * @param {Pocket} callback
		 * @returns {Pocket} callback
		 * @description
		 * PocketList yapısına özgü bir döngü yapısıdır.
		 * @example
		 * pocketList.ForEach(visitor=>{
		 *      console.log(visitor);
		 * })
		 */
		this.ForEach = function (callbackfn = Pocket) {
			let index = 0;
			let items = new PocketList();
			for (let i = 0; i < Object.keys(this).length; i++) {
				items.add(this[i]);
			}

			function first() {
				return reset();
			}

			function next() {
				return ++index;
			}

			function hasNext() {
				return index <= Object.keys(items).length - 3;
			}

			function reset() {
				return (index = 0);
			}
			for (let item = first(); hasNext(); item = next()) {
				/**
				 * @returns {Pocket}
				 */
				callbackfn(items[item]);
			}
		};
	}

	/**
	 *
	 * @param {Pocket} pocket
	 * @returns {this}
	 */
	add(pocket) {
		let _this = this;
		let thisLength = Object.keys(_this).length - 1;
		if (thisLength != 0) {
			_this[thisLength] = pocket;
		} else {
			_this[0] = pocket;
		}
		return _this;
	}

	/**
	 *
	 * @param {Integer} index
	 * @returns {Pocket}
	 */
	getPocket(index) {
		return this[index];
	}

	/**
	 *
	 * @returns {Boolean}
	 */
	isPocketList() {
		return this instanceof PocketList == "PocketList";
	}

	/**
	 *
	 * @returns {Integer}
	 */
	size() {
		return Object.keys(this).length - 1;
	}
}
