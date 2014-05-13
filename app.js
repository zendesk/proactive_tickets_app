(function() {

  return {
    defaultState: 'loading',
    createdTickets: 0,
    submittedTickets: null,
    events: {
      'pane.activated': 'getData',
      'click .save':'saveClicked',
      'createTicket.done': 'updateProgressStatus'
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
      },

      groupMemberships: function(){
        return{
          url: '/api/v2/group_memberships/assignable.json?include=users,groups',
          type: 'GET',
          dataType: 'json'
        };

      createTicket: function(data) {
        return {
          url: '/api/v2/tickets.json',
          type: 'POST',
          data: data
        }
      }
    },

    getData: function(){
    var self = this;
    var priorityOptions;
    var typeOptions;
    var statusOptions;
     this.ajax('customerLists').then(function(customerListData){
        this.ajax('listTicketFields').then(function(fieldsData){
          this.ajax('groupMemberships').then(function(groupData){

            // Fetch option lists for priority, type, and status
            for(var i=0; i<fieldsData.ticket_fields.length; i++){
              if(fieldsData.ticket_fields[i].type == 'priority'){
                priorityOptions = fieldsData.ticket_fields[i].system_field_options;
              }
              else if(fieldsData.ticket_fields[i].type == "tickettype"){
                typeOptions = fieldsData.ticket_fields[i].system_field_options;
              }
              else if(fieldsData.ticket_fields[i].type == "status"){
                statusOptions = fieldsData.ticket_fields[i].system_field_options;
              }
            }

            // Send all data into the main template
            self.switchTo('main', {user_views:customerListData.user_views, fields:fieldsData.ticket_fields, priorities:priorityOptions, types:typeOptions, statuses:statusOptions, groupAssignees:groupData});

          })
        })
      })
    },

    getTagsArray: function() {
      var tags = this.getField('tags') + ' ' + this.getCampaignNameTag();
      return tags.split(' ');
    },

    getCampaignNameTag: function() {
      var campaignName = this.getField('campaign-name');
      return campaignName.replace(/[^\w\s]/gi, '').replace(/\s/g, '_').replace(/ /g, '').toLowerCase();
    },

    saveClicked: function() {
      var subject = this.getField('subject'),
          tags = this.getTagsArray(),
          description = this.getField('description');

      for(var number=0; number < 50; number++) {
        var data = {
          ticket: {
            subject: subject + " " + number,
            comment: {
              body: description
            },
            tags: tags
          }
        };

        this.submittedTickets += 1;
        this.ajax('createTicket', data);
      }
    },

    updateProgressStatus: function() {
      this.createdTickets += 1;
      var percentage = (this.createdTickets/this.submittedTickets) * 100;
      this.$('.progress').html(this.renderTemplate('progress', { percentage: percentage}));
    },

    getField: function(name) {
      var cssSelector = '.' + name,
          value = this.$(cssSelector).val();

      return value;
    }

  };

}());
