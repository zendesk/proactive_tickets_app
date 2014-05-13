(function() {

  return {
    defaultState: 'loading',
    recipients: [],
    createdTickets: 0,
    submittedTickets: null,
    requiredFields: [
      'subject', 'description', 'campaign-name', 'customer-list'
    ],

    fields: {},
    data: {},

    currentView: 0,

    events: {
      'pane.activated': 'goToTemplate',
      'click .save':'saveClicked',
      'createTicket.done': 'updateProgressStatus',
      'change,keyup,input': 'valueChanged',
      'click .previous': 'goToPrevious',
      'click .next': 'goToNext'
    },

    goToTemplate: function() {
      var listid = this.getField('customer-list'),
          self = this;
      switch (this.currentView) {
        case 0:
          this.switchTo('loading');
          this.switchTo('onboarding');
          break;
        case 1:
          this.switchTo('loading');
          this.getData();
          break;
        case 2:
          this.setData();
          this.switchTo('loading');
          this.getRecipients(listid).then(function(data) {
            self.recipients = data.rows;
            self.switchTo('confirmation', { recipientCount: self.recipients.length });
          });
          break;

      }
    },

    goToPrevious: function() {
      if (this.currentView === 0) { return; }
      this.currentView -= 1;
      this.goToTemplate();
    },

    showNextButton: function() {
      return this.currentView < 3;
    },

    showPreviousButton: function() {
      return this.currentView > 0;
    },

    goToNext: function() {
      if (this.currentView === 2) { return; }
      this.currentView += 1;
      this.goToTemplate();
    },

    isFormValid: function() {
      var fields = _.filter(this.requiredFields, function(fieldName) {
        return this.getField(fieldName) === '';
      }.bind(this));

      return fields.length === 0;
    },

    valueChanged: _.debounce(function(e) {
      this.disableSaveButton(!this.isFormValid());
    }, 400),

    disableSaveButton: function(disabled) {
      this.$('.save').attr('disabled', disabled);
    },

    requests: {
      customerLists: function() {
        return{
          url: '/api/v2/user_views.json',
          type: 'GET',
          dataType: 'json'
        };
      },

      listTicketFields: function() {
        return{
          url: '/api/v2/ticket_fields.json',
          type: 'GET',
          dataType: 'json'
        };
      },

      groupMemberships: function() {
        return{
          url: '/api/v2/group_memberships/assignable.json?include=users,groups',
          type: 'GET',
          dataType: 'json'
        };
      },

      createTicket: function(data) {
        return {
          url: '/api/v2/tickets.json',
          type: 'POST',
          data: {
            ticket: data
          }
        }
      },

      customerListMemberships: function(id){
        return{
          url: '/api/v2/user_views/' + id + '/execute.json',
          type: 'GET',
          dataType: 'json'
        };
      },

      createView: function(data) {
        return{
          url: '/api/v2/views.json',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(data),
          proxy_v2: true
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

            var memberships = _.map(groupData.groups, function(group){

              return{
                id: group.id,
                group: self.getSideLoadedData(group.id, groupData.groups).name,
                users: self.findUsersForGroup(group.id, groupData)
              }

            })

            self.switchTo('main', {user_views:customerListData.user_views, fields:fieldsData.ticket_fields, priorities:priorityOptions, types:typeOptions, statuses:statusOptions, groupAssignees:memberships});
            self.disableSaveButton(true);


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

    setData: function() {
      var subject = this.getField('subject'),
          tags = this.getTagsArray(),
          status = this.getField('status'),
          type = this.getField('type'),
          priority = this.getField('priority'),
          description = this.getField('description');

      this.data = {
        campaignTag: this.getCampaignNameTag(),
        campaignName: this.getField('campaign-name'),
        ticketData: {
          subject: subject,
          comment: {
            body: description
          },
          tags: tags,
          status: status,
          type: type,
          priority: priority,
        }
      };
    },

    saveClicked: function() {
      var data;
      this.recipients.forEach(function(recipient) {
        data = this.data.ticketData;
        data.requester_id = recipient.id;
        this.submittedTickets += 1;
        this.ajax('createTicket', data);
      }.bind(this));
      this.generateView();
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
    },

    getSideLoadedData: function(id, json){
      return _.find(json, function(obj){
        return obj.id === id;
      })
    },

    findUsersForGroup: function(id, json){
      var self = this;
      var memberships = _.filter(json.group_memberships, function(membership){
        return membership.group_id === id;
      })

      return _.map(memberships, function(membership){
        return self.getSideLoadedData(membership.user_id, json.users);
      })
    },

    generateView: function(){
      debugger
      var campaignTag = this.data.campaignTag;
      var campaignName = this.data.campaignName;

      var data = 
      {
        view: {
          title: "Campaign: " + campaignName,
          conditions: {
            all: [
              {
                field: "status",
                operator: "less_than",
                value: "solved"
              },
              {
                field: "current_tags",
                operator: "includes",
                value: campaignTag
              }
            ],
            any: []
          },
          output: {
            columns: ["id", "status", "subject", "requester", "assignee"]
          },
          restriction: { 
            type: "User", 
            id: this.currentUser().id() 
          }
        }
      };

      var request = this.ajax('createView', data);
    },

    getRecipients: function(listid){
      return this.ajax('customerListMemberships', listid);
    }

  };

}());
