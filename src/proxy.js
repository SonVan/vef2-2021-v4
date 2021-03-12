// TODO útfæra proxy virkni

import express from 'express';
import fetch from 'node-fetch';
import { get, set } from './cache.js';
import { timerStart, timerEnd } from './time.js';


export const router = express.Router();

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

  if (!data) {
    const timer2 = timerStart();

    await fetch(url)
      .then(res => res.json())
      .then((json) => {
        data = json;
        info.elapsed = timerEnd(timer2);
        info.cached = false;
      }).catch(err => {
        console.error(err);
        return null;
      });
    await set(key, data, 30);
    console.log("New key addded to cache: " + key);
  }

  const returnData = { data, info };

  return res.json(returnData);
});