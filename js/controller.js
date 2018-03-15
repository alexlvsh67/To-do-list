(function (window) {
	'use strict';

	/**
	 * Prend un modèle et une vue et agit comme le contrôleur entre eux
	 *
	 * @constructor
	 * @param {object} model La valeur de modele
	 * @param {object} view La valeur de view
	 */
	function Controller(model, view) {
		var self = this;
		self.model = model;
		self.view = view;
        
		self.view.bind('newTodo', function (title) {
			self.addItem(title);                               
		});

		self.view.bind('itemEdit', function (item) {
			self.editItem(item.id);
		});

		self.view.bind('itemEditDone', function (item) {
			self.editItemSave(item.id, item.title);
		});

		self.view.bind('itemEditCancel', function (item) {
			self.editItemCancel(item.id);
		});

		self.view.bind('itemRemove', function (item) {
			self.removeItem(item.id);
		});

		self.view.bind('itemToggle', function (item) {
			self.toggleComplete(item.id, item.completed);
		});

		self.view.bind('removeCompleted', function () {
			self.removeCompletedItems();
		});

		self.view.bind('toggleAll', function (status) {
			self.toggleAll(status.completed);
		});
	}

	/**
	 * Charge et initialise la vue grace à la fonction _updateFilterState pour 
	 * 
	 * @param {string} '' | 'active' | 'completed'
	 */
	Controller.prototype.setView = function (locationHash) {
		var route = locationHash.split('/')[1];
		var page = route || '';
		this._updateFilterState(page);
	};

	/**
	 * Un événement est déclenché au chargement. Obtient tous les éléments 
	 * et les affiche dans le liste de choses à faire
	 */
	Controller.prototype.showAll = function () {
		var self = this;
		self.model.read(function (data) {
			self.view.render('showEntries', data);
		});
	};

	/**
	 * Rend toutes les tâches actives.
	 */
	Controller.prototype.showActive = function () {
		var self = this;
		self.model.read({ completed: false }, function (data) {
			self.view.render('showEntries', data);
		});
	};

	/**
	 * Rend toutes les tâches terminées
	 */
	Controller.prototype.showCompleted = function () {
		var self = this;
		self.model.read({ completed: true }, function (data) {
			self.view.render('showEntries', data);
		});
	};

	/**
	 * Un événement est déclenché lorsqu'on souhaite ajouter un élément. 
	 * Passe dans l'événement l'objet qui va gérer l'insertion DOM et 
	 * la sauvegarde du nouvel élément.
	 */
	Controller.prototype.addItem = function (title) {
		var self = this;

		if (title.trim() === '') {
			return;
		}

		self.model.create(title, function () {
			self.view.render('clearNewTodo');
			self._filter(true);
		});
	};

	/*
	 * Déclenche le mode d'édition d'élément.
	 */
	Controller.prototype.editItem = function (id) {
		var self = this;
		self.model.read(id, function (data) {
			self.view.render('editItem', {id: id, title: data[0].title});
		});
	};

	/*
	 * Termine le mode d'édition d'élément avec succès.
	 */
	Controller.prototype.editItemSave = function (id, title) {
		var self = this;

		while (title[0] === " ") {
			title = title.slice(1);
		}

		while (title[title.length-1] === " ") {
			title = title.slice(0, -1);
		}

		if (title.length !== 0) {
			self.model.update(id, {title: title}, function () {
				self.view.render('editItemDone', {id: id, title: title});
			});
		} else {
			self.removeItem(id);
		}
	};

	/*
	 * Annule le mode d'édition d'élément.
	 */
	Controller.prototype.editItemCancel = function (id) {
		var self = this;
		self.model.read(id, function (data) {
			self.view.render('editItemDone', {id: id, title: data[0].title});
		});
	};

	/**
	 * En lui donnant un identifiant, il trouvera l'élément DOM correspondant 
	 * à cet identifiant, le retirer du DOM et le retirer du stockage.
	 *
	 * @param {number} id L'identifiant de l'objet à retirer du DOM et du stockage
	 */
	Controller.prototype.removeItem = function (id) {
		var self = this;
		
		/*..................................................................................................................
		var items;
		self.model.read(function(data) {
			items = data;
		});

		items.forEach(function(item) {
			if (item.id === id) {
				console.log("Element with ID: " + id + " has been removed.");
			}
		});
		
        ........................................................................................................................*/
		self.model.remove(id, function () {
			self.view.render('removeItem', id);
		});

		self._filter();
	};

	/**
	 * Supprime tous les éléments terminés du DOM et du stockage.
	 */
	Controller.prototype.removeCompletedItems = function () {
		var self = this;
		self.model.read({ completed: true }, function (data) {
			data.forEach(function (item) {
				self.removeItem(item.id);
			});
		});

		self._filter();
	};

	/**
	 * Si on lui donne un identifiant et une case à cocher, il mettra à jour 
	 * l'élément en stockage dans le modele sur l'état de la case à cocher.
	 *
	 * @param {number} id L'ID de l'élément complet ou incomplet
	 * @param {object} checkbox La case à cocher pour vérifier l'état complet ou imcomplet
	 * @param {boolean|undefined} silent Empêcher le re-filtrage des éléments de la liste
	 */
	Controller.prototype.toggleComplete = function (id, completed, silent) {
		var self = this;
		self.model.update(id, { completed: completed }, function () {
			self.view.render('elementComplete', {
				id: id,
				completed: completed
			});
		});

		if (!silent) {
			self._filter();
		}
	};

	/**
	 * Permet d'activer / désactiver l'état ON / OFF de toutes 
	 * les cases à cocher de l'intégralité des modèles.
	 */
	Controller.prototype.toggleAll = function (completed) {
		var self = this;
		self.model.read({ completed: !completed }, function (data) {
			data.forEach(function (item) {
				self.toggleComplete(item.id, completed, true);
			});
		});

		self._filter();
	};

	/**
	 * Met à jour les parties de la page qui changent 
	 * en fonction du nombre restant de todos.
	 */
	Controller.prototype._updateCount = function () {
		var self = this;
		self.model.getCount(function (todos) {
			self.view.render('updateElementCount', todos.active);
			self.view.render('clearCompletedButton', {
				completed: todos.completed,
				visible: todos.completed > 0
			});

			self.view.render('toggleAll', {checked: todos.completed === todos.total});
			self.view.render('contentBlockVisibility', {visible: todos.total > 0});
		});
	};

	/**
	 * Re-filtre les éléments de tâche en fonction de l'itinéraire (route) actif.
	 * @param {boolean|undefined} force  force une re-peinture des éléments todo.
	 */
	Controller.prototype._filter = function (force) {
		var activeRoute = this._activeRoute.charAt(0).toUpperCase() + this._activeRoute.substr(1);

		// Mettre à jour les éléments sur la page, qui changent à chaque fois
		this._updateCount();

		/** 
		 * Si la dernière route active n'est pas "All", ou si nous changeons de route, 
		nous recréons les éléments de l'élément todo, en appelant: this.show [Tout | Active | Completed] (); 
		*/
		if (force || this._lastActiveRoute !== 'All' || this._lastActiveRoute !== activeRoute) {
			this['show' + activeRoute]();
		}

		this._lastActiveRoute = activeRoute;
	};

	/**
	 * Met simplement à jour les états sélectionnés du filtre nav
	 */
	Controller.prototype._updateFilterState = function (currentPage) {
		/**
		 * Stockez une référence à la route active, ce qui nous permet de filtrer 
		 * à nouveau les éléments de tâche tels qu'ils sont marqués comme complets ou incomplets.
		 */
		this._activeRoute = currentPage;

		if (currentPage === '') {
			this._activeRoute = 'All';
		}

		this._filter();

		this.view.render('setFilter', currentPage);
	};

	/** Exporter vers la fenêtre
	 *  Création de app.Controller qui contient le constructeur Controller
	 *  et qu'on instancie dans app.js
	 */
	window.app = window.app || {};
	window.app.Controller = Controller;
})(window);