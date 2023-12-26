const mongoose = require('mongoose')

async function dbConnect() {
  mongoose.connect(process.env.DB, {
    dbName: process.env.DBNAME
  })
    .then(() => {
      console.log('Successfully connected to MongoDB!')
    })
    .catch(error => {
      console.error("Unable to connect to MongoDB Atlas!", error)
  })
}

module.exports = dbConnect