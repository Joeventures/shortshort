var reportList = null;
$(document).ready(function () {

  var config = {
    apiKey: "AIzaSyAhBqVICLQao-0yl0jzW8Ti6-yq73Gt164",
    authDomain: "shortshort-a63fa.firebaseapp.com",
    databaseURL: "https://shortshort-a63fa.firebaseio.com",
    projectId: "shortshort-a63fa",
    storageBucket: "shortshort-a63fa.appspot.com",
    messagingSenderId: "697292026507"
  };
  firebase.initializeApp(config);

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var uid = user.uid;
      var providerData = user.providerData;

      $(".report").html("");

      // Handlebars: Display the report form
      var reportForm = Handlebars.compile($("#report-form").html());
      var reportContext = {email: email};
      var reportHtml = reportForm(reportContext);
      $(".report").html(reportHtml);

      // Display the list of past reports
      firebase.database().ref("reports/" + uid).on('value', function(results) {
        $("#pills-past").html("<ul class=\"list-group list-group-flush\"></ul>");
        reportList = results.val();
        // reportArr = [];
        // Build the individual list items
        $.each(reportList, function(k,v) {
          // reportArr.push(v);
          var timestamp = new Date(v.timestamp);
          $("#pills-past ul").prepend("<li class=\"list-group-item\" data-listitem=\""+k+"\">Submitted: " + timestamp + "</li>");
        });
        // Make each list item clickable and populate the modal content as needed
        $("#pills-past li").click(function (item) {
          currentItem = reportList[item.target.dataset.listitem];
          $("#modal-accomplishments").text(currentItem.accomplishments);
          $("#modal-priorities").text(currentItem.priorities);
          $("#modal-challenges").text(currentItem.challenges);
          $("#modal-lessons").text(currentItem.lessons);
          $("#report-modal").modal();
        });
      });


      // Logout when logout button is clicked
      $(".btn-logout").click(function () {
        $(".modal").modal('hide');
        firebase.auth().signOut();
      });
      
      // Switch to Past Reports when button is clicked
      $(".btn-past").click(function () {
        $(".modal").modal('hide');
        $('#pills-tab a[href="#pills-past"]').tab('show')
      });

      // Accept report form submission
      $("#form-report").submit(function (e) {
        e.preventDefault();
        var managerEmail = $("#manager-email").val();
        var accomplishments = $("#question-accomplishments").val();
        var priorities = $("#question-priorities").val();
        var challenges = $("#question-challenges").val();
        var lessons = $("#question-lessons").val();

        var postData = {
          managerEmail: managerEmail,
          accomplishments: accomplishments,
          priorities: priorities,
          challenges: challenges,
          lessons: lessons,
          timestamp: Date.now()
        };

        // Write to the database and give feedback to the user
        var newReport = firebase.database().ref('reports/' + uid).push();
        newReport.set(postData).then(function () {
          $("#form-report")[0].reset();
          $("#small-modal").modal();
        });
      });

    } else {

      // Handlebars: Display the login/register forms
      var loginForm = Handlebars.compile($('#login-form').html());
      var loginContext = { };
      var loginHtml = loginForm(loginContext);
      $(".report").html(loginHtml);
      $("#login .alert").hide();

      // Create a user account on submission of #form-register
      $("#form-register").submit(function (e) {
        e.preventDefault();
        var loginEmail = $("#register-email").val();
        var loginPassword = $("#register-password").val();
        var loginConfirmPassword = $("#register-confirm-password").val();
        // Make sure the password fields match
        if(loginPassword !== loginConfirmPassword) {
          $("#register-password").addClass("is-invalid");
          $("#register-confirm-password").addClass("is-invalid");
        } else {
          // If the user fields match...
          $("#register-password").removeClass("is-invalid");
          $("#register-confirm-password").removeClass("is-invalid");

          // Create the user account
          createUser(loginEmail, loginPassword);
        }
      });

      // Log in on submission of #form-login
      $("#form-login").submit(function (e) {
        e.preventDefault();
        var loginEmail = $("#login-email").val();
        var loginPassword = $("#login-password").val();
        loginUser(loginEmail, loginPassword);
      });

      // Create the user in Firebase and automatically log them in
      function createUser(email, password) {
        firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log("User creation error (" + errorCode + "): " + errorMessage);
        });
      }

      function loginUser(email, password) {
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log("User login error (" + errorCode + "): " + errorMessage);
        });
      }
    }
  });


});
