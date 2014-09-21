;(function( window, $, _, Backbone ) {
'use strict';


/*****************************************************************************
  * CONFIGURATION OPTIONS
  ****************************************************************************/

var config = {};

config.cardHeight = 5;
config.cardWidth = 5;

config.wordList = [
  { word: 'Viral' },
  { word: 'Crowdsource', withHyphens: [ 'Crowd', 'source' ]},
  { word: 'Buzzword', withHyphens: [ 'Buzz', 'word' ]},
  { word: 'Engagement', withHyphens: [ 'Engage', 'ment' ]},
  { word: 'Analytics', withHyphens: [ 'Ana', 'lytics' ]},
  { word: 'Insider', withHyphens: [ 'In', 'sid', 'er' ]},
  { word: 'CMS' },
  { word: 'Verification', withHyphens: [ 'Veri', 'fi', 'cation' ]},
  { word: 'Responsive design', withHyphens: [ 'Respon', 'sive design' ]},
  { word: 'Comments' },
  { word: 'Aggregation', withHyphens: [ 'Aggreg', 'ation' ]},
  { word: 'Mobile-first' },
  { word: 'Social' },
  { word: 'Knight Foundation', withHyphens: [ 'Knight Foun', 'da', 'tion' ]},
  { word: 'Objective', withHyphens: [ 'Objec', 'tive' ]},
  { word: 'NSA' },
  { word: 'Entrepreneur', withHyphens: [ 'En', 'tre', 'pre', 'neur' ]},
  { word: 'Audience' },
  { word: 'Storytelling', withHyphens: [ 'Story', 'telling' ]},
  { word: 'Show your work' },
  { word: 'Storify' },
  { word: 'FOIA' },
  { word: 'User-generated content', withHyphens: [ 'User-gener', 'ated content' ]},
  { word: 'Twitter verified' },
  { word: 'Moderation', withHyphens: [ 'Moder', 'ation' ]},
  { word: 'Snackable', withHyphens: [ 'Snack', 'able' ]},
  { word: 'Public media' },
  { word: 'Google Glass' },
  { word: 'Teaching hospital', withHyphens: [ 'Teach', 'ing hos', 'pi', 'tal' ]},
  { word: 'Infographics', withHyphens: [ 'Info', 'graphics' ]},
  { word: 'Network' },
  { word: 'Big Data' },
  { word: 'New revenue streams' },
  { word: 'Public interest' },
  { word: '', withHyphens: [ 'Attri', 'bution' ]},
  { word: 'Snow Fall' },
];


/*****************************************************************************
  * BOARD DEFINITION
  ****************************************************************************/

var BingoCard,
  BingoSpace;

BingoSpace = Backbone.Model.extend({});

BingoCard = Backbone.Collection.extend({
  model: BingoSpace
});

/*****************************************************************************
  * VIEW DEFINITION
  ****************************************************************************/

var BingoCardView,
  BingoSpaceView;

/*****************************************************************************
  * INITIALIZATION
  ****************************************************************************/

$( window.document ).ready(function() {
  var card,
    cardView,
    words;

  words = getWords( config.cardHeight * config.cardWidth, config.wordList );

  card = new BingoCard( words );
});


/*****************************************************************************
  * UTILITY FUNCTIONS
  ****************************************************************************/

function getWords( wordCount, wordList ) {
  /**
    * Choose some number of random words (without duplicates) from a given
    * list.
    *
    * Works with any array of objects, I suppose, but it's intended here for
    * objects of words for bingo spaces.
    *
    * @argument {number} wordCount - how many words to select
    * @argument {array} wordList - the list of words from which to choose
    * @returns {array}
    */

  return _.shuffle( wordList ).slice( 0, wordCount );
}

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
