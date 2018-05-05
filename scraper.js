console.log('hi');
my_secret_value = process.env.MORPH_MYSECRET;

const db = require('monk')(my_secret_value)
const users = db.get('database')

users.insert({ name: 'hi',quote: ' mongo4'})
