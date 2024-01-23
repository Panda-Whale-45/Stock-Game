const portfolioController = {};
const axios = require("axios");
const model = require("../model/model.js");
const Price = require("../model/priceModel.js");

portfolioController.buy = async (req, res, next) => {
  try {
    console.log("---> ENTERING PORTFOLIO CONTROLLER BUY <---");
    const { ticker, priceBought, dateBought, shares, totalCost } = req.body;
    const stock = await model.find({ ticker });
    if (stock.length !== 0) {
      (stock[0].shares += shares), (stock[0].totalCost += totalCost);
      (stock[0].priceBought =
        (stock[0].totalCost + totalCost) / (stock[0].shares + shares)),
        await stock[0].save();
      console.log("Sent to Mongo");
      res.locals.buy = stock[0];
      return next();
    } else {
      const newStock = await model.create({
        ticker,
        priceBought,
        dateBought,
        shares,
        totalCost,
      });
      console.log("Sent to Mongo");
      res.locals.buy = newStock;
      return next();
    }
  } catch (err) {
    return next({
      log: "Error occurred in the portfolio buy controller",
      status: 500,
      message: { err: "An error occurred" },
    });
  }
};

portfolioController.sell = async (req, res, next) => {
  console.log("---> ENTERING PORTFOLIO CONTROLLER SELL <---");
  const { ticker, priceSold, shares, totalCost } = req.body;
  const stock = await model.find({ ticker });
  if (shares < stock[0].shares) {
    (stock[0].shares -= shares),
      (stock[0].totalCost -= stock[0].priceBought * shares),
      await stock[0].save();
    console.log("Sent to Mongo");
    res.locals.sell = stock[0];
    return next();
  } else if (shares === stock[0].shares) {
    await model.deleteOne({ ticker });
    res.locals.sell = stock[0];
    return next();
  } else if (shares > stock[0].shares) {
    next({
      log: "User attempted invalid sell request; not enough stocks owned.",
      status: 403,
      message: "Error: insufficient stock ownership for sell request.",
    });
  }
};

portfolioController.read = async (req, res, next) => {
  console.log("---> ENTERING PORTFOLIO CONTROLLER READ <---");
  try {
    const stockList = await model.find();
    console.log(stockList);
    const priceList = await Price.find();
    res.locals.stockList = [stockList, priceList];
    return next();
  } catch (err) {
    return next({
      log: "Error occurred in the portfolio read controller.",
      status: 500,
      message: { err: "An error occurred." },
    });
  }
};

portfolioController.sync = async (req, res, next) => {
  console.log("---> ENTERING PORTFOLIO CONTROLLER SYNC <---");
  const url1 = "https://financialmodelingprep.com/api/v3/quote/";
  const url2 = "?apikey=4042057d38554e647177dd356510ed00";
  const newData = [];
  try {
    const stockList = await model.find();
    const prices = await Price.find();
    const priceTickers = prices.map((el) => el.ticker);
    newData.push(prices);
    console.log("stock list", stockList);
    console.log("price tickers", priceTickers);
    stockList.forEach((el) => {
      if (!priceTickers.includes(el.ticker)) {
        const dynamicUrl = url1 + el.ticker + url2;
        axios.get(dynamicUrl).then((response) => {
          const data = response.data;
          console.log("logging from portfolioController.sync", data);
          Price.create({
            ticker: data[0].symbol,
            price: data[0].price,
          }).then((data) => {
            newData.push(data);
          });
        });
      }
    });
    console.log(newData);
    res.locals.syncedData = newData;
    return next();
  } catch (err) {
    console.log(err);
    return next({
      log: "Error occurred in the portfolio sync controller.",
      status: 500,
      message: { err: "An error occurred." },
    });
  }
};

module.exports = portfolioController;
