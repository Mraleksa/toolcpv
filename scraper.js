console.log('hi');

const db = require('monk')("mongodb://Mr_cep:Mr_cep258258@ds111078.mlab.com:11078/cep")
const users = db.get('database')

users.insert({ name: 'hi',quote: ' mongo!'})
