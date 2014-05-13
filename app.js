(function() {

  return {
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
