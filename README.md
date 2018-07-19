# Simple `kinogo.by` crawler

Runs micro service which accepts several types of requests and returns relevant info taken from `kinogo.by`

This is a study project and it is not intended to be used for commercial purposes

## Get search results by video name

> /?search={query}

Finds serial or film by query string. Response:

```js
Array<{
  description: string,
  title: string,
  url: string,
}>
```

## Get video info

> /?resource={url}

Returns info about video by it's url (can be taken from `search` results). Response can be one of the following:

```js
{
  files: Array<string>,
  poster: string,
  title: string,
  type: 'film'
}
```

```js
{
  poster: string,
  seasons: Array<{
    comment: string,
    playlist: Array<{
      comment: string,
      files: Array<string>
    }>
  }>
  title: string,
  type: 'serial'
}
```

# Run and development

There are several commands to start local web server:

`npm run start` - starts production ready [server](https://github.com/zeit/micro)

`npm run dev` - starts dev [server](https://github.com/zeit/micro-dev) with such useful features as hot reloading, error displaying, etc.
