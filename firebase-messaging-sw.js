importScripts( 'https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js' );
importScripts( 'https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js' );
importScripts( 'scripts/firebase-configuration.js' );

firebase.messaging( ).setBackgroundMessageHandler( function( message ) {
	console.log( 'Background message received: ', message );

	const title = 'Background Message Title';
	const options = {
		body: 'Background Message body.',
		icon: '/firebase-logo.png'
	};

	return self.registration.showNotification( title, options );
} );
