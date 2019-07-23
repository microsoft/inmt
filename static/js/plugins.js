/*================================================================================
  Item Name: Materialize - Material Design Admin Template
  Version: 4.0
  Author: PIXINVENT
  Author URL: https://themeforest.net/user/pixinvent/portfolio
================================================================================*/

  /*Preloader*/
  $(window).on('load', function() {
    setTimeout(function() {
      $('body').addClass('loaded');
    }, 200);
  });

  $(function() {

    "use strict";

    var window_width = $(window).width();
    

    // Search class for focus
    $('.header-search-input').focus(
      function() {
        $(this).parent('div').addClass('header-search-wrapper-focus');
      }).blur(
      function() {
        $(this).parent('div').removeClass('header-search-wrapper-focus');
      });

    // Check first if any of the task is checked
    $('#task-card input:checkbox').each(function() {
      checkbox_check(this);
    });

    // Task check box
    $('#task-card input:checkbox').change(function() {
      checkbox_check(this);
    });

    // Check Uncheck function
    function checkbox_check(el) {
      if (!$(el).is(':checked')) {
        $(el).next().css('text-decoration', 'none'); // or addClass
      } else {
        $(el).next().css('text-decoration', 'line-through'); //or addClass
      }
    }
    // Plugin initialization

    $('select').material_select();
    // Set checkbox on forms.html to indeterminate
    var indeterminateCheckbox = document.getElementById('indeterminate-checkbox');
    if (indeterminateCheckbox !== null)
      indeterminateCheckbox.indeterminate = true;

    // Commom, Translation & Horizontal Dropdown
    $('.dropdown-button, .translation-button, .dropdown-menu').dropdown({
      inDuration: 300,
      outDuration: 225,
      constrainWidth: false,
      hover: true,
      gutter: 0,
      belowOrigin: true,
      alignment: 'left',
      stopPropagation: false
    });
    // Notification, Profile & Settings Dropdown
    $('.notification-button, .profile-button, .dropdown-settings').dropdown({
      inDuration: 300,
      outDuration: 225,
      constrainWidth: false,
      hover: true,
      gutter: 0,
      belowOrigin: true,
      alignment: 'right',
      stopPropagation: false
    });

    // Materialize scrollSpy
    $('.scrollspy').scrollSpy();

    // Materialize tooltip
    $('.tooltipped').tooltip({
      delay: 50
    });

    //Main Left Sidebar Menu
    $('.sidebar-collapse').sideNav({
      edge: 'left', // Choose the horizontal origin
    });

    // Overlay Menu (Full screen menu)
    $('.menu-sidebar-collapse').sideNav({
      menuWidth: 240,
      edge: 'left', // Choose the horizontal origin
      //closeOnClick:true, // Set if default menu open is true
      menuOut: false // Set if default menu open is true
    });

    //Main Left Sidebar Chat
    $('.chat-collapse').sideNav({
      menuWidth: 300,
      edge: 'right',
    });

    // Pikadate datepicker
    $('.datepicker').pickadate({
      selectMonths: true, // Creates a dropdown to control month
      selectYears: 15 // Creates a dropdown of 15 years to control year
    });

    // Perfect Scrollbar
    $('select').not('.disabled').material_select();
    var leftnav = $(".page-topbar").height();
    var leftnavHeight = window.innerHeight - leftnav;
    if (!$('#slide-out.leftside-navigation').hasClass('native-scroll')) {
      $('.leftside-navigation').perfectScrollbar({
        suppressScrollX: true
      });
    }
    var righttnav = $("#chat-out").height();
    $('.rightside-navigation').perfectScrollbar({
      suppressScrollX: true
    });

    // Fullscreen
    function toggleFullScreen() {
      if ((document.fullScreenElement && document.fullScreenElement !== null) ||
        (!document.mozFullScreen && !document.webkitIsFullScreen)) {
        if (document.documentElement.requestFullScreen) {
          document.documentElement.requestFullScreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullScreen) {
          document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }
      } else {
        if (document.cancelFullScreen) {
          document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        }
      }
    }

    $('.toggle-fullscreen').click(function() {
      toggleFullScreen();
    });

    // Toggle Flow Text
    var toggleFlowTextButton = $('#flow-toggle')
    toggleFlowTextButton.click(function() {
      $('#flow-text-demo').children('p').each(function() {
        $(this).toggleClass('flow-text');
      })
    });

    // Detect touch screen and enable scrollbar if necessary
    function is_touch_device() {
      try {
        document.createEvent("TouchEvent");
        return true;
      } catch (e) {
        return false;
      }
    }
    if (is_touch_device()) {
      $('#nav-mobile').css({
        overflow: 'auto'
      })
    }
  });