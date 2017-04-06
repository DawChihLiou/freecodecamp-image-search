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
app.get('/api/imagesearch/:search', (req, res) => {
    const searchParams = req.params.search;
    const searchOffset = req.query.offset;
    const data = [];
    
    Bing.images(searchParams, {
        count: 10,
        offset: searchOffset || 0
    }, (err, resp, body) => {
        if (err) console.error(`Unable to fetch image data ${err}`);
        
        for (const v of body.value) {
            const img = {
                url: v.contentUrl,
                snippet: v.name,
                thumbnail: v.thumbnailUrl,
                context: v.contentUrl
            };
            data.push(img);
        }
        
        res.send(data);
    });
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