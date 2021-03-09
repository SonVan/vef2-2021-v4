// TODO útfæra proxy virkni

import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import redis from 'redis';
import util from 'util';

export const router = express.Router();

dotenv.config();

const {
  REDIS_URL: redisUrl,
} = process.env;

if (!redisUrl) {
  console.error('Vantar gögn í env');
  process.exit(1);
}

const client = redis.createClient(redisUrl);

const asyncGet = util.promisify(client.get).bind(client);
const asyncSet = util.promisify(client.set).bind(client);


/**
 * Higher-order fall sem umlykur async middleware með villumeðhöndlun.
 *
 * @param {function} fn Middleware sem grípa á villur fyrir
 * @returns {function} Middleware með villumeðhöndlun
 */
function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

async function proxy(req, res) {
  /*
  const period = req.query.period;
  const type = req.query.type;

  const url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${type}_${period}.geojson`;

  fetch(url)
    .then(res => res.json())
    .then((out) => {
        console.log(out);
  }).catch(err => console.error(err));

  return res.render('index');*/

  const set = await asyncSet('foo', 'bar', 'EX', 2);
  console.log('set = ', set);
  const get = await asyncGet('foo');
  console.log('get = ', get);

  setTimeout(async () => {
    const getResult = await asyncGet('foo');
    console.log('get = ', getResult);
    client.quit();
  }, 2100);

  return "hello!";
}


router.get('/proxy', catchErrors(proxy));


