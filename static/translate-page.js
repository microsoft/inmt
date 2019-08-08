function strip(html){
  var tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

var globalPartial
var searchRequest = null;
var debounceTimeout = null;
var searchInput = $("#partial");
var result = '';
var selecte = 0;
var outputs = [];
var highlight = $("#highlight").is(':checked');
var textlist = []
var part2text = ""
var part1text = ""

var inputs = []
var langspec = ""

function resetcolors(elem, nums) {
  for (i=0; i<nums; i++) {
    $(elem + i).css({"background-color": "transparent"})
  }
}

function sharedStart(feed, partial) {

  // Implement algo which checks
  lastspace = partial.lastIndexOf(" ")
  part1text = partial.substring(0, lastspace)
  part2text = partial.substring(lastspace+1)
  var count = 0
  if (part1text) {
    newfeed = feed.replace(part1text + " ", '')
    
  } else {
    newfeed = feed
  }
  for (i=0; i<part2text.length; i++) {
    if(part2text[i] === newfeed[i]){
      count = count + 1;
    } else {
      break;
    }
  }
  newfeedpre = newfeed.substring(0, count)
  newfeedsuf = newfeed.substring(count)
  if (newfeedpre == "" && newfeedsuf == "") {
    return ""
  }
  return '<b>' + newfeedpre + '</b>' + newfeedsuf
}

function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}

function endsWithSpace(str) {
  var endSpace = /\s$/;
  if (endSpace.test(str)) {
    return true
  } else {
    return false
  }
}

function inputSpan(str) {
  var strlist = str.split(" ");
  var container = ""
  for (k=0; k<strlist.length; k++) {
    container += '<span class="hin_inp_part hin_inp_part' + k + '">' + strlist[k] + '</span> '
  }
  return container
}

function myFunction(str) {
  // Get the snackbar DIV
  var x = document.getElementById("snackbar");

  // Add the "show" class to DIV
  x.className = "show";
  x.innerHTML = str;
  // After 3 seconds, remove the show class from DIV
  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 300);
} 

function key2char(str) {
  var keychar = String.fromCharCode(str);
  switch (str) {
      
  case 1:
      // left mouse click
      keychar = "Mouse: left button";
      break;
  case 2:
      // middle mouse click
      keychar = "Mouse: middle button";
      break;
  case 3:
      // right mouse click
      keychar = "Mouse: right button";
      break;
          
  case 8:
      //  backspace
      keychar = "Backspace &#8592;";
      break;
  case 9:
      //  tab
      keychar = "Tab &#8594";
      break;
  case 13:
      //  enter
      keychar = "Enter &#8629";
      break;
  case 16:
      //  shift
      keychar = "Shift";
      break;
  case 17:
      //  ctrl
      keychar = "Ctrl";
      break;
  case 18:
      //  alt
      keychar = "Alt";
      break;
  case 19:
      //  pause/break
      keychar = "Pause/Break";
      break;
  case 20:
      //  caps lock
      keychar = "Caps Lock";
      break;
  case 27:
      //  escape
      keychar = "Escape";
      break;
  case 33:
      // page up, to avoid displaying alternate character and confusing people             
      keychar = "Page ↑";
      break;
  case 34:
      // page down
      keychar = "Page ↓";
      break;
  case 35:
      // end
      keychar = "End";
      break;
  case 36:
      // home
      keychar = "Home";
      break;
  case 37:
      // left arrow
      keychar = "Arrow Left";
      break;
  case 38:
      // up arrow
      keychar = "Up ↑";
      break;
  case 39:
      // right arrow
      keychar = "Arrow Right";
      break;
  case 40:
      // down arrow
      keychar = "Down ↓";
      break;
  case 45:
      // insert
      keychar = "Insert";
      break;
  case 46:
      // delete
      keychar = "Delete";
      break;
  case 91:
      // left window
      keychar = "Window Left";
      break;
  case 92:
      // right window
      keychar = "Window Right";
      break;
  case 93:
      // select key
      keychar = "Context Menu (select key)";
      break;
  case 96:
      // NumPad 0
      keychar = "NumPad 0";
      break;
  case 97:
      // NumPad 1
      keychar = "NumPad 1";
      break;
  case 98:
      // NumPad 2
      keychar = "NumPad 2";
      break;
  case 99:
      // NumPad 3
      keychar = "NumPad 3";
      break;
  case 100:
      // NumPad 4
      keychar = "NumPad 4";
      break;
  case 101:
      // NumPad 5
      keychar = "NumPad 5";
      break;
  case 102:
      // NumPad 6
      keychar = "NumPad 6";
      break;
  case 103:
      // NumPad 7
      keychar = "NumPad 7";
      break;
  case 104:
      // NumPad 8
      keychar = "NumPad 8";
      break;
  case 105:
      // NumPad 9
      keychar = "NumPad 9";
      break;
  case 106:
      // multiply
      keychar = "NumPad * (multiply)";
      break;
  case 107:
      // add
      keychar = "NumPad + (add)";
      break;
  case 109:
      // subtract
      keychar = "NumPad - (subtract)";
      break;
  case 110:
      // decimal point
      keychar = "NumPad . (decimal point)";
      break;
  case 111:
      // divide
      keychar = "NumPad / (divide)";
      break;
  case 112:
      // F1
      keychar = "F1";
      break;
  case 113:
      // F2
      keychar = "F2";
      break;
  case 114:
      // F3
      keychar = "F3";
      break;
  case 115:
      // F4
      keychar = "F4";
      break;
  case 116:
      // F5
      keychar = "F5";
      break;
  case 117:
      // F6
      keychar = "F6";
      break;
  case 118:
      // F7
      keychar = "F7";
      break;
  case 119:
      // F8
      keychar = "F8";
      break;
  case 120:
      // F9
      keychar = "F9";
      break;
  case 121:
      // F10
      keychar = "F10";
      break;
  case 122:
      // F11
      keychar = "F11";
      break;
  case 123:
      // F12
      keychar = "F12";
      break;
  case 144:
      // num lock
      keychar = "Num Lock";
      break;
  case 145:
      // scroll lock
      keychar = "Scroll Lock";
      break;
  case 186:
      // semi-colon
      keychar = ";";
      break;
  case 187:
      // equal-sign
      keychar = "=";
      break;
  case 188:
      // comma
      keychar = ",";
      break;
  case 189:
      // dash
      keychar = "-";
      break;
  case 190:
      // period
      keychar = ".";
      break;
  case 191:
      // forward slash
      keychar = "/";
      break;
  case 192:
      // grave accent
      keychar = "`";
      break;
  case 219:
      // open bracket
      keychar = "[";
      break;
  case 220:
      // back slash
      keychar = "\\";
      break;
  case 221:
      // close bracket
      keychar = "]";
      break;
  case 222:
      // single quote
      keychar = "'";
      break;
  }
  return keychar
}

function parseProcessedJsonResultsfunction(data, partial) {
  result = data.result.split("\n")
  partialret = data.partial

  selecte = 0;
  
  // All to do with the user input
  if (selecte >= result.length) {
    selecte = 0;
  }

  if (result[selecte].includes(partial.text())) {
      partial.closest('.bmo').find('.suggest').text(result[selecte])
      partial.closest('.bmo').find('.suggest').scrollTop(partial.scrollTop());
  }
  
  var container = $('<div />');

  var countcontainer = 0
  finalresult = []
  for(var i = 0; i < result.length; i++) {
      var repres = sharedStart(result[i], partialret)
      if (repres !== "") {
        container.append('<span id="res'+countcontainer+'" class="res'+countcontainer+' spanres"> ' + repres + '</span>');
        countcontainer += 1;
        finalresult.push(result[i])
      }
  }

  result = finalresult

  partial.closest('.bmo').find('.dropdown').html(container);
  console.log("The container is:", container)
  
  resetcolors('.res', $('.spanres').length)
  $('.res' + selecte).css("background-color","#eee")
  if (countcontainer>1) {
    partial.closest('.bmo').find('.dropdown').css('visibility', 'visible');
  }

  // All to do with the source sentence
  
  if (highlight == true) {
    var attn = data.attn
    $("span[class^='hin_inp_part']").css("background-color", "transparent");
    for (m=0; m<attn.length; m++) {
      
      if (attn[m] == 1) {
        partial.closest('.bmo').find('.hin_inp_part' + m).css('background-color', 'rgba(255,0,0,0.5)')
      }
      else {
        partial.closest('.bmo').find('.hin_inp_part' + m).css('background-color', 'rgba(0,255,0,0.5)')
      }
    }
  }
}

var connectSocket = new WebSocket(
  'ws://' + window.location.host + '/ws/simple/translation-socket'
);

connectSocket.onmessage = function(e){
  data = JSON.parse(e.data)
  searchRequest = parseProcessedJsonResultsfunction(data, globalPartial)
}

connectSocket.onclose = function(e){
  console.error()
}

$(document).ready(function(){


  $.getJSON('/simple/getinput', {}, function(data) {
    inputs=data.result;
    langspec = data.langspec;
    $('#cardscoll').html('')
    for (i=0; i<inputs.length; i++) {
      $('#cardscoll').append(
        `<div class="card bmo">
          <div class="card-content">
            <div class="row">
              <div class="col s5 m5">
                <div class="hin_inp transtext" contenteditable="false">` + inputSpan(inputs[i]) + `</div>
              </div>
              <div class="col s1 m1">
                <br>
                <img src="https://cdn.onlinewebfonts.com/svg/img_439255.png" style="height:15px">
              </div>
              <div class="col s6 m6">
                <div class="dropcontainer">
                  <div class="partcontainer">
                    <div class="suggest transtext" contenteditable="false"></div>
                    <div class=" partial transtext" contenteditable="true"></div>
                  </div>
                  <div class="dropdown">
                  </div>
                </div>
                <div class="perinstr">
                    | &nbsp; &nbsp; Select &#8645; Tab &#8594; Enter &#8608; &nbsp; &nbsp; | &nbsp; &nbsp; Page Down &#8609; Page Up &#8607; &nbsp; &nbsp; |
                </div>
              </div>
            </div>
          </div>
        </div>`
      )
    }

    $('.bmo').not($('.bmo').first()).addClass('bmo--blur');

    var searchEvents = function(partial){
      if (searchRequest)
        searchRequest.abort()

      var hin_inp = partial.closest('.bmo').find('.hin_inp')
      globalPartial = partial;

      //Make a communication request using the socket 
      connectSocket.send(JSON.stringify({
        'partial_translation': partial.clone().children().remove().end().text(),
        'original': hin_inp.text(),
        'langspec': langspec
      }));
      
    }
    $(".partial").on('mousedown', function(e){
      myFunction(key2char(e.keyCode || e.which));
    });
    $(".partial").on('keydown', function(e){
      var keyCode = e.keyCode || e.which;
      myFunction(key2char(keyCode));

      if (keyCode == 9) {
        e.preventDefault();
        var partial = $(this).clone().children().remove().end().text().split(" ").filter(function(v){return v!==''})
        var step = partial.length
        var res = result[selecte].split(" ")[step-1]
        if (result[selecte].split(" ")[step-1] == partial[step-1]) {
          res = result[selecte].split(" ")[step]
        } else {
          partial.pop()
        }
        partial.push(res)
        $(this).html(partial.join(" ") + " ")
        $(this).closest('.bmo').find('.suggest').text(result[selecte])
        placeCaretAtEnd($(this).get(0))
        $(this).closest('.bmo').find('.dropdown').css('visibility', 'hidden')
        
      } else

      if (keyCode == 13) { 
        e.preventDefault();
        $(this).html(result[selecte])
        $(this).closest('.bmo').find('.suggest').text(result[selecte])
        placeCaretAtEnd($(this).get(0))
        $(this).closest('.bmo').find('.dropdown').css('visibility', 'hidden')
      } else

      if (keyCode == 40) { 
        e.preventDefault();
        if (selecte < $('.spanres').length - 1 )
          selecte = selecte + 1;
          resetcolors('.res', $('.spanres').length)
          $('.res' + selecte).css("background-color", "#ddd")
          $(this).closest('.bmo').find('.suggest').text(result[selecte])
      } else
      if (keyCode == 38) { 
        e.preventDefault();
        if (selecte > 0)
          selecte = selecte - 1;
          resetcolors('.res', $('.spanres').length)
          $('.res' + selecte).css("background-color", "#ddd")
          $(this).closest('.bmo').find('.suggest').text(result[selecte])
      } else
      if (keyCode == 34) { 
        e.preventDefault();
        $(this).closest('.bmo').next().find('.partial').focus()
      } else 
      if (keyCode == 33) { 
        e.preventDefault();
        $(this).closest('.bmo').prev().find('.partial').focus()
      } else
      if (keyCode == 35) { 
        e.preventDefault();
        $(".partial").each(function() {
          outputs.push([$(this).closest('.bmo').find('.hin_inp').text(), $(this).text()])
        })

        $.ajax({
            url: '/simple/pushoutput',
            data: {'ops': JSON.stringify(outputs)},
            traditional: true,
            success: function(result) {
                window.location.href='/simple/end';
            }
        }); 

      } else
      if ((e.ctrlKey && keyCode == 67)|| (e.ctrlKey && keyCode == 65)) {
      } else {
        $(this).closest('.bmo').find('.suggest').text('')
      } 
      
    })

    $('.transtext').one('focus', function() {
        $(this).html('');
    });

    $('.partial').focusin(function() {
      $(this).closest('.bmo').removeClass('bmo--blur');
      $('.partial').closest('.bmo').not($(this).closest('.bmo')).addClass('bmo--blur');

      searchEvents($(this));
      var dropdown = $(this).parent().parent().children('.dropdown');
      dropdown.css('visibility', 'visible')
      var firsttext =  $(this).text()
      textlist = firsttext.split(" ")
      part2text = textlist.pop()
      part1text = textlist.join(" ") + " "

      $(this).html(part1text + '<div id="dummy"></div>' + part2text)
      if (firsttext) {
        dropdown.css('left', $('#dummy')[0].offsetLeft).css('top', $('#dummy')[0].offsetTop+7);
      } else {
        dropdown.css('left', $('#dummy')[0].offsetLeft-5).css('top', $('#dummy')[0].offsetTop+7);
      }

      $(this).html(firsttext)
      $(this).closest('.bmo').find('.suggest').css('visibility', 'visible');
      placeCaretAtEnd($(this).get(0))
    });

    $(".partial").on('focusout',function() {
      var dropdown = $(this).closest('.bmo').find('.dropdown');
      dropdown.css('visibility', 'hidden')
      $(this).closest('.bmo').find('.suggest').css('visibility', 'hidden')
    })

    $(".partial").on('scroll', function() {
      $(this).closest('.bmo').find('.suggest').scrollTop($(this).scrollTop());
    })

    $(".partial").keyup(function(e){
      var keyCode = e.keyCode || e.which;
      if (keyCode != 40 && keyCode != 38 && keyCode != 37 && keyCode != 39 && keyCode != 17 && !(e.ctrlKey && keyCode == 65) && keyCode != 35 ) {

        $(this).closest('.bmo').find('.dropdown').css('visibility', 'hidden');

        var dropdown = $(this).parent().parent().children('.dropdown');
        var firsttext =  $(this).text()
        textlist = firsttext.split(" ")
        part2text = textlist.pop()
        part1text = textlist.join(" ")

        $(this).html(part1text + '<div id="dummy"></div>' + part2text)
        if (firsttext) {
          dropdown.css('left', $('#dummy')[0].offsetLeft + 2).css('top', $('#dummy')[0].offsetTop+7);
        } else {
          dropdown.css('left', $('#dummy')[0].offsetLeft).css('top', $('#dummy')[0].offsetTop+24);
        }
        $(this).html(firsttext)
        placeCaretAtEnd($(this).get(0)) 

        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(searchEvents($(this)), 5);
      }
    });

    $(".hin_inp").focusout(function(){
      searchEvents($(this));
    })

    $("#highlight").change(function(){
      highlight = $(this).is(':checked')
      if (highlight == false) {
        $("span[class^='hin_inp_part']").css("background-color", "transparent");
      }
    })

    $("#darkmode").change(function(){
      if ($(this).is(':checked') == true) {
        $('.bmo--blur').css('background-color', '#2d3f50');
        $('body').css('color', '#fff');
        $('body').css('background-color', '#aaa');
        $('.card').css('background-color', '#2a3d4e');
        $('.dropdown').css('background-color', '#2d3f50');
      } else {
        $('.bmo--blur').css('background-color', '#ddd');
        $('body').css('color', '#404040');
        $('body').css('background-color', '#404040');
        $('.card').css('background-color', '#fff');
        $('.dropdown').css('background-color', '#eee');
      }
    })

  });
});
