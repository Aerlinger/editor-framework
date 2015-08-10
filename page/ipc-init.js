(function () {

var Ipc = require('ipc');

var _nextSessionId = 1000;
var _replyCallbacks = {};

var _channel2replyInfo = {};

require('../share/ipc-init');

// Messages

Ipc.on('editor:sendreq2core:reply', function replyCallback (args, sessionId) {
    'use strict';
    var key = '' + sessionId;
    var cb = _replyCallbacks[key];
    if (cb) {
        cb.apply(null, args);

        //if (sessionId + 1 === _nextSessionId) {
        //    --_nextSessionId;
        //}
        delete _replyCallbacks[key];
    }
    // else {
    //     Editor.error('non-exists callback of session:', sessionId);
    // }
});

Ipc.on('editor:send2panel', function () {
    Editor.Panel.dispatch.apply(Editor.Panel,arguments);
});

Ipc.on('editor:sendreq2page', function (request, args, sessionId) {
    var called = false;
    function replyCallback () {
        if ( !called ) {
            called = true;
            Ipc.send( 'editor:sendreq2page:reply', [].slice.call(arguments), sessionId );
        }
        else {
            Editor.error('The callback which reply to "%s" can only be called once!', request);
        }
    }

    args.unshift(request, replyCallback);
    if ( !Ipc.emit.apply(Ipc, args) ) {
        Editor.error('The listener of request "%s" is not yet registered!', request);
    }
});

// Communication Patterns

/**
 * Send message to core-level synchronized and return a result which is responded from core-level
 * @method sendToCoreSync
 * @param {string} message - the message to send
 * @param {...*} [arg] - whatever arguments the message needs
 * @return results
 */
Editor.sendToCoreSync = function ( message ) {
    'use strict';
    if ( typeof message === 'string' ) {
        var args = [].slice.call( arguments );
        return Ipc.sendSync.apply( Ipc, [message].concat(args) );
    }
    else {
        Editor.error('The message must be provided');
    }
};

/**
 * Send message to editor-core, which is so called as main app, or atom shell's browser side.
 * @method sendToCore
 * @param {string} message - the message to send
 * @param {...*} [arg] - whatever arguments the message needs
 */
Editor.sendToCore = function ( message ) {
    'use strict';
    if ( typeof message === 'string' ) {
        var args = [].slice.call( arguments );
        Ipc.send.apply( Ipc, ['editor:send2core'].concat( args ) );
    }
    else {
        Editor.error('The message must be provided');
    }
};

/**
 * Broadcast message to all pages.
 * The page is so called as atom shell's web side. Each application window is an independent page and has its own JavaScript context.
 * @method sendToWindows
 * @param {string} message - the message to send
 * @param {...*} [arg] - whatever arguments the message needs
 * @param {object} [options] - you can indicate the options such as Editor.selfExcluded
 */
Editor.sendToWindows = function ( message ) {
    'use strict';
    if ( typeof message === 'string' ) {
        var args = [].slice.call( arguments );
        Ipc.send.apply( Ipc, ['editor:send2wins'].concat( args ) );
    }
    else {
        Editor.error('The message must be provided');
    }
};

/**
 * Broadcast message to main page.
 * The page is so called as atom shell's web side. Each application window is an independent page and has its own JavaScript context.
 * @method sendToMainWindow
 * @param {string} message - the message to send
 * @param {...*} [arg] - whatever arguments the message needs
 */
Editor.sendToMainWindow = function ( message ) {
    'use strict';
    if ( typeof message === 'string' ) {
        var args = [].slice.call( arguments );
        Ipc.send.apply( Ipc, ['editor:send2mainwin'].concat( args ) );
    }
    else {
        Editor.error('The message must be provided');
    }
};

/**
 * Broadcast message to all pages and editor-core
 * @method sendToAll
 * @param {string} message - the message to send
 * @param {...*} [arg] - whatever arguments the message needs
 * @param {object} [options] - you can indicate the options such as Editor.selfExcluded
 */
Editor.sendToAll = function ( message ) {
    'use strict';
    if ( typeof message === 'string' ) {
        var args = [].slice.call( arguments );
        Ipc.send.apply( Ipc, ['editor:send2all'].concat( args ) );
    }
    else {
        Editor.error('The message must be provided');
    }
};

/**
 * Send message to specific panel
 * @method sendToPanel
 * @param {string} panelID - the panel id
 * @param {string} message - the message to send
 * @param {...*} [arg] - whatever arguments the message needs
 */
Editor.sendToPanel = function ( panelID, message ) {
    'use strict';
    if ( typeof message === 'string' ) {
        var args = [].slice.call( arguments );
        Ipc.send.apply( Ipc, ['editor:send2panel'].concat( args ) );
    }
    else {
        Editor.error('The message must be provided');
    }
};

/**
 * Send `args...` to core via `channel` in asynchronous message, and waiting for the `core-level`
 * to reply the message through `callback`.
 * @method sendRequestToCore
 * @param {string} channel - the request message channel
 * @param {...*} [arg] - whatever arguments the request needs
 * @param {function} reply - the callback used to handle replied arguments
 * @return {number} - session id, can be used in Editor.cancelRequestToCore
 */
Editor.sendRequestToCore = function (request) {
    'use strict';
    if (typeof request === 'string') {
        var args = [].slice.call(arguments, 1);
        var reply = args[args.length - 1];
        if (typeof reply === 'function') {
            args.pop();

            var sessionId = _nextSessionId++;
            var key = '' + sessionId;
            _replyCallbacks[key] = reply;

            Ipc.send('editor:sendreq2core', request, args, sessionId);
            return sessionId;
        }
        else {
            Editor.error('The reply must be of type function');
        }
    }
    else {
        Editor.error('The request must be of type string');
    }
    return null;
};

/**
 * Cancel request sent to core by sessionId
 * @method cancelRequestToCore
 */
Editor.cancelRequestToCore = function (sessionId) {
    'use strict';
    var key = '' + sessionId;
    var cb = _replyCallbacks[key];
    if ( cb ) {
        delete _replyCallbacks[key];
    }
};

/**
 * Send `args...` to core via `channel` in asynchronous message, and waiting for the `page-level` panel
 * to reply the message through `callback`.
 * @method waitForPanelReply
 * @param {string} channel - the request message channel
 * @param {...*} [arg] - whatever arguments the request needs
 * @param {function} reply - the callback used to handle replied arguments
 * @return {number} - session id, can be used in Editor.cancelRequestToCore
 */
Editor.waitForPanelReply = function (request) {
    'use strict';
    if (typeof request === 'string') {
        var args = [].slice.call(arguments, 0);
        var reply = args[args.length - 1];
        if (typeof reply === 'function') {
            args.pop();

            var info = _channel2replyInfo[request];

            if ( !info ) {
                var requestReply = request+':reply';
                _channel2replyInfo[request] = {
                    nextSessionId: 1000,
                    callbacks: {},
                };
            }

            var sessionId = _nextSessionId++;
            var key = '' + sessionId;
            _replyCallbacks[key] = reply;

            // Ipc.send('editor:sendreq2core', request, args, sessionId);
            Editor.Panel.dispatch.apply( Editor.Panel, args, sessionId );
            return sessionId;
        }
        else {
            Editor.error('The reply must be of type function');
        }
    }
    else {
        Editor.error('The request must be of type string');
    }
    return null;
};

})();
