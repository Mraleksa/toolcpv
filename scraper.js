console.log('hi');

const db = require('monk')(MORPH_MONGO)
const users = db.get('database')

users.insert({ name: 'hi',quote: ' mongo3'})
