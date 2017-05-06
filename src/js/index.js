// Initialize Firebase
var config = {
	apiKey: 'AIzaSyAFpsIF_vNzc6ONx29QM0ZN4dPpxOIBeCQ',
	authDomain: 'jsvigo-4fe88.firebaseapp.com',
	databaseURL: 'https://jsvigo-4fe88.firebaseio.com',
	projectId: 'jsvigo-4fe88',
	storageBucket: 'jsvigo-4fe88.appspot.com',
	messagingSenderId: '790101355447'
};

firebase.initializeApp(config);

var jsVigoDatabase = firebase.database();


function doLogin(user,password){
	firebase.auth().signInWithEmailAndPassword(user,password)
	.then(function(snapshot){
		console.log('Usuario logueado: ');
		console.log(snapshot);
	})
	.catch(function(error) {
	  // Handle Errors here.
	  var errorCode = error.code;
	  var errorMessage = error.message;
	  // ...
	  console.log([errorCode,errorMessage]);
	});
}

function doSignOut(){
	firebase.auth().signOut().then(function() {
	  	console.log('Hemos cerrado la sesión correctamente');
		
		jsVigoDatabase.ref('text').off('value');
		jsVigoDatabase.ref('Info').off('value');

	}, function(error) {
	  console.error(error);
	});	
}

function helloWorld(){
	
	jsVigoDatabase.ref('text').on('value', function(snapshot) {
		document.getElementsByTagName('h1')[0].innerHTML = snapshot.val();
	}, function(err){
		console.error(err);
	});

}

function showInfo(){

	jsVigoDatabase.ref('Info').on('value', function(snapshot) {
		var _info = snapshot.val();

		if ( !!_info ){
			document.getElementById('Nombre').value = _info.Nombre;
			document.getElementById('Apellidos').value = _info.Apellidos;
			document.getElementById('Profesion').value = _info.Profesion;			
		}else{
			console.log('No existe el nodo Info en firebase');
		}


	}, function(err){
		console.error(err);
	});	
}

function saveData(){

	var infoObj = {},
		_nombre = document.getElementById('nombreSet').value,
		_apellidos = document.getElementById('apellidosSet').value,
		_profesion = document.getElementById('profesionSet').value;

	if ( !!_nombre ){
		infoObj.Nombre = _nombre;
	}
	if ( !!_apellidos ){
		infoObj.Apellidos = _apellidos;
	}
	if ( !!_profesion ){
		infoObj.Profesion = _profesion;
	}

	jsVigoDatabase.ref('Info').set(infoObj);

	console.log('Vamos a reemplazar el objeto actual por este: ' + JSON.stringify(infoObj));
}

function saveDataPartial(){
	var _name = document.getElementById('nombrePartial').value;

	//jsVigoDatabase.ref('Info/Nombre').set(_name);
	jsVigoDatabase.ref('Info').child('Nombre').set(_name);
}

function getFriends(){
	jsVigoDatabase.ref('Friends').on('value', function(snapshot){
		snapshot.forEach(function(childSnapshot) {
			_addFriendToView(childSnapshot.val(),childSnapshot.key);
		});
	});
}

function getFriend(key){
	jsVigoDatabase.ref('Friends').child(key).child('nombre').once('value', function(snapshot){
		var _name = snapshot.val();
		if ( !_name ){
			document.getElementById('nombreGet').value = 'NO EXISTE';
		}else{
			document.getElementById('nombreGet').value = _name;
		}
		
	}, function(err){
		console.error(err);
	});
}

function createFriend(){

	document.getElementById('friends').innerHTML = '';

	var _friend = {},
		result = '';

	_friend.nombre = document.getElementById('nombrePush').value;
	_friend.apellidos = document.getElementById('apellidosPush').value;

	result = jsVigoDatabase.ref('Friends').push(_friend);

	console.log('Se ha creado un amigo en el array de amigos con el key: ' + result.key);

}

function deleteFriend(){

	var friendKey = document.getElementById('keyDelete').value;
	if ( !!friendKey ){
		document.getElementById('friends').innerHTML = '';
		jsVigoDatabase.ref('Friends').child(friendKey).remove()
			.then(function() {
				console.log('Amigo eliminado correctamente')
			})
			.catch(function(error) {
				console.log('Remove failed: ' + error.message)
			});
	}
}

function _addFriendToView(friend, key){
	var friendText = friend.nombre + '  ' + friend.apellidos + ' (' + key + ')',
		list = document.getElementById('friends');

	var newLI = document.createElement('li');
	newLI.appendChild(document.createTextNode(friendText));
	list.appendChild(newLI);	
}

document.addEventListener('DOMContentLoaded', function(event) { 

	//Ocultamos todos los divs
	var menus = document.getElementsByClassName('menu');
	function hideAll(){
		for (var i = 0; i < menus.length; i++) {
			document.getElementById(menus[i].getAttribute('data-index')).classList.add('none');
		}		
	}
	hideAll();
	for (var i = 0; i < menus.length; i++) {
		menus[i].addEventListener('click',function(){
			hideAll();
			document.getElementById(this.getAttribute('data-index')).classList.remove('none');
		})
	}
	//Mostramos el index
	document.getElementById('index').classList.remove('none');


	//Index
	document.getElementById('login').addEventListener('click',function(){
		
		var _user = document.getElementById('user').value,
			_pass = document.getElementById('password').value;

		if ( !!_user && !!_pass){
			doLogin(_user,_pass);
		}else{
			alert('Debe introducir usuario y password');
		}

	});

	document.getElementById('signout').addEventListener('click',function(){
		doSignOut();
	});

	document.getElementById('showInfo').addEventListener('click',function(){
		showInfo();
	});
	


	firebase.auth().onAuthStateChanged(function(user) {
	  
	  if (user) {
	  	
	  	document.getElementById('title').classList.remove('none');
	  	document.getElementById('signout').classList.remove('none');
	  	document.getElementById('form').classList.add('none');

	  	helloWorld();

	  } else {
	  	document.getElementById('form').classList.remove('none');
	  	document.getElementById('title').classList.add('none');
	  	document.getElementById('signout').classList.add('none');
	  }

	});

	//Datos
	document.getElementById('guardarDatos').addEventListener('click',function(){
		saveData();
	});
	document.getElementById('guardarDatosParcial').addEventListener('click',function(){
		saveDataPartial();
	});

	document.getElementById('pushFriends').addEventListener('click',function(){
		createFriend();
	});

	document.getElementById('getFriend').addEventListener('click',function(){
		var _key = document.getElementById('keyGet').value;
		if ( !!_key ){
			getFriend(_key);
		}
	});

	document.getElementById('delFriend').addEventListener('click',function(){
		deleteFriend();
	});	

	getFriends();
});