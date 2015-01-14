var http     = require('http')
var ecstatic = require('ecstatic')(__dirname + '/static')
var body     = require('body/any')
var xtend    = require('xtend')
var trumpet  = require('trumpet')
var through  = require('through2')
var encode   = require('he').encode
var fs       = require('fs')
var path     = require('path')

var router = require('routes')();
router.addRoute('/', (req, res, params) =>
    layout(res).end('Welcome!')
)

router.addRoute('/hello/:name', (req, res, params) =>
    layout(res).end('hello there, ' + encode(params.name))
)


var server = http.createServer( (req, res) => {
    var m = router.match(req.url)
    if (m) m.fn(req, res, m.params);
    else ecstatic(req, res)
})

server.listen(8000, '127.0.0.1')
console.log('running at: http://localhost:8000')

function post (fn) {
    return (req, res, params) => {
        if (req.method !== 'POST') {
            res.statusCode = 400;
            res.end('not a POST\n');
        }
        body(req, res, (err, pvars) => {
            fn(req, res, xtend(pvars, params));
        });
    };
}

function layout (res) {
    res.setHeader('content-type', 'text/html');
    var tr = trumpet();
    read('layout.html').pipe(tr).pipe(res);
    return tr.createWriteStream('#body');
}

function read (file) {
    return fs.createReadStream(path.join(__dirname, 'static', file));
}
