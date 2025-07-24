import { MongoClient, ObjectId } from 'mongodb';
import Pocket from './Pocket.js';
import PocketUtility from './PocketUtility.js';
import PocketLog from './PocketLog.js';
import PocketConfigManager from './PocketConfigManager.js';
import dotenv from 'dotenv';

export default class PocketMongo {
	/**
	 * PocketMongo sınıfının kurucusudur.
	 * MongoDB bağlantı URI'ını .env dosyasından okur ve bir istemci (client) oluşturur.
	 */
	constructor () {
		dotenv.config();
		this.uri = process.env.MONGO;
		this.client = new MongoClient(this.uri);
	}

	/**
	 * MongoDB sunucusuna bağlantı kurar.
	 * Eğer bağlantı zaten varsa, yeni bir bağlantı denemesi yapmaz.
	 * @throws {Error} Bağlantı başarısız olursa hata fırlatır.
	 */
	async connect() {
		if (!this.client || !this.client.topology || !this.client.topology.isConnected()) {
			try {
				await this.client.connect();
			} catch (error) {
				throw new Error("Bağlantı başarısız oldu");
			}
		}
	}

	/**
	 * Sunucudaki tüm veritabanlarının listesini döndürür.
	 * @returns {Promise<string[]>} Veritabanı isimlerinin bulunduğu bir dizi.
	 */
	async getDatabases() {
		await this.connect();
		const databasesList = await this.client.db().admin().listDatabases();
		return databasesList.databases.map(database => database.name);
	}

	/**
	 * MongoDB'den belirtilen kriterlere göre veri çeker (find).
	 * @param {object} args - Sorgu argümanlarını içeren nesne.
	 * @param {string} args.from - Verinin çekileceği veritabanı ve koleksiyon (örn: 'myDb.users').
	 * @param {object} [args.where] - Filtreleme kriterleri. `filters` adında bir dizi içermelidir.
	 * @param {Array<object>} args.where.filters - Filtre nesneleri dizisi. Her nesne { field, operator, value } formatındadır.
	 * @param {string} [args.projection] - Sonuçta dönülecek alanlar (örn: 'name,email'). '*' veya tanımsız ise tüm alanlar döner.
	 * @param {function} args.done - İşlem başarılı olduğunda çağrılacak callback. Sonuç dizisini parametre olarak alır.
	 * @param {function} args.fail - İşlem başarısız olduğunda çağrılacak callback. Hata nesnesini parametre olarak alır.
	 * @returns {Promise<void>}
	 */
	async executeGet(args) {
		await this.connect();

		const done = args.done;
		const fail = args.fail;
		const from = args.from?.split('.') || [];

		if (from.length !== 2) {
			throw new Error("Path not found");
		}

		const [dbName, collectionName] = from;
		const whereOptions = args.where || {}; // Değişiklik: .filters'a erişmeden önce where'in varlığını kontrol et
		const tempWhere = {};
		const operatorMapping = { "==": "$eq", ">": "$gt", "<": "$lt", ">=": "$gte", "<=": "$lte", "!=": "$ne" };

		if (whereOptions.filters && Array.isArray(whereOptions.filters)) {
			whereOptions.filters.forEach(filter => {
				const operator = operatorMapping[filter.operator];
				if (operator) {
					tempWhere[filter.field] = { [operator]: filter.value };
				} else {
					PocketLog.error("Geçersiz bir operatör girişi yapıldı. executeGet. Operator: " + filter.operator);
					throw new Error("Geçersiz operatör: " + filter.operator);
				}
			});
		}

		try {
			let projection = {};
			if (args.projection != undefined && args.projection != "*") {
				projection = args.projection.split(',').reduce((acc, field) => {
					acc[field.trim()] = 1; // Alan adlarındaki olası boşlukları temizle
					return acc;
				}, {});
			}

			const result = await this.client.db(dbName).collection(collectionName).find(tempWhere, { "projection": projection }).toArray();
			done(result);
		} catch (error) {
			const functionName = new Error().stack.match(/at\s+(.*?\s+|\S+)/)[1].replace('async ', '').split(' ')[0];
			PocketUtility.createExceptionLog(this.client, error, functionName).then(() => {
				fail(error);
			});
		}
	}

	/**
	 * MongoDB'de belirtilen kritere uyan bir dökümanı günceller (updateOne).
	 * Eğer kriterle eşleşen bir döküman bulunamazsa, `upsert: true` seçeneği ile yeni bir döküman oluşturur.
	 * @param {object} args - Güncelleme argümanlarını içeren nesne.
	 * @param {string} args.from - İşlem yapılacak veritabanı ve koleksiyon (örn: 'myDb.users').
	 * @param {object} args.where - Güncellenecek dökümanı filtreleyen kriterler. `filters` adında bir dizi içermelidir.
	 * @param {object} args.params - Güncellenecek alanları ve değerleri içeren nesne (örn: { status: 'active' }).
	 * @param {function} args.done - İşlem başarılı olduğunda çağrılacak callback.
	 * @param {function} args.fail - İşlem başarısız olduğunda çağrılacak callback.
	 * @returns {Promise<void>}
	 */
	async executeUpdate(args) {
		await this.connect();
		let done = args.done;
		let fail = args.fail;
		const from = args.from?.split('.') || [];
		if (from.length !== 2) throw new Error("Path not found");

		const [dbName, collectionName] = from;
		const whereOptions = args.where || {};
		const updatePocket = new Pocket().put("$set", args.params);
		const tempWhere = {};
		const operatorMapping = { "==": "$eq", ">": "$gt", "<": "$lt", ">=": "$gte", "<=": "$lte", "!=": "$ne" };

		if (whereOptions.filters && Array.isArray(whereOptions.filters)) {
			whereOptions.filters.forEach(filter => {
				const operator = operatorMapping[filter.operator];
				if (operator) {
					tempWhere[filter.field] = { [operator]: filter.value };
				} else {
					PocketLog.error("Geçersiz bir operatör girişi yapıldı. executeUpdate. Operator: " + filter.operator);
					throw new Error("Geçersiz operatör: " + filter.operator);
				}
			});
		}

		try {
			await this.client.db(dbName).collection(collectionName).updateOne(tempWhere, updatePocket, { upsert: true });
			done(true);
		} catch (error) {
			const functionName = new Error().stack.match(/at\s+(.*?\s+|\S+)/)[1].replace('async ', '').split(' ')[0];
			PocketUtility.createExceptionLog(this.client, error, functionName).then((res) => {
				fail(error);
			});
		}
	}

	/**
	 * MongoDB'ye yeni bir döküman ekler (insertOne).
	 * @param {object} args - Ekleme argümanlarını içeren nesne.
	 * @param {string} args.from - Dökümanın ekleneceği veritabanı ve koleksiyon (örn: 'myDb.logs').
	 * @param {object} args.params - Koleksiyona eklenecek olan döküman nesnesi (örn: { level: 'info', message: '...' }).
	 * @param {function} args.done - İşlem başarılı olduğunda çağrılacak callback.
	 * @param {function} args.fail - İşlem başarısız olduğunda çağrılacak callback.
	 * @returns {Promise<void>}
	 */
	async executeInsert(args) {
		await this.connect();
		let done = args.done;
		let fail = args.fail;
		const from = args.from?.split('.') || [];
		if (from.length !== 2) throw new Error("From not found");

		const [dbName, collectionName] = from;

		try {
			const db = this.client.db(dbName);
			const collections = await db.listCollections({ name: collectionName }).toArray();
			if (collections.length === 0) {
				throw new Error(`Collection "${collectionName}" does not exist.`);
			}
			await this.client.db(dbName).collection(collectionName).insertOne(args.params);
			done(true);
		} catch (error) {
			const functionName = new Error().stack.match(/at\s+(.*?\s+|\S+)/)[1].replace('async ', '').split(' ')[0];
			PocketUtility.createExceptionLog(this.client, error, functionName).then((res) => {
				fail(error);
			});
		}
	}

	/**
	 * MongoDB'den belirtilen kritere uyan ilk dökümanı siler (deleteOne).
	 * @param {object} args - Silme argümanlarını içeren nesne.
	 * @param {string} args.from - İşlem yapılacak veritabanı ve koleksiyon (örn: 'myDb.sessions').
	 * @param {object} args.where - Silinecek dökümanı belirleyen MongoDB sorgu nesnesi (örn: { _id: new ObjectId('...') }).
	 * @param {function} args.done - İşlem tamamlandığında çağrılacak callback. Bir döküman silindiyse `true` parametresini alır.
	 * @param {function} args.fail - İşlem başarısız olduğunda çağrılacak callback.
	 * @returns {Promise<void>}
	 */
	async executeDelete(args) {
		await this.connect();
		let done = args.done;
		let fail = args.fail;
		const from = args.from?.split('.') || [];
		if (from.length !== 2) throw new Error("from not found");

		const [dbName, collectionName] = from;
		const whereOptions = args.where || {};

		try {
			const result = await this.client.db(dbName).collection(collectionName).deleteOne(whereOptions);
			done(result.deletedCount > 0);
		} catch (error) {
			const functionName = new Error().stack.match(/at\s+(.*?\s+|\S+)/)[1].replace('async ', '').split(' ')[0];
			PocketUtility.createExceptionLog(this.client, error, functionName).then((res) => {
				fail(error);
			});
		}
	}
}

export const dbClient = new PocketMongo();