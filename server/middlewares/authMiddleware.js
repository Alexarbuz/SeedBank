const jwt = require('jsonwebtoken');

module.exports = function (roles = []) {
  return async (req, res, next) => {
    if (req.method === 'OPTIONS') return next();
    
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ message: 'Не авторизован' });

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.account = decoded; // Записываем данные пользователя в req.account
      
      // Проверка роли, если roles переданы
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Доступ запрещен' });
      }
      
      next();
    } catch (e) {
      res.status(401).json({ message: 'Не авторизован' });
    }
  };
};