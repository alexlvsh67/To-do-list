
(function (window) {
	'use strict';

	/**
	     * Résume complètement le DOM du navigateur.
	     * Il a deux points d'entrée simples:
	     *
	     *   - bind(eventName, handler)
	     *     Prend un événement d'application todo et enregistre le gestionnaire
	     *   - render(command, parameterObject)
	     *     Rend la commande donnée avec les options
	     */
	function View(template) {
		this.template = template;

		this.ENTER_KEY = 13;
		this.ESCAPE_KEY = 27;

		this.$todoList = qs('.todo-list');
		this.$todoItemCounter = qs('.todo-count');
		this.$clearCompleted = qs('.clear-completed');
		this.$main = qs('.main');
		this.$footer = qs('.footer');
		this.$toggleAll = qs('.toggle-all');
		this.$newTodo = qs('.new-todo');
	}

	/**
	 * Méthode qui supprime un élément de la vue
	 * 
	 * @param {number} id Prend un id en paramètre.
	 */
	View.prototype._removeItem = function (id) {
		var elem = qs('[data-id="' + id + '"]');

		if (elem) {
			this.$todoList.removeChild(elem);
		}
	};

	/**
	 * crée une méthode contenant l'objet this.template en l'associant à la fonction clearCompletedButton.
	 *  Cette fonction permet de lui appliquer le paramètre css "block"(visible) ou "none"(invisible).
	 */
	View.prototype._clearCompletedButton = function (completedCount, visible) {
		this.$clearCompleted.innerHTML = this.template.clearCompletedButton(completedCount);
		this.$clearCompleted.style.display = visible ? 'block' : 'none';
	};

    /**
	 * Utilise la fonction qs() définit dans helper, 
	 * Dans un premier temps enleve la classe .selected a l'élément de classe .filter,
	 * dans un deuxiemes temps attribue la classe .selected à la page actuel.
	 * 
	 * @param {string} currentPage 
	 */
	View.prototype._setFilter = function (currentPage) {
		qs('.filters .selected').className = '';
		qs('.filters [href="#/' + currentPage + '"]').className = 'selected';
	};

	/**
	 * Sélectionn un id, si l'id n'est pas trouvé on quitte la fonction
	 * Si l'id est trouvé on lui attribut la classe 'completed'.
	 * 
	 * @param {number} id 
	 * @param {string} completed 
	 */
	View.prototype._elementComplete = function (id, completed) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		listItem.className = completed ? 'completed' : '';

		// Au cas où il a été basculé d'un événement et non en cochant la case
		qs('input', listItem).checked = completed;
	};

    /**
	 * On rajoute au nom de la classe la String 'editing'
	 * On crée un input et lui attribue la classe 'edit', un focus, un titre
	 * qui correspond au title passé en paramètre et on l'insère dans le DOM.
	 */

	View.prototype._editItem = function (id, title) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		listItem.className = listItem.className + ' editing';

		var input = document.createElement('input');
		input.className = 'edit';

		listItem.appendChild(input);
		input.focus();
		input.value = title;
	};

	/**
	 * Récupère un id passé en paramètre de la fonction, 
	 * supprime son enfant input, et sa className. 
	 * Il récupère également tous les paramètres css avec label, 
	 * les parcours et supprimme celui qui possède 
	 * la même valeur que le textContent passé en paramètre de la fonction.
	 * 
	 */

	View.prototype._editItemDone = function (id, title) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		var input = qs('input.edit', listItem);
		listItem.removeChild(input);

		listItem.className = listItem.className.replace('editing', '');

		qsa('label', listItem).forEach(function (label) {
			label.textContent = title;
		});
	};

    /**
	 * Crée un objet ViewCommands qui contient contient plusieurs
	 * méthodes qui utilise toutes le parametre passé à la méthode .render
	 */

	View.prototype.render = function (viewCmd, parameter) {
		var self = this;
		var viewCommands = {

			showEntries: function () {
				self.$todoList.innerHTML = self.template.show(parameter);
			},
			/**
			 * Utilise la fonction _removeItem pour supprimer l'enfant 
			 * de l'élement passé en paramètre
			 */
			removeItem: function () {
				self._removeItem(parameter);
			},
			updateElementCount: function () {
				self.$todoItemCounter.innerHTML = self.template.itemCounter(parameter);
			},
			/**
			 * Utilise la fonction _clearCompletedButton() pour lui appliquer 
			 * le paramètre css "block"(visible) ou "none"(invisible).
			 */
			clearCompletedButton: function () {
				self._clearCompletedButton(parameter.completed, parameter.visible);
			},
			/**
			 * Attribut la propriété css display à la class main et footer et 
			 * lui donne la valeur "block" ou "none" selon qu'il soit visible ou non.
			 */
			contentBlockVisibility: function () {
				self.$main.style.display = self.$footer.style.display = parameter.visible ? 'block' : 'none';
			},
			/** Attribue le paramètre 'checked' au parmètre passé à la fonction */
			toggleAll: function () {
				self.$toggleAll.checked = parameter.checked;
			},
			/** Utilise la méthode ._setFilter et lui passe le parametre */
			setFilter: function () {
				self._setFilter(parameter);
			},
			/** Attribue une valeur vide à la nouvelle todo*/
			clearNewTodo: function () {
				self.$newTodo.value = '';
			},
			/**Utilise la méthode _elementComplete et lui assigne l'id du parametre et sa proptiété .completed */
			elementComplete: function () {
				self._elementComplete(parameter.id, parameter.completed);
			},
			/**Utilise la méthode _editItem et lui assigne l'id du parametre et son title */
			editItem: function () {
				self._editItem(parameter.id, parameter.title);
			},
			/**Utilise la méthode _editItemDone et lui assigne l'id du parametre et son title */
			editItemDone: function () {
				self._editItemDone(parameter.id, parameter.title);
			}
		};

		/** On passe le parametre de la méthode .render à l'objet
		 * viewCommands et on l'éxécute.
		 */
		viewCommands[viewCmd]();
	};

	View.prototype._itemId = function (element) {
		var li = $parent(element, 'li');
		return parseInt(li.dataset.id, 10);
	};

	/**
	 *  utilise la fonction $delegate définit dans helpers.js avec différents paramètres
	 */
	View.prototype._bindItemEditDone = function (handler) {
		var self = this;
		$delegate(self.$todoList, 'li .edit', 'blur', function () {
			if (!this.dataset.iscanceled) {
				handler({
					id: self._itemId(this),
					title: this.value
				});
			}
		});

		$delegate(self.$todoList, 'li .edit', 'keypress', function (event) {
			if (event.keyCode === self.ENTER_KEY) {
				/** Retire le curseur de la saisie lorsqu'on appuie sur Entrée*/
				this.blur();
			}
		});
	};

	/**
	 * utilise la fonction $delegate définit dans helpers.js avec différents paramètres
	 * Si la touche echap est préssé lors d'une dition de tache, 
	 * annule tout ce qui à été entré
	 */
	View.prototype._bindItemEditCancel = function (handler) {
		var self = this;
		$delegate(self.$todoList, 'li .edit', 'keyup', function (event) {
			if (event.keyCode === self.ESCAPE_KEY) {
				this.dataset.iscanceled = true;
				this.blur();

				handler({id: self._itemId(this)});
			}
		});
	};

	/**
	 * Selon la valeur du premier parametre passé à cette méthode,
	 * rentre dans un if, de la on utilise soit la méthode $delegate 
	 * défint dans helper.js, soit la méthode $on définit également dans helper.js
	 */
	View.prototype.bind = function (event, handler) {
		var self = this;
		if (event === 'newTodo') {
			$on(self.$newTodo, 'change', function () {
				handler(self.$newTodo.value);
			});

		} else if (event === 'removeCompleted') {
			$on(self.$clearCompleted, 'click', function () {
				handler();
			});

		} else if (event === 'toggleAll') {
			$on(self.$toggleAll, 'click', function () {
				handler({completed: this.checked});
			});

		} else if (event === 'itemEdit') {
			$delegate(self.$todoList, 'li label', 'dblclick', function () {
				handler({id: self._itemId(this)});
			});

		} else if (event === 'itemRemove') {
			$delegate(self.$todoList, '.destroy', 'click', function () {
				handler({id: self._itemId(this)});
			});

		} else if (event === 'itemToggle') {
			$delegate(self.$todoList, '.toggle', 'click', function () {
				handler({
					id: self._itemId(this),
					completed: this.checked
				});
			});

		} else if (event === 'itemEditDone') {
			self._bindItemEditDone(handler);

		} else if (event === 'itemEditCancel') {
			self._bindItemEditCancel(handler);
		}
	};

	/** Exporter vers la fenêtre
	 *  Création de app.View qui contient le constructeur View
	 *  et qu'on instancie dans app.js
	 */
	window.app = window.app || {};
	window.app.View = View;
}(window));
