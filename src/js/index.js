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

var jsVigoDatabase = firebase.database(),
	jsVigoStorage = firebase.storage().ref();

//Index
function doLogin(user, password) {
	firebase.auth().signInWithEmailAndPassword(user, password)
		.then(function (snapshot) {
			console.log('Usuario logueado: ');
			console.log(snapshot);
		})
		.catch(function (error) {
			// Handle Errors here.
			var errorCode = error.code;
			var errorMessage = error.message;
			// ...
			console.log([errorCode, errorMessage]);
		});
}

function doSignOut() {
	firebase.auth().signOut().then(function () {
		console.log('Hemos cerrado la sesión correctamente');

		jsVigoDatabase.ref('text').off('value');
		jsVigoDatabase.ref('Info').off('value');

	}, function (error) {
		console.error(error);
	});
}

function helloWorld() {

	jsVigoDatabase.ref('text').on('value', function (snapshot) {
		document.getElementsByTagName('h1')[0].innerHTML = snapshot.val();
	}, function (err) {
		console.error(err);
	});

}

function showInfo() {

	jsVigoDatabase.ref('Info').on('value', function (snapshot) {
		var _info = snapshot.val();

		if (!!_info) {
			document.getElementById('Nombre').value = _info.Nombre;
			document.getElementById('Apellidos').value = _info.Apellidos;
			document.getElementById('Profesion').value = _info.Profesion;
		} else {
			console.log('No existe el nodo Info en firebase');
		}


	}, function (err) {
		console.error(err);
	});
}

function saveData() {

	var infoObj = {},
		_nombre = document.getElementById('nombreSet').value,
		_apellidos = document.getElementById('apellidosSet').value,
		_profesion = document.getElementById('profesionSet').value;

	if (!!_nombre) {
		infoObj.Nombre = _nombre;
	}
	if (!!_apellidos) {
		infoObj.Apellidos = _apellidos;
	}
	if (!!_profesion) {
		infoObj.Profesion = _profesion;
	}

	jsVigoDatabase.ref('Info').set(infoObj);

	console.log('Vamos a reemplazar el objeto actual por este: ' + JSON.stringify(infoObj));
}

function saveDataPartial() {
	var _name = document.getElementById('nombrePartial').value;

	//jsVigoDatabase.ref('Info/Nombre').set(_name);
	jsVigoDatabase.ref('Info').child('Nombre').set(_name);
}

//Datos
function getFriends() {
	/*	jsVigoDatabase.ref('Friends').on('value', function(snapshot){
			snapshot.forEach(function(childSnapshot) {
				_addFriendToView(childSnapshot.val(),childSnapshot.key);
			});
		});*/
	jsVigoDatabase.ref('Friends').on('child_added', function (snapshot) {
		_addFriendToView(snapshot.val(), snapshot.key);
	});

	jsVigoDatabase.ref('Friends').on('child_removed', function (snapshot) {
		_removeFriendToView(snapshot.key);
	});

	jsVigoDatabase.ref('Friends').on('child_changed', function (snapshot) {
		console.log('El nodo con key: ' + snapshot.key + ' ahora tiene el valor: ' + JSON.stringify(snapshot.val()));
	});

}


function getFriend(key) {
	jsVigoDatabase.ref('Friends').child(key).child('nombre').once('value', function (snapshot) {
		var _name = snapshot.val();
		if (!_name) {
			document.getElementById('nombreGet').value = 'NO EXISTE';
		} else {
			document.getElementById('nombreGet').value = _name;
		}

	}, function (err) {
		console.error(err);
	});
}

function createFriend() {

	var _friend = {},
		result = '';

	_friend.nombre = document.getElementById('nombrePush').value;
	_friend.apellidos = document.getElementById('apellidosPush').value;

	result = jsVigoDatabase.ref('Friends').push(_friend);

	console.log('Se ha creado un amigo en el array de amigos con el key: ' + result.key);

}

function deleteFriend() {

	var friendKey = document.getElementById('keyDelete').value;
	if (!!friendKey) {

		jsVigoDatabase.ref('Friends').child(friendKey).remove()
			.then(function () {
				console.log('Amigo eliminado correctamente');
			})
			.catch(function (error) {
				console.log('Remove failed: ' + error.message);
			});
		document.getElementById('keyDelete').value = '';
	}
}

function _addFriendToView(friend, key) {
	var friendText = friend.nombre + '  ' + friend.apellidos + ' (' + key + ')',
		list = document.getElementById('friends');

	var newLi = document.createElement('li');
	newLi.setAttribute('id', key);
	newLi.appendChild(document.createTextNode(friendText));
	list.appendChild(newLi);
}

function _removeFriendToView(key) {
	var _friend = document.getElementById(key);
	_friend.remove();
}

//Query
function createRandomData() {

	var _total = 10000,
		_numberMaxRandom = 100;
	var _objRandom = {
		'name': null,
		'integerFilter': null,
		'stringFilter': null
	};

	for (var i = 0; i < _total; i++) {
		_objRandom.name = 'Name' + new Date().getTime();
		_objRandom.integerFilter = Math.floor((Math.random() * _numberMaxRandom) + 1);
		_objRandom.stringFilter = Math.random().toString(36).substring(7);

		jsVigoDatabase.ref('random').push(_objRandom, function () {
			console.log(i + ' registros aleatorios creados.');
		}).catch(function (err) {
			console.error(err);
		});
	}

}

function _addRandomDataToView(data, key) {
	var randomObjText = 'Nombre: ' + data.name + '  ' + 'integerFilter: ' + data.integerFilter + '  ' + 'stringFilter: ' + data.stringFilter + ' (' + key + ')',
		randomList = document.getElementById('randomData');

	var liRandom = document.createElement('li');
	liRandom.setAttribute('id', key);
	liRandom.appendChild(document.createTextNode(randomObjText));
	randomList.appendChild(liRandom);
}

function showRandomData() {

	document.getElementById('randomData').innerHTML = '';

	var _node = document.randomForm.performance.value,
		_typeFilter = document.randomForm.typeFilter.value,
		_fieldFilter = document.randomForm.fieldFilter.value,
		_valueFilter = (_fieldFilter === 'integerFilter') ? +document.getElementById('integerFilterValue').value : document.getElementById('stringFilterValue').value,
		_reference = {},
		_date = {};

	if (_typeFilter !== 'equalTo' && _fieldFilter === 'stringFilter') {
		alert('Firebase no permite buscar por cadenas que comiencen/finalicen por...');
	} else {

		switch (_typeFilter) {
			case 'equalTo':
				_reference = jsVigoDatabase.ref(_node).orderByChild(_fieldFilter).equalTo(_valueFilter);
				console.log('Tipo de búsqueda: equalTo - Filtro: ' + _fieldFilter + ' - Valor: ' + _valueFilter);
				break;
			case 'startAt':
				_reference = jsVigoDatabase.ref(_node).orderByChild(_fieldFilter).startAt(_valueFilter);
				console.log('Tipo de búsqueda: startAt - Filtro: ' + _fieldFilter + ' - Valor: ' + _valueFilter);
				break;
			case 'endAt':
				_reference = jsVigoDatabase.ref(_node).orderByChild(_fieldFilter).endAt(_valueFilter);
				console.log('Tipo de búsqueda: endAt - Filtro: ' + _fieldFilter + ' - Valor: ' + _valueFilter);
				break;
		}

		_date = new Date();
		console.log('Comenzamos a realizar la búsqueda: ' + _date.getMinutes() + ':' + _date.getSeconds() + ':' + _date.getMilliseconds());
		_reference.once('value', function (snapshot) {
			snapshot.forEach(function (childSnapshot) {
				_addRandomDataToView(childSnapshot.val(), childSnapshot.key);
			});
			_date = new Date();
			console.log('Finalizamos la búsqueda: ' + _date.getMinutes() + ':' + _date.getSeconds() + ':' + _date.getMilliseconds());
			console.log('Resultado: ' + Object.keys(snapshot.val() || []).length);
		}, function (err) {
			console.error(err);
		});

	}

}

function _countData() {
	jsVigoDatabase.ref('random/').once('value', function (snapshot) {
		console.log('Número de registros totales: ' + Object.keys(snapshot.val() || []).length);
	});
}

function _getUserInfo() {
	var _user = firebase.auth().currentUser;
	if (!!_user) {
		document.getElementById('nouserinfo').classList.add('none');
		document.getElementById('usercontainer').classList.remove('none');

		document.getElementById('useruid').innerHTML = 'useruid:' + _user.uid;
		document.getElementById('useremail').innerHTML = 'useremail:' + _user.email;
		document.getElementById('useremailverified').innerHTML = 'useremailverified:' + _user.emailVerified;
		document.getElementById('userproviderinfo').innerHTML = 'userproviderinfo:' + JSON.stringify(_user.providerData[0]);
	} else {
		document.getElementById('nouserinfo').classList.remove('none');
		document.getElementById('usercontainer').classList.add('none');
	}

}

function _checkUserInfo() {
	jsVigoDatabase.ref('users').child('NGlSK65LqVRqq2JJxYsJYtnflc73').once('value', function (snap) {
		console.log('Como propietario del nodo "user/$uid" puedo leer los datos: ' + JSON.stringify(snap.val()));
	});

	jsVigoDatabase.ref('users').child('PROelkoTy5hx0QwWsgrOiBjqTUE3').once('value', function (snap) {
		console.log('Como propietario del nodo "user/$uid" puedo leer los datos: ' + JSON.stringify(snap.val()));
	});
}

function uploadFile(nodeReference) {
	var file = document.getElementById('inputStorage').files[0];
	var _bucket = nodeReference + '/' + file.name;
	var uploadTask = jsVigoStorage.child(_bucket).put(file);

	uploadTask.on('state_changed', function (snapshot) {

	}, function (error) {
		console.error(error);
	}, function () {
		document.getElementById('bucketUrlImage').innerHTML = _bucket;
		var downloadURL = uploadTask.snapshot.downloadURL;
		console.log('Se ha añadido correctamente la imagen con la siguiente URL: ' + downloadURL);
	});

	uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
		function (snapshot) {
			// Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
			var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
			console.log('Upload is ' + progress + '% done');
			switch (snapshot.state) {
				case firebase.storage.TaskState.PAUSED: // or 'paused'
					console.log('Upload is paused');
					break;
				case firebase.storage.TaskState.RUNNING: // or 'running'
					console.log('Upload is running');
					break;
			}
		});
}

function getDownloadURL(bucket) {
	jsVigoStorage.child(bucket).getDownloadURL().then(function (dataUrl) {
		document.getElementById('showUrlImage').innerHTML = dataUrl;
	});
}

document.addEventListener('DOMContentLoaded', function (event) {

	//Ocultamos todos los divs
	var menus = document.getElementsByClassName('menu');
	function hideAll() {
		for (var i = 0; i < menus.length; i++) {
			document.getElementById(menus[i].getAttribute('data-index')).classList.add('none');
		}
	}
	hideAll();
	for (var i = 0; i < menus.length; i++) {
		menus[i].addEventListener('click', function () {
			var _id = this.getAttribute('data-index');
			hideAll();
			document.getElementById(_id).classList.remove('none');
		});
	}
	//Mostramos el index
	document.getElementById('index').classList.remove('none');


	//Index
	document.getElementById('login').addEventListener('click', function () {

		var _user = document.getElementById('user').value,
			_pass = document.getElementById('password').value;

		if (!!_user && !!_pass) {
			doLogin(_user, _pass);
		} else {
			alert('Debe introducir usuario y password');
		}

	});

	document.getElementById('signout').addEventListener('click', function () {
		doSignOut();
	});

	document.getElementById('showInfo').addEventListener('click', function () {
		showInfo();
	});

	document.getElementById('storageBtn').addEventListener('click', function () {
		console.log(document.getElementById('inputStorage'));
		var _node = document.storageForm.bucket.value;
		uploadFile(_node);
	});

	document.getElementById('getDownloadURL').addEventListener('click', function () {
		var _bucket = document.getElementById('bucketUrlImage').innerHTML;
		if (!!_bucket) {
			getDownloadURL(_bucket);
		} else {
			console.log('No se ha seleccionado ninguna imagen. Súbela y luego podrás consultar su URL');
		}

	});

	firebase.auth().onAuthStateChanged(function (user) {

		if (user) {

			document.getElementById('title').classList.remove('none');
			document.getElementById('signout').classList.remove('none');
			document.getElementById('form').classList.add('none');
			document.getElementById('mailLogged').innerHTML = user.email;
			helloWorld();

		} else {
			document.getElementById('form').classList.remove('none');
			document.getElementById('title').classList.add('none');
			document.getElementById('signout').classList.add('none');
		}

		//Permission
		_getUserInfo();

	});

	//Datos
	document.getElementById('guardarDatos').addEventListener('click', function () {
		saveData();
	});
	document.getElementById('guardarDatosParcial').addEventListener('click', function () {
		saveDataPartial();
	});

	document.getElementById('pushFriends').addEventListener('click', function () {
		createFriend();
	});

	document.getElementById('getFriend').addEventListener('click', function () {
		var _key = document.getElementById('keyGet').value;
		if (!!_key) {
			getFriend(_key);
		}
	});

	document.getElementById('delFriend').addEventListener('click', function () {
		deleteFriend();
	});

	getFriends();

	//Query
	document.getElementById('createRandom').addEventListener('click', function () {
		createRandomData();
	});
	document.getElementById('showRandom').addEventListener('click', function () {
		showRandomData();
	});

	_countData();

	//Permissions
	_checkUserInfo();

});