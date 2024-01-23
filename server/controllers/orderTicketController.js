const orderTicketController = {};
const axios = require("axios");

orderTicketController.getPrice = (req, res, next) => {
  console.log("---> ENTERING ORDER TICKET CONTROLLER GET PRICE <---");
  console.log(req.query);
  const url1 = "https://financialmodelingprep.com/api/v3/quote/";
  const ticker = req.query.ticker;
  const url2 = "?apikey=4042057d38554e647177dd356510ed00";
  const dynamicUrl = url1 + ticker + url2;
  // const staticUrl =
  //   'https://financialmodelingprep.com/api/v3/quote/META?apikey=v7vj7VtmFoqsC2wdxnvVhctwVAhs5V8H';
  axios
    .get(dynamicUrl)
    .then((response) => {
      const data = response.data;
      console.log("respose.data: ", response.data);
      const resultData = {
        symbol: data[0].symbol,
        price: data[0].price,
        volume: data[0].volume,
      };
      res.locals.getPrice = resultData;
      return next();
    })
    .catch((err) => {
      return next({
        log: "Error caught in Order Ticket Get Price Middleware",
        status: 500,
        message: { err: "Internal Server Error" },
      });
    });
};

module.exports = orderTicketController;
