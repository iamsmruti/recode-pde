#!/usr/bin/env node
const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const chokidar = require('chokidar');
const path = require('path');
const kill = require('tree-kill');


class Processing_Hotreloader {
    constructor() {
        this.__init__();
    }

    __init__ = () => {
        this.args = process.argv;
        this.fileName = this.args[2];
        this.cwd = process.cwd();
        this.watchPaths = [
            path.join(this.cwd, "/**/*.pde")
        ];
        this.ignoredPaths = "**/node_modules/*";

        this.reload();
        this.startWatching();
        this.listeningEvents();
    }

    reload = () => {
        if (this.nodeServer) {
            kill(this.nodeServer.pid);
            exec('killall java', (err, stdout, stderr) => {
                this.nodeServer = spawn('processing-java', [`--sketch=${this.cwd}`, "--run"], { stdio: [process.stdin, process.stdout, process.stderr] });
            })
        } else 
            this.nodeServer = spawn('processing-java', [`--sketch=${this.cwd}`, "--run"], { stdio: [process.stdin, process.stdout, process.stderr] });
    }


    startWatching = () => {
        chokidar.watch(this.watchPaths, {
            ignored: this.ignoredPaths,
            ignoreInitial: true
        }).on('all', (event, path) => {
            this.reload();
        });
    }

    listeningEvents = () => {
        // listening on CLI input
        process.stdin.on("data", (chunk) => {
            let cliInput = chunk.toString();
            switch (cliInput) {
                case 'rs\n':
                    this.reload();
                    break
            }
        });
    }
}


new Processing_Hotreloader();