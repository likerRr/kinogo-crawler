const fetch = require('node-fetch');
const iconv = require('iconv-lite');

const { HOST } = require('../config');

const MATCHER = {
  allInnerText: /<.+?>(.+)<\/.+?>/g,
  allBr: /<br\/>/g,
  film: /"file" {2}: "(.*?)"/,
  poster: /<link rel="image_src" href="(.+?)" \/>/,
  seasons: /seasons = (\[.*])/,
  title: /<meta property="og:title" content="(.+?)" \/>/,
};

const RESPONSE_TYPE = {
  FILM: 'film',
  SERIAL: 'serial',
};

module.exports = () => async resource => {
  const res = await fetch(resource);
  const html = iconv.decode(await res.buffer(), 'win1251');
  const files = matchFirst(html, MATCHER.film, files => files.split(','));
  const title = matchFirst(html, MATCHER.title);
  const poster = matchFirst(html, MATCHER.poster, gluePosterHost);

  if (files) {
    fix720resolution(files);

    return {
      files,
      poster,
      title,
      type: RESPONSE_TYPE.FILM,
    }
  }

  const seasonsJsObject = matchFirst(html, MATCHER.seasons);
  const seasonsJsonObject = seasonsJsObject.replace(/'/g, '"');
  const seasonsObj = JSON.parse(seasonsJsonObject);

  const seasons = fixSeasonsObject(seasonsObj);

  return {
    poster,
    seasons,
    title,
    type: RESPONSE_TYPE.SERIAL,
  };
};

function fixSeasonsObject(seasonsOrSeason) {
  // If there are seasons, then "playlist" property presented
  const isSingleSeason = !seasonsOrSeason[0].playlist;
  let seasons;

  if (isSingleSeason) {
    seasons = [{
      comment: '1 Сезон',
      playlist: seasonsOrSeason,
    }];
  } else {
    seasons = seasonsOrSeason;
  }

  seasons.forEach(season => {
    season.playlist.forEach(series => {
      // Replace html tags
      series.comment = series.comment
        .replace(MATCHER.allBr, ' ')
        .replace(MATCHER.allInnerText, '$1');


      const files = series.file.split(', ');

      fix720resolution(files);
      mapFiles(files);

      delete series.file;

      series.files = files;
    })
  });

  return seasons;
}

function mapFiles(files) {
  for (let i = 0; i < files.length; i++) {
    files[i] = {
      name: files[i],
      quality: matchFirst(files[i], /\/(\d+)\./, parseInt),
    }
  }
}

/**
 * Fixes bug when last and penult files are for 480p instead of 480p and 720p
 * @param files
 */
function fix720resolution(files) {
  const last = files[files.length - 1];
  const penult = files[files.length - 2];
  const lastIs480 = last.indexOf('/480.') !== 0;
  const penultIs480 = penult.indexOf('/480.') !== 0;

  if (lastIs480 && penultIs480) {
    files.splice(-1, 1, last.replace('/480.', '/720.'))
  }

  return files;
}

function mapMatch(str, matcher, map) {
  const found = str.match(matcher);

  return (found && map) ? map(found) : found;
}

function matchFirst(str, matcher, map) {
  return mapMatch(str, matcher, match => {
    const firstMatch = match[1];

    return map ? map(firstMatch) : firstMatch;
  });
}

function gluePosterHost(poster) {
  if (poster.startsWith('/')) {
    return `${HOST}${poster}`;
  }

  return poster;
}
