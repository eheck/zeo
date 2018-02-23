const _cfg = { 'iceServers': [ { 'url': 'stun:23.21.150.121' } ] };
const _con = { 'optional': [ { 'DtlsSrtpKeyAgreement': true } ] };
const _sdpConstraints = { optional: [], mandatory: {
	OfferToReceiveAudio: false,
	OfferToReceiveVideo: false
} };

const _peerConnection1 = new RTCPeerConnection( _cfg, _con );
const _peerConnection2 = new RTCPeerConnection( _cfg, _con );

let _dataChannel1 = null;
let _dataChannel2 = null;
let _activeDataChannel = null;

const _area = document.getElementById( 'area' );
const _input = document.getElementById( 'input' );

function send( ) {
	if( !_activeDataChannel ) {
		return;
	}

	_activeDataChannel.send( JSON.stringify( { message: _input.value } ) );
}

/* 1 */

function createRoom( ) {
	_area.value = 'loading';

	setupDataChannel1( );
	_peerConnection1.createOffer( function( description ) {
		console.log( 'Created Local Offer', description );
		_peerConnection1.setLocalDescription( description );
	}, function( ) { } );
}

function setupDataChannel1( ) {
	_dataChannel1 = _peerConnection1.createDataChannel( 'd(-.-)b', { reliable: true } );
	_activeDataChannel = _dataChannel1;

	console.log( 'Created Data Channel 1' );

	_dataChannel1.onopen = function( event ) {
		_connected = true;
		console.log( 'Data Channel 1 Connected' );
	}

	_dataChannel1.onmessage = function( event ) {
		console.log( 'New Message 1', event );
	}
}

function processAnswer( ) {
	const description = new RTCSessionDescription( JSON.parse( _area.value ) )

	console.log( 'Received Remote Answer', description );
	_peerConnection1.setRemoteDescription( description );
}

_peerConnection1.onicecandidate = function( event ) {
	console.log( 'ICE Candidate 1', event );

	if( event.candidate === null ) {
		_area.value = JSON.stringify( _peerConnection1.localDescription );
	}
}

/* 2 */

function joinRoom( ) {
	const description = new RTCSessionDescription( JSON.parse( _area.value ) );

	_area.value = 'loading';

	console.log( 'Received Remote Offer', description );

	_peerConnection2.setRemoteDescription( description );
	_peerConnection2.createAnswer( function( answer ) {
		console.log( 'Created Local Answer', answer );
		_peerConnection2.setLocalDescription( answer )
	}, function( ) { } );
}

_peerConnection2.onicecandidate = function(event ) {
	console.log( 'ICE Candidate 2', event );

	if( event.candidate === null ) {
		_area.value = JSON.stringify( _peerConnection2.localDescription );
	}
}

_peerConnection2.ondatachannel = function( event ) {
	_dataChannel2 = event.channel || event;

	_dataChannel2.onopen = function( event ) {
		_activeDataChannel = _dataChannel2;
		console.log( 'Data Channel 2 Connected' );
	}
	_dataChannel2.onmessage = function( event ) {
		console.log( 'New Message 2', event );
	}
}
