var pageStatus = "normal";
var pageTotal;
const getInputValue = () => {
  let sort = $("#sort-by option:selected").val();
  let option = $("#theOption option:selected").val();
  let page = 1;
  if(sort == "date"){
    let start = option;
    let end = moment(start).add(12,'hours').utc().format();
    return { sort,start,end,page}
  }
  else if (sort == "subscription") {
    return {sort,option,page};
  }
  else {
    return {sort,option,page};
  }
}
const changeOptionSelect = (val) => {
  let option
  if(val == "date"){
    var dates = [];
    let date = moment().hour(12).minute(0).second(0).utc().format();
    option = `<option value="">Select here..</option>`;
    dates.push(date);
    for(let i = 1;i < 4;i++) {
      date = moment(dates[i-1]).subtract(12,'hours').utc().format();
      dates.push(date);
    }
    option += `<option value='${dates[0]}'>today , 12pm ~ 12am</option>`;
    option += `<option value='${dates[1]}'>today , 12am ~ 12pm</option>`;
    option += `<option value='${dates[2]}'>yesterday , 12pm ~ 12am</option>`;
    option += `<option value='${dates[3]}'>yesterday , 12am ~ 12pm</option>`;
  }
  else if(val == "subscription") {
    option = `<option value="">Select here..</option>`;
    subscriptions.forEach(sub => {
      option += `<option value="${sub._id}">${sub.title}</option>`;
    });
  }
  else {
    option = `<option value="">Select here..</option>`;
  }
  $('#theOption').html("").html(option);
}
const changeSubscriptionLogs = (data) => {
  if(data.length == 0) {
    swal("It is empty", "no logs during this time", "info");
  }
  else {
    let html = ""
    data.forEach(doc => {
      let color;

      if(doc.logStatus <= 0){//match condition
        fontColor = "font-warning";
        logMsg = `<i class="icon-md icon-warning-sign"></i> ${doc.logMsg}`
      }
      else if(doc.logStatus == 1){//back to safe
        fontColor = "font-safe";
        logMsg = `<i class="icon-md icon-ok"></i> ${doc.logMsg}`

      }
      else if(doc.logStatus == 2){//changing subscription condition..
        fontColor = "font-blue";
        logMsg = `<i class="icon-md icon-edit"></i> ${doc.logMsg}`
      }
      else if(doc.logStatus == 3){//created subscription
        fontColor = "font-blue";
        logMsg = `<i class="icon-md icon-pencil"></i> ${doc.logMsg}`

      }
      else if(doc.logStatus == 4){//deleted subscription
        fontColor = "font-warning";
        logMsg = `<i class="icon-md icon-remove"></i> ${doc.logMsg}`

      }
      var scriptHtml = $("#logMsg-temp")[0].innerHTML;
      var template = Handlebars.compile(scriptHtml);
      var obj = {
        title: doc.title,
        logMsg: logMsg,
        color: fontColor,
        date: doc.date
      };
      html = html + template(obj);
      // if(doc.logStatus < 1) {
      //   var scriptHtml = $("#warning-logMsg-temp")[0].innerHTML;
      //   var template = Handlebars.compile(scriptHtml);
      //   var obj = {
      //     title: doc.title,
      //     logMsg: doc.logMsg,
      //     date: doc.date
      //   };
      //   html = html + template(obj);
      // }
      // else {
      //   var scriptHtml = $("#safe-logMsg-temp")[0].innerHTML;
      //   var template = Handlebars.compile(scriptHtml);
      //   var obj = {
      //     title: doc.title,
      //     logMsg: doc.logMsg,
      //     date: doc.date
      //   };
      //   html = html + template(obj);
      // }
    });
    $(".timeline").html("").html(html);
  }
}
const changePageNum = (num) => {
  let paging = num/15;
  paging = paging.toFixed(0)
  paging = (paging == 0) ? 1:paging;
  var html = "";
  for(let i = 1;i <= paging;i++){
    html += `<li><a href="#">${i}</a></li>`;
  }
  $('#page-num').html("").html(html);
  //
}
//determine previous or next btn is disabled or enabled
const enabled_PreAndNextBtn = () => {
  let currentPage = $("#page-btn").text();
  let lastPage = $("#page-num li:last-child").children().text();
  lastPage = (typeof lastPage === "") ? 1 : lastPage;
  if(currentPage == 1 && currentPage == lastPage){
    $("#page-next").attr('disabled', 'disabled');
    $("#page-previous").attr('disabled', 'disabled');
  }
  else if(currentPage == 1){
    $("#page-previous").attr('disabled', 'disabled');
    $("#page-next").removeAttr('disabled');
  }
  else if(currentPage == lastPage) {
    $("#page-previous").removeAttr('disabled');
    $("#page-next").attr('disabled', 'disabled');
  }
  else {
    $("#page-previous").removeAttr('disabled');
    $("#page-next").removeAttr('disabled');
  }
}
const requestSubscriptionLogs = (data) => {
  $.ajax({
      type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
      url         : '/observe/getSubscriptionLogs', // the url where we want to POST
      data        : data, // our data object
      dataType    : 'json', // what type of data do we expect back from the server
      encode          : true,
      beforeSend: function(){
        console.log("sending ajax");
        $.LoadingOverlay("show", {
          image       : "",
          fontawesome : "fa fa-cog fa-spin"
        });
      },
      complete: function(){
         $.LoadingOverlay("hide");
         console.log("ajax send finish");
      },
      success: function(data){
        //changing timeline content after received data
        changeSubscriptionLogs(data.subscriptionLogs);
        //changing page Number
        if(data.total && data.total > 0 && data.subscriptionLogs.length > 0){
          changePageNum(data.total);
          enabled_PreAndNextBtn();
          // if((data.total / 15) <= 1) {
          //   $("#page-previous").attr('disabled', 'disabled');
          // }
          // else {
          //   $("#page-previous").removeAttr('disabled');
          // }
        }

        ///console.log(data.total);
      },
      error: function(err){
        let msg = JSON.parse(err.responseText);
        swal("something went wrong", msg.msg, "error")
      }
  });
}
$(document).ready(function() {
  //when only one logMsg page
  if( (total / 15) <= 1 ) {
    $("#page-next").attr('disabled', 'disabled');
  }
  //user query subscription logs
  $( "#query-btn" ).click(function() {
    let inputValue = getInputValue();//getting input value
    if(!inputValue.sort && !inputValue.option) {
      swal("can not query", "make sure yours option had being selected", "info")
      return;
    }
    else {
      pageStatus = inputValue.sort;
    }
    //request new subscription logs and cuthange timeline content
    requestSubscriptionLogs(inputValue);
    $("#page-btn").text("1");
    $("#page-previous").attr('disabled', 'disabled');
  });
  //user switch fliter selected
  $("#sort-by").change(function() {
    let sort = $("#sort-by option:selected").val();
    changeOptionSelect(sort);
  });
  //user switch page
  $("#page-num").on("click","a", function(e) {
    let page = $(this).text();
    let inputValue = getInputValue();//getting input value
    inputValue.page = page;
    requestSubscriptionLogs(inputValue);
    $("#page-btn").text(page);//changing current page number
    enabled_PreAndNextBtn();
    // //get the last page number
    // var lastPage = $("#page-num li:last-child").children().text();
    // if(page == 1) {//if current page equal to first page
    //   //disabled the page previous btn
    //
    //   $("#page-previous").attr('disabled', 'disabled');
    // }
    // else if(page == lastPage) {//if current page equal to last page
    //   //disabled the page next btn
    //   $("#page-next").attr('disabled', 'disabled');
    // }
    // else {
    //   //enabled all the page btn
    //   $("#page-previous").removeAttr('disabled');
    //   $("#page-next").removeAttr('disabled');
    // }
  });
  //user click previous Page
  $("#page-previous").click(function() {
    let inputValue = getInputValue();//getting input value
    inputValue.page = Number($("#page-btn").text()) - 1;
    requestSubscriptionLogs(inputValue);
    $("#page-btn").text(inputValue.page);
    enabled_PreAndNextBtn();
    // if(inputValue.page == 1){//if current page equal to first page
    //   //disabled the page previous btn
    //   console.log("dasdsd :"+$("#page-previous").html());
    //   $("#page-previous").attr('disabled', 'disabled');
    //   $("#page-next").removeAttr('disabled');
    // }
    // else {
    //   //enabled all the page btn
    //   $("#page-previous").removeAttr('disabled');
    //   $("#page-next").removeAttr('disabled');
    // }
  });
  //user click next page
  $("#page-next").click(function() {
    let inputValue = getInputValue();//getting input value
    inputValue.page = Number($("#page-btn").text()) + 1;
    requestSubscriptionLogs(inputValue);
    $("#page-btn").text(inputValue.page);//changing current page number
    enabled_PreAndNextBtn();
    // var lastPage = $("#page-num li:last-child").children().text();
    // if(inputValue.page == lastPage) {//if current page equal to last page
    //   $("#page-next").attr('disabled', 'disabled');
    //   $("#page-previous").removeAttr('disabled');
    // }
    // else {
    //   //enabled all the page btn
    //   $("#page-previous").removeAttr('disabled');
    //   $("#page-next").removeAttr('disabled');
    // }
  });
});
