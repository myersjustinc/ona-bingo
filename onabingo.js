;(function( window, $, _, Backbone ) {
'use strict';





/*****************************************************************************
 * UTILITY FUNCTIONS
 *****************************************************************************/

// Variation of Paul Irish's log() for my IIFE setup:
// http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
function log() {
  log.history = log.history || [];
  log.history.push( arguments );
  if ( window.console ) {
    window.console.log( Array.prototype.slice.call( arguments ) );
  }
}


}( this, this.jQuery, this._, this.Backbone ));
