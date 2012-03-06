(function () {
sparks.GAHelper = {};

_gaq = window._gaq;

sparks.GAHelper.USER_TYPE = 1;

sparks.GAHelper.Category = {
  NAVIGATION: "Navigation"
}

sparks.GAHelper.setUserLoggedIn = function (isLoggedIn) {
  var userType = isLoggedIn ? "Member" : "Visitor";
  
  _gaq.push(['_setCustomVar',
    sparks.GAHelper.USER_TYPE,      // This custom var is set to slot #1.  Required parameter.
    'User Type',                    // The name of the custom variable.  Required parameter.
    userType,                       // Sets the value of "User Type" to "Member" or "Visitor" depending on status.  Required parameter.
    2                               // Sets the scope to session-level.  Optional parameter.
   ]);
};

sparks.GAHelper.userStartedLevel = function (levelName) {
   _gaq.push(['_trackEvent',
      sparks.GAHelper.Category.NAVIGATION, // category of activity
      'Started new activity', // Action
      levelName,
   ]);
};

sparks.GAHelper.userRepeatedLevel = function (levelName) {
   _gaq.push(['_trackEvent',
      sparks.GAHelper.Category.NAVIGATION, // category of activity
      'Repeated activity', // Action
      levelName,
   ]);
};



})();