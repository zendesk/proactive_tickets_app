(function() {

  return {
    defaultState: 'loading',
    events: {
      'pane.activated': 'getCustomerLists',
      'click .save':'saveClicked'
    },

    requests: {
      customerLists: function(){
        return{
          url: '/api/v2/user_views.json',
          type: 'GET',
          dataType: 'json'
        };
      }
    },

    getCustomerLists: function(){
      var request = this.ajax('customerLists');
      request.done(this.displayForm);
      //request.fail(this.showError);
    },

    displayForm: function(data){
      this.switchTo('main', data);
    },

    saveClicked: function() {
      this.getField('campaign-name');
      this.getField('subject');
      this.getField('tags');
      this.getField('description');
    },

    getField: function(name) {
      var cssSelector = '.' + name,
          value = this.$(cssSelector).val();

      console.log(name + ': ' + value);

      return value;
    }
  };

}());
