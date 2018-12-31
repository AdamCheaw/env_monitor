
var idClicked;
var subs = new Subscription();
//get user condition input field and output to an array of object
function getCondition() {
  let condition = [];
  if($("#form1_maxValue").val()) {
    var data = {
      type: "max",
      value: Number($("#form1_maxValue").val())
    };
    condition.push(data);
  }
  if($("#form1_minValue").val()) {
    var data = {
      type: "min",
      value: Number($("#form1_minValue").val())
    };
    condition.push(data);
  }
  if($("#form1_precisionValue option:selected").val()) {
    var data = {
      type: "precision",
      value: $("#form1_precisionValue option:selected").val()
    };
    condition.push(data);
  }
  if($("#form1_b_minValue").val() && $("#form1_b_minValue").val()) {
    var data = {
      type: "between",
      minValue: Number($("#form1_b_minValue").val()),
      maxValue: Number($("#form1_b_maxValue").val()),
    };
    condition.push(data);
  }
  if($("#form1_equalValue").val()) {
    var data = {
      type: "equal",
      value: Number($("#form1_equalValue").val())
    };
    condition.push(data);
  }
  return condition;
}
//according all Subscription refresh subscription board
function refreshSubscription(docs) {
  $("#subscription-board .span12").html("");
  $("#group-title").html("");
  let i = 0;
  docs.forEach(doc => {//default
    if(doc.option == "default") {
      var scriptHtml = $("#subscription-temp")[0].innerHTML;
      var template = Handlebars.compile(scriptHtml);
      var obj = { index:i, name:doc.name, option:"default" };
      var html = template(obj);
      $("#subscription-board .span12").append(html);
    }
    else {//advanced
      if(doc.groupType == "AND" || doc.groupType == "OR") { //group
        var scriptHtml = $("#subscriptionGroup-temp")[0].innerHTML;
        var template = Handlebars.compile(scriptHtml);
        var obj = {
          index: i,
          groupTitle: doc.groupTitle,
          option: "advanced",
          condition: doc.condition,
          sensorName: doc.sensorName,
          groupType: doc.groupType
        };
        var html = template(obj);
        $("#subscription-board .span12").append(html);
        //append option to group-title 's input
        html = `<option>${doc.groupTitle}</option>`;
        $("#group-title").append(html);
      }
      else {
        var scriptHtml = $("#subscription-temp")[0].innerHTML;
        var template = Handlebars.compile(scriptHtml);
        var obj = { index:i, name:doc.name, option:"advanced", condition:doc.condition };
        var html = template(obj);
        $("#subscription-board .span12").append(html);
      }
    }
    i += 1;
  })
}
//filter the subscription and post to back-end
function filterSubscriptions(docs) {
  let results = docs.map(doc => {
    if(doc.groupType == "AND" || doc.groupType == "OR") {//group
      return {
        _sensorID: doc._sensorID,
        option: doc.option,
        condition: doc.condition,
        groupTitle: doc.groupTitle,
        groupType: doc.groupType
      }
    }
    else { //advanced , no group
      return {
        _sensorID: doc._sensorID,
        option: doc.option,
        condition: (typeof doc.condition === 'undefined') ? [] : doc.condition
      }
    }
  });

  return results;
}
const handleEditSubscription = (doc,id) => {
  //script src from ./editSubscription.js
  changeEditSubView(doc,id);
  mapSubscriptionToEditForm(doc);
}

$("#vertical-menu1 a:first").addClass("active");
$(document).ready(function(){
    // $("#myModal").modal("show");
    // $("#myModal").modal("hide");
    toastr.options.closeButton = true;

    //for the live search data
    var sensorArray = [];
    allSensor.data.forEach(thisSensor => {
      sensorArray.push(thisSensor.name);
    });
    // Initialize autocomplete with custom appendTo:
    $('#autocomplete-dynamic').autocomplete({
        source: sensorArray
    });
    //when vertical-menu1 is click
    $("#vertical-menu1 a").click(function(e){
      e.preventDefault();
      $("#vertical-menu1 a").removeClass( "active" );
      $(this).addClass("active");
      var text = $(this).text();
      $("#form1 #autocomplete-dynamic").val(text);
    });
    //switching the advanced option enabled or disabled
    $("#form1 #Radios2").click(function(){//advanced
      $("#form1 #advanced-block").removeClass("enabled");
    });
    $("#form1 #Radios1").click(function(){//default
      $("#form1 #advanced-block").addClass("enabled");
      $("#group-input").addClass("enabled");
      //$("#group-input").val(" ");
      $("#radios-none").prop("checked", true);
      $("#radios-and").prop("checked", false);
      $("#radios-or").prop("checked", false);
    });

    //switching groupType radios
    $("#radios-none").click(function(){
      $("#form1 #advanced-block").addClass("enabled");
      $("#group-input").addClass("enabled");
      $("#Radios1").prop("checked", true);
      $("#Radios2").prop("checked", false);
    });
    $("#radios-and").click(function(){
      $("#form1 #advanced-block").removeClass("enabled");
      $("#group-input").removeClass("enabled");
      $("#Radios1").prop("checked", false);
      $("#Radios2").prop("checked", true);
    });
    $("#radios-or").click(function(){
      $("#form1 #advanced-block").removeClass("enabled");
      $("#group-input").removeClass("enabled");
      $("#Radios1").prop("checked", false);
      $("#Radios2").prop("checked", true);
    });
    //unlock or lock the input condition
    $("#advanced-block").on('change','.unlock-input',function(){
      if(this.checked) {
        $(this).parent().next().children(".input-condition").prop('disabled', false);
      }
      else {
        $(this).parent().next().children(".input-condition").prop('disabled', true);
        $(this).parent().next().children(".input-condition").val('');
      }
    });
    $("#advanced-block").on('change','.unlock-input-between',function(){
      if(this.checked) {
        $('.input-condition-between').prop('disabled', false);
      }
      else {
        $('.input-condition-between').prop('disabled', true);
        $('.input-condition-between').val('');
      }
    });

    //when form1 add btn being click, adding to subscription
    var subscription = [];//used for saving multiple subscrition
    $('#form1').on('click', '#form1-add', function(e) {
      var form1_inputName = $("#autocomplete-dynamic").val();
      var form1_id = "";
      //find the sensor._id
      for(var i = 0;i < allSensor.data.length;i++) {
        if(form1_inputName == allSensor.data[i].name) {
          form1_id = allSensor.data[i]._id;
          break;
        }
      }
      if(!form1_id) {
        swal("something went wrong", "this sensor does not exist", "warning")
        return;
      }

      if(subs.findSensorDuplicate(form1_id) !== undefined) {
        //console.log(subs.findSensorDuplicate(form1_id));
        swal("something went wrong", "this sensor has been subscribe already", "warning")
        return;
      }
      var form1_optionValue = $("input[name='form1-optionsRadios']:checked").val();
      var groupType = $("input[name='group-optionsRadios']:checked").val();
      var groupTitle = $("#group-title-input").val();
      if(form1_optionValue == "default"){ //optionValue is default
        var doc = {
            _sensorID: [form1_id],
            name: form1_inputName,
            option: form1_optionValue,
            groupType: null,
        };
        subs.addOneSubscription(doc);
      }
      else {//optionValue is advanced
        let condition = getCondition();
        //advanced input field is empty ,alert warning
        if(!condition.length) {
          swal("something went wrong", "advanced condition can't be empty", "warning")
          return;
        }
        if(groupType == "AND" || groupType == "OR") {
          if(!groupTitle && !groupTitle.length) {
            swal("something went wrong", "group 's title can't be empty", "warning")
            return;
          }
          var doc = {
            _sensorID: [form1_id],
            sensorName: [form1_inputName],
            option: "advanced",
            condition: condition,
            groupType: groupType,
            groupTitle: groupTitle
          };
          subs.addToGroup(doc);
        }
        else {//option value is advanced and groupType is none||null
          var doc = {
            _sensorID: [form1_id],
            name: form1_inputName,
            option: "advanced",
            condition: condition,
            groupType: null,
          };
          subs.addOneSubscription(doc);
        }
      }
      refreshSubscription(subs.getAllSubscription())
    });
    //remove a subscription list
    $('#subscription-board').on('click', '.sub-removeBtn',function(e) {
      idClicked = e.target.id;//get btn clicked id
      idClicked = idClicked.replace('sub-removeBtn-', '');
      // console.log("idClicked: "+idClicked);
      subs.removeOneSubscription(idClicked);
      refreshSubscription(subs.getAllSubscription());
    });
    //edit a subscription list
    $('#subscription-board').on('click', '.sub-editBtn',function(e) {
      idClicked = e.target.id;//get btn clicked id
      idClicked = idClicked.replace('sub-editBtn-', '');
      //console.log("idClicked: "+idClicked);
      let doc = subs.getOneSubscription(idClicked)
      handleEditSubscription(doc,idClicked);
      $("#editSub-Modal").modal("show");
      // subs.removeOneSubscription(idClicked);
      // refreshSubscription(subs.getAllSubscription());
    });
    //clear subscription
    $(".subscription-container #subscription-clearBtn").click(function(){
      subs.clear()
      $("#subscription-board .span12").html("");
    });
    // submit to changing a subscription
    $('#editSub-Modal').on('click', '.edit-submit',function(e) {
      idClicked = e.target.id;//get btn clicked id
      idClicked = idClicked.replace('submit-', '');
      let afterEdit  = getEditFormSubmit();//getting edit form value
      subs.updateOneSubscription(idClicked , afterEdit);//update the subs object
      refreshSubscription(subs.getAllSubscription());
      $("#editSub-Modal").modal("hide");
    });
    //submit subscription
    $(".subscription-container #subscription-submitBtn").click(function(){
      let docs = filterSubscriptions(subs.getAllSubscription());
      if(docs.length > 0)
      { //calling ajax to post subscription
        $.ajax({
            type        : 'POST',
            url         : '/getData/subscribeMany',
            data        : { subscription:docs },
            dataType    : 'json',
            // encode      : true,
            beforeSend: function(){
              // $.LoadingOverlay("show", {
              //   image       : "",
              //   fontawesome : "fa fa-cog fa-spin"
              // });
              $(".subscription-container #subscrition-submitBtn").attr('disabled', 'disabled').text('Sending');
            },
            complete: function(){
               console.log("ajax send finish");
               //$("#myModal").modal("hide");
            },
            success: function(data){
              //alert("success");
              // $.LoadingOverlay("hide");
              $(".subscription-container #subscrition-submitBtn").removeAttr('disabled').text('Submit');
              swal("Yours subscribe is success", " ", "success")
                .then(() => {
                  window.location.reload();
                })
            },
            error: function(data){
              let msg = JSON.parse(data.responseText);
              $(".subscription-container #subscrition-submitBtn").removeAttr('disabled').text('Submit');
              swal("something went wrong", msg.msg, "error")
            }
        })
      }
      else {
        swal("something went wrong", "subscription is empty", "warning")
      }
    });


});
