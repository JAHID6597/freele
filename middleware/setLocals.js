const moment = require("moment");
const cheerio = require("cheerio");

const setLocals = async (req, res, next) => {
  res.locals.isLogin = req.session.isLogin;
  res.locals.isLoginAdmin = req.session.isLoginAdmin;
  res.locals.sUser = req.session.sUser;

  res.locals.moment = (time) =>
    moment(time).format("dddd, MMMM Do YYYY, h:mm:ss a");

  res.locals.momentFormatMonthDayYear = (time) => moment(time).format('L');

  res.locals.momentTimeFromNow = (time) => {
    return moment(time).fromNow();
  };

  res.locals.momentCurrentYear = () => {
    return moment().format('YYYY');
  }

  res.locals.truncate = (html) => {
    let value = cheerio.load(html);
    let text = value.text();
    text = text.replace(/(\r\n|\n|\r)/gm, "");
    return text.substr(0, 100) + " ...";
  };

  // COUNT DOWN TIMER
  res.locals.countDownTimer = (createDate, duration) => {
    return moment(createDate).add(duration, "days");
  };

  next();
};

module.exports = setLocals;
