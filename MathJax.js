   var MathJax = {
        tex: {
          inlineMath: [
            ['$', '$'],
            ['\\(', '\\)']
          ]
        },
        chtml: {
          displayAlign: 'center'
				},
        startup: {
          pageReady: function() {
            //  Do the usual startup (which does a typeset).
            //  When that is all done, un-hide the page.
            return MathJax.startup.defaultPageReady().then(function() {
            	document.getElementById("hidden").disabled = true;
            });
          }
        }
    };