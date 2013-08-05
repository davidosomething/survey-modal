/**
 * Survey Modal JavaScript
 *
 * Depends on jQuery 1.7.1+ (load jQuery before this script)
 * Replace $.on with $.delegate if need to backport
 *
 * Usage:
 * Call with surveyModal.init();
 *
 * Called automatically on load (bottom of this script!)
 * Reads window.surveyDisabled variable
 */

////////////////////////////////////////////////////////////////////////////////
var surveyModal = (function () {
  var m = this; // self reference

  /**
   * default options - don't edit.
   * you should copy these to the BOTTON of this script and override them when
   * calling init()
   */
  this.options = {
    debug:       false, // debug to console at certain steps?
    ab:          false, // show to 50% of all users, overrides percentage
    percentage:  25,    // show to x% of all users, e.g. 25% would be 1/4 users
    mobileUrl:   'http://www.google.com' // URL to pop open when click "yes"
  };

  /**
   * set ROOT DOMAIN cookie so lightbox never pops up again
   * set when user clicks yes or no
   */
  this.done = function (e) {
    var expires = new Date();
    expires.setTime(expires.getTime() + (3600 * 1000 * 24 * 365 * 10)); // 10 years
    document.cookie = 'isSurveyDone=1;expires=' + expires.toGMTString() + ';path=/'; // unexpiring root cookie
    m.hide();
  };

  /**
   * read cookie determining if lightbox should popup
   * read before opening popup on init
   * @return bool true if isSurveyDone cookie value is 1
   */
  this.isSurveyDone = function () {
    var cookieValue = document.cookie.match('(^|;) ?isSurveyDone=([^;]*)(;|$)');
    return (cookieValue && cookieValue.length >= 2 && cookieValue[2] === "1") ? true : false;
  };

  /**
   * create and show the popup
   * can be called at any time
   */
  this.show = function () {
    if ($('#survey_modal').length) { // already open
      return;
    }
    m.debug();

    var modalHtml = '';
    modalHtml += '<div id="survey_modal"';
    modalHtml += '>';
    modalHtml += '<p>Will you answer a few questions?</p>';
    modalHtml += '<a href="' + m.options.mobileUrl + '" ';
    modalHtml += 'id="survey_modal-yes">Yes</a>';
    modalHtml += '<a id="survey_modal-no">No</a>';
    modalHtml += '</div>';
    $(modalHtml).appendTo('body');

    $('#survey_modal').css({
      'background': '#fff',
      '-webkit-box-shadow': '0px 0px 2px 1px rgba(0,0,0,0.55)',
      'box-shadow': '0px 0px 2px 1px rgba(0,0,0,0.55)',
      'border': '1px solid #aaa',
      'color': '#222',
      'padding': '26px 30px 36px',
      'width': '250px',
      'overflow': 'hidden',
      'text-align': 'center',
      'left': '50%',
      'margin': '0 0 0 -155px',
      'position': 'fixed',
      'top': '20%',
      'z-index': '9999',
    });
    $('#survey_modal a').css({
      'background-color': '#ace',
      'border': '1px solid #bdf',
      'box-sizing': 'border-box',
      'color': '#fff',
      'cursor': 'pointer',
      'float': 'left',
      'font-weight': '700',
      'margin': '2px',
      'padding': '10px 0',
      'text-align': 'center',
      'text-decoration': 'none',
      'width': '45%'
    });
    $('#survey_modal #survey_modal-no').css({
      'float': 'right',
    });

    $("#survey_modal-yes").unbind("click").on("click", function(e) {
      e.preventDefault();
      window.open($(this).attr("href"), "survey", "resizable=1,scrollbars=yes,width=770,height=830").blur();
      window.focus();
      m.done();
    });
  };

  /**
   * completely remove popup from DOM
   */
  this.hide = function (e) {
    $('#survey_modal').remove();
    m.debug();
  };

  // show mobile detection status and lightbox cookie
  this.debug = function () {
    if (!m.options.debug) {
      return;
    }
    console.log('isSurveyDone? ' + m.isSurveyDone());
  };

  // debugging method to unset cookie
  this.undo = function (e) {
    var expires = new Date();
    expires.setTime(expires.getTime() + (3600 * 1000 * 24 * 365 * 10)); // 10 years
    document.cookie = 'isSurveyDone=0;expires=' + expires.toGMTString() + ';path=/'; // unexpiring root cookie
    m.debug();
  };

  /**
   * @param options object
   */
  this.init = function () {
    if (arguments.length) {
      m.options = $.extend(m.options, arguments[0]);
    }
    if (m.options.debug) { // show options
      console.log(m.options, 'cookied: ' + this.isSurveyDone());
    }

    // set cookie after click yes or no, so popup only appears once ever
    $('body').on('click', '#survey_modal-yes, #survey_modal-no', m.done);

    // determine sample group, show if in 50% or percentage
    var isInSampleGroup = true;
    var pool = 2;

    if (m.options.ab) {
      isInSampleGroup = Math.floor(Math.random() * pool);
    }
    else if (m.options.percentage) {
      m.options.percentage = parseInt(m.options.percentage, 10);
                        // roll a 100 sided die,           accept numbers less than %
      isInSampleGroup = Math.floor(Math.random() * 100) <= m.options.percentage;
    }

    if (isInSampleGroup) {
      // cookied?
      if (!m.isSurveyDone()) {
        m.show();
      }
      else {
        console.log('cookied, normally wouldn\'t show but debug mode is on');
        m.show();
      }
    }
    else {
      if (m.options.debug) {
        console.log('Not in sample group');
      }
    }
  };

  // expose methods
  return this;

}).call({});


////////////////////////////////////////////////////////////////////////////////
// Execution
////////////////////////////////////////////////////////////////////////////////
jQuery(document).ready(function ($) {
  surveyModal.init({
    // override default options here
    debug: true
  });
});
