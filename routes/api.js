'use strict';
const Stock = require('../models/stockModel')

//fecht Stocks

async function getStocks(stock) {
  const res = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`)
  const { symbol, latestPrice } = await res.json()
  return { symbol, latestPrice }

}
// Find Stocks
async function findStock(stock) {
  return await Stock.findOne({ symbol: stock }).exec()
}
// Create Stocks
async function createStock(stock, like, ip) {
  const newStock = new Stock({
    symbol: stock,
    likes: like === 'true' ? [ip] : []
  })
  const savedStock = await newStock.save()
  return savedStock
}
// Save Stocks
async function saveStocks(stock, like, ip) {
  let saved = {}
  const foundStock = await findStock(stock)
  if (!foundStock) {
    const newStock = await createStock(stock, like, ip)
    saved = newStock
    return saved
  } else {
    if (like === 'true' && foundStock.likes.indexOf(ip) === -1) {
      foundStock.likes.push(ip)
    }
    saved = foundStock
    return saved
  }
}

module.exports = function (app) {



  app.route('/api/stock-prices')
    .get(async function (req, res) {
      const { stock, like } = req.query

      // Two stocks
      if (Array.isArray(stock)) {
        const { symbol: symbol1,  latestPrice: latestPrice1 } = await getStocks(stock[0])
        const { symbol: symbol2,  latestPrice: latestPrice2 } = await getStocks(stock[1])

        let stockData = []
       
        if (symbol1 && symbol2) {
          const firstStock = await saveStocks(symbol1, like, req.ip)
          const secondStock = await saveStocks(symbol2, like, req.ip)
          stockData.push({
            stock: symbol1,
            price: latestPrice1,
            rel_likes: firstStock.likes.length - secondStock.likes.length
          })
          stockData.push({
            stock: symbol2,
            price: latestPrice2,
            rel_likes: secondStock.likes.length - firstStock.likes.length
          })
        } else {
          stockData.push({
            error: "invalid symbol",
            rel_likes: 0
          })
        }
        res.json({ stockData })
        return

      }


      // One Stock
      const { symbol, latestPrice } = await getStocks(stock)
      if (!symbol) {
        res.json({
          stockData: { error: "invalid symbol", likes: 0 }
        })
        return
      }
      const data = await saveStocks(symbol, like, req.ip)

      console.log('StockData', data)
      res.json({
        stockData: {
          stock: symbol,
          price: latestPrice,
          likes: data.likes.length
        }
      })

    });

};
