(function(global){
    function extend(SubClassConstructor, SuperClassConstructor) {
        //create a new, dummy object that we can use to prototype chain in the superClass's prototype while allowing us to bypass
        //its constructor, which would potentially throw errors (if it's missing args) and would drop instance vars onto our prototype.
        function Chainer() {};
        Chainer.prototype = SuperClassConstructor.prototype;

        SubClassConstructor.prototype = new Chainer();
        SubClassConstructor.prototype.constructor = SubClassConstructor;
        //Set super as not an prototype property so that it's less susceptible to reassignments of this. e.g. calling SubClass.x() might
        //really produce a call of subType.__proto__.__proto__.x() (i.e. an x on the prototype of the SuperClass), and in that x `this`
        //will point to the SubClass instance, even though the SuperClass's method probably expects it to point to the SuperClass' instance.
        //We could make it an inherited property too (i.e. on SubClassConstructor.prototype), but there's really no need. Any instance
        //that wants to get access to it's parent's prototype can do so with inst.constructor.__super__;
        SubClassConstructor.__super__  = SuperClassConstructor.prototype;
    };
    
    /**
     * Handles "conditional sections", meaning that it takes a DOM structure and
     * looks for/hooks into a toggle that will switch a section of content on or off.
     *
     * @constructor
     * @param {jQuery} container A jQuery-wrapped DOM element that contains your toggle and its sections.
     */ 
    function ConditionalSection(container) {
        var that = this,
            listener = function(e) { that.handleEvent(e); };
        
        this.container = container;
        this.toggle    = container.find('.' + this.constants.classToggle);
        this.section   = container.find('.' + this.constants.classSection).eq(0);
    
        this.isShown   = this.toggle.find(':checked').length ? true : false;
    
        //add listeners, etc
        if(!this.toggle.find('input,a').length) { this.toggle.contents().wrap('<a href="" onclick="return false;" />'); }
        this.toggle.find('input').length ? this.toggle.change(listener) : this.toggle.click(listener);
    }
    
    ConditionalSection.prototype.constants = {'classContainer':'conditional-section', 'classHidden': 'condition-not-met', 'classShown': 'condition-met', 'classSection': 'contents', 'classToggle': 'toggle'};
    ConditionalSection.prototype.handleEvent = function(event) {
        this.update($(event.target));
    }
    ConditionalSection.prototype.update = function(elm) {
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
        ConditionalSectionSet.__super__.constructor.call(this, container);
		var that = this;
        this.sections     = container.find('.' + this.constants.classSection).filter(function() { return ($(this).parents('.'+ that.constants.classContainer).get(0)==container.get(0)); });
        this.section      = this.toggle.find(':checked').length ? this.sections.filter('.'+ this.toggle.find(':checked').eq(0).val()) : false;
    }
    extend(ConditionalSectionSet, ConditionalSection);
    ConditionalSectionSet.prototype.constants.classShownSection = 'active-section';

    ConditionalSectionSet.prototype.handleEvent = function(event) {
        var target = $(event.target);
        if(target.val()) { this.update(target); }
    }
    ConditionalSectionSet.prototype.update = function(elm) {
            this.isShown = true;
            this.section = this.sections.filter('.'+elm.val());
            this.render();
    }

    ConditionalSectionSet.prototype.render = function() {
        ConditionalSectionSet.__super__.render.call(this);

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
        DecisionScreenSet.__super__.constructor.call(this, container);
    }
    extend(DecisionScreenSet, ConditionalSectionSet);
    
    DecisionScreenSet.prototype.update = function(elm) {
		if(elm.val()!='toggle') {
			this.toggle.hide();
	        DecisionScreenSet.__super__.update.call(this, elm);
		}
		else {
			this.reset();	
		}
        
    }

    DecisionScreenSet.prototype.reset = function() {
		this.sections.hide();
        this.toggle.show();
    }

    //export from the closure
    global.ConditionalSection    = ConditionalSection;
    global.ConditionalSectionSet = ConditionalSectionSet;
    global.DecisionScreenSet     = DecisionScreenSet;

}(this));