let currentSong = new Audio()
let songs
let currFolder

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text()

    let div = document.createElement('div')
    div.innerHTML = response
    let as = div.getElementsByTagName('a')

    songs = []
    for(i=0; i<as.length; i++) {
        let element = as[i]
        if(element.href.endsWith('.mp3') || element.href.endsWith('.flac')) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // Entering and displaying songs in the song-list
    let songUL = document.querySelector(".song-list").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML += `<li data-song="${song}">
                            <img src="svg/music.svg" class="invert" alt="">
                            <div class="info">
                                <div>${decodeURIComponent(song.split("-")[1])}</div>
                                <div>${decodeURIComponent(song.split("-")[0])}</div>
                            </div>
                            <div class="playnow">
                                <img src="svg/play.svg" class="invert" alt="">
                            </div>
                        </li>`
    }

    // Attach event listener to each song
    Array.from(document.querySelectorAll(".song-list li")).forEach(e => {
        e.addEventListener("click", () => {
            let track = e.getAttribute("data-song") // Get the actual filename
            console.log("Playing: ", track)
            playMusic(track)
        })
    })
}

/****************************************************************************************/

let playMusic = (track, pause=false)=> {
    currentSong.src = `/${currFolder}/` + track
    if(!pause) {
        currentSong.play()
        play.src = "svg/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

/****************************************************************************************/

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) {
        return "00:00"; // Default value to prevent NaN display
    }

    seconds = Math.floor(seconds); // Ensure we only work with whole seconds
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;

    return String(minutes).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

/****************************************************************************************/

async function main() {
    // Getting list of all the songs in the folder
    await getSongs("songs/ncs")
    playMusic(songs[0], true)

    // Get the list of all the songs
    //displayAlbums()

    // Attach an event listener to play button in playbar
    play.addEventListener("click", ()=> {
        if(currentSong.paused) {
            currentSong.play()
            play.src = "svg/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "svg/play.svg"
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", ()=> {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    // Adding an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e=> {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = (currentSong.duration * percent) / 100
    })

    // Adding an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=> {
        document.querySelector(".left").style.left = "0"
        document.querySelector(".playbar").style.bottom = "-130px"
    })

    // Adding an event listener for close button
    document.querySelector(".close").addEventListener("click", ()=> {
        document.querySelector(".left").style.left = "-100%"
        document.querySelector(".playbar").style.bottom = "15px"
    })

    // Adding an event listener to previous
    previous.addEventListener("click", ()=> {
        let currentTrack = currentSong.src.split(`/${currFolder}/`)[1];
        let index = songs.indexOf(currentTrack);
        if(index-1 >= 0) {
            playMusic(songs[index-1])
        }
    })

    // Adding an event listener to next
    next.addEventListener("click", ()=> {
        let currentTrack = currentSong.src.split(`/${currFolder}/`)[1];
        let index = songs.indexOf(currentTrack);
        if(index+1 < songs.length) {
            playMusic(songs[index+1])
        }
    })

    // Adding an even listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=> {
        currentSong.volume = parseInt(e.target.value) / 100
    })

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=> {
        e.addEventListener("click", async item=> {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
        })
    })
}

/****************************************************************************************/

main()
