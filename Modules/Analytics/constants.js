export const Modules = {
     "ANALYTICS":"Analytics",
     "NETFLIX":"Netflix"
}

export const Db = {
     "ANALYTICS":"analytics",
}
export const Collection = {
     "ACCOUNTS":"accounts",
     "CUSTOMER":"customer",
     "TRANSACTIONS":"transactions"
}

export const MongoQueryFrom = {
     "ACCOUNTS":Db.ANALYTICS + "." + Collection.ACCOUNTS,
     "CUSTOMER":Db.ANALYTICS + "." + Collection.CUSTOMER,
     "TRANSACTIONS":Db.ANALYTICS + "." + Collection.TRANSACTIONS
}