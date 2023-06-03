const express = require('express')
const app = express()
// const fetch = require('node-fetch')
const mongoose = require('mongoose');
const port = 4000
require('dotenv').config();

app.use(express.static('public'));
app.set('views', './views');
app.set('view engine', 'ejs');


const dataSchema = new mongoose.Schema({
    name: String,
    last: Number,
    buy: Number,
    sell: Number,
    volume: Number,
    base_unit: String
  
  });
const DataModel = mongoose.model('Data', dataSchema);

async function getDataAndUpload() {
    const fetch = (await import('node-fetch')).default;
  
    const response = await fetch('https://api.wazirx.com/api/v2/tickers');
    const data = await response.json();
    const value = Object.values(data)
    const top10 = value.slice(0, 10);
    const name = top10.map(item => item.name.split("/")[0]);
    const result = top10.map(item => ({
      name: item.name,
      last: item.last,
      buy: item.buy,
      sell: item.sell,
      volume: item.volume,
      base_unit: item.base_unit
    }));
    await DataModel.deleteMany({});
    await DataModel.insertMany(result);
    return name
  }

app.get('/', (req, res) => {
res.redirect('/BTC-INR');
});
app.get('/:name',async(req,res)=>{
    const currency = await getDataAndUpload();
    const name = req.params.name;
    const splitStr = name.split("-");
    const joinedStr = splitStr.join("/");
    const data = await DataModel.findOne({ name: joinedStr });
    res.render('index',{data:data,names:currency})
})


const url = process.env.DATABASEURL;
mongoose.connect(url);
app.listen(port,()=>console.info("listening"))