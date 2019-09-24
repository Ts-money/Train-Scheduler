//Intialize firebase - Creates the config
const config = {
    apiKey: "AIzaSyBH9FmqB0qX3FSLr5goRpses2fqVkbWpj4",
    authDomain: "train-scheduler-5170e.firebaseapp.com",
    databaseURL: "https://train-scheduler-5170e.firebaseio.com",
    projectId: "train-scheduler-5170e",
    storageBucket: "",
    messagingSenderId: "952346556609",
    appId: "1:952346556609:web:fdab78589660fd5d883c40"
};
//Intializes firebase - Logs in the app
var firebaseApp = firebase.initializeApp(config);

console.log(firebaseApp.name);

// Get the firebase database we are working on
var database = firebase.database();

// Get current moment instance
var mmt = moment();
// Clones the current moment object and gets the midnight time stamp.
var midnight = mmt.clone().startOf('day');
// Gets the difference between midnight and NOW in minutes. 
var diffMinutes = mmt.diff(midnight, 'minutes');

// Function to initially make the update button disappear.
function disappearUpdateButton() {
    document.getElementById("update").style.display = "none";
}

//This tells the user that they have added schedule time
function addTrain() {

    // Gets the name of the train from the Input box.
    var name = $("#name").val().trim();
    // Gets the destination of the train from the Input box.
    var destination = $("#destination").val().trim();
    // Gets the first time the train departs from the Input box.
    var firstTime = $("#firstTime").val().trim();
    // Gets the frequency of the train running from the Input box.
    var frequency = $("#frequency").val().trim();

    // Pushes all the data from user to the firebase database.
    var insertRow = database.ref().push({
        trainName: name,
        trainDestination: destination,
        trainFirstTime: firstTime,
        trainFrequency: frequency,
        timeDiff: diffMinutes
    });

    // Tells the user they have added a train without any problems.
    alert("Train successfully added!");

}

var timeID;

// Method to load all previous trains from the firebase database.
database.ref().on("child_added", function (snapshot) {
    console.log(snapshot.val());
    child = snapshot.val();
    var id = snapshot.key;
    timeID = snapshot.key;
    console.log(id);


    // Creates a new row object for html using jQuery
    var newRow = $("<tr>");

    // Creates the name part of the row 
    var tdName = $("<td id='tdName'>");
    // Splits the name of the train
    var splitName = child.trainName.split("");
    // Adds some css and html properties 
    for (var i = 0; i < splitName.length; i++) {
        var letter = $("<span>" + splitName[i] + "</span>");
        letter.css({ "border": "1px solid darkslategrey", "padding": "2px", "margin": "0 3px" });
        tdName.append(letter);
    }


    // Creates destination part of the row 
    var tdDestination = $("<td>");
    // Again splits the name of the destination
    var splitDest = child.trainDestination.split("");
    // Goes throug hevery character and adds css & html properties
    for (var i = 0; i < splitDest.length; i++) {
        var letter = $("<span>" + splitDest[i] + "</span>");
        letter.css({ "border": "1px solid darkslategrey", "padding": "2px", "margin": "0 3px" });
        tdDestination.append(letter);
    }

    // Creates frequency part of the row
    var tdFrequency = $("<td>");
    // Splits the frequency character by character
    var splitFrequency = child.trainFrequency.split("");
    // Goes through every char and adds css & html propeties
    for (var i = 0; i < splitFrequency.length; i++) {
        var letter = $("<span>" + splitFrequency[i] + "</span>");
        letter.css({ "border": "1px solid darkslategrey", "padding": "2px", "margin": "0 3px" });
        tdFrequency.append(letter);
    }

    var tdNext = $("<td>");
    var currentTime = moment();
    var convertedTime = moment(child.trainFirstTime, "HH:mm").subtract(1, "years");
    var diffTime = moment().diff(moment(convertedTime), "minutes");

    var remainder = diffTime % child.trainFrequency;
    var minutesAway = child.trainFrequency - remainder;
    var minAway = minutesAway.toString();
    var nextTrain = moment().add(minutesAway, "minutes").format("hh:mm");


    var splitNext = nextTrain.split("");
    for (var i = 0; i < splitNext.length; i++) {
        var letter = $("<span>" + splitNext[i] + "</span>");
        letter.css({ "border": "1px solid darkslategrey", "padding": "2px", "margin": "0 3px" });
        tdNext.append(letter);
    }
    var tdMinutesAway = $("<td>");
    var splitMinutes = minAway.split("");
    for (var i = 0; i < splitMinutes.length; i++) {
        var letter = $("<span>" + splitMinutes[i] + "</span>");
        letter.css({ "border": "1px solid darkslategrey", "padding": "2px", "margin": "0 3px" });
        tdMinutesAway.append(letter);
    }

    // Makes the update button element
    var updateRecord = $("<td>");
    // Adds the html properties required for it to function properly
    updateRecord.html("<a href='#trainForm'><button class='update btn-success' onclick='updateButton(\"" + id + "\");' data-name='" + id + "'>Update</button></a>")

    var deleteRecord = $("<td>");
    deleteRecord.html("<button class='delete btn-danger' onclick='deleteButton(\"" + id + "\");' data-name='" + id + "'>Delete</button>");

    // Adds all the row elements into the row it self

    newRow.append(tdName);
    newRow.append(tdDestination);
    newRow.append(tdFrequency);
    newRow.append(tdNext);
    newRow.append(tdMinutesAway);
    newRow.append(updateRecord);
    newRow.append(deleteRecord);
    // Adds the row to the table.
    $("tbody").append(newRow);
});

// Used to update some elements of the train (Parameter: id of train)
function updateButton (id) {
    // Gets the firebase database child that we need to update.  
    var updateThis = database.ref().child(id);
    // Set all input boxes values to the ones from the database to update
    updateThis.once('value', function (snapshot) {
        // Get all values required to go in input boxes
        var nameFromDB = snapshot.val().trainName;
        var destFromDB = snapshot.val().trainDestination;
        var firstFromDB = snapshot.val().trainFirstTime;
        var frequencyFromDB = snapshot.val().trainFrequency;

        // Update the input boxes to those values
        $("#name").val(nameFromDB);
        $("#destination").val(destFromDB);
        $("#firstTime").val(firstFromDB);
        $("#frequency").val(frequencyFromDB);
        // Hide the submit button
        $("#submit").hide();
        // Show the update button
        $("#update").show();
    
    });
    
    // Once the update button has been clicked update the firebase database.
    $("#update").on("click", function () {
        // Updates everything on firebase
        updateThis.update({
            "trainName": $("#name").val(),
            "trainDestination": $("#destination").val(),
            "trainFirstTime": $("#firstTime").val(),
            "trainFrequency": $("#frequency").val()
        }).then(function () {
            // If update was successful alerts the user saying it was sucessfull
            alert("You updated a record.");
            // Reloads the page to show the updates
            location.reload();
        }).catch(function (error) {
            // The program catched a error and alerts the user about it
            alert("Sorry, something went wrong.");
            console.log("Sorry");
        });


    })   
}

//gives an alert when train is removed
function deleteButton(id) {
    // Gets the train that we will be deleting
    var deleteThis = database.ref().child(id);
    // Goes in the firebase database and removes the record
    deleteThis.remove().then(function () {
        // If successful tells the user about it
        alert("You deleted a record.");
        // Reloads the page to show that the train has been deleted.
        location.reload();
    }).catch(function (error) {
        // The program catched a error and alerts the user about it.
        alert("Sorry, something went wrong");
        console.log("Sorry");
    });
}


//timer functions to update the page every minute as the database changes
var number = 0;
var intervalId;

function run() {
    // Removes any existing interval just in case
    clearInterval(intervalId);
    // Creates a new interval set to call increment() function every 1000 ms (1 second = 1000 ms)
    intervalId = setInterval(increment, 1000);
}

// Counts up every 1 second to reload the page after 1 minute.
function increment() {
    // Count the counter up
    number++;
    // Put the number to console for debug
    console.log(number);
    // If number has reached 60 (1 minute) stop the timer and reload page
    if (number === 60) {
        // Stops timer
        stop();
        // Gets the current time from train
        var timeChange = database.ref().child(timeID);
        console.log(timeChange);
        // Updates the firebase database to the current time
        timeChange.update({
            timeDiff: moment().diff(midnight, 'minutes')
        });
        // As soon as database is updated reloads page
        database.ref().on("value", function (snapshot) {

            // Reloads page
            location.reload();

        });
        // Starts the timer back up
        run();

    }
}

// Function to stop timer
function stop() {
    // Removes the current interval
    clearInterval(intervalId);
    // Resets the coutner back to 0
    number = 0;
}

// As soon as the script is loaded it starts the timer.
run();