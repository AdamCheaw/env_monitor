//changing edit subscription modal's view
const changeEditSubView = (doc , id) => {
  // console.log(doc);
  var scriptHtml = $("#editSubscription-temp")[0].innerHTML;
  var template = Handlebars.compile(scriptHtml);
  //no grouping
  if(doc.groupType && (doc.groupType !== null || doc.groupType !== undefined)){
    var obj = { title : doc.title, isGroup : true, id: id };
  }
  else {
    var obj = { title : doc.title ,isGroup : false, id: id };
  }
  var html = template(obj);
  $("#editSub-Modal .modal-content").html("");
  $("#editSub-Modal .modal-content").append(html);
}
//mapping subscription to edit form modal
const mapSubscriptionToEditForm = (doc) => {

  if(doc.groupType && doc.groupType !== null) { //is grouping
    $('#editSub-Modal .input-condition').parent().parent()
      .removeClass('enabled');
    $('#editSub-Modal .unlock-input-btw').parent().parent()
      .removeClass('enabled');
    //default radio is AND
    if(doc.groupType == "OR") {
      //switching radios
      $("#editSub-Modal #radio-AND").prop("checked", false);
      $("#editSub-Modal #radio-OR").prop("checked", true);

    }
  }
  else if(doc.option && doc.option !== null) {  //not grouping
    //default radio is "default"
    if(doc.option == "advanced") {
      //switching radios
      $("#editSub-Modal #radio-default").prop("checked", false);
      $("#editSub-Modal #radio-advanced").prop("checked", true);
      $('#editSub-Modal .input-condition').parent().parent()
        .removeClass('enabled');
      $('#editSub-Modal .unlock-input-btw').parent().parent()
        .removeClass('enabled');
    }
  }
  if(doc.condition && doc.condition.length) {
    doc.condition.forEach(doc => {
      //fill in the condition according condition type
      switch (doc.type) {
        case "max":
          $("#editSub-Modal #input-max").val(doc.value).prop('disabled', false)
            .parent().prev().children().prop('checked', true);
          break;
        case "min":
          $("#editSub-Modal #input-min").val(doc.value).prop('disabled', false)
            .parent().prev().children().prop('checked', true);
          break;
        case "precision":
          $(`#editSub-Modal #select-precision option[value=${doc.value}]`)
            .prop('selected', true).parent().prop('disabled', false)
            .parent().prev().children().prop('checked', true);
          break;
        case "equal":
          $("#editSub-Modal #input-equal").val(doc.value).prop('disabled', false)
            .parent().prev().children().prop('checked', true);
          break;
        case "between":
          $("#editSub-Modal #input-btw-min").val(doc.minValue)
            .prop('disabled', false);
          $("#editSub-Modal #input-btw-max").val(doc.maxValue)
            .prop('disabled', false);
          $('#editSub-Modal .unlock-input-btw').prop('checked', true);
          break;
      }
    })
  }

}
//getting edit form condition value
const getEditFormCondition = () => {
  let condition = [];
  if($("#editSub-Modal #input-max").val()) {
    var data = {
      type: "max",
      value: Number($("#editSub-Modal #input-max").val())
    };
    condition.push(data);
  }
  if($("#editSub-Modal #input-min").val()) {
    var data = {
      type: "min",
      value: Number($("#editSub-Modal #input-min").val())
    };
    condition.push(data);
  }
  if($("#editSub-Modal #select-precision option:selected").val()) {
    var data = {
      type: "precision",
      value: $("#editSub-Modal #select-precision option:selected").val()
    };
    condition.push(data);
  }
  if($("#editSub-Modal #input-btw-max").val() && $("#editSub-Modal #input-btw-max").val()) {
    var data = {
      type: "between",
      minValue: Number($("#editSub-Modal #input-btw-min").val()),
      maxValue: Number($("#editSub-Modal #input-btw-max").val()),
    };
    condition.push(data);
  }
  if($("#editSub-Modal #input-equal").val()) {
    var data = {
      type: "equal",
      value: Number($("#editSub-Modal #input-equal").val())
    };
    condition.push(data);
  }
  return condition;
}
//when edit subscription's form being submit
const getEditFormSubmit = () => {
  let afterEdit;
  if($("#editSub-Modal input[name='groupType']:checked").val()) {
    afterEdit = {
      groupType : $("#editSub-Modal input[name='groupType']:checked").val(),
      condition : getEditFormCondition()
    };
  }
  else if($("#editSub-Modal input[name='option']:checked").val()) {
    let option = $("#editSub-Modal input[name='option']:checked").val();
    if(option == "default") {
      afterEdit = {
        option : option,
        condition : []
      };
    }
    else {
      afterEdit = {
        option : option,
        condition : getEditFormCondition()
      };
    }
  }
  return afterEdit;
}
$(document).ready(function() {
  //unlock or lock the input condition
  $("#editSub-Modal").on('change','.unlock-input',function(){
    if(this.checked) {
      $(this).parent().next().children(".input-condition").prop('disabled', false);
    }
    else {
      $(this).parent().next().children(".input-condition").prop('disabled', true);
      $(this).parent().next().children(".input-condition").val('');
    }
  });
  $("#editSub-Modal").on('change','.unlock-input-btw',function(){
    if(this.checked) {
      $('#editSub-Modal .input-condition-between').prop('disabled', false);
    }
    else {
      $('#editSub-Modal .input-condition-between').prop('disabled', true);
      $('#editSub-Modal .input-condition-between').val('');
    }
  });
  //when option radio-default being click
  $('#editSub-Modal').on('click','#radio-default',function() {
    $('#editSub-Modal .input-condition').parent().parent()
      .addClass('enabled');
    $('#editSub-Modal .unlock-input-btw').parent().parent()
      .addClass('enabled');
  });
  //when option radio-advanced being click
  $('#editSub-Modal').on('click','#radio-advanced',function() {
    $('#editSub-Modal .input-condition').parent().parent()
      .removeClass('enabled');
    $('#editSub-Modal .unlock-input-btw').parent().parent()
      .removeClass('enabled');
  });
});
