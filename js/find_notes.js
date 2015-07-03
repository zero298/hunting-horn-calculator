document.addEventListener("DOMContentLoaded", function () {
    var availableSongChart = document.getElementById("availableSongChart");
    var clearButton = document.getElementById("clearNotes");

    var selectedNotesArr = [];

    function createNoteListener(noteButton, callback) {
        noteButton.addEventListener("click", function (e) {
            if (selectedNotesArr.indexOf(e.target.dataset.color) <= -1) {
                selectedNotesArr.push(e.target.dataset.color);
                if (callback) {
                    callback();
                }
            }
        });
    }

    function findSongs(givenNotes, setList) {

        var possibleSongs = [];
        var viableSong = false;

        if (setList && setList["songs"]) {

            var songs = setList["songs"];

            for (var i = 0; i < songs.length; i++) {
                viableSong = true;
                var setListSongNotes = songs[i]["notes"];

                for (var j = 0; j < givenNotes.length; j++) {
                    if (setListSongNotes.indexOf(givenNotes[j]) <= -1) {
                        viableSong = false;
                        break;
                    }
                }

                if (viableSong) {
                    possibleSongs.push(songs[i]);
                }
            }
        }
        return possibleSongs;
    }

    function createSongElement(song) {
        var songElement = document.createElement("div");
        var songTitleElement = document.createElement("span");
        var songDurationElement = document.createElement("span");
        var songNotesElement = document.createElement("span");

        songElement.appendChild(songTitleElement);
        songElement.appendChild(songDurationElement);
        songElement.appendChild(songNotesElement);

        songTitleElement.innerHTML = song.songName;
        songDurationElement.innerHTML = song.duration;

        songElement.className = "noteResults";
        songTitleElement.className = "noteResultsTitle";
        songDurationElement.className = "noteResultsDuration";
        songNotesElement.className = "noteResultsNotes";

        song.notes.forEach(function (note) {
            var noteElement = document.createElement("span");
            noteElement.className = "note" + " " + note.toLowerCase();
            songNotesElement.appendChild(noteElement);
        });

        return songElement;
    }

    function printSongs(availableSongs) {

        if (availableSongs) {


            availableSongChart.innerHTML = "";

            if (!availableSongs.length) {
                availableSongChart.innerHTML = "No Available Songs";
            }
            else {
                availableSongs.forEach(function (viableSong) {
                    var songDiv = createSongElement(viableSong);
                    availableSongChart.appendChild(songDiv);
                });
            }
        }
        else {
            availableSongChart.innerHTML = "Please select notes";
        }

    }

    var xhr = new XMLHttpRequest();
    xhr.addEventListener("readystatechange", function () {
        if (xhr.readyState === 4 && xhr.status === 200) {

            var data = JSON.parse(xhr.responseText);

            var noteButtons = document.querySelectorAll("#selectableNotes button.note");

            for (var i = 0; i < noteButtons.length; i++) {
                createNoteListener(noteButtons[i], function (b) {
                    var availableSongs = findSongs(selectedNotesArr, data);
                    printSongs(availableSongs);
                });
            }

            clearButton.addEventListener("click", function () {
                selectedNotesArr.splice(0, selectedNotesArr.length);
                printSongs();
            });
        }
    });

    xhr.open("GET", "/horn/res/json/note_data.json");
    xhr.send();
});