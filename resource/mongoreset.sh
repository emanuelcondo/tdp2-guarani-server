mongo --eval "db.getSiblingDB('guarani').dropDatabase()"
mongorestore --db guarani ./guarani
mongo
