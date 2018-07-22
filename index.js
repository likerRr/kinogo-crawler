const mQuery = require('micro-query');
const { send } = require('micro');

const resourceRoute = require('./routes/resource');
const searchRoute = require('./routes/search');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { resource, search } = mQuery(req);

  if (resource) {
    return resourceRoute(req, res)(resource);
  }

  if (search) {
    return searchRoute(req, res)(search);
  }

  return send(res, 405);
};