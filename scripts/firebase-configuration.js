if ( typeof firebase === 'undefined' ) {
	throw new Error( 'Firebase SDK not detected!' );
}

firebase.initializeApp( {
	apiKey: "AIzaSyBZXmzTxtOwmOfk4MdlgIMgBUd2Oc5s-Vo",
	databaseURL: "http://zeo-app.firebaseio.com",
	storageBucket: "zeo-app.appspot.com",
	authDomain: "zeo-app.firebaseapp.com",
	messagingSenderId: "1098175429045",
	projectId: "zeo-app"
} );
