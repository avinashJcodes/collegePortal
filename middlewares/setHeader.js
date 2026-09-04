const setHeader = (value) => {
  return (req, res, next) => {
    res.locals.showHeader = value;
    next();
  };
};

module.exports = { setHeader };