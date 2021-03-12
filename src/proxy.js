// TODO útfæra proxy virkni

import express from 'express';
import fetch from 'node-fetch';
import { get, set } from './cache.js';

export const router = express.Router();



function timerStart() {
  return process.hrtime();
}

function timerEnd(time) {
  const diff = process.hrtime(time);
  const elapsed = diff[0] * 1e9 + diff[1];
  const elapsedAsSeconds = elapsed / 1e9;

  return Number(elapsedAsSeconds.toFixed(4));
}







router.get('/proxy', async (req, res) => {
  const period = req.query.period;
  const type = req.query.type;
  const key = type + "_" + period;
  const url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${type}_${period}.geojson`;

  var data;
  var info = {
    cached: '',
    elapsed: ''
  };


  const timer1 = timerStart();
  data = await get(key);
  info.elapsed = timerEnd(timer1);
  info.cached = true;

  if (data === null) {
    const timer2 = timerStart();

    await fetch(url)
      .then(res => res.json())
      .then((json) => {
        data = json;
      }).catch(err => {
        console.error(err);
        return null;
      });
    info.elapsed = timerEnd(timer2);
    info.cached = false;
    await set(key, data, 20);
  }

  const returnData = { data, info };

  return res.json(returnData);
});