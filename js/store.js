
(function (window) {
	'use strict';

	/**
	 * Crée un nouvel objet de stockage côté client et créera
	 * une collection vide si aucune collection n'existe déjà.
	 *
	 * @param {string} name Le nom de la DataBase que nous voulons utiliser
	 * @param {function} callback Notre fausse base de données utilise un callback
	 * car dans dans certaine situations on ferait probablement des appels AJAX.
	 */
	function Store(name, callback) {
		callback = callback || function () {};

		this._dbName = name;

		if (!localStorage[name]) {
			var data = {
				todos: []
			};

			localStorage[name] = JSON.stringify(data);
		}

		callback.call(this, JSON.parse(localStorage[name]));
	}

	/**
	 * Trouve les éléments basés sur une requête donnée en tant qu'objet JS
	 * Si il n'y as pas de callback on quitte la fonction
	 * 
	 * @param {object} query La requête à comparer (i.e. {foo: 'bar'})
	 * @param {function} callback Le rappel à déclencher lorsque la requête est terminée
	 *
	 * @example
	 * db.find({foo: 'bar', hello: 'world'}, function (data) {
	 *	 // data retournera tous les éléments qui ont foo: bar et
	 *	 // hello: monde dans leurs propriétés
	 * });
	 */
	Store.prototype.find = function (query, callback) {
		if (!callback) {
			return;
		}

		var todos = JSON.parse(localStorage[this._dbName]).todos;

		callback.call(this, todos.filter(function (todo) {
			for (var q in query) {
				if (query[q] !== todo[q]) {
					return false;
				}
			}
			return true;
		}));
	};

	/**
	 * Récupérer toutes les données de la collection
	 *
	 * @param {function} callback le callback lors de la récupération des données
	 */
	Store.prototype.findAll = function (callback) {
		callback = callback || function () {};
		callback.call(this, JSON.parse(localStorage[this._dbName]).todos);
	};

	/**
	 * Sauvegarde les informations dans la base de données. 
	 * Si aucun item n'existe, création d'un nouveau élément, 
	 * sinon la fonction mettra simplement à jour les propriétés d'un élément existant
	 *
	 * @param {object} updateData Les données à sauvegarder dans la base de données
	 * @param {function} callback Le callback après l'enregistrement dans la base de données
	 * @param {number} id Un paramètre facultatif pour entrer l'ID de l'élément à mettre à jour
	 */
	Store.prototype.save = function (updateData, callback, id) {
		var data = JSON.parse(localStorage[this._dbName]);
		var todos = data.todos;

		callback = callback || function () {};
        /* ....................................................................................................................
		// Generate an ID
	    var newId = ""; 
	    var charset = "0123456789";

        for (var i = 0; i < 6; i++) {
     		newId += charset.charAt(Math.floor(Math.random() * charset.length));
		}
		
        .......................................................................................................................*/
		// If an ID was actually given, find the item and update each property
		
		if (id) {
			
			for (var i = 0; i < todos.length; i++) {
				if (todos[i].id === id) {
					for (var key in updateData) {
						todos[i][key] = updateData[key];
					}
					break;
				}
			}

			localStorage[this._dbName] = JSON.stringify(data);
			callback.call(this, todos);
		} else {

    		/** Renvoie un Number basé sur le nombre de millisecondes 
			 *  depuis le 1er janvier 1970, cà en fait donc un ID unique.
			 */ 
			updateData.id = new Date().getTime();

			todos.push(updateData);
			localStorage[this._dbName] = JSON.stringify(data);
			callback.call(this, [updateData]);
		}
	};

	/**
	 * Supprime un élément de Store en fonction de son id
	 *
	 * @param {number} id L'id de l'élément qu'on veut supprmier
	 * @param {function} callback le callback après l'enregistrement
	 */
	Store.prototype.remove = function (id, callback) {
		var data = JSON.parse(localStorage[this._dbName]);
		var todos = data.todos;
		var todoId;
		
		for (var i = 0; i < todos.length; i++) {
			if (todos[i].id == id) {
				todoId = todos[i].id;
			}
		}

		for (var i = 0; i < todos.length; i++) {
			if (todos[i].id == todoId) {
				todos.splice(i, 1);
			}
		}

		localStorage[this._dbName] = JSON.stringify(data);
		callback.call(this, todos);
	};

	/**
	 * Laisse tomber tout le stockage et le rafraîchit
	 *
	 * @param {function} callback Le callback après avoir déposé les données
	 */
	Store.prototype.drop = function (callback) {
		var data = {todos: []};
		localStorage[this._dbName] = JSON.stringify(data);
		callback.call(this, data.todos);
	};

	/** Exporter vers la fenêtre
	 *  Création de app.Store qui contient le constructeur Store
	 *  et qu'on instancie dans app.js
	 */
	window.app = window.app || {};
	window.app.Store = Store;
})(window);