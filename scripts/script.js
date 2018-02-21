const zeo = new Vue( {
	el: '#zeo',
	data: {
		logs: []
	},
	created: function( ) {
		this.logs.unshift( 'zeo created' );
	},
	mounted: function( ) {
		this.logs.unshift( 'zeo mounted' );
		this.register( );
	},
	updated: function( ) {
		//this.logs.unshift( 'zeo updated' );
	},
	destroyed: function( ) {
		this.logs.unshift( 'zeo destroyed' );
	},
	methods: {
		register: function( ) {
			// Firebase initialization
			const messaging = firebase.messaging( );

			messaging.onMessage( function( message ) {
				zeo.logs.unshift( 'Message received', message );
			} );

			messaging.requestPermission( ).then( function( ) {
				zeo.logs.unshift( 'Notification permission granted' );

				messaging.getToken( ).then( function( token ) {
					zeo.logs.unshift( 'Using token', token );
				} ).catch( function( error ) {
					zeo.logs.unshift( 'Unable to retrieve refreshed token', error );
				} );
			} ).catch( function( error ) {
				zeo.logs.unshift( 'Unable to get permission to notify', error );
			} );

			messaging.onTokenRefresh( function( ) {
				messaging.getToken( ).then( function( token ) {
					zeo.logs.unshift( 'Token refreshed', token );
				} ).catch( function( error ) {
					zeo.logs.unshift( 'Unable to retrieve refreshed token', error );
				} );
			} );

			// Service Worker registration
			/*
			if( 'serviceWorker' in navigator ) {
				navigator.serviceWorker.register( '/sw.js' ).then( function( registration ) {
					zeo.logs.unshift( 'ServiceWorker registration successful with scope: ' + registration.scope );

					// Firebase initialization

					const config = {
						apiKey: "AIzaSyBZXmzTxtOwmOfk4MdlgIMgBUd2Oc5s-Vo",
						authDomain: "zeo-app.firebaseapp.com",
						databaseURL: "https://zeo-app.firebaseio.com",
						projectId: "zeo-app",
						storageBucket: "zeo-app.appspot.com",
						messagingSenderId: "1098175429045"
					};

					firebase.initializeApp(config);

					const messaging = firebase.messaging();

					messaging.requestPermission().then(function() {
						zeo.logs.unshift('Notification permission granted.');

						messaging.getToken().then(function(currentToken) {
							if (currentToken) {
								zeo.logs.unshift('Token obtained: ' + currentToken);
								sendTokenToServer(currentToken);
								updateUIForPushEnabled(currentToken);
							} else {
								zeo.logs.unshift('No Instance ID token available. Request permission to generate one.');
								updateUIForPushPermissionRequired();
								setTokenSentToServer(false);
							}
						}).catch(function(err) {
							zeo.logs.unshift('An error occurred while retrieving token: ' + err);
							//showToken('Error retrieving Instance ID token. ', err);
							//setTokenSentToServer(false);
							console.log(err)
						})
					}).catch(function(err) {
						zeo.logs.unshift('Unable to get permission to notify: ' + err);
					});
				}, function(err) {
					zeo.logs.unshift('ServiceWorker registration failed: ' + err);
				});
			}
			*/
		},
	},
	computed: {
	}
} );
