console.log('hi');

const db = require('monk')("mongodb://MORPH_MONGO@ds111078.mlab.com:11078/cep")
const users = db.get('database')

users.insert({ name: 'hi',quote: ' mongo!'})

