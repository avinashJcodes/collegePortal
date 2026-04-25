const setSidebar = (value) => (req, res, next) => {
  res.locals.hideSidebar = value;
  next();
};


module.exports = { setSidebar };