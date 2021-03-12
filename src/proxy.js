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

function timerStart() {
  return process.hrtime();
}

function timerEnd(time) {
  const diff = process.hrtime(time);
  const elapsed = diff[0] * 1e9 + diff[1];
  const elapsedAsSeconds = elapsed / 1e9;

  return Number(elapsedAsSeconds.toFixed(4));
}



router.get('/proxy', (req, res) => {
  proxy(req, res);
});

async function fetchUSGS(url) {
  var response;

  await fetch(url)
    .then(res => res.json())
    .then((result) => {
      response = res.json(result);
    }).catch(err => {
      console.error(err);
      return null;
    });

  return response;
}

async function proxy(req, res) {
  const period = req.query.period;
  const type = req.query.type;
  const url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${type}_${period}.geojson`;

  await fetch(url)
    .then(res => res.json())
    .then((json) => {
      const data = res.json(json);
      console.log(json);
    }).catch(err => {
      console.error(err);
      return null;
    });


  //data = await fetchUSGS(url);
  
/*
  if (data) {
    const set = await asyncSet('foo', data, 'EX', 2);
    console.log('set = ', set);
    const get = await asyncGet('foo');
    console.log('get = ', get);
  }*/
}