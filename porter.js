#!/usr/bin/env node

/** 
 * AddMusicY Made Easy (for porters)
 * Author: tcdw
 * Version: 1.0.1
 * License: MIT
 */

'use strict';

const version = '1.0.1';
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const argv = process.argv.slice(2);

if (argv.length < 1) {
    console.error('usage: porter.js mml_txt');
    process.exit(1);
}

// https://github.com/pwnall/node-open/blob/master/lib/open.js
const open = (target, appName, callback) => {
    const escape = (s) => {
        return s.replace(/"/g, '\\\"');
    }
    let opener;
    if (typeof appName === 'function') {
        callback = appName;
        appName = null;
    }
    switch (process.platform) {
        case 'darwin':
            if (appName) {
                opener = 'open -a "' + escape(appName) + '"';
            } else {
                opener = 'open';
            }
            break;
        case 'win32':
            if (appName) {
                opener = 'start "" "' + escape(appName) + '"';
            } else {
                opener = 'start ""';
            }
            break;
        default:
            if (appName) {
                opener = escape(appName);
            } else {
                opener = path.join(__dirname, '../vendor/xdg-open');
            }
            break;
    }
    if (process.env.SUDO_USER) {
        opener = 'sudo -u ' + process.env.SUDO_USER + ' ' + opener;
    }
    return exec(opener + ' "' + escape(target) + '"', callback);
}

const writeSPC = () => {
    const template = fs.readFileSync(path.resolve(__dirname, 'template.spc'));
    const source = fs.readFileSync(path.resolve(__dirname, 'mml.bin'));
    const offset = 0x100;
    let current = 0;

    console.log('\n[Byte writing]');
    while (current < source.length) {
        const length = source.readUInt16LE(current);
        const target = source.readUInt16LE(current + 2);
        let written = 0;
        console.log(`Going to write \x1b[93m${length}\x1b[0m bytes to position \x1b[93m${target}\x1b[0m`);
        current += 4;
        while (written < length) {
            template.writeUInt8(source.readUInt8(current + written), target + written + offset);
            written++;
        }
        current += written;
    }

    const text = fs.readFileSync(path.resolve(process.cwd(), argv[0]), { encoding: 'utf8' });
    const comments = text.split(';');
    const realComments = comments.map((e) => {
        return e.split('\n')[0].trim();
    });

    const pad = (s, len) => {
        const str = String(s);
        if (str.length >= len) {
            return str;
        }
        return '0'.repeat(len - str.length) + str;
    }

    const writeStrings = (str, pos, maxlen) => {
        const buffer = Buffer.from(str, { encoding: 'utf8' });
        if (buffer.length > maxlen) {
            console.warn('Warning: String \x1b[93m"' + str + '"\x1b[0m has more than \x1b[93m' + maxlen + '\x1b[0m bytes. All of extra bytes will be cut.');
        }
        for (let i = 0; i < maxlen; i++) {
            template.writeUInt8(i >= buffer.length ? 0 : buffer.readUInt8(i), pos + i);
        }
    };

    console.log('\n[ID666 Tag Writing]');
    realComments.forEach((e) => {
        if (e[0] === '@' && e[1] === '@') {
            const str = e.slice(2);
            const { index } = /[\s\uFEFF\xA0]+/g.exec(str);
            const key = str.slice(0, index);
            const value = str.slice(index).trim();
            console.log(key + ': ' + value);
            switch (key) {
                case 'title':
                    writeStrings(value, 0x2E, 32);
                    break;
                case 'game':
                    writeStrings(value, 0x4E, 32);
                    break;
                case 'dumper':
                    writeStrings(value, 0x6E, 16);
                    break;
                case 'comments':
                    writeStrings(value, 0x7E, 32);
                    break;
                case 'artist':
                    writeStrings(value, 0xB1, 32);
                    break;
                case 'length':
                    writeStrings(pad(value, 3), 0xA9, 3);
                    break;
                case 'fadeout':
                    const realNum = Math.floor(Number(value) * 1000);
                    writeStrings(pad(isNaN(realNum) ? 6666 : realNum, 5), 0xAC, 5);
                break;
                default:
                    break;
            }
        }
    });
    // Date SPC was dumped (MM/DD/YYYY)
    const now = new Date();
    writeStrings(pad(now.getMonth() + 1, 2) + "/" + pad(now.getDate(), 2) + "/" + now.getFullYear(), 0x9E, 11);

    const spcPath = path.resolve(process.cwd(), 'output.spc');
    fs.writeFileSync(spcPath, template);
    return spcPath;
}

console.log('\nAddMusicY Made Easy (for porters) ' + version + ' by tcdw\n');
console.log('[Compiling MML to BIN with AddMusicY]');

// https://stackoverflow.com/questions/13230370/nodejs-child-process-write-to-stdin-from-an-already-initialised-process
const child = spawn(path.resolve(__dirname, 'AddMusicY_beta.exe'));
child.stdin.setEncoding('utf-8');
child.stdout.pipe(process.stdout);
child.stdin.write(argv[0] + "\n");
child.stdin.end();
child.on('close', (code) => {
    console.log(`AddMusicY exited with code ${code}`);
    const spcPath = writeSPC();
    open(spcPath);
});
