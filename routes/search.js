const fetch = require('node-fetch');
const iconv = require('iconv-lite');

const { API_SEARCH, HOST } = require('../config');

module.exports = () => async search => {
  const res = await fetch(API_SEARCH, {
    method: 'POST',
    headers: {
      Origin: HOST,
      Referer: `${HOST}/`,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
    },
    body: `query=${encodeURIComponent(search)}`,
  });

  const html = iconv.decode(await res.buffer(), 'win1251');
  const splitByHref = html.split('<a href="').slice(1, -1);

  return splitByHref.reduce((searchRes, htmlLine) => {
    const [, url] = htmlLine.match(/^(.*?)"/);
    const [, title] = htmlLine.match(/<span class="searchheading">(.*?)<\/span>/);
    const [, description] = htmlLine.match(/<\/span><span>(.*?)<\/span>/);

    searchRes.push({
      description,
      title,
      url,
    });

    return searchRes;
  }, []);
};