var _inspecting = false;
var _maskEL;

var _webviewEL = function ( el ) {
    if ( !el ) return null;

    if ( el.tagName === 'WEBVIEW' )
        return el;

    if ( el.parentNode.host && el.parentNode.host.tagName === 'WEBVIEW' )
        return el.parentNode.host;

    return null;
};

var _inspectOFF = function () {
    _inspecting = false;
    _maskEL.remove();
    _maskEL = null;

    window.removeEventListener('mousemove', _mousemove, true);
    window.removeEventListener('mousedown', _mousedown, true);
    window.removeEventListener('keydown', _keydown, true);
};

var _inspectON = function () {
    if ( _inspecting )
        return;

    _inspecting = true;
    if ( !_maskEL ) {
        _maskEL = document.createElement('div');
        _maskEL.style.position = 'absolute';
        _maskEL.style.zIndex = '999';
        _maskEL.style.top = '0';
        _maskEL.style.right = '0';
        _maskEL.style.bottom = '0';
        _maskEL.style.left = '0';
        _maskEL.style.backgroundColor = 'rgba( 0, 128, 255, 0.5)';
        _maskEL.style.outline = '1px solid #09f';
        _maskEL.style.cursor = 'default';
        document.body.appendChild(_maskEL);
    }

    window.addEventListener('mousemove', _mousemove, true);
    window.addEventListener('mousedown', _mousedown, true);
    window.addEventListener('keydown', _keydown, true);
};

var _mousemove = function ( event ) {
    event.preventDefault();
    event.stopPropagation();

    _maskEL.remove();

    var el = document.elementFromPoint( event.clientX, event.clientY );
    rect = el.getBoundingClientRect();

    // if we are in web-view, show red color
    if ( _webviewEL(el) ) {
        _maskEL.style.backgroundColor = 'rgba( 128, 0, 0, 0.4)';
        _maskEL.style.outline = '1px solid #f00';
    } else {
        _maskEL.style.backgroundColor = 'rgba( 0, 128, 255, 0.5)';
        _maskEL.style.outline = '1px solid #09f';
    }

    //
    document.body.appendChild(_maskEL);
    _maskEL.style.top = (rect.top+1) + 'px';
    _maskEL.style.left = (rect.left+1) + 'px';
    _maskEL.style.width = (rect.width-2) + 'px';
    _maskEL.style.height = (rect.height-2) + 'px';
};

var _mousedown = function ( event ) {
    event.preventDefault();
    event.stopPropagation();

    _inspectOFF ();

    var el = document.elementFromPoint( event.clientX, event.clientY );
    var webviewEL = _webviewEL(el);
    if ( webviewEL ) {
        webviewEL.openDevTools();
    } else {
        Editor.sendToCore( 'window:inspect-at', event.clientX, event.clientY, Editor.requireIpcEvent );
    }
};

var _keydown = function ( event ) {
    event.preventDefault();
    event.stopPropagation();

    if ( event.which === 27 ) {
        _inspectOFF ();
    }
};

// ==========================
// Methods
// ==========================

var EditorWindow = {};

EditorWindow.focus = function () {
    Editor.sendToCore( 'window:focus', Editor.requireIpcEvent );
};

// ==========================
// Ipc events
// ==========================

var Ipc = require('ipc');

Ipc.on('window:inspect', function () {
    _inspectON ();
});

module.exports = EditorWindow;
