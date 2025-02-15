const program = require('commander');   //  https://github.com/tj/commander.js
const {clientOpen, Api} = require('./index');
const fs = require('fs');
const startWebServer = require('./web-server').start;

const LOCAL_PORT = 4000;
const HOST = 'localhost';
const PORT = 8001;

const   parseOptions = () => {
    program.option  ('--config <config filename>', 'config file');
    program.option  ('--user <user>',              'user name');
    program.option  ("--password <password>",              "password");
    program.option  ('--host <host>',              'tunnel host');
    program.option  ('--port <port>',              'tunnel port');
    program.option  ('--secure',                   'secure connection');
    program.option  ('--local-port <localPort>',   'local port');
    program.option  ('--re-connect',               're-connect server');
    program.option  ('--web-server',               'start web server');
    program.option  ('--server-config <config filename>', 'web server config file');
    program.option  ('--document-root <path>',     'web server document root');
    program.option  ('--index',                    'list index');
    program.argument('[profileName]',              'profile name', 'default');
    program.parse();

    let opts = program.opts();
    let args = program.args;

    //console.log({opts}, args);
    if  ( opts.config ) {
        try {
            let config = JSON.parse(fs.readFileSync(opts.config, 'utf-8'));
            Object.keys(opts).forEach((key) => {
                    console.log('key', key, opts[key]);
                    config[key] = opts[key];
            });
            if  ( config['profile'] )   {
                profile = config['profile'];
            }
            opts = config;
        } catch (e) {}
    }
    opts['host'] ||= HOST;
    opts['port'] ||= PORT;
    opts['localPort'] ||= LOCAL_PORT;
    opts['reConnect'] ||= false;
    opts['webServer'] ||= false;
    opts['index'] ||= false;
    console.log({opts}, args);

    return  { opts: opts, profile: args[0]};
}

let closed = true;
const   tunnel = (opts, profile) => {
    closed = false;
    //console.log('main');
    let ws = clientOpen(opts.host, opts.port, opts.localPort, opts.secure);
    ws.on('open', () => {
        ws.Api('auth', {
                user: opts.user,
                password:  opts.password
            },
            (body) => {
                console.log('body', body);
                if  ( body.status == 'OK')  {
                    session_id = body.id;
                    ws.Api('start', {
                            name: profile
                        },
                        (body) => {
                            if  ( body.status != 'OK')  {
                                console.log(`can not start ${profile}`);
                                console.log('error:', body.error);
                                ws.close();
                            } else {
                                console.log(`start ${profile}`);
                            }
                        });
                } else {
                    console.log('authentication fail');
                    ws.close();
                }
            });
        });
    ws.on('close', () => {
        //console.log('closed');
        closed = true;
    })
    return  (ws);
}

const   main = () => {
    let {opts, profile} = parseOptions();
    if  ( opts.webServer )  {
        let config = {};
        if  ( opts.serverConfig )   {
            config = JSON.parse(fs.readFileSync(opts.serverConfig, 'utf-8'));
            opts.documentRoot ||= config['public'];
        } else {
            config['directoryListing'] = opts.index;
        }
        startWebServer(opts.localPort, opts.documentRoot, config);
    }
    if  ( opts.reConnect )  {
        setInterval(() => {
            if  ( closed )  {
                try {
                    tunnel(opts, profile);
                } catch (e) {
                    console.log('error', e);
                }
            }
        }, 1000);
    } else {
        tunnel(opts, profile);
    }
}

main();
