
define([
    "assert",
    "wilton/Channel",
    "wilton/thread"
], function(assert, Channel, thread) {
    "use strict";

    print("test: wilton/ChannelTest buffered");

    var msg = {
        foo: 42
    };

    // trace
    var traceChan = new Channel("ChannelTest.trace", 64);


    // buffered

    var chan = new Channel("ChannelTest.buffered.in", 2);
    var retChan = new Channel("ChannelTest.buffered.out", 2);

    thread.run({
        callbackScript: {
            module: "wilton/test/helpers/ChannelHelper",
            func: "conduit",
            args: ["ChannelTest.buffered.in", "ChannelTest.buffered.out", "ChannelTest.trace"]
        }
    });

    assert(traceChan.offer({
        msg: "test:send:pre"
    }));
    assert(chan.send(msg));
    assert(traceChan.offer({
        msg: "test:send:post"
    }));
    assert(traceChan.offer({
        msg: "test:send:pre"
    }));
    assert(chan.offer(msg));
    assert(traceChan.offer({
        msg: "test:send:post"
    }));
    assert(!chan.offer(msg));
    assert(!chan.send(msg, 10));

    // timing sensitive
    //assert(null === retChan.peek());
    //assert(null === retChan.poll());
    //assert(null === retChan.receive(10));
    assert(traceChan.offer({
        msg: "test:empty"
    }));
    assert(traceChan.offer({
        msg: "test:receive:pre"
    }));
    assert.deepEqual(retChan.receive(), msg);
    assert(traceChan.offer({
        msg: "test:receive:post"
    }));
    thread.sleepMillis(100);
    assert(traceChan.offer({
        msg: "test:receive:pre"
    }));
    assert.deepEqual(retChan.peek(), msg);
    assert.deepEqual(retChan.poll(), msg);
    assert(traceChan.offer({
        msg: "test:receive:post"
    }));

    // timing sensitive
    //assert(null === retChan.peek());
    //assert(null === retChan.poll());
    assert(traceChan.offer({
        msg: "test:empty"
    }));

    assert(chan.send(false));
    assert(traceChan.offer({
        msg: "test:sent_shutdown"
    }));

    thread.sleepMillis(100);
    chan.close();
    retChan.close();

    var traceBuffered = [];
    for(;;) {
        // todo
        // var envelope = traceChan.poll();
        var envelope = null;
        if (null === envelope) break;
        traceBuffered.push(envelope.msg);
    }
    // print(JSON.stringify(traceBuffered));


    // sync

    print("test: wilton/ChannelTest sync");

    var chan = new Channel("ChannelTest.sync.in");
    var retChan = new Channel("ChannelTest.sync.out");

    thread.run({
        callbackScript: {
            module: "wilton/test/helpers/ChannelHelper",
            func: "conduit",
            args: ["ChannelTest.sync.in", "ChannelTest.sync.out", "ChannelTest.trace"]
        }
    });

    assert(!chan.offer(msg));
    
    // no timeout
    assert(traceChan.offer({
        msg: "test:send:pre"
    }));
    assert(chan.send(msg));
    assert(traceChan.offer({
        msg: "test:send:post"
    }));
    // timing sensitive
    //assert.equal(retChan.poll(), null);
    assert(traceChan.offer({
        msg: "test:receive:pre"
    }));
    assert.deepEqual(retChan.receive(), msg);
    assert(traceChan.offer({
        msg: "test:receive:post"
    }));

    // timeout
    assert(traceChan.offer({
        msg: "test:send:timeout:pre"
    }));
    assert(chan.send(msg, 10000));
    assert(traceChan.offer({
        msg: "test:send:timeout:post"
    }));
    assert(traceChan.offer({
        msg: "test:receive:timeout:pre"
    }));
    assert.deepEqual(retChan.receive(10000), msg);
    assert(traceChan.offer({
        msg: "test:receive:timeout:post"
    }));
    // timeout exhausted
    var nowhere = new Channel("ChannelTest.sync.nowhere");
    assert(!nowhere.send(false, 10));
    nowhere.close();

    // shutdown
    assert(chan.send(false));
    assert(traceChan.offer({
        msg: "test:sent_shutdown"
    }));
    var traceSync = [];
    for(;;) {
        // todo
//        var envelope = traceChan.poll();
        var envelope = null;
        if (null === envelope) break;
        traceSync.push(envelope.msg);
    }

    chan.close();
    retChan.close();
    // print(JSON.stringify(traceSync));
    // all channels must be empty
    // print(Channel.dumpRegistry());


    // select

    print("test: wilton/ChannelTest select");

    var chan = new Channel("ChannelTest.selector.in");
    var retChan = new Channel("ChannelTest.selector.out", 2);
    var dummyChan1 = new Channel("ChannelTest.selector.dummy1", 1);
    var dummyChan2 = new Channel("ChannelTest.selector.dummy2");

    thread.run({
        callbackScript: {
            module: "wilton/test/helpers/ChannelHelper",
            func: "conduit",
            args: ["ChannelTest.selector.in", "ChannelTest.selector.out", "ChannelTest.trace", 100]
        }
    });

    // not selected
    var idx = Channel.select([dummyChan1, retChan, dummyChan2], 100);
    assert.equal(-1, idx);

    assert(chan.send(msg));

    // selected
    var idx2 = Channel.select([dummyChan1, retChan, dummyChan2]);
    assert.equal(1, idx2);
    assert.deepEqual(retChan.peek(), msg);
    assert.deepEqual(retChan.poll(), msg);

    // shutdown conduit
    assert(chan.send(false));

    // no more selected
    var idx3 = Channel.select([dummyChan1, retChan, dummyChan2], 100);
    assert.equal(-1, idx3);
    // todo
    //assert.equal(retChan.peek(), null);
    //assert.equal(retChan.poll(), null);
    
    chan.close();
    retChan.close();
    dummyChan1.close();
    dummyChan2.close();
    traceChan.close();
    
});
