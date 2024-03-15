import { MongoClient, ObjectId } from 'mongodb';
import Pocket from './Pocket.js';
import { DbError } from '../util/constant.js';
import PocketUtility from './PocketUtility.js';
import PocketLog from './PocketLog.js';
import PocketConfigManager from './PocketConfigManager.js';


export default class PocketMongo {
	constructor () {
		this.uri = PocketConfigManager.getMongoConfig();
		this.client = new MongoClient(this.uri);
	}


	async connect() {
		if (!this.client && !this.client.topology && !this.client.topology.isConnected()) {
			await this.client.connect();
		}
	}

	async getDatabases() {
		await this.connect();
		const databasesList = await this.client.db().admin().listDatabases();
		return databasesList.databases.map(database => database.name);
	}

	async executeGet(args) {
		await this.connect();

		const done = args.done;
		const fail = args.fail;
		const from = args.from?.split('.') || [];

		if (from.length !== 2) {
			throw new Error(DbError.PATH_NOT_FOUND);
		}

		const [dbName, collectionName] = from;
		const whereOptions = args.where || [];

		const tempWhere = {};

		const operatorMapping = {
			"==": "$eq",
			">": "$gt",
			"<": "$lt",
			">=": "$gte",
			"<=": "$lte",
			"!=": "$ne"
		};

		whereOptions.filters.forEach(filter => {
			const operator = operatorMapping[filter.operator];

			if (operator) {
				tempWhere[filter.field] = { [operator]: filter.value };
			} else {
				PocketLog.error("Geçersiz bir operatör girişi yapıldı. executeGet. Operator: " + operator)
				throw new Error("Geçersiz operatör: " + filter.operator);
			}
		});

		try {
			let projection = {};
			if (args.projection != undefined && args.projection != "*") {
				projection = args.projection.split(',').reduce((acc, field) => {
					acc[field] = 1;
					return acc;
				}, {});
			}

			const result = await this.client.db(dbName).collection(collectionName).find(tempWhere, { "projection": projection }).toArray();
			delete result["ForEach"];
			done(result);
		} catch (error) {
			const functionName = new Error().stack.match(/at\s+(.*?\s+|\S+)/)[1].replace('async ', '').split(' ')[0];
			PocketUtility.createExceptionLog(this.client, error, functionName).then(() => {
				fail(error);
			});
		}
	}




	async executeUpdate(args) {
		await this.connect();
		let done = args.done;
		let fail = args.fail;
		const from = args.from?.split('.') || [];
		if (from.length !== 2) throw new Error(DbError.PATH_NOT_FOUND);

		const [dbName, collectionName] = from;
		const whereOptions = args.where || {};
		const updatePocket = new Pocket().put("$set", args.params);

		const tempWhere = {};

		const operatorMapping = {
			"==": "$eq",
			">": "$gt",
			"<": "$lt",
			">=": "$gte",
			"<=": "$lte",
			"!=": "$ne"
		};

		whereOptions.filters.forEach(filter => {
			const operator = operatorMapping[filter.operator];

			if (operator) {
				tempWhere[filter.field] = { [operator]: filter.value };
			} else {
				PocketLog.error("Geçersiz bir operatör girişi yapıldı. executeGet. Operator: " + operator)
				throw new Error("Geçersiz operatör: " + filter.operator);
			}
		});

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

	async executeInsert(args) {
		await this.connect();
		let done = args.done;
		let fail = args.fail;
		const from = args.from?.split('.') || [];
		if (from.length !== 2) throw new Error(DbError.PATH_NOT_FOUND);

		const [dbName, collectionName] = from;

		try {
			const db = this.client.db(dbName);
			const collections = await db.listCollections().toArray();
			const collectionExists = collections.some(col => col.name === collectionName);

			if (!collectionExists) {
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

	async executeDelete(args) {
		await this.connect();
		let done = args.done;
		let fail = args.fail;
		const from = args.from?.split('.') || [];
		if (from.length !== 2) throw new Error(DbError.PATH_NOT_FOUND);

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