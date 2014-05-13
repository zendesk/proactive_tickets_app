(function() {

  return {
    events: {
      'app.activated':'init',
      'click .save':'saveClicked'
    },

    init: function() {
      this.switchTo('setup');
    },

    saveClicked: function() {
      console.log(this.getField('campaign-name'));
      console.log(this.getField('subkect'));
      console.log(this.getField('tags'));
      console.log(this.getField('description'));
    },

    getField: function(name) {
      var cssSelector = '.' + name;
      return this.$(cssSelector).val();
    }
  };

}());
