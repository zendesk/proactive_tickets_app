(function() {

  return {
    defaultState: 'loading',
    events: {
      'pane.activated': 'getData',
      'click .save':'saveClicked'
    },

    requests: {
      customerLists: function(){
        return{
          url: '/api/v2/user_views.json',
          type: 'GET',
          dataType: 'json'
        };
      },

      listTicketFields: function(){
        return{
          url: '/api/v2/ticket_fields.json',
          type: 'GET',
          dataType: 'json'
        };
      }

    },

    getData: function(){
    var self = this;
    var priorityOptions;
    var typeOptions;
     this.ajax('customerLists').then(function(customerListData){
        this.ajax('listTicketFields').then(function(fieldsData){
          for(var i=0; i<fieldsData.ticket_fields.length; i++){
            if(fieldsData.ticket_fields[i].type == 'priority'){
              priorityOptions = fieldsData.ticket_fields[i].system_field_options;
            }
            else if(fieldsData.ticket_fields[i].type == "tickettype"){
              typeOptions = fieldsData.ticket_fields[i].system_field_options;
            }
          }

          self.switchTo('main', {user_views:customerListData.user_views, fields:fieldsData.ticket_fields, priorities:priorityOptions, types:typeOptions});
        })
      })
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
