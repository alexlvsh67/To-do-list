
(function (window) {
	'use strict';

	/**
	 * Création d'un objet htmlEscapes avec différentes propriétés
	 * correspondant aux touches d'un clavier
	 */
	var htmlEscapes = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		'\'': '&#x27;',
		'`': '&#x60;'
	};

	/**
	 * Création de la variable escapeHtmlChar qui prend en paramètre
	 * une valeur et retourne la valeur de htmlEscapes sous forme de tableau
	 */
	var escapeHtmlChar = function (chr) {
		return htmlEscapes[chr];
	};

	/**
	 * La regex reUnescapedHtml recherche un des caractères situé entre les 2 slash
	 * le g signifie « rechercher plusieurs fois , c'est à dire 
	 * que si une occurence est trouvé la recherche continuera.
	 */
	var reUnescapedHtml = /[&<>"'`]/g;

	/** https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/RegExp/source */
	var reHasUnescapedHtml = new RegExp(reUnescapedHtml.source);

	var escape = function (string) {
		return (string && reHasUnescapedHtml.test(string))
			? string.replace(reUnescapedHtml, escapeHtmlChar)
			: string;
	};

	/**
	 * Définit les valeurs par défaut pour toutes les méthodes de modèle telles qu'un modèle par défaut
	 *
	 * @constructor
	 */
	function Template() {
		this.defaultTemplate
		=	'<li data-id="{{id}}" class="{{completed}}">'
		+		'<div class="view">'
		+			'<input class="toggle" type="checkbox" {{checked}}>'
		+			'<label>{{title}}</label>'
		+			'<button class="destroy"></button>'
		+		'</div>'
		+	'</li>';
	}

	/**
	 * Crée une chaîne HTML <li> et la renvoie pour l'insérer dans l'application.
	 *
	 * NOTE: Dans la vraie vie, vous devriez utiliser un moteur de template comme 
	 * Moustache ou Handlebars, cependant, ceci est un exemple vanilla JS.
	 *
	 * @param {object} data L'objet contenant les clés que vous souhaitez 
	 *                      trouver dans le modèle à remplacer.
	 * @returns {string} Chaîne HTML d'un élément <li>
	 *
	 * @example
	 * view.show({
	 *	id: 1,
	 *	title: "Hello World",
	 *	completed: 0,
	 * });
	 */
	Template.prototype.show = function (data) {
		var i, l;
		var view = '';

		for (i = 0, l = data.length; i < l; i++) {
			var template = this.defaultTemplate;
			var completed = '';
			var checked = '';

			if (data[i].completed) {
				completed = 'completed';
				checked = 'checked';
			}

			template = template.replace('{{id}}', data[i].id);
			template = template.replace('{{title}}', escape(data[i].title));
			template = template.replace('{{completed}}', completed);
			template = template.replace('{{checked}}', checked);

			view = view + template;
		}

		return view;
	};

	/**
	 * Affiche un compteur du nombre de tâches à terminer
	 * Si il y as plusisurs taches en cours on rajoutera u "s" à "left".
	 * 
	 * @param {number} activeTodos Le nombre de tache active
	 * @returns {string} Retourne le nombre de tache active
	 */
	Template.prototype.itemCounter = function (activeTodos) {
		var plural = activeTodos === 1 ? '' : 's';

		//return '<strong>' + activeTodos + '</strong> item' + plural + ' left';  La balise <strong> semble inutile 
		return  activeTodos + ' item' + plural + ' left'; 
	};

	/**
	 * Si le nombre de tâches complétés est supérieur à 0 on affiche
	 * 'Clear completed', sinon on n'affiche rien.
	 *
	 * @param  {type} completedTodos Le nombre de tâche complete.
	 * @returns {string} Chaîne contenant le nombre
	 */
	Template.prototype.clearCompletedButton = function (completedTodos) {
		if (completedTodos > 0) {
			return 'Clear completed';
		} else {
			return '';
		}
	};

	/** Exporter vers la fenêtre
	 *  Création de app.Template qui contient le constructeur Template
	 *  et qu'on instancie dans app.js
	 */
	window.app = window.app || {};
	window.app.Template = Template;
})(window);
