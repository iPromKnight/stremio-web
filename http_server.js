#!/usr/bin/env node

// Copyright (C) 2017-2023 Smart code 203358507

const INDEX_CACHE = 7200;
const ASSETS_CACHE = 2629744;
const HTTP_PORT = 8080;

const express = require('express');
const path = require('path');
const fs = require("node:fs");

const build_path = path.resolve(__dirname, 'build');
const index_path = path.join(build_path, 'index.html');
const patched_marker = '<!-- CONFIG INJECTED -->';

fs.readFile(index_path, 'utf8', (err, html) => {
    if (err) {
        console.error('Failed to read index.html:', err);
        process.exit(1);
    }

    if (!html.includes(patched_marker)) {
        const runtimeConfig = {
            API_ENDPOINT: process.env.API_ENDPOINT || 'https://api.strem.io',
            API_KEY: process.env.API_KEY || null,
        };

        console.log('Patching index.html with runtimeConfig:', runtimeConfig);

        const script = `<script>window.RUNTIME_CONFIG = ${JSON.stringify(runtimeConfig)};</script>`;
        const injectedHtml = html.replace('</head>', `${script}\n${patched_marker}\n</head>`);

        fs.writeFile(index_path, injectedHtml, 'utf8', (writeErr) => {
            if (writeErr) {
                console.error('Failed to patch index.html:', writeErr);
                process.exit(1);
            }
            console.log('index.html patched successfully!');
        });
    } else {
        console.log('index.html already patched, skipping...');
    }
});

express().use(express.static(build_path, {
    setHeaders: (res, path) => {
        if (path === index_path) res.set('cache-control', `public, max-age: ${INDEX_CACHE}`);
        else res.set('cache-control', `public, max-age: ${ASSETS_CACHE}`);
    }
})).all('*', (_req, res) => {
    // TODO: better 404 page
    res.status(404).send('<h1>404! Page not found</h1>');
}).listen(HTTP_PORT, () => console.info(`Server listening on port: ${HTTP_PORT}`));
