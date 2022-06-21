module.exports.corsAllowed = (req, res, next) => {
  const { origin } = req.headers;
  const allowedCors = [
    'https://aver.nomoreparties.sbs',
    'http://aver.nomoreparties.sbs',
    'https://api.aver.nomoreparties.sbs',
    'http://api.aver.nomoreparties.sbs',
    'localhost:3000',
  ];

  const { method } = req;

  const requestHeaders = req.headers['access-control-request-headers'];
  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';

  if (allowedCors.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  if (method === 'OPTIONS') {
    res.header('Access-Control-Allow-Headers', requestHeaders);
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
    return res.end();
  }
  return next();
};
