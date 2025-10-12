# 🧪 VIB34D Manual Test Checklist

**Test URL:** http://localhost:8765/vib34d-modular-rebuild/
**Test Date:** 2025-10-12
**Tester:** Manual verification required

---

## ✅ CRITICAL TESTS (MUST PASS)

### 1. System Initialization
- [ ] Page loads without JavaScript errors
- [ ] Loading indicator appears then disappears
- [ ] "Choreographer ready!" message in status log
- [ ] Canvas element created in #stage-container
- [ ] Control panel visible on right side
- [ ] Top bar visible with play/stop controls

**How to verify:**
1. Open http://localhost:8765/vib34d-modular-rebuild/
2. Open browser console (F12)
3. Check for errors (should see "✅ Choreographer ready!")
4. Visually confirm UI elements present

---

### 2. Audio File Loading
- [ ] File input button works in top bar
- [ ] Can select an audio file
- [ ] "Audio loaded successfully" appears in status log
- [ ] Play/Pause/Stop buttons become enabled
- [ ] Audio status shows filename in top bar

**How to verify:**
1. Click file input in top bar
2. Select ANY audio file (MP3, WAV, etc.)
3. Wait for "Audio loaded successfully" message
4. Confirm play buttons are no longer disabled

---

### 3. Playback Controls
- [ ] Play button starts audio playback
- [ ] Audio actually plays through speakers/headphones
- [ ] Visualization starts animating
- [ ] Pause button pauses audio and visualization
- [ ] Stop button stops audio and resets
- [ ] Status display shows "Playback started"

**How to verify:**
1. Click "▶ PLAY" button in top bar
2. Listen for audio output
3. Watch canvas for movement/animation
4. Test pause and stop buttons

---

### 4. 4D Rotation Controls (CRITICAL!)
- [ ] "🔄 4D ROTATION" section visible in control panel
- [ ] XW Plane slider present (-π to π)
- [ ] YW Plane slider present (-π to π)
- [ ] ZW Plane slider present (-π to π)
- [ ] Moving XW slider changes visualization
- [ ] Moving YW slider changes visualization
- [ ] Moving ZW slider changes visualization
- [ ] Value displays update (show numbers like "1.57")

**How to verify:**
1. Scroll down in right control panel
2. Find "🔄 4D ROTATION" section
3. Slowly drag XW Plane slider
4. **WATCH CANVAS** - shape should rotate/morph
5. Try YW and ZW sliders
6. Check console for "✅ Set rot4dXW = [value]" messages

**Expected behavior:**
- Shape should visibly rotate in hyperspace
- Different from just spinning - the 3D projection should change
- May see faces/edges appear/disappear as 4D rotation occurs

---

### 5. Other Parameter Controls
- [ ] Geometry slider (1-22) changes shape
- [ ] Grid Density slider affects mesh resolution
- [ ] Morph Factor slider morphs shape
- [ ] Chaos slider adds randomization
- [ ] Speed slider affects animation speed
- [ ] Hue slider changes colors
- [ ] Intensity slider affects brightness
- [ ] Saturation slider affects color intensity

**How to verify:**
1. Move each slider one at a time
2. Observe changes in visualization
3. Check console for "✅ Set [param] = [value]"

---

### 6. Audio Reactivity
- [ ] Audio Reactivity toggle button visible
- [ ] Clicking toggle shows "🔊 ON"
- [ ] With audio playing, visualization reacts to music
- [ ] Beat detection visible (shapes pulse/change)
- [ ] Reactivity Strength slider affects sensitivity
- [ ] Console shows "✅ Audio reactivity: ON"

**How to verify:**
1. Load music file
2. Click "Audio Reactivity" toggle (should show 🔊 ON)
3. Press Play
4. **WATCH VISUALIZATION** - should pulse/react to beats
5. Try Reactivity Strength slider (0-1)

---

### 7. System Switching
- [ ] FACETED button is active by default
- [ ] Clicking QUANTUM switches system
- [ ] Clicking HOLOGRAPHIC switches system
- [ ] WebGL context properly recreates
- [ ] Visualization style changes between systems
- [ ] No errors during switching

**How to verify:**
1. Click "QUANTUM" pill
2. Wait for switch (should see "Switched to quantum")
3. Observe different visualization style
4. Click "HOLO" pill
5. Confirm system switches without errors

---

### 8. Choreography Mode
- [ ] Choreography Mode dropdown visible
- [ ] Can select Dynamic/Smooth/Aggressive/Minimal
- [ ] Mode changes affect behavior (with audio)
- [ ] Console shows "✅ Choreography mode: [mode]"

**How to verify:**
1. Select different modes from dropdown
2. Play music and observe differences
3. Aggressive should be more intense
4. Minimal should be subtle

---

## 🎯 INTEGRATION TESTS

### Test 1: Full Audio-Reactive 4D Rotation Session
**Scenario:** Load music, enable reactivity, adjust 4D rotation while playing

**Steps:**
1. Load an audio file with clear beats
2. Enable Audio Reactivity (🔊 ON)
3. Press Play
4. While music plays, adjust rot4dXW slider
5. Observe both audio reactivity AND 4D rotation
6. Try rot4dYW and rot4dZW
7. Adjust Reactivity Strength

**Expected Result:**
- Visualization reacts to music beats
- 4D rotation controls still work during playback
- Shape rotates in hyperspace while pulsing to music
- No lag or freezing
- Console shows parameter updates

---

### Test 2: System Switching During Playback
**Scenario:** Switch visualization systems while audio is playing

**Steps:**
1. Load audio and press Play
2. While playing, click QUANTUM
3. Observe system switch
4. Click HOLOGRAPHIC
5. Confirm audio continues playing
6. Check for errors

**Expected Result:**
- Audio playback continues uninterrupted
- Visualization switches smoothly
- No crashes or errors
- Parameters persist across switches

---

### Test 3: All 11 Parameters + Audio
**Scenario:** Adjust every parameter while music plays

**Steps:**
1. Load audio with beats, press Play
2. Adjust Geometry (try different shapes)
3. Adjust Grid Density
4. Adjust Morph Factor
5. Adjust Chaos
6. Adjust Speed
7. Adjust Hue
8. Adjust Intensity
9. Adjust Saturation
10. Adjust rot4dXW
11. Adjust rot4dYW
12. Adjust rot4dZW

**Expected Result:**
- All 11 parameters work simultaneously
- No conflicts between parameters
- Visualization updates smoothly
- Audio continues playing
- Console shows all parameter updates

---

## ⚠️ ERROR CONDITIONS TO TEST

### Test: No Audio Loaded
- [ ] Play button disabled when no audio
- [ ] Visualization still works (idle animation)
- [ ] 4D rotation sliders still work
- [ ] Parameters can be adjusted

### Test: Invalid Audio File
- [ ] Error message if file can't be loaded
- [ ] System doesn't crash
- [ ] Can try loading different file

### Test: Rapid Parameter Changes
- [ ] Drag sliders rapidly back and forth
- [ ] System doesn't crash
- [ ] No lag or freezing
- [ ] Console doesn't spam errors

### Test: System Switch Spam
- [ ] Click FACETED → QUANTUM → HOLO rapidly
- [ ] System handles gracefully
- [ ] No WebGL errors
- [ ] Eventually settles on last clicked

---

## 🐛 KNOWN ISSUES TO CHECK

### Issue 1: 4D Rotation Not Visible
**Symptom:** Moving rot4d sliders does nothing visible

**Possible causes:**
- WebGL uniforms not receiving values
- Shader not using rot4d uniforms
- choreographer.setParameter() not calling correctly

**Debug steps:**
1. Open console
2. Move rot4dXW slider
3. Look for "✅ Set rot4dXW = [value]"
4. If missing: event listener not connected
5. Check choreographer.baseParams in console

### Issue 2: Audio Not Playing
**Symptom:** Play button works but no sound

**Possible causes:**
- AudioContext not initialized
- Browser autoplay policy blocking
- Audio file format not supported

**Debug steps:**
1. Check console for AudioContext errors
2. Try clicking page first (user gesture)
3. Try different audio file format
4. Check browser audio permissions

### Issue 3: WebGL Context Lost
**Symptom:** Black screen, "WebGL context lost" error

**Possible causes:**
- GPU overload
- Too many contexts created
- System switching bug

**Debug steps:**
1. Refresh page
2. Try different system
3. Check GPU usage
4. Look for context recreation errors

---

## 📊 PERFORMANCE TESTS

### Frame Rate
- [ ] Visualization runs at 30+ FPS
- [ ] No stuttering during playback
- [ ] Smooth parameter transitions

**How to check:**
1. Open browser DevTools → Performance
2. Record during playback
3. Check FPS graph

### Memory Usage
- [ ] Memory doesn't continuously increase
- [ ] No memory leaks after 5+ minutes
- [ ] System switching releases memory

**How to check:**
1. Open DevTools → Memory
2. Take heap snapshot
3. Play for 5 minutes
4. Take another snapshot
5. Compare sizes

---

## ✅ SIGN-OFF CHECKLIST

Before considering this TESTED AND WORKING:

- [ ] All 8 critical tests passed
- [ ] All 3 integration tests passed
- [ ] No console errors during normal use
- [ ] Audio loads and plays correctly
- [ ] 4D rotation sliders visibly affect visualization
- [ ] Audio reactivity works with music
- [ ] System switching works without errors
- [ ] All 11 parameters respond correctly
- [ ] Performance is acceptable (30+ FPS)
- [ ] No crashes during 10+ minute session

**Test completed by:** ___________________
**Date:** ___________________
**Overall status:** PASS / FAIL
**Notes:** ___________________

---

## 🚨 IF TESTS FAIL

### Critical Failures (System Broken):
- Page doesn't load
- JavaScript errors on init
- Audio won't load at all
- 4D rotation sliders don't exist
- No visualization appears

**Action:** DO NOT DEPLOY. Report critical failures immediately.

### Major Failures (Core Features Broken):
- Audio plays but no reactivity
- 4D rotation sliders don't affect visualization
- Parameters don't update visualization
- System switching crashes

**Action:** Fix before deploying. These are user-facing features.

### Minor Failures (Polish Issues):
- UI styling issues
- Console warnings (not errors)
- Performance slightly slow
- Minor visual glitches

**Action:** Document for future fix. Can deploy with notes.

---

**This checklist ensures the VIB34D system actually WORKS, not just compiles.**

🌟 **A Paul Phillips Manifestation**
