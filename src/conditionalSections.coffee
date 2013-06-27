# A Conditional Section is a section of content that's toggled on and off when the user clicks on 
# an associated, adjacent toggle.
#
# @constructor
# @param {jQuery} container A jQuery-wrapped DOM element that contains your toggle and its section.
#
class ConditionalSection

  constructor: (@container) ->
    # prep vars for our event listeners
    data = that: @
    listener = (e) => @handleEvent e

    # init instance vars    
    @toggle  = container.find '.' + @constants.classToggle
    @section = container.find('.' + @constants.classSection).eq 0
    @isShown = @toggle.find(':checked').length > 0

    # if the toggle elem is missing any child elem that could be the toggle (i.e. one, usually an
    # input or link, that can be focused and acted on), wrap the toggle's content in a link that
    # will capture the click event when the toggle is used.
    if @toggle.find('input, a').length is 0
      @toggle.contents().wrap '<a href="" onclick="return false;" />' 

    # add listeners (which call handleEvent) to trigger the show/hide-- a change listener if the
    # toggle is an input (e.g. a checkbox) and a click listener if a link.
    if @toggle.find('input').length
    then @toggle.change(data, listener)
    else @toggle.click(data, listener)

  handleEvent: (event) -> @update()

  update: () ->
    @isShown = !@isShown
    @render()

  render: () ->    
    @container
      .removeClass(@constants.classHidden + ' ' + @constants.classShown)
      .addClass(if @isShown then @constants.classShown else @constants.classHidden)
    null
    
  constants:
    classContainer: 'conditional-section', 
    classHidden:    'condition-not-met', 
    classShown:     'condition-met', 
    classSection:   'contents', 
    classToggle:    'toggle'


# A Conditional Section Set is a group of related sections in which only one section applies
# (and is therefore the only one that's shown), depending on a user's choice from a set of options.
#
# It's similar to a tab bar behaviorally, in that if the user clicks on a different radio button
# (i.e. makes a different choice) a different section shows up. But it has different semantics:
# unlike tabs, where the user might find the content in all the tabs relevant at the same time, in
# a conditional section set, only one section is ultimately applicable. The only point of the
# section switching mechanism, therefore, is if the user changes his/her mind about the main choice
# that dictates which section applies.
#
# @constructor
# @param {jQuery} container A jQuery-wrapped DOM elem containing your toggle & its sections
#
class ConditionalSectionSet extends ConditionalSection

  constructor: (container) ->
    super container

    that = @; currChoice = @toggle.find ':checked'
    
    @sections = container.find('.'+ @constants.classSection).filter(() ->
      $(@).parents('.' + that.constants.classContainer).get(0) is container.get(0))
    @section = if currChoice.length then @sections.filter('.'+currChoice.eq(0).val()) else false

  handleEvent: (event) ->
    targetVal = $(event.target).val()
    validSection = if targetVal then event.data.that.sections.filter('.'+targetVal) else false;

    if validSection && validSection.length then @update(validSection.eq(0), targetVal)

  update: (newSection, key) -> 
    @isShown = true
    @section = newSection
    @render()

  render: () ->
    super

    @sections.removeClass @constants.classShownSection
    this.section.addClass(this.constants.classShownSection) if this.section
    null

  ConditionalSectionSet::constants.classShownSection = 'active-section'  

# Handles the Conditional Section Set semantics with a "decision screen" acting as the toggle.
# A decision screen is an intermediate screen that requires the user to make a choice before seeing
# any section (i.e. there never a default section) and that is then hidden until the user specific-
# ally reinvokes it. This is useful for Conditional Section Sets where you want the user to think
# more carefully about the decision upfront (e.g. because switching midway might cause some of their
# input to be lost) or where the initial options need some explanatory text (on the decision screen)
# that should then go away after the user's chosen.
#
# @constructor
# @param {jQuery} container A jQuery-wrapped DOM element that contains your toggle and its sections.
#     
class DecisionScreenSet extends ConditionalSectionSet
  constructor: (container) ->
    super container
    @userHasChosen = false
    @sections.bind('click change', 'that': @, (e) -> e.data.that.handleEvent(e))
    
  handleEvent: (event) ->
    if $(event.target).val() is 'reset' then @reset() else super(event)
    
  update: (newSection, key) ->
    @userHasChosen = true
    super newSection, key

  reset: () ->
    @section = false
    @userHasChosen = false
    @render()

  render: () ->
    if @userHasChosen then @toggle.hide() else @toggle.show()
    super()


# export constructors to the global
global = exports ? this
global.ConditionalSection    = ConditionalSection
global.ConditionalSectionSet = ConditionalSectionSet
global.DecisionScreenSet     = DecisionScreenSet;