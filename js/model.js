(function (window) {
	'use strict';

	/**
	 * Crée une nouvelle instance de modèle et raccorde le stockage.
	 *
	 * @constructor
	 * @param {object} storage Une référence à la classe de stockage côté client
	 */
	function Model(storage) {
		this.storage = storage;
	}

	/**
	 * crée un nouveau modèle de todo
	 *
	 * @param {string} [title] Le titre de la tâche
	 * @param {function} [callback] 
	 */
	Model.prototype.create = function (title, callback) {
		title = title || '';
		callback = callback || function () {};

		var newItem = {
			title: title.trim(), /** Retire les blancs en début et en fin de chaîne */
			completed: false   /** Initialise la tache à active */
		};

		this.storage.save(newItem, callback);
	};

	/**
	 * Trouve et renvoie un modèle en mémoire. 
	 * Si aucune requête n'est donnée, la fonction retourne tout. 
	 * Si on lui passe une chaîne ou un numéro, cela ressemblera à l'identifiant du modèle à trouver. 
	 *  Enfin, on peut lui passer un objet pour correspondre contre
	 *
	 * @param {string|number|object} [query] Une requête pour faire correspondre les modèles
	 * @param {function} [callback] le callback après la découverte du modèle
	 *
	 * @example
	 * model.read(1, func); // Trouvera le modèle avec un ID de 1
	 * model.read('1'); // Idem
	 */
	Model.prototype.read = function (query, callback) {
		var queryType = typeof query;
		callback = callback || function () {};

		if (queryType === 'function') {
			callback = query;
			return this.storage.findAll(callback);
		} else if (queryType === 'string' || queryType === 'number') {
			query = parseInt(query, 10);
			this.storage.find({ id: query }, callback);
		} else {
			this.storage.find(query, callback);
		}
	};

	/**
	 * Met à jour un modèle en lui donnant un identifiant, des données à mettre à jour,
	 * et un rappel(callback) à éxécuter quand la mise à jour est terminée
	 *
	 * @param {number} id L'id du modele à mettre à jour
	 * @param {object} data Les propriétés à mettre à jour et leur nouvelle valeur
	 * @param {function} callback le callback à éxécuter quand la mise à jour est terminée.
	 */
	Model.prototype.update = function (id, data, callback) {
		this.storage.save(data, callback, id);
	};

	/**
	 * Supprime un modele du stockage
	 *
	 * @param {number} id L'id du modele à supprimer
	 * @param {function} callback le callback à éxécuter quand la mise à jour est terminée.
	 */
	Model.prototype.remove = function (id, callback) {
		this.storage.remove(id, callback);
	};

	/**
	 *ATTENTION: Retire TOUTES les données du stockage
	 *
	 * @param {function} callback le callback lorsque le stockage est effacé.
	 */
	Model.prototype.removeAll = function (callback) {
		this.storage.drop(callback);
	};

	/**
	 * Renvoie le nombre de todos en additionnant 
	 * toutes les taches actives et completes
	 *  
	 */
	Model.prototype.getCount = function (callback) {
		var todos = {
			active: 0,
			completed: 0,
			total: 0
		};

		this.storage.findAll(function (data) {
			data.forEach(function (todo) {
				if (todo.completed) {
					todos.completed++;
				} else {
					todos.active++;
				}

				todos.total++;
			});
			callback(todos);
		});
	};

	/** Exporter vers la fenêtre
	 *  Création de app.Model qui contient le constructeur Model
	 *  et qu'on instancie dans app.js
	 */
	window.app = window.app || {};
	window.app.Model = Model;
})(window);
