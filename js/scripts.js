let currentSong = new Audio()
let songs = []
let currFolder

async function getSongs(folder) {
    currFolder = folder;
    
    // For GitHub Pages - replace with your actual username and repository
    const username = "Usaid-Khan";
    const repo = "Music";
    const branch = "main";
    
    try {
        // Fetch the song list from a JSON file instead of trying to scrape HTML
        // You'll need to create a songs.json file in each folder with the list of songs
        let response = await fetch(`https://${username}.github.io/${repo}/songs/${folder}/songs.json`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch songs: ${response.status}`);
        }
        
        songs = await response.json();
        console.log("Songs loaded:", songs);
        
        // Entering and displaying songs in the song-list
        let songUL = document.querySelector(".song-list").getElementsByTagName("ul")[0];
        songUL.innerHTML = "";
        
        for (const song of songs) {
            songUL.innerHTML += `<li data-song="${song.file}">
                            <img src="svg/music.svg" class="invert" alt="">
                            <div class="info">
                                <div>${song.title}</div>
                                <div>${song.artist}</div>
                            </div>
                            <div class="playnow">
                                <img src="svg/play.svg" class="invert" alt="">
                            </div>
                        </li>`;
        }

        // Attach event listener to each song
        Array.from(document.querySelectorAll(".song-list li")).forEach(e => {
            e.addEventListener("click", () => {
                let track = e.getAttribute("data-song"); // Get the actual filename
                console.log("Playing: ", track);
                playMusic(track);
            });
        });
        
        return songs;
    } catch (error) {
        console.error("Error loading songs:", error);
        document.querySelector(".song-list").getElementsByTagName("ul")[0].innerHTML = 
            `<li>Error loading songs. Please check console for details.</li>`;
        return [];
    }
}

// Keep track of current index
let currentIndex = 0;

let playMusic = (track, pause=false) => {
    // Use the correct URL structure for GitHub Pages
    currentSong.src = `https://usaid-khan.github.io/Music/songs/${currFolder}/${track}`;
    
    // Find the song metadata from our songs array
    const songData = songs.find(s => s.file === track);
    if (songData) {
        // Update current index when playing a song
        currentIndex = songs.findIndex(song => song.file === track);
        document.querySelector(".songinfo").innerHTML = `${songData.title} - ${songData.artist}`;
    } else {
        document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
    }
    
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    
    if(!pause) {
        currentSong.play();
        play.src = "svg/pause.svg";
    }
}

// Adding an event listener to previous
previous.addEventListener("click", () => {
    if(currentIndex - 1 >= 0) {
        playMusic(songs[currentIndex - 1].file);
    }
});

// Adding an event listener to next
next.addEventListener("click", () => {
    if(currentIndex + 1 < songs.length) {
        playMusic(songs[currentIndex + 1].file);
    }
});

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) {
        return "00:00"; // Default value to prevent NaN display
    }

    seconds = Math.floor(seconds); // Ensure we only work with whole seconds
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;

    return String(minutes).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

async function main() {
    // Getting list of all the songs in the folder
    await getSongs("ncs"); // Just use the folder name without the full path
    
    if (songs.length > 0) {
        playMusic(songs[0].file, true);
    }

    // Attach an event listener to play button in playbar
    play.addEventListener("click", () => {
        if(currentSong.paused) {
            currentSong.play()
            play.src = "svg/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "svg/play.svg"
        }
    });

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    });

    // Adding an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = (currentSong.duration * percent) / 100
    });

    // Adding an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
        document.querySelector(".playbar").style.bottom = "-130px"
    });

    // Adding an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
        document.querySelector(".playbar").style.bottom = "15px"
    });

    // Adding an even listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    });

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await getSongs(item.currentTarget.dataset.folder);
            if (songs.length > 0) {
                playMusic(songs[0].file);
            }
        });
    });
}

main();
