module.exports = function (allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.account.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Недостаточно прав'
      });
    }
    next();
  };
};