var cppQtGui = process.binding('cpp-qt-gui');

var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed

cppQtGui.registerExitFunc(process.exit);

var emitRequest = function () {
  console.log("Refreshing feeds...")
  var feedparser = new FeedParser([]);
  var req = request('http://feeds.bbci.co.uk/news/world/rss.xml')

  req.on('error', function (error) {
    // catch all request errors but don't handle them in this demo
  });

  req.on('response', function (res) {
    var stream = this; // `this` is `req`, which is a stream

    if (res.statusCode !== 200) {
      this.emit('error', new Error('Bad status code'));
    }
    else {
      cppQtGui.clearFeed();
      stream.pipe(feedparser);
    }
  });

  feedparser.on('error', function (error) {
    // catch all parser errors but don't handle them in this demo
  });

  feedparser.on('readable', function () {
    var stream = this; // `this` is `feedparser`, which is a stream
    var item = stream.read();

    if (item && item['title']) {
      var itemString = item['title'] + '\n' + item['description'];
      cppQtGui.addFeedItem( { item: itemString } );
    }
  });

  feedparser.on('end', function (){
    cppQtGui.redraw();
    setTimeout(emitRequest, 3000);
  });
}

emitRequest();

function processQtEvents() {
    cppQtGui.processQtEvents()
    setTimeout(processQtEvents, 20);
}

processQtEvents();
