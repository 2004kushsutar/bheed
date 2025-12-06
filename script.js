document.addEventListener("DOMContentLoaded", () => {
  // 1. SOCKET CONNECTION
  const socket = io("http://localhost:5000", {
    transports: ["websocket"], 
    upgrade: false
  });

  socket.on("connect", () => {
    console.log("✅ Connected to Python CCTV System!");
  });

  // 2. RECEIVE DATA
  socket.on("traffic_update", (data) => {
    console.log("📸 Raw Car Counts:", data);

    // Save the REAL car counts directly
    realCarCounts.north = data.north;
    realCarCounts.south = data.south;
    realCarCounts.east = data.east;
    realCarCounts.west = data.west;

    updateInterface();
  });

  // 3. CONFIGURATION
  const YELLOW_TIME = 3000;
  const ALL_RED_TIME = 2000;
  const CYCLE_ORDER = ["north", "east", "south", "west"];
  let currentCycleIndex = -1;

  // We store REAL counts now, not percentage
  const realCarCounts = { north: 0, south: 0, east: 0, west: 0 };
  
  let currentLights = { north: "red", south: "red", east: "red", west: "red" };
  let phase = "green";
  let cycleStartTime = Date.now();
  let phaseDuration = 0;

  // 4. DOM ELEMENTS
  const lights = {
    north: document.querySelectorAll("#north-light .light"),
    south: document.querySelectorAll("#south-light .light"),
    east: document.querySelectorAll("#east-light .light"),
    west: document.querySelectorAll("#west-light .light"),
  };
  const sliders = {
    north: document.getElementById("north-slider"),
    south: document.getElementById("south-slider"),
    east: document.getElementById("east-slider"),
    west: document.getElementById("west-slider"),
  };
  const valueDisplays = {
    north: document.getElementById("north-value"),
    south: document.getElementById("south-value"),
    east: document.getElementById("east-value"),
    west: document.getElementById("west-value"),
  };
  const timerDisplays = {
    north: document.getElementById("north-timer"),
    south: document.getElementById("south-timer"),
    east: document.getElementById("east-timer"),
    west: document.getElementById("west-timer"),
  };
  const roadCountDisplays = {
    north: document.getElementById("north-road-count"),
    south: document.getElementById("south-road-count"),
    east: document.getElementById("east-road-count"),
    west: document.getElementById("west-road-count"),
  };

  // 5. HELPER FUNCTIONS

  function setLight(direction, color) {
    lights[direction].forEach((light) => {
      light.classList.toggle("active", light.classList.contains(color));
    });
    currentLights[direction] = color;
  }

  function updateInterface() {
    for (const dir in realCarCounts) {
      const count = realCarCounts[dir];
      
      // 1. Text Updates
      // Display the actual car count on the dashboard
      valueDisplays[dir].textContent = count; 
      roadCountDisplays[dir].textContent = `${count} 🚗`;

      // 2. Slider Bar Logic
      // We convert count to a percentage for the bar visualization.
      // Let's say 20 cars = 100% full bar.
      const maxCapacity = 20; 
      let percentage = (count / maxCapacity) * 100;
      if (percentage > 100) percentage = 100;
      
      sliders[dir].value = percentage;

      // 3. Slider Color Logic
      // Remove old colors
      sliders[dir].classList.remove("low", "medium", "high");
      
      if (percentage < 33) {
        sliders[dir].classList.add("low");     // Green Bar
      } else if (percentage < 66) {
        sliders[dir].classList.add("medium");  // Yellow Bar
      } else {
        sliders[dir].classList.add("high");    // Red Bar
      }
    }
  }

  // --- NEW INTELLIGENT TIMING LOGIC ---
  function calculateSmartTime(carCount) {
    const STARTUP_TIME = 5000; // 5 Seconds overhead
    const TIME_PER_CAR = 3000; // 3 Seconds per car
    
    let time = STARTUP_TIME + (carCount * TIME_PER_CAR);

    // Safety Clamps
    if (time < 10000) time = 10000; // Minimum 10s
    if (time > 60000) time = 60000; // Maximum 60s
    
    return time;
  }

  function showCountdown(directions, remainingMs) {
    const seconds = Math.ceil(remainingMs / 1000);
    for (const dir in timerDisplays) timerDisplays[dir].style.display = "none";
    directions.forEach((dir) => {
      timerDisplays[dir].style.display = "block";
      timerDisplays[dir].textContent = seconds > 0 ? seconds : 0;
    });
  }

  function getActiveDirections() {
    if (currentCycleIndex === -1) return ["north"];
    return [CYCLE_ORDER[currentCycleIndex]];
  }

  function switchCycle() {
    currentCycleIndex = (currentCycleIndex + 1) % CYCLE_ORDER.length;
    phase = "green";

    const activeDirs = getActiveDirections();
    const activeDir = activeDirs[0];
    
    // Get real car count
    const carCount = realCarCounts[activeDir];

    // Use Formula
    phaseDuration = calculateSmartTime(carCount);
    cycleStartTime = Date.now();
    
    console.log(`🟢 Green for ${activeDir}. Cars: ${carCount}. Time Allocated: ${phaseDuration/1000}s`);
    
    updateLights();
  }

  function updateLights() {
    const active = getActiveDirections();
    const inactive = ["north", "south", "east", "west"].filter(
      (d) => !active.includes(d)
    );

    if (phase === "green") {
      active.forEach((d) => setLight(d, "green"));
      inactive.forEach((d) => setLight(d, "red"));
    } else if (phase === "yellow") {
      active.forEach((d) => setLight(d, "yellow"));
      inactive.forEach((d) => setLight(d, "red"));
    } else if (phase === "red") {
      ["north", "south", "east", "west"].forEach((d) => setLight(d, "red"));
    }
  }

  // 6. MAIN LOOP
  function mainLoop() {
    const now = Date.now();
    const elapsed = now - cycleStartTime;
    const activeDirs = getActiveDirections();

    if (phase === "green" && elapsed >= phaseDuration) {
      phase = "yellow";
      phaseDuration = YELLOW_TIME;
      cycleStartTime = now;
      updateLights();
    } else if (phase === "yellow" && elapsed >= phaseDuration) {
      phase = "red";
      phaseDuration = ALL_RED_TIME;
      cycleStartTime = now;
      updateLights();
    } else if (phase === "red" && elapsed >= phaseDuration) {
      switchCycle();
    }

    const remaining = Math.max(0, phaseDuration - (now - cycleStartTime));
    showCountdown(activeDirs, remaining);

    requestAnimationFrame(mainLoop);
  }

  // 7. INITIALIZATION
  // Disable sliders so user cannot move them manually
  for (const dir in sliders) {
    sliders[dir].disabled = true;
  }

  switchCycle();
  mainLoop();
});