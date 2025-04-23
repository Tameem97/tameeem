/******************************************************
 * SMOOTH SCROLLING
 ******************************************************/
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          window.scrollTo({
            top: target.offsetTop - 60,
            behavior: 'smooth'
          });
        }
      });
    });
  }
  
  /******************************************************
   * INSTAGRAM SLIDER (ONE POST AT A TIME, FIXED WIDTH)
   ******************************************************/
  function initializeInstagramSlider() {
    const track = document.querySelector('.slider-track');
    const slideDivs = document.querySelectorAll('.slider-track .slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
  
    if (!track || slideDivs.length === 0 || !prevBtn || !nextBtn) {
      return; // No slider found, or missing elements
    }
  
    let currentIndex = 0;
    const totalSlides = slideDivs.length;
  
    // We'll measure one slide's width dynamically (the .slide container).
    function getSlideWidth() {
      if (slideDivs[0]) {
        return slideDivs[0].offsetWidth + 20; // +20 for margin (10 on each side)
      }
      // fallback if not loaded
      return 320;
    }
  
    function updateSliderPosition() {
      const singleSlideWidth = getSlideWidth();
      // IMPORTANT: Use backticks for template strings:
      track.style.transform = `translateX(-${currentIndex * singleSlideWidth}px)`;
    }
  
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateSliderPosition();
      }
    });
  
    nextBtn.addEventListener('click', () => {
      if (currentIndex < totalSlides - 1) {
        currentIndex++;
        updateSliderPosition();
      }
    });
  
    // Initial position
    updateSliderPosition();
  
    // Recalculate if window is resized
    window.addEventListener('resize', updateSliderPosition);
  }
  
  /******************************************************
  * SEQUENTIAL SONG LIST (SAMPLE)
  ******************************************************/
  const mySongs = [];
  const mySongs_2 = [];
  
  async function loadSongData() {
    try {
      // Fetch both JSON files in parallel
      const [response1, response2] = await Promise.all([
        fetch('s1.json'),
        fetch('s2.json')
      ]);
  
      // Check for errors
      if (!response1.ok || !response2.ok) {
        throw new Error('Failed to load one or both JSON files');
      }
  
      // Parse JSON
      const data1 = await response1.json();
      const data2 = await response2.json();
  
      // Push the data into your existing arrays
      // (data1 and data2 are arrays of song objects)
      mySongs.push(...data1);
      mySongs_2.push(...data2);
  
      // Now mySongs & mySongs_2 each contain the newly loaded song objects
    } catch (error) {
      console.error('Error loading songs data:', error);
    }
  }
  
  /******************************************************
   * SHUFFLE HELPER
   ******************************************************/
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  /******************************************************
   * PREPARE SHUFFLED INDICES FOR EACH LIST
   ******************************************************/
  let indicesList1 = [];
  let indicesList2 = [];
  let list1Counter = 0; // For the 2:1 pattern
  let currentSongInfo = null; // We'll track which "song info" is currently displayed
  
  function setupSongLists() {
    indicesList1 = shuffle([...Array(mySongs.length).keys()]);
    indicesList2 = shuffle([...Array(mySongs_2.length).keys()]);
  }
  
  function getNextSongInfo() {
    // If both are empty => done
    if (indicesList1.length === 0 && indicesList2.length === 0) {
      return null;
    }
  
    // If list #1 is empty, only pick from list #2
    if (indicesList1.length === 0) {
      return { list: 2, index: indicesList2.pop() };
    }
  
    // If list #2 is empty, only pick from list #1
    if (indicesList2.length === 0) {
      return { list: 1, index: indicesList1.pop() };
    }
  
    // Both have songs
    if (list1Counter < 2) {
      // pick from list #1
      list1Counter++;
      return { list: 1, index: indicesList1.pop() };
    } else {
      // pick from list #2, then reset the counter
      list1Counter = 0;
      return { list: 2, index: indicesList2.pop() };
    }
  }
  
  /******************************************************
   * LOAD & PLAY SONGS
   ******************************************************/
  function loadSong(songInfo) {
    if (!songInfo) return; // If no info, do nothing
  
    // Figure out which list
    let chosenSong;
    if (songInfo.list === 1) {
      chosenSong = mySongs[songInfo.index];
    } else {
      chosenSong = mySongs_2[songInfo.index];
    }
  
    if (!chosenSong) return; // safety check
  
    // Update the displayed title
    const songLabel = document.getElementById('song-label');
    if (songLabel) {
      songLabel.textContent = chosenSong.title || 'Unknown Song';
    }
  
    // Update the favorite line if present
    const favLineEl = document.getElementById('favorite-line');
    if (favLineEl) {
      favLineEl.textContent = chosenSong.favoriteLine
        ? `"${chosenSong.favoriteLine}"`
        : '';
    }
  }
  
  function playSong(songInfo) {
    if (!songInfo) return;
  
    let chosenSong;
    if (songInfo.list === 1) {
      chosenSong = mySongs[songInfo.index];
    } else {
      chosenSong = mySongs_2[songInfo.index];
    }
  
    if (!chosenSong) return;
  
    // Open in a new tab
    window.open(chosenSong.url, '_blank');
  }
  
  /******************************************************
   * INTERSECTION OBSERVER (SECTION FADE-IN)
   ******************************************************/
  function initIntersectionObserver() {
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show-section');
          }
        });
      },
      { threshold: 0.1 }
    );
  
    sections.forEach(section => {
      section.classList.add('hidden-section');
      observer.observe(section);
    });
  }
  
  /******************************************************
   * TRAVEL SECTION COLLAPSIBLE
   ******************************************************/
  function initCollapsibleTravel() {
    const toggleTravelBtn = document.getElementById('toggleTravelBtn');
    const travelList = document.getElementById('travelList');
  
    if (toggleTravelBtn && travelList) {
      // By default, travelList is hidden in CSS (display: none).
      // So the button text is "Show Places" initially.
  
      toggleTravelBtn.addEventListener('click', () => {
        // Check if it's currently hidden
        if (travelList.style.display === 'none' || !travelList.style.display) {
          travelList.style.display = 'block';
          toggleTravelBtn.textContent = 'Hide Places';
        } else {
          travelList.style.display = 'none';
          toggleTravelBtn.textContent = 'Show Places';
        }
      });
    }
  }
  
  // Variables to store the passes data and the current index
  let passes = [];
  let currentIndex = 0;
  let playingInterval = null;
  
  // Get DOM elements for the collapsible
  const toggleDemoBtn   = document.getElementById('toggle-demo-btn');
  const demoContent     = document.getElementById('demo-content');
  const toggleMoreBtn   = document.getElementById('toggle-more-btn');
  const moreDetails     = document.getElementById('more-details');
  
  // Demo control buttons
  const loadBtn         = document.getElementById('load-btn');
  const prevBtn         = document.getElementById('prev-pass-btn');
  const playBtn         = document.getElementById('play-btn');
  const nextBtn         = document.getElementById('next-pass-btn');
  const resetBtn        = document.getElementById('reset-btn');
  
  // Jump / search
  const passNumberInput = document.getElementById('pass-number');
  const goPassBtn       = document.getElementById('go-pass-btn');
  const searchInput     = document.getElementById('search-pass');
  const searchBtn       = document.getElementById('search-btn');
  
  // Info & IR code block
  const passTitleEl     = document.getElementById('pass-title');
  const irDumpEl        = document.getElementById('ir-dump');
  const passProgressEl  = document.getElementById('pass-progress');
  
  /******************************************************
   * COLLAPSIBLE TOGGLES
   ******************************************************/
  // 1) Main demo show/hide
  toggleDemoBtn.addEventListener('click', () => {
    if (demoContent.classList.contains('show-section')) {
      // Hide it
      demoContent.classList.remove('show-section');
      toggleDemoBtn.textContent = 'Show Demo';
    } else {
      // Show it
      demoContent.classList.add('show-section');
      toggleDemoBtn.textContent = 'Hide Demo';
    }
  });
  
  // 2) "More details" show/hide
  toggleMoreBtn.addEventListener('click', () => {
    if (moreDetails.classList.contains('show-section')) {
      moreDetails.classList.remove('show-section');
      toggleMoreBtn.textContent = 'Read More Details';
    } else {
      moreDetails.classList.add('show-section');
      toggleMoreBtn.textContent = 'Hide Details';
    }
  });
  
  /******************************************************
   * COMPILER PASS DEMO
   ******************************************************/
  loadBtn.addEventListener('click', async () => {
    try {
      const response = await fetch('ir_dump.json'); // Adjust path if needed
      if (!response.ok) {
        throw new Error(`Error fetching passes.json: ${response.statusText}`);
      }
      passes = await response.json();
  
      currentIndex = 0;
      updatePassDisplay();
  
      // Enable control buttons
      prevBtn.disabled = false;
      playBtn.disabled = false;
      nextBtn.disabled = false;
      resetBtn.disabled = false;
      goPassBtn.disabled = false;
      searchBtn.disabled = false;
  
      // We only need to load once
      loadBtn.disabled = true;
    } catch (err) {
      console.error(err);
      alert('Failed to load passes data. Check console for details.');
    }
  });
  
  // Update the display for the current pass
  function updatePassDisplay() {
    if (!passes || passes.length === 0) return;
    
    const pass = passes[currentIndex];
    passTitleEl.textContent = pass.title || 'Unknown Pass';
    irDumpEl.textContent    = pass.code || '';
  
    // "1 / 20" style progress (currentIndex is zero-based)
    passProgressEl.textContent = `${currentIndex + 1} / ${passes.length}`;
  
    // Disable prev button if at start
    prevBtn.disabled = (currentIndex === 0);
    // Disable next button if at end
    nextBtn.disabled = (currentIndex === passes.length - 1);
  }
  
  // Prev button
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updatePassDisplay();
    }
  });
  
  // Next button
  nextBtn.addEventListener('click', () => {
    if (currentIndex < passes.length - 1) {
      currentIndex++;
      updatePassDisplay();
    }
  });
  
  // Play button toggles auto-play
  playBtn.addEventListener('click', () => {
    if (!passes || passes.length === 0) return;
  
    // If not playing, start
    if (!playingInterval) {
      playBtn.textContent = 'Pause';
      playingInterval = setInterval(() => {
        if (currentIndex < passes.length - 1) {
          currentIndex++;
          updatePassDisplay();
        } else {
          // Stop at last pass
          clearInterval(playingInterval);
          playingInterval = null;
          playBtn.textContent = 'Play';
        }
      }, 150); // 1.5s interval - adjust as desired
    } else {
      // Pause
      clearInterval(playingInterval);
      playingInterval = null;
      playBtn.textContent = 'Play';
    }
  });
  
  /******************************************************
   * NEW FEATURES: RESET, GO TO PASS #, SEARCH
   ******************************************************/
  // Reset button => go back to first pass
  resetBtn.addEventListener('click', () => {
    if (passes.length > 0) {
      currentIndex = 0;
      updatePassDisplay();
    }
  });
  
  // Go to pass # (index = passNumber - 1)
  goPassBtn.addEventListener('click', () => {
    if (!passes || passes.length === 0) return;
  
    const passNum = parseInt(passNumberInput.value, 10);
    // Check valid pass number
    if (!isNaN(passNum) && passNum >= 1 && passNum <= passes.length) {
      currentIndex = passNum - 1; // because array is zero-based
      updatePassDisplay();
    } else {
      alert(`Please enter a pass number between 1 and ${passes.length}.`);
    }
  });
  
  // Search for pass name
  searchBtn.addEventListener('click', () => {
    if (!passes || passes.length === 0) return;
  
    const query = searchInput.value.toLowerCase().trim();
    if (!query) {
      alert('Please type part of a pass name to search for.');
      return;
    }
  
    // Find first pass whose title contains the query (case-insensitive)
    const foundIndex = passes.findIndex(p => p.title.toLowerCase().includes(query));
    if (foundIndex !== -1) {
      currentIndex = foundIndex;
      updatePassDisplay();
    } else {
      alert('No pass title matches your search.');
    }
  });
  
  
  /******************************************************
   * MAIN INITIALIZATION
   ******************************************************/
  document.addEventListener('DOMContentLoaded', async () => {
    await loadSongData();
  
    // 1) Init smooth scrolling
    initSmoothScrolling();
  
    // 2) Delay Instagram slider init so IG embed can load dimensions
    setTimeout(initializeInstagramSlider, 1000);
    
    // 3) Setup the song lists (shuffle them)
    setupSongLists();
  
    // 4) Immediately pick the first "next song" and load it
    currentSongInfo = getNextSongInfo();
    loadSong(currentSongInfo);
  
    // 5) "Song" button => open that song in new tab
    const songBtn = document.getElementById('song-btn');
    if (songBtn) {
      songBtn.addEventListener('click', () => {
        playSong(currentSongInfo);
      });
    }
  
    // 6) "Next" button => picks the next random from our 2:1 logic
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const newSongInfo = getNextSongInfo();
        if (!newSongInfo) {
          alert('All songs have been played!');
          return;
        }
        currentSongInfo = newSongInfo;
        loadSong(currentSongInfo);
      });
    }
  
    // 7) Initialize Intersection Observer for section fade-ins
    initIntersectionObserver();
  
    // 8) Initialize Collapsible Travel Section
    initCollapsibleTravel();
  });