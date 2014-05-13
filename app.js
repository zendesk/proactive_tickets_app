(function() {

  return {
    events: {
      'app.activated':'init',
      'pane.activated': 'getCustomerLists'
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

    init: function() {
    }
  };

}());
