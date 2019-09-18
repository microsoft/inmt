
/*
*************************************************
*************************************************
Global variables that need to be defined in the template scripts:
1. sockets_use : Describes whether to use sockets or HTTP for connection.
2. system_type: Describes which system to use - IT (Interactive Translation), PE (Post-Editing), BL (Baseline)
3. URLS to be mapped:
    - socket_translate: Access the translation engine using sockets
    - http_translate: Access the translation engine using HTTP requests
    - http_getinput: GET the corpus fragments after processing in the backend
    - http_pushoutput: POST the entered translations to the backend
    - http_preview: GET the results to be previewed.
4. Control scheme variables as described below:
    - SELECT_SINGLE_WORD_FROM_SUGGESTION_KEY : Select single token from the selection
    - SELECT_ENTIRE_SUGGESTION : Select all the tokens together in the selection
    - SELECT_NEXT_TRANSLATION_SUGGESTION : Go to next dropdown selection
    - SELECT_PREVIOUS_TRANSLATION_SUGGESTION : Go to previous dropdown selection
    - NAVIGATE_TO_NEXT_CORPUS_FRAGMENT : Go to next corpus fragment
    - NAVIGATE_TO_PREVIOUS_CORPUS_FRAGMENT : Go to previous corpus fragment
    - SUBMIT_TRANSLATION : Finish the task and submit the translations
    - CONTROL_SCHEME_NAME : Name the control scheme being used
5. csrf_token : Store the csrf token to perform post requests


*************************************************
*************************************************

*/


var outputs = []; // To push outputs before submission
var globalPartial; // Stores the partial input
var globkeystrokes = []; // Stores the keystrokes
var searchRequest = null; // Handler for the HTTP search request
var docstarttime = new Date() // To measure the document translation time
var debounceTimeout = null; // Handler for delay between keystroke and request
var highlight = null; // Set the highlight variable

var inputs = []

var timer1 = 0;
var timer2 = 0;


globkeystrokes.push([CONTROL_SCHEME_NAME, new Date() - docstarttime])

// This function is used to decide the common start between the received vs. input. Used for IT.
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

// Used to reset colors in the dropdowns
function resetcolors(elem, nums) {
    for (i=0; i<nums; i++) {
        $(elem + i).css({"background-color": "transparent"})
    }
}

// This function is used to place caret at end after every keyboard interaction. Need to improve this.
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

// This function condenses the corpus fragment code.
function inputSpan(str) {
    var strlist = str.split(" ");
    var container = ""
    for (k=0; k<strlist.length; k++) {
        container += '<span class="hin_inp_part hin_inp_part' + k + '">' + strlist[k] + '</span> '
    }
    return container
}

// This function displays the keys used by the user. Only for debugging or demonstration purposes.
function myFunction(str) {
    // Get the snackbar DIV
    var x = document.getElementById("snackbar");
    // Add the "show" class to DIV
    x.className = "show";
    x.innerHTML = str;
    // After 3 seconds, remove the show class from DIV
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 300);
} 

// Used for converting the keycodes to keyboard characters.
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
        keychar = "Up ↑ (UP!!!)";
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

// As of now, this logic is for the results to be processed from sockets.
function parseProcessedJsonResultsfunction(data, partial) {
    
    // Result is received in form of a single string. Need to split here.
    result = data.result.split("\n")
    partialret = data.partial
    

    // The pointer for dropdown selection. Initially set at 0.
    selecte = 0;
    
    // This is the pointer for the dropdown box highlight
    if (selecte >= result.length) {
        selecte = 0;
    }

    // The main processes like dropdown, gisting etc. is only required for Interactive Translation
    if (system_type == 'IT') {
        if (result[selecte].includes(partial.text())) {
            partial.closest('.bmo').find('.suggest').text(result[selecte])
            partial.closest('.bmo').find('.suggest').scrollTop(partial.scrollTop());
        }
        
        var container = $('<div />');

        // Populating results for dropdown
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

        // Coloring the drop down box selections
        partial.closest('.bmo').find('.dropdown').html(container);
        resetcolors('.res', $('.spanres').length)
        $('.res' + selecte).css("background-color","#eee")
        if (countcontainer>1) {
            partial.closest('.bmo').find('.dropdown').css('visibility', 'visible');
        }

        // Visualizing Attention
        if (highlight == true) {
            var attn = data.attn
            $("span[class^='hin_inp_part']").css("background-color", "transparent");
            for (m=0; m<attn.length; m++) {
                if (attn[m] != 0) {
                    partial.closest('.bmo').find('.hin_inp_part' + m).css('background-color', 'rgba(255,0,0,' + attn[m] + ')')
                }
                else {
                    partial.closest('.bmo').find('.hin_inp_part' + m).css('background-color', 'rgba(0,255,0,0.5)')
                }
            }
        }
    } // For Post Editing, we just put the text in partial textbox 
    else if (system_type == 'PE') {
        partial.text(result[selecte])
    }
}

if (sockets_use == true) {
    var connectSocket = new WebSocket(
        'ws://' + window.location.host + socket_translate
    );

    connectSocket.onmessage = function(e){
        data = JSON.parse(e.data)
        searchRequest = parseProcessedJsonResultsfunction(data, globalPartial)
    }

    connectSocket.onclose = function(e){
        console.error()
    }
}

var langspecs = [
    'en-hi',
    'hi-en',
    'en-hi']

$(document).ready(function() {

    var topdock = $('#topdock')// For smooth scrolling
    var bottomdock = $('#bottomdock')// For smooth scrolling

    //Logging system variables
    console.log("Sockets used? ", sockets_use);
    console.log("Translation System Used? ", system_type);

    $.getJSON(http_getinput, {}, function(data) {
        inputs = data.result;
        langspec = data.langspec
        // langtolangid = data.langtolangid;
        console.log(inputs)
        $('#cardscoll').html('')
        for (i=0; i<inputs.length; i++) {
            $('#cardscoll').append(
                `<div class="card bmo">
                    <div class="card-content">
                        <div class="row">
                            <div class="col s5 m5">
                                <div class="hin_inp transtext" contenteditable="false">`+inputSpan(inputs[i][0])+`</div>    
                            </div>
                            <div class="col s1 m1">
                                <br>
                                <img src="https://cdn.onlinewebfonts.com/svg/img_439255.png" style="height:15px">
                            </div>
                            <div class="col s6 m6">
                                <div class="dropcontainer">
                                    <div class="partcontainer">
                                        <div class="suggest transtext" contenteditable="false"></div>
                                            <div class=" partial transtext" id="card` + i + `" contenteditable="true"
                                            data-tab=0 data-enter=0 data-up=0 data-down=0 data-others=0 data-pgup=0 data-pgdn=0 data-end=0 data-right=0 data-left=0 data-bkspc=0 data-time=0
                                            >`+inputs[i][1]+`</div>
                                    </div>
                                    <div class="dropdown">
                                    </div>
                                </div>
                                <div class="perinstr">
                                    `+ CONTROL_SCHEME_NAME +`: &nbsp;` +key2char(SELECT_PREVIOUS_TRANSLATION_SUGGESTION)+"&#x2191; "+key2char(SELECT_NEXT_TRANSLATION_SUGGESTION) +` &#x2193; ` +key2char(SELECT_SINGLE_WORD_FROM_SUGGESTION_KEY) +`  &#8594; ` +key2char(SELECT_ENTIRE_SUGGESTION)+` &#8608; &nbsp; | &nbsp; ` +key2char(NAVIGATE_TO_NEXT_CORPUS_FRAGMENT)+` &#8609; ` +key2char(NAVIGATE_TO_PREVIOUS_CORPUS_FRAGMENT)+` &#8607; &nbsp; | Submit: ` +key2char(SUBMIT_TRANSLATION)+`
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`
            )
        }

        $('.bmo').not($('.bmo').first()).addClass('bmo--blur');

        var searchEvents = function(partial){
            if (searchRequest) searchRequest.abort()

            var hin_inp = partial.closest('.bmo').find('.hin_inp')
            globalPartial = partial;
            if (sockets_use == true) {
                connectSocket.send(JSON.stringify({
                    'partial_translation': partial.clone().children().remove().end().text(),
                    'original': hin_inp.text(),
                    'langspec': langspec
                }));
            } 
            else {

            //OLD, JANKY HTTP REQUEST!!
                searchRequest =  $.getJSON(http_translate, {
                    a: hin_inp.text(),
                    b: partial.clone().children().remove().end().text()
                }, function(data) {
                    // console.log(data)
                    parseProcessedJsonResultsfunction(data, globalPartial)
                //     result = data.result.split("\n")
                //     partialret = data.partial
                //     selecte = 0;
                //     // All to do with the user input
                //     if (selecte >= result.length) {
                //         selecte = 0;
                //     }

                //     if (system_type == 'IT') {
                //         if (result[selecte].includes(partial.text())) {
                //             partial.closest('.bmo').find('.suggest').text(result[selecte])
                //             partial.closest('.bmo').find('.suggest').scrollTop(partial.scrollTop());
                //         }
                    
                //     var container = $('<div />');

                //     var countcontainer = 0
                //     finalresult = []
                //     for(var i = 0; i < result.length; i++) {
                //         var repres = sharedStart(result[i], partialret)
                //         // console.log(repres)
                //         if (repres !== "") {
                //           container.append('<span id="res'+countcontainer+'" class="res'+countcontainer+' spanres"> ' + repres + '</span>');
                //           countcontainer += 1;
                //           finalresult.push(result[i])
                //           // console.log(countcontainer, finalresult)
                //         }
                //     }

                //     result = finalresult

                //     partial.closest('.bmo').find('.dropdown').html(container);
                    
                //     resetcolors('.res', $('.spanres').length)
                //     $('.res' + selecte).css("background-color","#eee")
                //     if (countcontainer>1) {
                //       partial.closest('.bmo').find('.dropdown').css('visibility', 'visible');
                //     }

                //     // All to do with the source sentence
                    
                //     if (highlight == true) {
                //       var attn = data.attn
                //       $("span[class^='hin_inp_part']").css("background-color", "transparent");
                //       for (m=0; m<attn.length; m++) {
                        
                //         if (attn[m] != 0) {
                //           partial.closest('.bmo').find('.hin_inp_part' + m).css('background-color', 'rgba(255,0,0,' + attn[m] + ')')
                //         }
                //         else {
                //           partial.closest('.bmo').find('.hin_inp_part' + m).css('background-color', 'rgba(0,255,0,0.5)')
                //         }
                //       }
                //     }
                //   } else if (system_type == 'PE') {
                //     partial.text(result[selecte])
                //   }
                    });
            }
        }

        //PART OF CODE DEDICATED TO SUBMISSIONS
        // $('.submittrans').click(function(elem){
        //   $('.preloader-background').css('display', 'flex')
        //     // searchEvents($(this));
        //     $(".partial").each(function() {
        //       outputs.push([$(this).closest('.bmo').find('.hin_inp').text(), $(this).text()])
        //     })
        //     $(this).data("end", parseInt($(this).data("end")) + 1)

        //     $.ajax({
        //         type: 'POST',
        //         url: '/pushoutput',
        //         data: { 'csrfmiddlewaretoken': '{{ csrf_token }}', 'ops': JSON.stringify(outputs), 'keytimeseries': JSON.stringify(globkeystrokes)},
        //         traditional: true,
        //         success: function(result) {
        //             // console.log(result.result);
        //             window.location.href='/preview';
        //         }
        //     }); 

        // })
        //END SUBMISSION PORTION

        $(document).on('keydown', function(e) {
            globkeystrokes.push([e.keyCode || e.which, new Date() - docstarttime])
        });

        $(document).on('mousedown', function(e) {
            globkeystrokes.push([e.keyCode || e.which, new Date() - docstarttime])
        });

        $(".partial").on('keydown', function(e){
            var keyCode = e.keyCode || e.which;

            if (keyCode == SELECT_SINGLE_WORD_FROM_SUGGESTION_KEY) {
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
                $(this).data("tab", parseInt($(this).data("tab")) + 1)
            } else

            if (keyCode == SELECT_ENTIRE_SUGGESTION) {
                e.preventDefault();
                $(this).html(result[selecte])
                $(this).closest('.bmo').find('.suggest').text(result[selecte])
                placeCaretAtEnd($(this).get(0))
                $(this).closest('.bmo').find('.dropdown').css('visibility', 'hidden')
                $(this).data("enter", parseInt($(this).data("enter")) + 1)
            } else
            if (keyCode == SELECT_NEXT_TRANSLATION_SUGGESTION) { 
                e.preventDefault();
                if (selecte < $('.spanres').length - 1 )
                    selecte = selecte + 1;
                    resetcolors('.res', $('.spanres').length)
                    $('.res' + selecte).css({"background-color": "#ddd"})
                    $(this).closest('.bmo').find('.suggest').text(result[selecte])
                    $(this).data("down", parseInt($(this).data("down")) + 1)
            } else
            if (keyCode == SELECT_PREVIOUS_TRANSLATION_SUGGESTION) { 
                e.preventDefault();
                if (selecte > 0)
                    selecte = selecte - 1;
                    resetcolors('.res', $('.spanres').length)
                    $('.res' + selecte).css({"background-color": "#ddd"})
                    $(this).closest('.bmo').find('.suggest').text(result[selecte])
                    $(this).data("up", parseInt($(this).data("up")) + 1)
            } else
            if (keyCode == NAVIGATE_TO_NEXT_CORPUS_FRAGMENT) { 
                e.preventDefault();
                var currentDiv = $(this).closest('.bmo').find('.partial')
                var nextDiv = $(this).closest('.bmo').next().find('.partial');
                // var heightDiff = nextDiv.offset().top - currentDiv.offset().top
                var heightDiff = nextDiv.offset().top - topdock.offset().top
                var browh = window.innerHeight
                if (heightDiff >= 0.5*browh) {
                    window.scrollBy({
                        top: heightDiff- 0.5*browh,
                        left: 0,
                        behavior: 'smooth',
                    });
                }
                nextDiv.focus()
                $(this).data("pgdn", parseInt($(this).data("pgdn")) + 1)
            } else 
            if (keyCode == NAVIGATE_TO_PREVIOUS_CORPUS_FRAGMENT) { 
                e.preventDefault();
                var currentDiv = $(this).closest('.bmo').find('.partial')
                var prevDiv = $(this).closest('.bmo').prev().find('.partial');
                var browh = window.innerHeight
                var heightDiff = browh - (prevDiv.offset().top - topdock.offset().top)
                if (heightDiff >= 0.5*browh) {
                    window.scrollBy({
                        top: 0.5*browh-heightDiff,
                        left: 0,
                        behavior: 'smooth'
                    });
                }
                prevDiv.focus()
                $(this).data("pgup", parseInt($(this).data("pgup")) + 1)
            } else
            if (keyCode == SUBMIT_TRANSLATION) { 
                e.preventDefault();
                $('.preloader-background').css('display', 'flex')
                $(".partial").each(function() {
                    outputs.push([$(this).closest('.bmo').find('.hin_inp').text(), $(this).text()])
                });
                $(this).data("end", parseInt($(this).data("end")) + 1)

                $.ajax({
                    type: 'POST',
                    url: http_pushoutput,
                    data: {'csrfmiddlewaretoken': csrf_token, 'ops': JSON.stringify(outputs), 'keytimeseries': JSON.stringify(globkeystrokes)},
                    traditional: true,
                    success: function(result) {
                        window.location.href = http_preview;
                    }
                }); 

            } else
            if (e.ctrlKey || (e.ctrlKey && keyCode == 65)) {
            } else {
                if (keyCode == 39) {
                    $(this).data("right", parseInt($(this).data("right")) + 1)
                } else
                if (keyCode == 37) {
                    $(this).data("left", parseInt($(this).data("left")) + 1)
                } else
                if (keyCode == 8) {
                    $(this).data("bkspc", parseInt($(this).data("bkspc")) + 1)
                } else {
                    $(this).data("others", parseInt($(this).data("others")) + 1)
                }
                $(this).closest('.bmo').find('.suggest').text('')
            }
        });

        $('.partial').one('focus', function() {
            if (system_type == 'PE') {
                searchEvents($(this));
            }
        });

        $('.partial').focusin(function() {
            timer1 = new Date();
            $(this).closest('.bmo').removeClass('bmo--blur');
            $('.partial').closest('.bmo').not($(this).closest('.bmo')).addClass('bmo--blur');

            if (system_type == 'IT'){
                searchEvents($(this));
                var dropdown = $(this).parent().parent().children('.dropdown');
                dropdown.css('visibility', 'visible')
                var firsttext =  $(this).text()
                var textlist = firsttext.split(" ")
                var part2text = textlist.pop()
                var part1text = textlist.join(" ") + " "

                $(this).html(part1text + '<div id="dummy"></div>' + part2text)
                if (firsttext) {
                    dropdown.css('left', $('#dummy')[0].offsetLeft).css('top', $('#dummy')[0].offsetTop+7);
                } else {
                    dropdown.css('left', $('#dummy')[0].offsetLeft-5).css('top', $('#dummy')[0].offsetTop+7);
                }
                $(this).html(firsttext)
            }

            $(this).closest('.bmo').find('.suggest').css('visibility', 'visible');
            placeCaretAtEnd($(this).get(0))
            //Note the card switch in the globalkeystroke data
            cardID = $(this).get(0).id
            globkeystrokes.push([cardID, new Date() - docstarttime])
        });

        $(".partial").on('focusout',function() {
            timer2 = new Date();
            $(this).data("time", timer2 - timer1 + parseInt($(this).data("time")))
            // console.log($(this).data("time"))
            if (system_type == 'IT'){
                var dropdown = $(this).closest('.bmo').find('.dropdown');
                dropdown.css('visibility', 'hidden')
            }
            $(this).closest('.bmo').find('.suggest').css('visibility', 'hidden')
        });

        $(".partial").keyup(function(e){
            var keyCode = e.keyCode || e.which;
            if (keyCode != SELECT_NEXT_TRANSLATION_SUGGESTION && keyCode != SELECT_PREVIOUS_TRANSLATION_SUGGESTION && keyCode != 17 && !(e.ctrlKey && keyCode == 65) && keyCode != SUBMIT_TRANSLATION ) {

                $(this).closest('.bmo').find('.dropdown').css('visibility', 'hidden');
                if (system_type == 'IT'){
                    var dropdown = $(this).parent().parent().children('.dropdown');
                    var firsttext =  $(this).text()
                    var textlist = firsttext.split(" ")
                    var part2text = textlist.pop()
                    var part1text = textlist.join(" ")

                    $(this).html(part1text + '<div id="dummy"></div>' + part2text)
                    if (firsttext) {
                        dropdown.css('left', $('#dummy')[0].offsetLeft + 2).css('top', $('#dummy')[0].offsetTop+7);
                    } else {
                        dropdown.css('left', $('#dummy')[0].offsetLeft).css('top', $('#dummy')[0].offsetTop+24);
                    }
                    $(this).html(firsttext)
                    placeCaretAtEnd($(this).get(0)) 
                
                    clearTimeout(debounceTimeout);
                    debounceTimeout = setTimeout(searchEvents($(this)), 50);
                }
            }
        });

        $(".hin_inp").focusout(function(){
          // $('#hin_inp').html(strip($('#hin_inp').html()))
            if (system_type == 'IT'){
                searchEvents($(this));
            }
        });

        $("#highlight").change(function(){
          // $('#hin_inp').html(strip($('#hin_inp').html()))
            highlight = $(this).is(':checked')
            if (highlight == false) {
                $("span[class^='hin_inp_part']").css("background-color", "transparent");
            }
        });

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
        });
    });
});