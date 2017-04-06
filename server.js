'use strict';

const apikey = process.env.BING_ACCOUNT_KEY;
const port = process.env.PORT;

const express = require('express');
const url = require('url');
const Bing = require('node-bing-api')({accKey: apikey});

const app = express();

/**
 *  Image Search with Bing
 */
app.get('/api/imagesearch/:query', (req, res) => {
    res.send('hi');
});

/**
 * Show latest searches
 */
app.get('/api/latest/imagesearch', (req, res) => {
    res.send('hi');
});

app.listen(port, () => {
    console.log(`Server is listening to port ${port}`); 
});