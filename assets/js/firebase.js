var firebaseModule = (function() {
  var config = {
    apiKey: 'AIzaSyDqKoNT1rpDeSl2QVu6sK_YGMVfTzohops',
    authDomain: 'realtime-rps.firebaseapp.com',
    databaseURL: 'https://realtime-rps.firebaseio.com',
    projectId: 'realtime-rps',
    storageBucket: 'realtime-rps.appspot.com',
    messagingSenderId: '603566803686'
  };
  firebase.initializeApp(config);

  var database = firebase.database();

  return {
    database: database
  };
})();
