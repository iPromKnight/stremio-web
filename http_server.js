#!/usr/bin/env node

// Copyright (C) 2017-2023 Smart code 203358507

const INDEX_CACHE = 7200;
const ASSETS_CACHE = 2629744;
const HTTP_PORT = 8080;

const express = require('express');
const path = require('path');
const fs = require("node:fs");
const cookieParser = require("cookie-parser");

const build_path = path.resolve(__dirname, 'build');
const index_path = path.join(build_path, 'index.html');
const login_path = path.join(build_path, 'login.html');
const patched_marker = '<!-- CONFIG INJECTED -->';
const WEB_AUTH_KEY = process.env.WEB_AUTH_KEY;

if (!WEB_AUTH_KEY) {
    console.error('WEB_AUTH_KEY is required to be set in the environment!');
    process.exit(1);
}

console.log('WEB_AUTH_KEY:', WEB_AUTH_KEY);

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// ==========================
// Authentication Middleware
// ==========================
function webAuth(req, res, next) {
    const authKey =
        req.query.auth ||
        req.cookies.authToken ||
        req.headers['authorization']?.split(' ')[1];

    if (authKey === WEB_AUTH_KEY) {
        console.log('User authenticated successfully');
        return next();  // Auth successful
    }

    console.log('Unauthorized access attempt to:', req.originalUrl);
    res.redirect('/login');  // Redirect to login page if not authenticated
}() => console.info(`Server listening on port: ${HTTP_PORT}`);

// ==========================
// Check if authenticated
// ==========================
function checkAuth(req) {
    const authKey =
        req.cookies.authToken ||
        req.headers['authorization']?.split(' ')[1];

    return authKey === WEB_AUTH_KEY;
}


// ==========================
// Login Route - Handle POST
// ==========================
app.post('/api/login', (req, res) => {
    const { auth_key } = req.body;  // Correctly parsed form data

    if (auth_key === WEB_AUTH_KEY) {
        res.cookie('authToken', WEB_AUTH_KEY, { httpOnly: true });
        console.log('Login successful');
        return res.redirect('/');
    }

    console.log('Invalid login attempt');
    res.status(401).send('Invalid Web Auth Key');
});

// ==========================
// Serve Login Page (GET /login)
// ==========================
app.get('/login', (req, res) => {
    res.set('Cache-Control', 'no-store');
    fs.readFile(login_path, 'utf8', (err, html) => {
        if (err) {
            console.error('Failed to load login.html:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.send(html);
    });
});

// ==========================
// Protect Root (Serve index.html Only If Authenticated)
// ==========================
app.get('/', webAuth, (req, res) => {
    res.sendFile(index_path);
});

// ==========================
// Serve Static Assets (JS/CSS) with conditional caching
// ==========================
app.use(express.static(build_path, {
    setHeaders: (res, filePath) => {
        const isAuthenticated = checkAuth(res.req);

        if (filePath === index_path) {
            if (isAuthenticated) {
                res.set('Cache-Control', `public, max-age=${INDEX_CACHE}`);
            } else {
                res.set('Cache-Control', 'no-store');
            }
        } else {
            res.set('Cache-Control', `public, max-age=${ASSETS_CACHE}`);
        }
    }
}));


// ==========================
// 404 Handler for Unknown Routes
// ==========================
app.all('*', (_req, res) => {
    res.status(404).send('<h1>404! Page not found</h1>');
});

// ==========================
// Start the Server
// ==========================
app.listen(HTTP_PORT, () => {
    console.info(`Server listening on port: ${HTTP_PORT}`);
});
