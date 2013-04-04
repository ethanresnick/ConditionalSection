(function(global){

    /** 
     * Generic function for creating javascript "subclasses".
     * 
     * Modifies SubClassConstructor so it's prototype chain includes SuperClassConstructor.prototype.
     * Also adds an __super__ property to SubClassConstructor that points the super class's prototype.
     * 
     * @param {function} SubClassConstructor The constructor function for the subclass.
     * @param {function} SuperClassConstructor The constructor function for the superclass.
     */ 
    function extend(SubClassConstructor, SuperClassConstructor) {
        function Chainer() {
            this.constructor = SubClassConstructor;
        };

        Chainer.prototype = SuperClassConstructor.prototype;
        SubClassConstructor.prototype = new Chainer();
        SubClassConstructor.__super__  = SuperClassConstructor.prototype;
    };
    
    /**
     * A Conditional Section is a section of content that's toggled on and off 
     * when the user clicks on an associated, adjacent toggle.
     *
     * @constructor
     * @param {jQuery} container A jQuery-wrapped DOM element that contains your toggle and its section.
     */ 
    function ConditionalSection(container) {

        //prep variables for our event listeners
        var that = this, data = {'that':this}, listener = function(e) { that.handleEvent(e); };
        
        //initialize the instance vars
        this.container = container;
        this.toggle    = container.find('.' + this.constants.classToggle);
        this.section   = container.find('.' + this.constants.classSection).eq(0);
        this.isShown   = this.toggle.find(':checked').length ? true : false;
 
        //if the elem marked as the toggle doesn't contain anything that could be the toggle 
        //(i.e. an elem, usually an input or link, that can be focused and acted on), wrap the 
        //toggle's contents in a link that will capture the click event when the toggle is used.
        if(!this.toggle.find('input, a').length) { 
            this.toggle.contents().wrap('<a href="" onclick="return false;" />'); 
        }

        //add listeners (which call handleEvent) to trigger the section show/hide.
        //will be a change listener if the toggle is an input (e.g. a checkbox) and a click listener if a link.
        this.toggle.find('input').length ? this.toggle.change(data, listener) : this.toggle.click(data, listener);
    }
    
    ConditionalSection.prototype.constants = {
        'classContainer':'conditional-section', 
        'classHidden': 'condition-not-met', 
        'classShown': 'condition-met', 
        'classSection': 'contents', 
        'classToggle': 'toggle'
    };

    ConditionalSection.prototype.handleEvent = function(event) {
        this.update();
    }

    ConditionalSection.prototype.update = function() {
        this.isShown = !this.isShown;
        this.render();
    }

    ConditionalSection.prototype.render = function() {      
        this.container
            .removeClass(this.constants.classHidden + ' ' + this.constants.classShown)
            .addClass(this.isShown ? this.constants.classShown : this.constants.classHidden);
    }


    /**
     * A Conditional Section Set is a group of related sections in which only one section applies 
     * (and is therefore the only one that's shown), depending on a user's choice from a set of options.
     * It's similar to a tab bar behaviorally, in that if the user clicks on a different radio button 
     * (i.e. makes a different choice) a different section shows up. But it has different semantics: 
     * unlike tabs, where the user might find the content in all the tabs relevant at the same time, 
     * in a conditional section set, only one section is ultimately applicable. The only point of the 
     * section switching mechanism, therefore, is if the user changes his/her mind about the main choice
     * that dictates which section applies.
     *
     * @constructor
     * @param {jQuery} container A jQuery-wrapped DOM element that contains your toggle and its sections.
     */     
    function ConditionalSectionSet(container) {

        ConditionalSectionSet.__super__.constructor.call(this, container);
        var that = this, selectedChoice = this.toggle.find(':checked');
    
        this.sections = container.find('.' + this.constants.classSection).filter(function() { 
                return ($(this).parents('.'+ that.constants.classContainer).get(0)==container.get(0)); 
        });
        this.section  = selectedChoice.length ? this.sections.filter('.'+ selectedChoice.eq(0).val()) : false;
    }

    extend(ConditionalSectionSet, ConditionalSection);
    ConditionalSectionSet.prototype.constants.classShownSection = 'active-section';

    ConditionalSectionSet.prototype.handleEvent = function(event) {
        var targetVal    = $(event.target).val(), 
            sections     = event.data.that.sections, 
            validSection = sections.filter('.'+targetVal);

        if(targetVal && validSection.length) {
            this.update(validSection.eq(0), targetVal);
        }
    }

    ConditionalSectionSet.prototype.update = function(newSection, key) {
            this.isShown = true;
            this.section = newSection;
            this.render();
    }

    ConditionalSectionSet.prototype.render = function() {
        ConditionalSectionSet.__super__.render.call(this);

        this.sections.removeClass(this.constants.classShownSection);
        if(this.section) { this.section.addClass(this.constants.classShownSection); }
    }


    /**
     * Handles the Conditional Section Set semantics with a "decision screen" acting as the toggle.
     * A decision screen is an intermediate screen that requires the user to make a choice before 
     * seeing any section (i.e. there never a default section) and that is then hidden until the user 
     * specifically reinvokes it. This is useful for conditional section sets where you want the user 
     * to think more carefully about the decision upfront (e.g. because switching midway might cause 
     * some of their input to be lost) or where the initial options need some explanatory text 
     * (on the decision screen) that should then go away after the user's chosen.
     *
     * @constructor
     * @param {jQuery} container A jQuery-wrapped DOM element that contains your toggle and its sections.
     */     
    function DecisionScreenSet(container) {
        DecisionScreenSet.__super__.constructor.call(this, container);
        this.sections.bind('click change', {'that':this}, function(e) { e.data.that.handleEvent(e); });
    }
    extend(DecisionScreenSet, ConditionalSectionSet);
    
    DecisionScreenSet.prototype.handleEvent = function(event) {
        if($(event.target).val()=='reset') {
            this.reset();
        }
        else{
            DecisionScreenSet.__super__.handleEvent.call(this, event);
        }
    }
    
    DecisionScreenSet.prototype.update = function(newSection, key) {
        this.toggle.hide();
        DecisionScreenSet.__super__.update.call(this, newSection, key);
    }

    DecisionScreenSet.prototype.reset = function() {
        this.section = false;
        this.toggle.show();
        this.render();
    }

    //export constructors to the global
    global.ConditionalSection    = ConditionalSection;
    global.ConditionalSectionSet = ConditionalSectionSet;
    global.DecisionScreenSet     = DecisionScreenSet;

}(this));
