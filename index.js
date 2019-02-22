'use strict'

const fs = require('fs');
const path = require('path');

async function existsAsync(filepath) {
    return new Promise((resolve) => {
        fs.access(filepath, (err) => {
            if (err) {
                resolve(false);
            }
            else {
                resolve(true);
            }
        });
    });
}

async function statAsync(filepath) {
    return new Promise((resolve) => {
        fs.stat(filepath, (err, stats) => {
            if (err) {
                resolve(null);
            }
            else {
                resolve(stats);
            }
        })
    });
}

async function mkdirAsync(dirpath, mode) {
    return new Promise((resolve, reject) => {
        fs.mkdir(dirpath, mode, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(true);
            }
        })
    });
}

async function rmdirAsync(dirpath) {
    return new Promise((resolve, reject) => {
        fs.rmdir(dirpath, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(true);
            }
        })
    });
}

async function rmdirRecursiveAsync(dirpath) {
    let files = await readDirAsync(dirpath);
    for (let i in files) {
        let currentPath = path.join(dirpath, files[i]);
        let stats = await statAsync(currentPath);
        if (stats.isDirectory()) {
            await rmdirRecursiveAsync(currentPath);
            await rmdirAsync(currentPath);
        }
        else {
            await unlinkAsync(currentPath);
        }
    }
    return;
}

async function providePathAsync(filepath, mode) {
    let paths = filepath.split(path.sep);
    let currentPath = '';
    for (let i = 0; i < paths.length - 1; i++) {
        currentPath = path.join(currentPath, paths[i]);
        let stats = await statAsync(currentPath);
        if (!stats) {
            await mkdirAsync(currentPath, mode);
        }
        else if (!(stats.isDirectory())) {
            throw new Error('Not a directory error');
        }
    }
    return true;
}

async function writeFileAsync(filepath, data, options) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filepath, data, options, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(true);
            }
        })
    });
}

async function readFileAsync(filepath, options) {
    return new Promise((resolve, reject) => {
        fs.readFile(filepath, options, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        })
    });
}

async function readDirAsync(dirpath, options) {
    return new Promise((resolve, reject) => {
        fs.readdir(dirpath, options, (err, files) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(files);
            }
        })
    });
}

async function readDirRecursiveSubs(resArray, dirpath, subpath, options) {
    let currentDir = path.join(dirpath, subpath);
    let files = await readDirAsync(currentDir, options);
    for (let i in files) {
        let currentPath = path.join(currentDir, files[i]);
        let stats = await statAsync(currentPath);
        if (stats.isDirectory()) {
            await readDirRecursiveSubs(resArray, dirpath, path.join(subpath, files[i]), options);
        }
        else {
            resArray.push(path.join(subpath, files[i]));
        }
    }
    return;
}

async function readDirRecursiveAsync(dirpath, options) {
    let resArray = [];
    await readDirRecursiveSubs(resArray, dirpath, '', options);
    return resArray;
}

async function unlinkAsync(filpath) {
    return new Promise((resolve, reject) => {
        fs.unlink(filpath, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(true);
            }
        })
    });
}

module.exports = {
    existsAsync,
    statAsync,
    mkdirAsync,
    rmdirAsync,
    rmdirRecursiveAsync,
    providePathAsync,
    writeFileAsync,
    readFileAsync,
    readDirAsync,
    readDirRecursiveAsync,
    unlinkAsync
}
