const mongoose = require("mongoose");

async function ConnectTODb(){
  return mongoose.connect(process.env.MONGO_URL)
}

module.exports = ConnectTODb
