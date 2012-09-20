(function(global){
    function extend(SubClassConstructor, SuperClassConstructor) {
		//create a new, dummy object that we can use to prototype chain in the superClass's prototype while allowing us to bypass
		//its constructor, which would potentially throw errors (if it's missing args) and would drop instance vars onto our prototype.
		function Chainer() {};
		Chainer.prototype = SuperClassConstructor.prototype;

		SubClassConstructor.prototype = new Chainer();
		SubClassConstructor.prototype.constructor = SubClassConstructor;
	};
	
	/**
	 * Handles "conditional sections", meaning that it takes a DOM structure and
	 * looks for/hooks into a toggle that will switch a section of content on or off.
	 *
	 * @constructor
	 * @param {jQuery} container A jQuery-wrapped DOM element that contains your toggle and its sections.
	 */ 
	function ConditionalSection(container) {
		var that = this;
		
		this.container = container;
		this.toggle    = container.find('.' + this.constants.classToggle);
		this.section   = container.find('.' + this.constants.classSection).eq(0);
	
		this.isShown   = this.toggle.find(':checked').length ? true : false;
	
		//add listeners, etc
		if(!this.toggle.find('input,a').length) { this.toggle.contents().wrap('<a href="" onclick="return false;" />'); }
		this.toggle.find('input').length ? this.toggle.change(function(e) { that.update(e); }) : this.toggle.click(function(e) { that.update(e); });
	}

	ConditionalSection.prototype.constants = {'classHidden': 'condition-not-met', 'classShown': 'condition-met', 'classSection': 'contents', 'classToggle': 'toggle'};
	ConditionalSection.prototype.update = function(event) {
		this.isShown = !this.isShown;
		this.render();
	}
	ConditionalSection.prototype.render = function() {		
		this.container
			.removeClass(this.constants.classHidden + ' ' + this.constants.classShown)
			.addClass(this.isShown ? this.constants.classShown : this.constants.classHidden);
	}

	/**
	 * Handles "conditional section sets", meaning that it takes a DOM structure and looks for/hooks into
	 * a control that contains multiple inputs that will switch between showing one of a set of sections.
	 *
	 * @constructor
	 * @param {jQuery} container A jQuery-wrapped DOM element that contains your toggle and its sections.
	 */ 	
	function ConditionalSectionSet(container) {
		ConditionalSection.prototype.constructor.call(this, container);
		this.sections     = container.find('.' + this.constants.classSection);
		this.section      = this.toggle.find(':checked').length ? this.sections.filter('.'+ this.toggle.find(':checked').eq(0).val()) : false;
	}
	extend(ConditionalSectionSet, ConditionalSection);
	ConditionalSectionSet.prototype.constants.classShownSection = 'active-section';

	ConditionalSectionSet.prototype.update = function(event) {
		this.isShown = true;
		this.section = this.sections.filter('.'+$(event.target).val());
		this.render();
	}

	ConditionalSectionSet.prototype.render = function() {
		ConditionalSection.prototype.render.call(this);
		this.sections.removeClass(this.constants.classShownSection);
		if(this.section) { this.section.addClass(this.constants.classShownSection); }
	}
	
	/**
	 * Handles a conditional section set with a decision screen (i.e. the toggle
	 * goes away after the user picks an option and then can be reinvoked later).
	 *
	 * @constructor
	 * @param {jQuery} container A jQuery-wrapped DOM element that contains your toggle and its sections.
	 */ 	
	function DecisionScreenSet(container, preUpdateCallback) {
		ConditionalSectionSet.prototype.constructor.call(this, container);
		this.preUpdate = preUpdateCallback || function() {};
	}
	extend(DecisionScreenSet, ConditionalSectionSet);
	
	DecisionScreenSet.prototype.update = function(event) {
		this.preUpdate(event);

		if($(event.target).val()) {//a valid option
			this.toggle.hide();
		}
		ConditionalSectionSet.prototype.update.call(this, event);
	}

	DecisionScreenSet.prototype.showToggle = function() {
		this.toggle.show();
	}

    //export from the closure
    global.ConditionalSection    = ConditionalSection;
    global.ConditionalSectionSet = ConditionalSectionSet;
    global.DecisionScreenSet     = DecisionScreenSet;

}(this));