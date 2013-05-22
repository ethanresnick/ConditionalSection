(function() {
  var ConditionalSection, ConditionalSectionSet, DecisionScreenSet, global,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ConditionalSection = (function() {
    function ConditionalSection(container) {
      var data, listener,
        _this = this;

      this.container = container;
      data = {
        that: this
      };
      listener = function(e) {
        return _this.handleEvent(e);
      };
      this.toggle = container.find('.' + this.constants.classToggle);
      this.section = container.find('.' + this.constants.classSection).eq(0);
      this.isShown = this.toggle.find(':checked').length > 0;
      if (this.toggle.find('input, a').length === 0) {
        this.toggle.contents().wrap('<a href="" onclick="return false;" />');
      }
      if (this.toggle.find('input').length) {
        this.toggle.change(data, listener);
      } else {
        this.toggle.click(data, listener);
      }
    }

    ConditionalSection.prototype.handleEvent = function(event) {
      return this.update();
    };

    ConditionalSection.prototype.update = function() {
      this.isShown = !this.isShown;
      return this.render();
    };

    ConditionalSection.prototype.render = function() {
      this.container.removeClass(this.constants.classHidden + ' ' + this.constants.classShown).addClass(this.isShown ? this.constants.classShown : this.constants.classHidden);
      return null;
    };

    ConditionalSection.prototype.constants = {
      classContainer: 'conditional-section',
      classHidden: 'condition-not-met',
      classShown: 'condition-met',
      classSection: 'contents',
      classToggle: 'toggle'
    };

    return ConditionalSection;

  })();

  ConditionalSectionSet = (function(_super) {
    __extends(ConditionalSectionSet, _super);

    function ConditionalSectionSet(container) {
      var currChoice, that;

      ConditionalSectionSet.__super__.constructor.call(this, container);
      that = this;
      currChoice = this.toggle.find(':checked');
      this.sections = container.find('.' + this.constants.classSection).filter(function() {
        return $(this).parents('.' + that.constants.classContainer).get(0) === container.get(0);
      });
      this.section = currChoice.length ? this.sections.filter('.' + currChoice.eq(0).val()) : false;
    }

    ConditionalSectionSet.prototype.handleEvent = function(event) {
      var targetVal, validSection;

      targetVal = $(event.target).val();
      validSection = event.data.that.sections.filter('.' + targetVal);
      if (targetVal && validSection.length) {
        return this.update(validSection.eq(0), targetVal);
      }
    };

    ConditionalSectionSet.prototype.update = function(newSection, key) {
      this.isShown = true;
      this.section = newSection;
      return this.render();
    };

    ConditionalSectionSet.prototype.render = function() {
      ConditionalSectionSet.__super__.render.apply(this, arguments);
      this.sections.removeClass(this.constants.classShownSection);
      if (this.section) {
        this.section.addClass(this.constants.classShownSection);
      }
      return null;
    };

    ConditionalSectionSet.prototype.constants.classShownSection = 'active-section';

    return ConditionalSectionSet;

  })(ConditionalSection);

  DecisionScreenSet = (function(_super) {
    __extends(DecisionScreenSet, _super);

    function DecisionScreenSet(container) {
      DecisionScreenSet.__super__.constructor.call(this, container);
      this.sections.bind('click change', {
        'that': this
      }, function(e) {
        return e.data.that.handleEvent(e);
      });
    }

    DecisionScreenSet.prototype.handleEvent = function(event) {
      if ($(event.target).val() === 'reset') {
        return this.reset();
      } else {
        return DecisionScreenSet.__super__.handleEvent.call(this, event);
      }
    };

    DecisionScreenSet.prototype.update = function(newSection, key) {
      this.toggle.hide();
      return DecisionScreenSet.__super__.update.call(this, newSection, key);
    };

    DecisionScreenSet.prototype.reset = function() {
      this.section = false;
      this.toggle.show();
      return this.render();
    };

    return DecisionScreenSet;

  })(ConditionalSectionSet);

  global = typeof exports !== "undefined" && exports !== null ? exports : this;

  global.ConditionalSection = ConditionalSection;

  global.ConditionalSectionSet = ConditionalSectionSet;

  global.DecisionScreenSet = DecisionScreenSet;

}).call(this);
