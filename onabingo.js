;(function( window, $, _, Backbone ) {
'use strict';


/*****************************************************************************
  * CONFIGURATION OPTIONS
  ****************************************************************************/

var config = {};

config.cardHeight = 5;
config.cardWidth = 5;

config.wordList = [
  { word: 'Aggregation', withHyphens: [ 'Aggreg', 'ation' ]},
  { word: 'Analytics', withHyphens: [ 'Ana', 'lytics' ]},
  { word: 'Apple Watch' },
  { word: 'Attribution', withHyphens: [ 'Attri', 'bution' ]},
  { word: 'Audience' },
  { word: 'Best practices', withHyphens: [ 'Best prac', 'tices' ]},
  { word: 'Big Data' },
  { word: 'Buzzword', withHyphens: [ 'Buzz', 'word' ]},
  { word: 'Comments' },
  { word: 'Crowdsource', withHyphens: [ 'Crowd', 'source' ]},
  { word: 'Disruptive', withHyphens: [ 'Dis', 'rup', 'tive' ]},
  { word: 'Ecosystem', withHyphens: [ 'E', 'co', 'sys', 'tem' ]},
  { word: 'Embeddable', withHyphens: [ 'Em', 'bed', 'da', 'ble' ]},
  { word: 'Engagement', withHyphens: [ 'Engage', 'ment' ]},
  { word: 'Entrepreneur', withHyphens: [ 'En', 'tre', 'pre', 'neur' ]},
  { word: 'Explainer', withHyphens: [ 'Ex', 'plain', 'er' ]},
  { word: 'Ferguson', withHyphens: [ 'Fer', 'gu', 'son' ]},
  { word: 'Gamification', withHyphens: [ 'Gam', 'i', 'fi', 'ca', 'tion' ]},
  { word: 'Immersive', withHyphens: [ 'Im', 'mer', 'sive' ]},
  { word: 'Infographics', withHyphens: [ 'Info', 'graphics' ]},
  { word: 'Innovation', withHyphens: [ 'In', 'no', 'va', 'tion' ]},
  { word: 'Insider', withHyphens: [ 'In', 'sid', 'er' ]},
  { word: 'Jeff Bezos' },
  { word: 'Knight Foundation', withHyphens: [ 'Knight Foun', 'da', 'tion' ]},
  { word: 'Lady ___' },
  { word: 'Mobile' },
  { word: 'Moderation', withHyphens: [ 'Moder', 'ation' ]},
  { word: 'Muppet' },
  { word: 'Net neutrality', withHyphens: [ 'Net neu', 'tral', 'i', 'ty' ]},
  { word: 'Oculus Rift' },
  { word: 'On a budget' },
  { word: 'Public radio' },
  { word: 'Social' },
  { word: 'Startup', withHyphens: [ 'Start', 'up' ]},
  { word: 'Sustainable', withHyphens: [ 'Sus', 'tain', 'a', 'ble' ]},
  { word: 'Timeline', withHyphens: [ 'Time', 'line' ]},
  { word: 'Twitter' },
  { word: 'User-generated content', withHyphens: [ 'User-gener', 'ated content' ]},
  { word: 'Verification', withHyphens: [ 'Veri', 'fi', 'cation' ]},
  { word: 'Viral' },
  { word: 'Wearable', withHyphens: [ 'Wear', 'a', 'ble' ]},
  { word: 'iPhone 6' }
];


/*****************************************************************************
  * BOARD DEFINITION
  ****************************************************************************/

var BingoCard,
  BingoSpace;

BingoSpace = Backbone.Model.extend({
  defaults: {
    selected: false
  },
  initialize: function( attributes ) {
    if ( attributes.word === 'Free space' ) {
      this.set( 'selected', true );
    }
  },
  toggleSpace: function() {
    /**
      * Toggles whether this space is selected, unless it happens to be the
      * free space.
      */

    if ( this.get( 'word' ) === 'Free space' ) {
      this.set( 'selected', true );
      return;
    }

    this.set( 'selected', !this.get( 'selected' ) );

    // Send an analytics event.
    if ( this.get( 'selected' ) ) {
      window.ga && window.ga('send', {
        'hitType': 'event',
        'eventCategory': 'spaceChange',
        'eventAction': 'check',
        'eventLabel': this.get( 'word' )
      });
    } else {
      window.ga && window.ga('send', {
        'hitType': 'event',
        'eventCategory': 'spaceChange',
        'eventAction': 'uncheck',
        'eventLabel': this.get( 'word' )
      });
    }
  }
});

BingoCard = Backbone.Collection.extend({
  model: BingoSpace,
  initialize: function( models, options ) {
    this.cardHeight = options.cardHeight;
    this.cardWidth = options.cardWidth;

    this.on( 'reset', this.arrangeRows, this );
    this.on( 'change:selected', this.checkForWin, this );
  },
  arrangeRows: function() {
    /**
      * Stores the card's spaces in a 2D array for convenience.
      */

    var byRow = [],
      cardHeight = this.cardHeight,
      cardWidth = this.cardWidth;

    // Keep track of the models by coordinates.
    _.forEach( _.range( cardHeight ), function( rowIndex ) {
      var row = [];

      _.forEach( _.range( cardWidth ), function( colIndex ) {
        row.push( this.at( rowIndex * cardWidth + colIndex ) );
      }, this );

      byRow.push( row );
    }, this );

    this.byRow = byRow;
  },
  checkForWin: function() {
    /**
      * Check whether the user has won the game.
      *
      * Emits the 'win' event with the winning words when appropriate.
      *
      * @returns {boolean}
      */

    var nextResult;

    nextResult = this.checkDiagonals();
    if ( nextResult ) {
      this.trigger( 'win', nextResult );
      return true;
    }

    nextResult = this.checkRows();
    if ( nextResult ) {
      this.trigger( 'win', nextResult );
      return true;
    }

    nextResult = this.checkColumns();
    if ( nextResult ) {
      this.trigger( 'win', nextResult );
      return true;
    }

    return false;
  },
  checkDiagonals: function() {
    /**
      * Check the two diagonals of the board for a win condition.
      *
      * Returns the array of the winning words if appropriate.
      *
      * @returns {array|null}
      */

    var byRow = this.byRow,
      northeast,
      northeastPasses,
      shortestAxisLength = _.min([ this.cardHeight, this.cardWidth ]),
      southeast,
      southeastPasses;

    // Check the northwest-to-southeast diagonal.
    southeast = _.map( _.range( shortestAxisLength ), function( index ) {
      return byRow[ index ][ index ];
    }, this );
    southeastPasses = _.all( southeast, function( model ) {
      return model.get( 'selected' );
    }, this );
    if ( southeastPasses ) {
      return _.map( southeast, function( model ) {
        return model.get( 'word' );
      }, this );
    }

    // Check the southwest-to-northeast diagonal.
    northeast = _.map( _.range( shortestAxisLength ), function( index ) {
      return byRow[ this.cardHeight - index - 1 ][ index ];
    }, this );
    northeastPasses = _.all( northeast, function( model ) {
      return model.get( 'selected' );
    }, this );
    if ( northeastPasses ) {
      return _.map( northeast, function( model ) {
        return model.get( 'word' );
      }, this );
    }

    return null;
  },
  checkRows: function() {
    /**
      * Check the rows of the board for a win condition.
      *
      * Returns the array of the winning words if appropriate.
      *
      * @returns {array|null}
      */

    var byRow = this.byRow,
      cardHeight = this.cardHeight,
      rowIndex,
      rowPasses;

    for ( rowIndex = 0; rowIndex < cardHeight; rowIndex++ ) {
      rowPasses = _.all( byRow[ rowIndex ], function( model ) {
        return model.get( 'selected' );
      }, this );
      if ( rowPasses ) {
        return _.map( byRow[ rowIndex ], function( model ) {
          return model.get( 'word' );
        }, this );
      }
    }

    return null;
  },
  checkColumns: function() {
    /**
      * Check the column of the board for a win condition.
      *
      * Returns the array of the winning words if appropriate.
      *
      * @returns {array|null}
      */

    var byRow = this.byRow,
      cardHeight = this.cardHeight,
      cardWidth = this.cardWidth,
      column,
      columnIndex,
      columnPasses;

    for ( columnIndex = 0; columnIndex < cardWidth ; columnIndex++ ) {
      column = _.map( _.range( cardHeight ), function( rowIndex ) {
        return byRow[ rowIndex ][ columnIndex ];
      }, this );
      columnPasses = _.all( column, function( model ) {
        return model.get( 'selected' );
      }, this );
      if ( columnPasses ) {
        return _.map( column, function( model ) {
          return model.get( 'word' );
        }, this );
      }
    }

    return null;
  }
});

/*****************************************************************************
  * VIEW DEFINITION
  ****************************************************************************/

var BingoCardView,
  BingoSpaceView;

BingoSpaceView = Backbone.View.extend({
  tagName: 'td',
  className: 'bingo-space',
  events: {
    'click': 'toggleSpace'
  },
  initialize: function( options ) {
    this.listenTo( this.model, 'change', this.render );
  },
  render: function() {
    /**
      * Renders the current view.
      *
      * @returns {BingoSpaceView}
      */

    var withHyphens = this.model.get( 'withHyphens' );

    if ( withHyphens != null ) {
      this.$el.text( withHyphens.join( '\u00ad' ) );
    } else {
      this.$el.text( this.model.get( 'word' ) );
    }

    this.$el.toggleClass( 'selected', this.model.get( 'selected' ) );

    return this;
  },
  toggleSpace: function() {
    /**
      * Tell the model to toggle its current state.
      */

    this.model.toggleSpace();
  }
});

BingoCardView = Backbone.View.extend({
  tagName: 'table',
  className: 'bingo-card',
  initialize: function( options ) {
    this.spaceViews = [];
    this.listenTo( this.collection, 'reset', this.render );
  },
  render: function() {
    /**
      * Renders the current view.
      *
      * @returns {BingoCardView}
      */

    var byRow,
      cardHeight,
      cardWidth,
      collection = this.collection;

    cardHeight = collection.cardHeight;
    cardWidth = collection.cardWidth;
    byRow = collection.byRow;

    // Empty this view.
    this.$el.empty();

    // Initialize a view for each BingoSpace.
    this.spaceViews = _.map( byRow, function( rowModels ) {
      return _.map( rowModels, function( spaceModel ) {
        return new BingoSpaceView({
          model: spaceModel
        });
      }, this );
    }, this );

    // Iterate over all of them again and build the DOM structure for the bingo
    // card. (Yes, I could've done this all at once while I was initializing
    // them earlier, but this is a bit easier to read, and I'm not particularly
    // worried about performance with a typical size of bingo card.)
    _.forEach( this.spaceViews, function( rowViews ) {
      var $row = $( '<tr></tr>' );

      _.forEach( rowViews, function( spaceView ) {
        spaceView.render().$el.appendTo( $row );
      }, this );

      $row.appendTo( this.$el );
    }, this );

    return this;
  }
});

/*****************************************************************************
  * INITIALIZATION
  ****************************************************************************/

$( window.document ).ready(function() {
  var card,
    cardView,
    winClass = 'bingo-win--won',
    $winDialog = $( '.bingo-win' ),
    $winningWords = $( '.bingo-winning-words' ),
    words;

  function newCard() {
    words = getWords(
      config.cardHeight * config.cardWidth,
      config.wordList );
    card.reset( words );
    $winDialog.removeClass( winClass );

    window.ga && window.ga('send', {
      'hitType': 'event',
      'eventCategory': 'newCard',
      'eventAction': 'newCard'
    });
  }

  function openWinDialog() {
    $winDialog.addClass( winClass );
  }
  function closeWinDialog() {
    $winDialog.removeClass( winClass );
  }

  card = new BingoCard( null, {
    cardHeight: config.cardHeight,
    cardWidth: config.cardWidth
  });
  newCard();

  cardView = new BingoCardView({
    collection: card,
    el: $( '.bingo-card' )
  });
  cardView.render();

  $( '.bingo-reset' ).on( 'click', newCard );
  card.on( 'win', function( winningWords ) {
    openWinDialog();
    $winningWords.val( winningWords.join( ', ' ) );

    window.ga && window.ga('send', {
      'hitType': 'event',
      'eventCategory': 'gameEnd',
      'eventAction': 'win'
    });
  });

  $( '.bingo-tweet' ).on( 'click', function( event ) {
    var session = $( '.bingo-session' ).val().trim();

    if ( session ) {
      session += ' ';
    }

    window.open(
      ('http://twitter.com/share?text=' +
      encodeURIComponent(
        'Bingo! (' + $winningWords.val() + ') ' + session +
        '#ONA14 #ONAbingo' ) +
      '&url=' + encodeURIComponent( window.location.href )),
      'sharer', 'toolbar=0,status=0,width=626,height=436'
    );
  });

  $( '.bingo-win__close' ).on( 'click', function( event ) {
    closeWinDialog();
  });
});


/*****************************************************************************
  * UTILITY FUNCTIONS
  ****************************************************************************/

function getWords( wordCount, wordList ) {
  /**
    * Choose some number of random words (without duplicates) from a given
    * list, with a free space in the middle.
    *
    * @argument {number} wordCount - how many words to select
    * @argument {array} wordList - the list of words from which to choose
    * @returns {array}
    */

  var selectedWords = _.shuffle( wordList ).slice( 0, wordCount - 1 );

  selectedWords.splice( Math.floor( wordCount / 2 ), 0, {
    word: 'Free space'
  });

  return selectedWords;
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
