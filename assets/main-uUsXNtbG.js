(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function e(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(s){if(s.ep)return;s.ep=!0;const o=e(s);fetch(s.href,o)}})();class P{constructor(t){this.choreographer=t,this.mediaRecorder=null,this.recordedChunks=[],this.isRecording=!1,this.recordingStartTime=0,this.recordingTimer=null,this.recordingCanvas=null,this.recordingAudioDest=null}async startRecording(){try{console.log("🎥 Starting stable recording system...");const t=document.getElementById("stage-container"),e=window.innerWidth,i=window.innerHeight;this.recordingCanvas=document.createElement("canvas"),this.recordingCanvas.width=e,this.recordingCanvas.height=i,this.recordingCanvas.id="recording-canvas",this.recordingCanvas.style.display="none",document.body.appendChild(this.recordingCanvas);const s=this.recordingCanvas.getContext("2d",{alpha:!1});console.log(`📐 Recording canvas: ${e}x${i}`);const o=this.recordingCanvas.captureStream(30);if(this.choreographer.audioElement&&this.choreographer.audioSource){this.recordingAudioDest=this.choreographer.audioContext.createMediaStreamDestination(),this.choreographer.audioSource.connect(this.recordingAudioDest);const m=this.recordingAudioDest.stream.getAudioTracks()[0];m&&(o.addTrack(m),console.log("🔊 Audio track added to recording"))}const a={mimeType:"video/webm;codecs=vp9",videoBitsPerSecond:8e6};MediaRecorder.isTypeSupported(a.mimeType)||(a.mimeType="video/webm;codecs=vp8",a.videoBitsPerSecond=6e6),this.mediaRecorder=new MediaRecorder(o,a),this.recordedChunks=[],this.mediaRecorder.ondataavailable=m=>{m.data.size>0&&this.recordedChunks.push(m.data)},this.mediaRecorder.onstop=()=>{this.saveRecording()};let r=null,n=0,l=0;const h=()=>{if(!this.isRecording)return;if(n++,this.choreographer.audioElement&&this.choreographer.sequences&&this.choreographer.sequences.length>0){const f=this.choreographer.audioElement.currentTime;this.choreographer.updateChoreographyAtTime(f)}const m=this.choreographer.systems[this.choreographer.currentSystem];if(m&&m.engine)try{if(this.choreographer.audioElement&&(m.engine.time=this.choreographer.audioElement.currentTime),m.engine.updateVisualizers)m.engine.updateVisualizers();else if(m.engine.visualizers){const f=this.choreographer.getCurrentParameters();f.time=m.engine.time||0,m.engine.visualizers.forEach(g=>{g&&g.updateParameters&&g.render&&(g.updateParameters(f),g.render())})}}catch(f){console.warn("📹 Visualizer render failed:",f.message)}s.fillStyle="#000000",s.fillRect(0,0,this.recordingCanvas.width,this.recordingCanvas.height);const p=Array.from(t.querySelectorAll("canvas"));p.length!==l&&(console.log(`📹 Recording frame ${n}: ${p.length} canvases (was ${l})`),l=p.length);let y=!1;if(p.forEach(f=>{if(f&&f.width>0&&f.height>0)try{s.drawImage(f,0,0,this.recordingCanvas.width,this.recordingCanvas.height),y=!0}catch(g){console.warn(`📹 Frame ${n}: Failed to capture canvas`,g.message)}}),y)try{r=s.getImageData(0,0,this.recordingCanvas.width,this.recordingCanvas.height)}catch{}else if(r){console.log(`📹 Frame ${n}: Using buffered frame (${p.length} canvases available)`);try{s.putImageData(r,0,0)}catch{}}else console.log(`📹 Frame ${n}: No frame to capture (${p.length} canvases, no buffer)`);requestAnimationFrame(h)};this.mediaRecorder.start(100),this.isRecording=!0,requestAnimationFrame(h);const d=document.getElementById("start-recording-btn"),u=document.getElementById("stop-recording-btn");d&&(d.style.display="none"),u&&(u.style.display="block"),this.recordingStartTime=Date.now(),this.recordingTimer=setInterval(()=>{const m=Math.floor((Date.now()-this.recordingStartTime)/1e3),p=Math.floor(m/60),y=m%60,f=document.getElementById("recording-timer");f&&(f.textContent=`⏺ REC ${p}:${y.toString().padStart(2,"0")}`,f.style.display="block")},1e3),console.log("✅ Recording started - stable system-switch-proof capture")}catch(t){console.error("❌ Recording error:",t),alert(`Failed to start recording: ${t.message}`),this.isRecording=!1}}stopRecording(){if(!this.mediaRecorder||!this.isRecording)return;if(this.isRecording=!1,this.mediaRecorder.stop(),this.recordingCanvas&&this.recordingCanvas.parentNode&&(this.recordingCanvas.parentNode.removeChild(this.recordingCanvas),this.recordingCanvas=null),this.recordingAudioDest)try{this.recordingAudioDest.disconnect(),this.recordingAudioDest=null}catch(s){console.warn("Error disconnecting recording audio:",s)}this.recordingTimer&&(clearInterval(this.recordingTimer),this.recordingTimer=null);const t=document.getElementById("start-recording-btn"),e=document.getElementById("stop-recording-btn"),i=document.getElementById("recording-timer");t&&(t.style.display="block"),e&&(e.style.display="none"),i&&(i.textContent="💾 Saving video..."),console.log("🎥 Recording stopped - processing video...")}saveRecording(){const t=new Blob(this.recordedChunks,{type:"video/webm"}),e=(t.size/(1024*1024)).toFixed(2);console.log(`💾 Saving video: ${e} MB`);const i=URL.createObjectURL(t),s=document.createElement("a");s.style.display="none",s.href=i,s.download=`vib34d-choreography-${Date.now()}.webm`,document.body.appendChild(s),s.click(),setTimeout(()=>{document.body.removeChild(s),URL.revokeObjectURL(i)},100);const o=document.getElementById("recording-timer");o&&(o.textContent=`✅ Video saved! (${e} MB)`,setTimeout(()=>{o.style.display="none",o.textContent=""},5e3)),console.log(`✅ Recording saved: ${e} MB`)}}class F{constructor(t){this.choreographer=t,this.lastBeatTime=0,this.beatHistory=[],this.avgBeatInterval=0,this.beatPhase=0,this.rhythmicPulse=0,this.peakDetector={bass:0,mid:0,high:0,energy:0},this.energyMomentum={bass:0,mid:0,high:0},this.energyHistory=[],this.lastModeChange=0}getFrequencyRange(t,e,i){let s=0;for(let o=e;o<i&&o<t.length;o++)s+=t[o];return s/(i-e)}startAnalysisLoop(){const t=this.choreographer.analyser;if(!t){console.warn("⚠️ No analyser available");return}const e=t.frequencyBinCount,i=new Uint8Array(e);let s=performance.now();const o=()=>{if(requestAnimationFrame(o),!this.choreographer.audioReactive||!t)return;const a=performance.now(),r=(a-s)/1e3;s=a,t.getByteFrequencyData(i);const n=this.getFrequencyRange(i,0,100)/255,l=this.getFrequencyRange(i,100,250)/255,h=this.getFrequencyRange(i,250,500)/255,d=this.getFrequencyRange(i,500,800)/255,u=this.getFrequencyRange(i,800,1024)/255,m=(n*2+l+h+d+u)/6,p=this.peakDetector.bass*.7+.3;let y=!1;if(n>p&&a-this.lastBeatTime>250&&(y=!0,this.lastBeatTime=a,this.beatHistory.push(a),this.beatHistory.length>8&&this.beatHistory.shift(),this.beatHistory.length>=4)){const f=[];for(let g=1;g<this.beatHistory.length;g++)f.push(this.beatHistory[g]-this.beatHistory[g-1]);this.avgBeatInterval=f.reduce((g,v)=>g+v,0)/f.length}if(this.avgBeatInterval>0){const f=a-this.lastBeatTime;this.beatPhase=f/this.avgBeatInterval%1,this.rhythmicPulse=Math.sin(this.beatPhase*Math.PI*2)*.5+.5}if(this.peakDetector.bass=Math.max(this.peakDetector.bass*.99,n),this.peakDetector.mid=Math.max(this.peakDetector.mid*.99,h),this.peakDetector.high=Math.max(this.peakDetector.high*.99,u),this.peakDetector.energy=Math.max(this.peakDetector.energy*.99,m),this.energyMomentum.bass+=(n-this.energyMomentum.bass)*.15,this.energyMomentum.mid+=(h-this.energyMomentum.mid)*.12,this.energyMomentum.high+=(u-this.energyMomentum.high)*.18,this.energyHistory.push(m),this.energyHistory.length>120&&this.energyHistory.shift(),a-this.lastModeChange>5e3){const f=this.energyHistory.reduce((x,S)=>x+S,0)/this.energyHistory.length,g=this.energyHistory.map(x=>Math.abs(x-f)).reduce((x,S)=>x+S,0)/this.energyHistory.length;let v=this.choreographer.choreographyMode;f>.7&&g>.2?v="chaos":f>.5?v="pulse":g>.15?v="dynamic":f<.3?v="flow":v="wave",v!==this.choreographer.choreographyMode&&(this.choreographer.choreographyMode=v,this.lastModeChange=a,console.log(`🎭 Choreography mode: ${v} (energy=${f.toFixed(2)}, variance=${g.toFixed(2)})`))}this.choreographer.applyAdvancedChoreography({bass:n,lowMid:l,mid:h,highMid:d,high:u,energy:m,isBeat:y,beatPhase:this.beatPhase,rhythmicPulse:this.rhythmicPulse,momentum:this.energyMomentum,peaks:this.peakDetector,dt:r})};o()}getAudioData(){return{bass:this.energyMomentum.bass,mid:this.energyMomentum.mid,high:this.energyMomentum.high,beatPhase:this.beatPhase,isBeat:performance.now()-this.lastBeatTime<100}}getBPM(){return this.avgBeatInterval===0?0:Math.round(6e4/this.avgBeatInterval)}}class B{constructor(){this.enabled=!0,this.metrics={fps:0,frameTime:0,renderTime:0,cpuUsage:0,memoryUsage:0,gpuStalls:0,activeVisualizers:0,canvasCount:0},this.history={fps:[],frameTime:[],renderTime:[],maxHistorySize:300},this.thresholds={targetFPS:60,minAcceptableFPS:30,maxFrameTime:33.33,memoryWarning:500,memoryCritical:1e3},this.lastFrameTime=performance.now(),this.frameCount=0,this.startTime=performance.now(),this.optimizationSuggestions=[],this.warningCallbacks=[],console.log("📊 PerformanceMonitor initialized")}start(){this.enabled&&this.monitoringLoop()}monitoringLoop(){this.enabled&&requestAnimationFrame(()=>{this.update(),this.monitoringLoop()})}update(){const t=performance.now(),e=t-this.lastFrameTime;this.frameCount++;const i=t-this.startTime;this.metrics.fps=Math.round(this.frameCount/i*1e3),this.metrics.frameTime=e,this.addToHistory("fps",this.metrics.fps),this.addToHistory("frameTime",e),i>=1e3&&(this.frameCount=0,this.startTime=t),this.lastFrameTime=t,this.checkPerformance()}addToHistory(t,e){this.history[t]&&(this.history[t].push(e),this.history[t].length>this.history.maxHistorySize&&this.history[t].shift())}startRender(){this.renderStartTime=performance.now()}endRender(){this.renderStartTime&&(this.metrics.renderTime=performance.now()-this.renderStartTime,this.addToHistory("renderTime",this.metrics.renderTime))}setVisualizerCount(t){this.metrics.activeVisualizers=t}setCanvasCount(t){this.metrics.canvasCount=t}recordGPUStall(){this.metrics.gpuStalls++}checkPerformance(){this.optimizationSuggestions=[],this.metrics.fps<this.thresholds.minAcceptableFPS&&(this.optimizationSuggestions.push({severity:"high",message:`Low FPS detected: ${this.metrics.fps} (target: ${this.thresholds.targetFPS})`,suggestions:["Reduce number of active visualizers","Lower grid density parameter","Disable some canvas layers","Switch to simpler visualization system"]}),this.triggerWarning("low_fps",this.metrics.fps)),this.metrics.frameTime>this.thresholds.maxFrameTime&&this.optimizationSuggestions.push({severity:"medium",message:`High frame time: ${this.metrics.frameTime.toFixed(2)}ms`,suggestions:["Optimize render loop","Reduce complexity of active geometry","Consider using lower quality settings"]}),this.metrics.activeVisualizers>10&&this.optimizationSuggestions.push({severity:"medium",message:`High visualizer count: ${this.metrics.activeVisualizers}`,suggestions:["Some systems may be creating redundant visualizers","Consider cleaning up unused visualizers"]}),this.metrics.gpuStalls>100&&this.optimizationSuggestions.push({severity:"high",message:`Frequent GPU stalls detected: ${this.metrics.gpuStalls}`,suggestions:["Reduce ReadPixels operations","Optimize shader complexity","Use texture pooling"]})}getAverage(t){return!this.history[t]||this.history[t].length===0?0:this.history[t].reduce((i,s)=>i+s,0)/this.history[t].length}getSummary(){return{current:{...this.metrics},averages:{fps:Math.round(this.getAverage("fps")),frameTime:this.getAverage("frameTime").toFixed(2),renderTime:this.getAverage("renderTime").toFixed(2)},status:this.getPerformanceStatus(),suggestions:this.optimizationSuggestions}}getPerformanceStatus(){return this.metrics.fps>=this.thresholds.targetFPS?"excellent":this.metrics.fps>=this.thresholds.minAcceptableFPS?"good":this.metrics.fps>=20?"poor":"critical"}onWarning(t){this.warningCallbacks.push(t)}triggerWarning(t,e){this.warningCallbacks.forEach(i=>{try{i(t,e,this.getSummary())}catch(s){console.error("Performance warning callback error:",s)}})}getGrade(){const t=this.getAverage("fps");return t>=55?"A":t>=45?"B":t>=35?"C":t>=25?"D":"F"}reset(){this.frameCount=0,this.startTime=performance.now(),this.history.fps=[],this.history.frameTime=[],this.history.renderTime=[],this.metrics.gpuStalls=0,console.log("📊 Performance metrics reset")}setEnabled(t){this.enabled=t,t?(console.log("📊 Performance monitoring enabled"),this.start()):console.log("📊 Performance monitoring disabled")}getReport(){return{summary:this.getSummary(),grade:this.getGrade(),recommendations:this.getRecommendations(),timestamp:new Date().toISOString()}}getRecommendations(){const t=this.getPerformanceStatus(),e=[];return(t==="poor"||t==="critical")&&(e.push({priority:"high",category:"quality",action:"Reduce visual quality settings",impact:"Will improve FPS by 20-40%"}),e.push({priority:"high",category:"system",action:"Switch to simpler visualization system",impact:"Faceted system is lighter than Quantum or Holographic"})),this.metrics.activeVisualizers>5&&e.push({priority:"medium",category:"optimization",action:"Reduce number of canvas layers",impact:"Each layer adds ~10-20% overhead"}),e}}class _{constructor(t){this.choreographer=t,this.presets=this.getDefaultPresets(),this.currentPreset=null,this.loadPresetsFromStorage(),console.log("🎨 PresetManager initialized with",Object.keys(this.presets).length,"presets")}getDefaultPresets(){return{"chill-ambient":{name:"Chill Ambient",description:"Smooth, flowing visuals for ambient music",system:"holographic",mode:"flow",parameters:{geometry:3,gridDensity:8,morphFactor:.5,chaos:.1,speed:.5,hue:200,intensity:.3,saturation:.6,rot4dXW:.001,rot4dYW:.002,rot4dZW:.001},reactivity:.3,colorPalette:"ocean",sweeps:[]},"edm-drop":{name:"EDM Drop",description:"Intense, chaotic visuals for drops and heavy sections",system:"quantum",mode:"chaos",parameters:{geometry:7,gridDensity:25,morphFactor:2,chaos:.8,speed:2,hue:330,intensity:.9,saturation:1,rot4dXW:.05,rot4dYW:.08,rot4dZW:.06},reactivity:1,colorPalette:"fire",sweeps:["pulse-train","exponential-decay"]},"techno-pulse":{name:"Techno Pulse",description:"Rhythmic, beat-locked visuals for techno",system:"faceted",mode:"pulse",parameters:{geometry:4,gridDensity:18,morphFactor:1.2,chaos:.3,speed:1.5,hue:180,intensity:.7,saturation:.8,rot4dXW:.02,rot4dYW:.03,rot4dZW:.02},reactivity:.8,colorPalette:"neon",sweeps:["sine-wave"]},"progressive-build":{name:"Progressive Build",description:"Gradually intensifying visuals for buildups",system:"quantum",mode:"build",parameters:{geometry:5,gridDensity:12,morphFactor:.8,chaos:.2,speed:1,hue:270,intensity:.4,saturation:.7,rot4dXW:.01,rot4dYW:.015,rot4dZW:.01},reactivity:.6,colorPalette:"rainbow",sweeps:["linear-sweep"]},"glitch-experimental":{name:"Glitch Experimental",description:"Stuttering, glitchy visuals for IDM/experimental",system:"holographic",mode:"glitch",parameters:{geometry:9,gridDensity:20,morphFactor:1.5,chaos:.9,speed:1.8,hue:120,intensity:.8,saturation:.9,rot4dXW:.1,rot4dYW:.15,rot4dZW:.12},reactivity:.9,colorPalette:"neon",sweeps:["pulse-train","sawtooth"]},"dnb-liquid":{name:"Liquid DnB",description:"Fluid, organic morphing for liquid drum & bass",system:"faceted",mode:"liquid",parameters:{geometry:6,gridDensity:15,morphFactor:1.8,chaos:.4,speed:1.3,hue:180,intensity:.6,saturation:.75,rot4dXW:.03,rot4dYW:.04,rot4dZW:.035},reactivity:.75,colorPalette:"ocean",sweeps:["triangle","sine-wave"]},"minimal-deep":{name:"Minimal Deep",description:"Subtle, minimalist visuals for deep house",system:"holographic",mode:"wave",parameters:{geometry:2,gridDensity:10,morphFactor:.6,chaos:.15,speed:.7,hue:240,intensity:.4,saturation:.5,rot4dXW:.005,rot4dYW:.008,rot4dZW:.006},reactivity:.4,colorPalette:"ocean",sweeps:[]},"strobe-hard":{name:"Hard Strobe",description:"Extreme flashing for hard techno/industrial",system:"quantum",mode:"strobe",parameters:{geometry:8,gridDensity:30,morphFactor:2.5,chaos:1,speed:2.5,hue:0,intensity:1,saturation:1,rot4dXW:.08,rot4dYW:.1,rot4dZW:.09},reactivity:1,colorPalette:"fire",sweeps:["pulse-train"]}}}async applyPreset(t){const e=this.presets[t];if(!e)return console.warn(`Preset "${t}" not found`),!1;console.log(`🎨 Applying preset: ${e.name}`);try{return e.system!==this.choreographer.currentSystem&&await this.choreographer.switchSystem(e.system),this.choreographer.choreographyMode=e.mode,Object.entries(e.parameters).forEach(([i,s])=>{this.choreographer.baseParams[i]=s}),this.choreographer.updateSystemParameters(this.choreographer.systems[e.system].engine),this.choreographer.reactivityStrength=e.reactivity,this.currentPreset=t,console.log(`✅ Preset "${e.name}" applied successfully`),!0}catch(i){return console.error(`Failed to apply preset "${t}":`,i),!1}}saveCurrentAsPreset(t,e=""){const i={name:t,description:e,system:this.choreographer.currentSystem,mode:this.choreographer.choreographyMode,parameters:{...this.choreographer.baseParams},reactivity:this.choreographer.reactivityStrength,custom:!0,createdAt:new Date().toISOString()};return this.presets[t.toLowerCase().replace(/\s+/g,"-")]=i,this.savePresetsToStorage(),console.log(`💾 Saved preset: ${t}`),i}deletePreset(t){const e=this.presets[t];return e?e.custom?(delete this.presets[t],this.savePresetsToStorage(),console.log(`🗑️ Deleted preset: ${e.name}`),!0):(console.warn(`Cannot delete built-in preset "${t}"`),!1):(console.warn(`Preset "${t}" not found`),!1)}getPresetList(){return Object.entries(this.presets).map(([t,e])=>({key:t,name:e.name,description:e.description,system:e.system,mode:e.mode,custom:e.custom||!1}))}getPreset(t){return this.presets[t]}savePresetsToStorage(){try{const t={};Object.entries(this.presets).forEach(([e,i])=>{i.custom&&(t[e]=i)}),localStorage.setItem("vib34d_custom_presets",JSON.stringify(t))}catch(t){console.error("Failed to save presets to localStorage:",t)}}loadPresetsFromStorage(){try{const t=localStorage.getItem("vib34d_custom_presets");if(t){const e=JSON.parse(t);Object.assign(this.presets,e),console.log(`📂 Loaded ${Object.keys(e).length} custom presets`)}}catch(t){console.error("Failed to load presets from localStorage:",t)}}exportPresets(){const t=JSON.stringify(this.presets,null,2),e=new Blob([t],{type:"application/json"}),i=URL.createObjectURL(e),s=document.createElement("a");s.href=i,s.download=`vib34d_presets_${Date.now()}.json`,s.click(),URL.revokeObjectURL(i),console.log("📥 Presets exported")}async importPresets(t){try{const e=await t.text(),i=JSON.parse(e);let s=0;return Object.entries(i).forEach(([o,a])=>{a.custom=!0,a.importedAt=new Date().toISOString(),this.presets[o]=a,s++}),this.savePresetsToStorage(),console.log(`📤 Imported ${s} presets`),s}catch(e){throw console.error("Failed to import presets:",e),e}}}class ${constructor(t){this.choreographer=t,this.enabled=!0,this.shortcuts=this.getDefaultShortcuts(),this.pressedKeys=new Set,this.setupEventListeners(),console.log("⌨️ KeyboardController initialized")}getDefaultShortcuts(){return{Space:{name:"Play/Pause",action:()=>this.togglePlayback(),category:"playback"},KeyS:{name:"Stop",action:()=>this.choreographer.stop(),category:"playback"},Digit1:{name:"Switch to Faceted",action:()=>this.choreographer.switchSystem("faceted"),category:"system"},Digit2:{name:"Switch to Quantum",action:()=>this.choreographer.switchSystem("quantum"),category:"system"},Digit3:{name:"Switch to Holographic",action:()=>this.choreographer.switchSystem("holographic"),category:"system"},"shift+Digit1":{name:"Chaos Mode",action:()=>this.setMode("chaos"),category:"mode"},"shift+Digit2":{name:"Pulse Mode",action:()=>this.setMode("pulse"),category:"mode"},"shift+Digit3":{name:"Wave Mode",action:()=>this.setMode("wave"),category:"mode"},"shift+Digit4":{name:"Flow Mode",action:()=>this.setMode("flow"),category:"mode"},"shift+Digit5":{name:"Dynamic Mode",action:()=>this.setMode("dynamic"),category:"mode"},ArrowUp:{name:"Increase Intensity",action:()=>this.adjustParameter("intensity",.1),category:"parameters"},ArrowDown:{name:"Decrease Intensity",action:()=>this.adjustParameter("intensity",-.1),category:"parameters"},ArrowRight:{name:"Increase Speed",action:()=>this.adjustParameter("speed",.2),category:"parameters"},ArrowLeft:{name:"Decrease Speed",action:()=>this.adjustParameter("speed",-.2),category:"parameters"},BracketRight:{name:"Increase Grid Density",action:()=>this.adjustParameter("gridDensity",2),category:"parameters"},BracketLeft:{name:"Decrease Grid Density",action:()=>this.adjustParameter("gridDensity",-2),category:"parameters"},Equal:{name:"Increase Chaos",action:()=>this.adjustParameter("chaos",.1),category:"parameters"},Minus:{name:"Decrease Chaos",action:()=>this.adjustParameter("chaos",-.1),category:"parameters"},KeyR:{name:"Toggle Audio Reactivity",action:()=>this.toggleReactivity(),category:"audio"},"shift+KeyR":{name:"Increase Reactivity",action:()=>this.adjustReactivity(.1),category:"audio"},"ctrl+KeyR":{name:"Decrease Reactivity",action:()=>this.adjustReactivity(-.1),category:"audio"},KeyE:{name:"Start/Stop Export",action:()=>this.toggleExport(),category:"export"},"shift+KeyE":{name:"Quick Screenshot",action:()=>this.takeScreenshot(),category:"export"},KeyF:{name:"Toggle Fullscreen",action:()=>this.toggleFullscreen(),category:"view"},KeyH:{name:"Toggle UI",action:()=>this.toggleUI(),category:"view"},KeyP:{name:"Toggle Performance Monitor",action:()=>this.togglePerformanceMonitor(),category:"view"},"ctrl+KeyZ":{name:"Undo Last Change",action:()=>this.undo(),category:"utility"},"ctrl+KeyS":{name:"Save Current State",action:()=>this.saveState(),category:"utility"},Escape:{name:"Cancel/Close",action:()=>this.cancel(),category:"utility"},slash:{name:"Show Shortcuts Help",action:()=>this.showHelp(),category:"utility"}}}setupEventListeners(){window.addEventListener("keydown",t=>this.handleKeyDown(t)),window.addEventListener("keyup",t=>this.handleKeyUp(t))}handleKeyDown(t){if(!this.enabled||t.target.tagName==="INPUT"||t.target.tagName==="TEXTAREA")return;this.pressedKeys.add(t.code);const e=[];t.ctrlKey&&e.push("ctrl"),t.shiftKey&&e.push("shift"),t.altKey&&e.push("alt");const i=[...e,t.code].join("+");let s=this.shortcuts[i];if(!s&&e.length>0&&(s=this.shortcuts[t.code]),s){t.preventDefault();try{s.action(),console.log(`⌨️ Executed: ${s.name}`)}catch(o){console.error(`Failed to execute ${s.name}:`,o)}}}handleKeyUp(t){this.pressedKeys.delete(t.code)}togglePlayback(){this.choreographer.audioElement&&!this.choreographer.audioElement.paused?this.choreographer.pause():this.choreographer.play().catch(t=>console.error("Play failed:",t))}setMode(t){this.choreographer.choreographyMode=t,console.log(`🎭 Mode set to: ${t}`)}adjustParameter(t,e){let s=(this.choreographer.baseParams[t]||0)+e;t==="intensity"||t==="chaos"?s=Math.max(0,Math.min(1,s)):t==="speed"?s=Math.max(.1,Math.min(5,s)):t==="gridDensity"&&(s=Math.max(1,Math.min(50,s))),this.choreographer.baseParams[t]=s;const o=this.choreographer.systems[this.choreographer.currentSystem];o.engine&&this.choreographer.updateSystemParameters(o.engine),console.log(`📊 ${t} = ${s.toFixed(2)}`)}toggleReactivity(){this.choreographer.audioReactive=!this.choreographer.audioReactive,console.log(`🔊 Audio reactivity: ${this.choreographer.audioReactive?"ON":"OFF"}`)}adjustReactivity(t){this.choreographer.reactivityStrength=Math.max(0,Math.min(1,this.choreographer.reactivityStrength+t)),console.log(`🔊 Reactivity strength: ${this.choreographer.reactivityStrength.toFixed(2)}`)}toggleExport(){console.log("📹 Export toggled (not yet implemented)")}takeScreenshot(){const t=document.querySelector("canvas");t&&t.toBlob(e=>{const i=URL.createObjectURL(e),s=document.createElement("a");s.href=i,s.download=`vib34d_${Date.now()}.png`,s.click(),URL.revokeObjectURL(i),console.log("📸 Screenshot saved")})}toggleFullscreen(){document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen().catch(t=>{console.error("Fullscreen failed:",t)})}toggleUI(){const t=document.getElementById("control-panel"),e=document.getElementById("mode-display");t&&(t.style.display=t.style.display==="none"?"block":"none"),e&&(e.style.display=e.style.display==="none"?"block":"none")}togglePerformanceMonitor(){console.log("📊 Performance monitor toggled (UI pending)")}undo(){console.log("↶ Undo (history system pending)")}saveState(){if(this.choreographer.presetManager){const t=prompt("Enter preset name:");t&&this.choreographer.presetManager.saveCurrentAsPreset(t)}}cancel(){console.log("❌ Cancel")}showHelp(){const t={};Object.entries(this.shortcuts).forEach(([e,i])=>{t[i.category]||(t[i.category]=[]),t[i.category].push({key:this.formatKey(e),name:i.name})}),console.log("⌨️ KEYBOARD SHORTCUTS:"),Object.entries(t).forEach(([e,i])=>{console.log(`
${e.toUpperCase()}:`),i.forEach(s=>{console.log(`  ${s.key.padEnd(20)} - ${s.name}`)})}),this.showHelpUI(t)}formatKey(t){return t.replace("shift+","⇧ ").replace("ctrl+","⌃ ").replace("alt+","⌥ ").replace("Key","").replace("Digit","").replace("Arrow","⬆️⬇️⬅️➡️ ")}showHelpUI(t){let e=document.getElementById("shortcuts-help-modal");e||(e=document.createElement("div"),e.id="shortcuts-help-modal",e.style.cssText=`
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.95);
                border: 2px solid #0ff;
                padding: 30px;
                z-index: 10000;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                display: none;
                font-family: 'Courier New', monospace;
                color: #0ff;
            `,document.body.appendChild(e));let i='<h2 style="margin-top: 0; text-align: center;">⌨️ KEYBOARD SHORTCUTS</h2>';i+='<p style="text-align: center; font-size: 10px; opacity: 0.7;">Press ESC or / to close</p>',Object.entries(t).forEach(([o,a])=>{i+=`<h3 style="margin-top: 20px; color: #0ff;">${o.toUpperCase()}</h3>`,i+='<table style="width: 100%; font-size: 11px;">',a.forEach(r=>{i+=`<tr>
                    <td style="padding: 5px; color: #fff;">${r.key}</td>
                    <td style="padding: 5px;">${r.name}</td>
                </tr>`}),i+="</table>"}),i+=`<p style="text-align: center; margin-top: 20px;"><button onclick="this.parentElement.parentElement.style.display='none'" style="background: #0ff; color: #000; border: none; padding: 10px 20px; cursor: pointer;">Close</button></p>`,e.innerHTML=i,e.style.display="block";const s=o=>{(o.key==="Escape"||o.key==="/")&&(e.style.display="none",window.removeEventListener("keydown",s))};window.addEventListener("keydown",s)}setEnabled(t){this.enabled=t,console.log(`⌨️ Keyboard controls: ${t?"enabled":"disabled"}`)}addShortcut(t,e,i,s="custom"){this.shortcuts[t]={name:e,action:i,category:s},console.log(`⌨️ Added shortcut: ${t} -> ${e}`)}removeShortcut(t){delete this.shortcuts[t],console.log(`⌨️ Removed shortcut: ${t}`)}}function k(c,t,e,i,s){switch(c){case"chaos":z(t,e,i,s);break;case"pulse":V(t,e,i,s);break;case"wave":G(t,e,i,s);break;case"flow":O(t,e,i,s);break;case"dynamic":R(t,e,i,s);break;case"strobe":H(t,e,i,s);break;case"glitch":U(t,e,i,s);break;case"build":q(t,e,i,s);break;case"breakdown":Y(t,e,i,s);break;case"liquid":N(t,e,i,s);break;default:R(t,e,i,s)}}function z(c,t,e,i){const s=c.isBeat?1:c.momentum.bass,o=i.gridDensity+c.bass*60*e+s*20,a=c.high*180*e+c.rhythmicPulse*60,r=(i.hue+a)%360,n=i.morphFactor+Math.pow(c.mid,2)*1.5*e,l=i.chaos+c.energy*.8*e+(c.isBeat?.2:0),h=i.speed*(1+c.energy*2*e)*(c.isBeat?1.5:1),d=Math.min(1,i.intensity*(.6+c.peaks.energy*.8*e)),u=Math.min(1,i.saturation*(.8+c.high*.5*e)),m=i.rot4dXW+c.bass*4*e+(c.isBeat?1.5:0),p=i.rot4dYW+c.mid*5*e-c.lowMid*2*e,y=i.rot4dZW+c.high*6*e+c.rhythmicPulse*2;t("gridDensity",Math.floor(o)),t("hue",Math.floor(r)),t("morphFactor",Math.min(2,n)),t("chaos",Math.min(1,l)),t("speed",Math.min(3,h)),t("intensity",d),t("saturation",u),t("rot4dXW",Math.max(-6.28,Math.min(6.28,m))),t("rot4dYW",Math.max(-6.28,Math.min(6.28,p))),t("rot4dZW",Math.max(-6.28,Math.min(6.28,y)))}function V(c,t,e,i){const s=.7+c.rhythmicPulse*.6,o=i.gridDensity*s+c.bass*40*e,a=Math.floor(c.beatPhase*4)*90,r=(i.hue+a+c.lowMid*30*e)%360,n=i.morphFactor*(.8+c.rhythmicPulse*.4),l=c.isBeat?1:.6+c.momentum.bass*.4,h=Math.min(1,i.intensity*l),d=i.speed*(.9+c.rhythmicPulse*.3*e),u=Math.min(1,i.saturation*(.85+c.mid*.3*e)),m=i.rot4dXW+c.rhythmicPulse*3*e,p=i.rot4dYW+Math.sin(c.beatPhase*Math.PI)*2*e,y=i.rot4dZW+(c.isBeat?.8:0)+c.bass*1.5*e;t("gridDensity",Math.floor(o)),t("hue",Math.floor(r)),t("morphFactor",Math.min(2,n)),t("intensity",h),t("speed",Math.min(3,d)),t("saturation",u),t("rot4dXW",Math.max(-6.28,Math.min(6.28,m))),t("rot4dYW",Math.max(-6.28,Math.min(6.28,p))),t("rot4dZW",Math.max(-6.28,Math.min(6.28,y)))}function G(c,t,e,i){const s=performance.now()*3e-4,o=Math.sin(s)*.3+Math.sin(s*1.7)*.2,a=i.gridDensity+c.momentum.bass*25*e+o*15,r=Math.sin(s*.8)*45,n=(i.hue+r+c.mid*20*e)%360,l=i.morphFactor+c.momentum.mid*.8*e,h=i.chaos+(Math.sin(s*2.3)*.2+.2)*(c.energy*e),d=i.speed*(.9+c.momentum.high*.4*e),u=Math.min(1,i.intensity*(.75+c.momentum.mid*.4*e+Math.sin(s*1.5)*.15)),m=i.rot4dXW+Math.sin(s*1.2)*1.5*e+c.momentum.bass*.5,p=i.rot4dYW+Math.cos(s*.9)*1.8*e+c.momentum.mid*.6,y=i.rot4dZW+Math.sin(s*1.5+Math.PI/3)*1.2*e+c.momentum.high*.4;t("gridDensity",Math.floor(a)),t("hue",Math.floor(n)),t("morphFactor",Math.min(2,l)),t("chaos",Math.min(1,h)),t("speed",Math.min(3,d)),t("intensity",u),t("rot4dXW",Math.max(-6.28,Math.min(6.28,m))),t("rot4dYW",Math.max(-6.28,Math.min(6.28,p))),t("rot4dZW",Math.max(-6.28,Math.min(6.28,y)))}function O(c,t,e,i){const s=i.gridDensity+c.bass*10*e,o=(i.hue+c.lowMid*15*e)%360,a=i.morphFactor+c.mid*.3*e,r=i.chaos*(.5+c.energy*.3*e),n=i.speed*(.85+c.high*.2*e),l=Math.min(1,i.intensity*(.8+c.energy*.25*e)),h=Math.min(1,i.saturation*(.9+c.mid*.15*e)),d=performance.now()*1e-4,u=i.rot4dXW+Math.sin(d)*.5*e+c.bass*.2,m=i.rot4dYW+Math.cos(d*1.3)*.6*e+c.mid*.15,p=i.rot4dZW+Math.sin(d*.7)*.4*e+c.high*.1;t("gridDensity",Math.floor(s)),t("hue",Math.floor(o)),t("morphFactor",Math.min(2,a)),t("chaos",Math.min(1,r)),t("speed",Math.min(3,n)),t("intensity",l),t("saturation",h),t("rot4dXW",Math.max(-6.28,Math.min(6.28,u))),t("rot4dYW",Math.max(-6.28,Math.min(6.28,m))),t("rot4dZW",Math.max(-6.28,Math.min(6.28,p)))}function R(c,t,e,i){const s=i.gridDensity+c.bass*35*e+c.mid*15*e,o=c.bass*30,a=c.mid*45,r=c.high*60,n=(i.hue+o+a+r*e)%360,l=i.morphFactor+c.mid*1*e+(c.isBeat?.3:0),h=i.chaos+c.highMid*.6*e+(c.peaks.energy-c.energy)*.3,d=i.speed*(1+c.high*1.2*e)*(c.isBeat?1.2:1),u=Math.min(1,i.intensity*(.7+c.momentum.mid*.5*e+c.energy*.3)),m=Math.min(1,i.saturation*(.85+c.energy*.3*e)),p=i.rot4dXW+c.bass*2.5*e+c.momentum.bass*1,y=i.rot4dYW+c.mid*3*e+(c.isBeat?.5:0),f=i.rot4dZW+c.high*3.5*e+c.momentum.high*.8;t("gridDensity",Math.floor(s)),t("hue",Math.floor(n)),t("morphFactor",Math.min(2,l)),t("chaos",Math.min(1,h)),t("speed",Math.min(3,d)),t("intensity",u),t("saturation",m),t("rot4dXW",Math.max(-6.28,Math.min(6.28,p))),t("rot4dYW",Math.max(-6.28,Math.min(6.28,y))),t("rot4dZW",Math.max(-6.28,Math.min(6.28,f)))}function H(c,t,e,i){const s=Math.floor(performance.now()/100)%2,o=c.isBeat?1.5:s,a=i.gridDensity+c.bass*50*e*o,r=Math.floor(c.beatPhase*8)*45,n=(i.hue+r+c.high*90*e)%360,h=(c.isBeat?2:s?1.5:.5)*e,d=s?i.chaos+.5*e:i.chaos,u=i.speed*(1+c.isBeat?2:s*1.5*e),m=s?i.intensity+c.bass*e:i.intensity*.3,p=Math.min(1,s?1:.5),y=i.rot4dXW+(s?c.bass*4*e:0),f=i.rot4dYW+(c.isBeat?2:s*1.5*e),g=i.rot4dZW+c.high*5*e*s;t("gridDensity",Math.floor(a)),t("hue",Math.floor(n)),t("morphFactor",Math.min(2,h)),t("chaos",Math.min(1,d)),t("speed",Math.min(3,u)),t("intensity",Math.min(1,m)),t("saturation",p),t("rot4dXW",Math.max(-6.28,Math.min(6.28,y))),t("rot4dYW",Math.max(-6.28,Math.min(6.28,f))),t("rot4dZW",Math.max(-6.28,Math.min(6.28,g)))}function U(c,t,e,i){const s=c.high>.7||Math.random()<.05,o=s?Math.random()*80-40:0,a=i.gridDensity+c.mid*30*e+o,r=s?Math.random()*360:0,n=(i.hue+c.bass*45+r)%360,l=s?Math.random()*1.5:c.mid*e,h=i.morphFactor+l,d=i.chaos+c.highMid*.8*e+(s?.4:0),u=s?Math.random()*2:1,m=i.speed*u*(1+c.energy*e),p=s?Math.random()<.5?.1:1:.7+c.momentum.bass*.4,y=Math.min(1,i.intensity*p),f=s?Math.random():i.saturation*(.8+c.mid*.3),g=i.rot4dXW+(s?Math.random()*6-3:c.bass*2*e),v=i.rot4dYW+(s?Math.random()*6-3:c.mid*2.5*e),x=i.rot4dZW+(s?Math.random()*6-3:c.high*3*e);t("gridDensity",Math.floor(Math.max(5,Math.min(100,a)))),t("hue",Math.floor(n)),t("morphFactor",Math.min(2,Math.max(0,h))),t("chaos",Math.min(1,Math.max(0,d))),t("speed",Math.min(3,Math.max(.1,m))),t("intensity",Math.min(1,Math.max(0,y))),t("saturation",Math.min(1,Math.max(0,f))),t("rot4dXW",Math.max(-6.28,Math.min(6.28,g))),t("rot4dYW",Math.max(-6.28,Math.min(6.28,v))),t("rot4dZW",Math.max(-6.28,Math.min(6.28,x)))}function q(c,t,e,i){const s=performance.now()%3e4/3e4,o=Math.pow(s,1.5),a=i.gridDensity+o*40+c.bass*30*e,r=(i.hue+s*180+c.mid*20*e)%360,n=i.morphFactor+o*1.2+c.momentum.mid*.5*e,l=i.chaos+o*.6+c.energy*.3*e,h=i.speed*(1+o*1.5)*(1+c.high*.5*e),d=Math.min(1,i.intensity*(.5+o*.7)+c.energy*.3),u=Math.min(1,i.saturation*(.7+o*.4)),m=i.rot4dXW+o*2*e+c.bass*1.5,p=i.rot4dYW+o*2.5*e+c.mid*2,y=i.rot4dZW+o*3*e+c.high*2.5;t("gridDensity",Math.floor(a)),t("hue",Math.floor(r)),t("morphFactor",Math.min(2,n)),t("chaos",Math.min(1,l)),t("speed",Math.min(3,h)),t("intensity",d),t("saturation",u),t("rot4dXW",Math.max(-6.28,Math.min(6.28,m))),t("rot4dYW",Math.max(-6.28,Math.min(6.28,p))),t("rot4dZW",Math.max(-6.28,Math.min(6.28,y)))}function Y(c,t,e,i){const s=Math.max(5,i.gridDensity*.5+c.bass*15*e),o=(i.hue+c.lowMid*10*e)%360,a=i.morphFactor*.6+c.momentum.bass*.3*e,r=i.chaos*.3+c.mid*.2*e,n=i.speed*(.6+c.momentum.mid*.3*e),l=Math.min(1,i.intensity*(.5+c.energy*.4*e)),h=Math.min(1,i.saturation*(.9+c.mid*.15*e)),d=i.rot4dXW+(c.isBeat?c.bass*2*e:0),u=i.rot4dYW+c.momentum.bass*.5*e,m=i.rot4dZW+c.momentum.mid*.6*e;t("gridDensity",Math.floor(s)),t("hue",Math.floor(o)),t("morphFactor",Math.min(2,a)),t("chaos",Math.min(1,r)),t("speed",Math.min(3,n)),t("intensity",l),t("saturation",h),t("rot4dXW",Math.max(-6.28,Math.min(6.28,d))),t("rot4dYW",Math.max(-6.28,Math.min(6.28,u))),t("rot4dZW",Math.max(-6.28,Math.min(6.28,m)))}function N(c,t,e,i){const s=performance.now()*2e-4,o=Math.sin(s)*Math.cos(s*1.7),a=i.gridDensity+c.momentum.bass*30*e+o*12,r=Math.sin(s*1.3)*35+Math.cos(s*.7)*25,n=(i.hue+r+c.mid*15*e)%360,l=i.morphFactor+o*.4+c.momentum.mid*.7*e,h=i.chaos+Math.abs(o)*.3+c.momentum.high*.4*e,d=i.speed*(.85+Math.abs(o)*.3)*(1+c.momentum.bass*.3*e),u=Math.min(1,i.intensity*(.7+c.momentum.mid*.4*e+o*.2)),m=Math.min(1,i.saturation*(.9+c.mid*.2*e)),p=i.rot4dXW+Math.sin(s*1.1)*1.2*e+c.momentum.bass*.6,y=i.rot4dYW+Math.cos(s*.9)*1.5*e+c.momentum.mid*.7,f=i.rot4dZW+Math.sin(s*1.4+Math.PI/4)*1*e+c.momentum.high*.5;t("gridDensity",Math.floor(a)),t("hue",Math.floor(n)),t("morphFactor",Math.min(2,l)),t("chaos",Math.min(1,h)),t("speed",Math.min(3,d)),t("intensity",u),t("saturation",m),t("rot4dXW",Math.max(-6.28,Math.min(6.28,p))),t("rot4dYW",Math.max(-6.28,Math.min(6.28,y))),t("rot4dZW",Math.max(-6.28,Math.min(6.28,f)))}function X(c,t,e,i){Object.entries(c).forEach(([s,o])=>{let a=0;const r=t*2*Math.PI;switch(o.function){case"sine-wave":a=o.offset+o.amplitude*Math.sin(r*(o.frequency||1));break;case"sawtooth":const n=t*(o.frequency||1)%1;a=o.min+(o.max-o.min)*n;break;case"triangle":const l=t*(o.frequency||1)%1;a=o.min+(o.max-o.min)*(l<.5?l*2:(1-l)*2);break;case"pulse-train":a=Math.sin(r*(o.frequency||4))>0?o.max:o.min;break;case"exponential-decay":a=o.max-(o.max-o.min)*(1-Math.exp(-t*3));break;case"linear-sweep":a=o.min+(o.max-o.min)*t;break;default:a=o.offset||0}i(s,a)})}function j(c,t,e,i,s){const o=c.colors;if(!o||o.length===0)return;let a=0;switch(c.transitionMode){case"beat-pulse":a=Math.floor(e*o.length)%o.length;break;case"smooth-fade":const n=t*o.length;a=Math.floor(n)%o.length;break;case"snap-change":const l=c.barsPerChange||4;a=Math.floor(t*o.length/l)%o.length;break;case"frequency-map":i&&(a=Math.floor(i.bass*o.length)%o.length);break;default:a=0}const r=o[a];r&&(s("hue",r.hue),s("saturation",r.saturation),s("intensity",r.intensity))}function D(c,t="smooth-fade",e=4){return{colors:c.map(i=>({hue:i.hue||0,saturation:i.saturation||.8,intensity:i.intensity||.5})),transitionMode:t,barsPerChange:e}}D([{hue:0,saturation:.8,intensity:.5},{hue:60,saturation:.8,intensity:.5},{hue:120,saturation:.8,intensity:.5},{hue:180,saturation:.8,intensity:.5},{hue:240,saturation:.8,intensity:.5},{hue:300,saturation:.8,intensity:.5}]),D([{hue:0,saturation:1,intensity:.5},{hue:30,saturation:1,intensity:.6},{hue:60,saturation:1,intensity:.7}]),D([{hue:180,saturation:.8,intensity:.4},{hue:200,saturation:.7,intensity:.5},{hue:220,saturation:.6,intensity:.6}]),D([{hue:180,saturation:1,intensity:.8},{hue:300,saturation:1,intensity:.8},{hue:120,saturation:1,intensity:.8}]);class Z{static getGeometryNames(){return["TETRAHEDRON","HYPERCUBE","SPHERE","TORUS","KLEIN BOTTLE","FRACTAL","WAVE","CRYSTAL"]}static getGeometryName(t){return this.getGeometryNames()[t]||"UNKNOWN"}static getVariationParameters(t,e){const i={gridDensity:8+e*4,morphFactor:.5+e*.3,chaos:e*.15,speed:.8+e*.2,hue:(t*45+e*15)%360};switch(t){case 0:i.gridDensity*=1.2;break;case 1:i.morphFactor*=.8;break;case 2:i.chaos*=1.5;break;case 3:i.speed*=1.3;break;case 4:i.gridDensity*=.7,i.morphFactor*=1.4;break;case 5:i.gridDensity*=.5,i.chaos*=2;break;case 6:i.speed*=1.8,i.chaos*=.5;break;case 7:i.gridDensity*=1.5,i.morphFactor*=.6;break}return i}}class K{constructor(t,e,i,s){if(this.canvas=document.getElementById(t),this.role=e,this.reactivity=i,this.variant=s,!this.canvas){console.error(`Canvas ${t} not found`);return}let o=this.canvas.getBoundingClientRect();const a=Math.min(window.devicePixelRatio||1,2);this.contextOptions={alpha:!0,depth:!0,stencil:!1,antialias:!1,premultipliedAlpha:!0,preserveDrawingBuffer:!1,powerPreference:"high-performance",failIfMajorPerformanceCaveat:!1},this.ensureCanvasSizedThenInitWebGL(o,a),this.mouseX=.5,this.mouseY=.5,this.mouseIntensity=0,this.clickIntensity=0,this.startTime=Date.now(),this.params={geometry:0,gridDensity:15,morphFactor:1,chaos:.2,speed:1,hue:200,intensity:.5,saturation:.8,dimension:3.5,rot4dXW:0,rot4dYW:0,rot4dZW:0}}async ensureCanvasSizedThenInitWebGL(t,e){t.width===0||t.height===0?await new Promise(i=>{setTimeout(()=>{if(t=this.canvas.getBoundingClientRect(),t.width===0||t.height===0){const s=window.innerWidth,o=window.innerHeight;this.canvas.width=s*e,this.canvas.height=o*e,window.mobileDebug&&window.mobileDebug.log(`📐 Canvas ${this.canvas.id}: Using viewport fallback ${this.canvas.width}x${this.canvas.height}`)}else this.canvas.width=t.width*e,this.canvas.height=t.height*e,window.mobileDebug&&window.mobileDebug.log(`📐 Canvas ${this.canvas.id}: Layout ready ${this.canvas.width}x${this.canvas.height}`);i()},100)}):(this.canvas.width=t.width*e,this.canvas.height=t.height*e,window.mobileDebug&&window.mobileDebug.log(`📐 Canvas ${this.canvas.id}: ${this.canvas.width}x${this.canvas.height} (DPR: ${e})`)),this.createWebGLContext(),this.gl&&this.init()}createWebGLContext(){let t=this.canvas.getContext("webgl2")||this.canvas.getContext("webgl")||this.canvas.getContext("experimental-webgl");if(t&&!t.isContextLost()){console.log(`🔄 Reusing existing WebGL context for ${this.canvas.id}`),this.gl=t;return}if(this.gl=this.canvas.getContext("webgl2",this.contextOptions)||this.canvas.getContext("webgl",this.contextOptions)||this.canvas.getContext("experimental-webgl",this.contextOptions),this.gl){if(window.mobileDebug){const e=this.gl.getParameter(this.gl.VERSION);window.mobileDebug.log(`✅ WebGL context created for ${this.canvas.id}: ${e} (size: ${this.canvas.width}x${this.canvas.height})`)}}else{console.error(`WebGL not supported for ${this.canvas.id}`),window.mobileDebug&&window.mobileDebug.log(`❌ WebGL context failed for ${this.canvas.id} (size: ${this.canvas.width}x${this.canvas.height})`),this.showWebGLError();return}}init(){this.initShaders(),this.initBuffers(),this.resize()}initShaders(){const t=`attribute vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}`,e=`precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_geometry;
uniform float u_gridDensity;
uniform float u_morphFactor;
uniform float u_chaos;
uniform float u_speed;
uniform float u_hue;
uniform float u_intensity;
uniform float u_saturation;
uniform float u_dimension;
uniform float u_rot4dXW;
uniform float u_rot4dYW;
uniform float u_rot4dZW;
uniform float u_mouseIntensity;
uniform float u_clickIntensity;
uniform float u_roleIntensity;

// 4D rotation matrices
mat4 rotateXW(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat4(c, 0.0, 0.0, -s, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, s, 0.0, 0.0, c);
}

mat4 rotateYW(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat4(1.0, 0.0, 0.0, 0.0, 0.0, c, 0.0, -s, 0.0, 0.0, 1.0, 0.0, 0.0, s, 0.0, c);
}

mat4 rotateZW(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat4(1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, c, -s, 0.0, 0.0, s, c);
}

vec3 project4Dto3D(vec4 p) {
    float w = 2.5 / (2.5 + p.w);
    return vec3(p.x * w, p.y * w, p.z * w);
}

// Simplified geometry functions for WebGL 1.0 compatibility (ORIGINAL FACETED)
float geometryFunction(vec4 p) {
    int geomType = int(u_geometry);
    
    if (geomType == 0) {
        // Tetrahedron lattice - UNIFORM GRID DENSITY
        vec4 pos = fract(p * u_gridDensity * 0.08);
        vec4 dist = min(pos, 1.0 - pos);
        return min(min(dist.x, dist.y), min(dist.z, dist.w)) * u_morphFactor;
    }
    else if (geomType == 1) {
        // Hypercube lattice - UNIFORM GRID DENSITY
        vec4 pos = fract(p * u_gridDensity * 0.08);
        vec4 dist = min(pos, 1.0 - pos);
        float minDist = min(min(dist.x, dist.y), min(dist.z, dist.w));
        return minDist * u_morphFactor;
    }
    else if (geomType == 2) {
        // Sphere lattice - UNIFORM GRID DENSITY
        float r = length(p);
        float density = u_gridDensity * 0.08;
        float spheres = abs(fract(r * density) - 0.5) * 2.0;
        float theta = atan(p.y, p.x);
        float harmonics = sin(theta * 3.0) * 0.2;
        return (spheres + harmonics) * u_morphFactor;
    }
    else if (geomType == 3) {
        // Torus lattice - UNIFORM GRID DENSITY
        float r1 = length(p.xy) - 2.0;
        float torus = length(vec2(r1, p.z)) - 0.8;
        float lattice = sin(p.x * u_gridDensity * 0.08) * sin(p.y * u_gridDensity * 0.08);
        return (torus + lattice * 0.3) * u_morphFactor;
    }
    else if (geomType == 4) {
        // Klein bottle lattice - UNIFORM GRID DENSITY
        float u = atan(p.y, p.x);
        float v = atan(p.w, p.z);
        float dist = length(p) - 2.0;
        float lattice = sin(u * u_gridDensity * 0.08) * sin(v * u_gridDensity * 0.08);
        return (dist + lattice * 0.4) * u_morphFactor;
    }
    else if (geomType == 5) {
        // Fractal lattice - NOW WITH UNIFORM GRID DENSITY
        vec4 pos = fract(p * u_gridDensity * 0.08);
        pos = abs(pos * 2.0 - 1.0);
        float dist = length(max(abs(pos) - 1.0, 0.0));
        return dist * u_morphFactor;
    }
    else if (geomType == 6) {
        // Wave lattice - UNIFORM GRID DENSITY
        float freq = u_gridDensity * 0.08;
        float time = u_time * 0.001 * u_speed;
        float wave1 = sin(p.x * freq + time);
        float wave2 = sin(p.y * freq + time * 1.3);
        float wave3 = sin(p.z * freq * 0.8 + time * 0.7); // Add Z-dimension waves
        float interference = wave1 * wave2 * wave3;
        return interference * u_morphFactor;
    }
    else if (geomType == 7) {
        // Crystal lattice - UNIFORM GRID DENSITY
        vec4 pos = fract(p * u_gridDensity * 0.08) - 0.5;
        float cube = max(max(abs(pos.x), abs(pos.y)), max(abs(pos.z), abs(pos.w)));
        return cube * u_morphFactor;
    }
    else {
        // Default hypercube - UNIFORM GRID DENSITY
        vec4 pos = fract(p * u_gridDensity * 0.08);
        vec4 dist = min(pos, 1.0 - pos);
        return min(min(dist.x, dist.y), min(dist.z, dist.w)) * u_morphFactor;
    }
}

void main() {
    vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / min(u_resolution.x, u_resolution.y);
    
    // 4D position with mouse interaction - NOW USING SPEED PARAMETER
    float timeSpeed = u_time * 0.0001 * u_speed;
    vec4 pos = vec4(uv * 3.0, sin(timeSpeed * 3.0), cos(timeSpeed * 2.0));
    pos.xy += (u_mouse - 0.5) * u_mouseIntensity * 2.0;
    
    // Apply 4D rotations
    pos = rotateXW(u_rot4dXW) * pos;
    pos = rotateYW(u_rot4dYW) * pos;
    pos = rotateZW(u_rot4dZW) * pos;
    
    // Calculate geometry value
    float value = geometryFunction(pos);
    
    // Apply chaos
    float noise = sin(pos.x * 7.0) * cos(pos.y * 11.0) * sin(pos.z * 13.0);
    value += noise * u_chaos;
    
    // Color based on geometry value and hue with user-controlled intensity/saturation
    float geometryIntensity = 1.0 - clamp(abs(value), 0.0, 1.0);
    geometryIntensity += u_clickIntensity * 0.3;
    
    // Apply user intensity control
    float finalIntensity = geometryIntensity * u_intensity;
    
    float hue = u_hue / 360.0 + value * 0.1;
    
    // Create color with saturation control
    vec3 baseColor = vec3(
        sin(hue * 6.28318 + 0.0) * 0.5 + 0.5,
        sin(hue * 6.28318 + 2.0943) * 0.5 + 0.5,
        sin(hue * 6.28318 + 4.1887) * 0.5 + 0.5
    );
    
    // Apply saturation (mix with grayscale)
    float gray = (baseColor.r + baseColor.g + baseColor.b) / 3.0;
    vec3 color = mix(vec3(gray), baseColor, u_saturation) * finalIntensity;
    
    gl_FragColor = vec4(color, finalIntensity * u_roleIntensity);
}`;this.program=this.createProgram(t,e),this.uniforms={resolution:this.gl.getUniformLocation(this.program,"u_resolution"),time:this.gl.getUniformLocation(this.program,"u_time"),mouse:this.gl.getUniformLocation(this.program,"u_mouse"),geometry:this.gl.getUniformLocation(this.program,"u_geometry"),gridDensity:this.gl.getUniformLocation(this.program,"u_gridDensity"),morphFactor:this.gl.getUniformLocation(this.program,"u_morphFactor"),chaos:this.gl.getUniformLocation(this.program,"u_chaos"),speed:this.gl.getUniformLocation(this.program,"u_speed"),hue:this.gl.getUniformLocation(this.program,"u_hue"),intensity:this.gl.getUniformLocation(this.program,"u_intensity"),saturation:this.gl.getUniformLocation(this.program,"u_saturation"),dimension:this.gl.getUniformLocation(this.program,"u_dimension"),rot4dXW:this.gl.getUniformLocation(this.program,"u_rot4dXW"),rot4dYW:this.gl.getUniformLocation(this.program,"u_rot4dYW"),rot4dZW:this.gl.getUniformLocation(this.program,"u_rot4dZW"),mouseIntensity:this.gl.getUniformLocation(this.program,"u_mouseIntensity"),clickIntensity:this.gl.getUniformLocation(this.program,"u_clickIntensity"),roleIntensity:this.gl.getUniformLocation(this.program,"u_roleIntensity")}}createProgram(t,e){const i=this.createShader(this.gl.VERTEX_SHADER,t),s=this.createShader(this.gl.FRAGMENT_SHADER,e);if(!i||!s)return null;const o=this.gl.createProgram();return this.gl.attachShader(o,i),this.gl.attachShader(o,s),this.gl.linkProgram(o),this.gl.getProgramParameter(o,this.gl.LINK_STATUS)?o:(console.error("Program linking failed:",this.gl.getProgramInfoLog(o)),null)}createShader(t,e){if(!this.gl)return console.error("❌ Cannot create shader: WebGL context is null"),null;if(this.gl.isContextLost())return console.error("❌ Cannot create shader: WebGL context is lost"),null;try{const i=this.gl.createShader(t);if(!i)return console.error("❌ Failed to create shader object - WebGL context may be invalid"),null;if(this.gl.shaderSource(i,e),this.gl.compileShader(i),!this.gl.getShaderParameter(i,this.gl.COMPILE_STATUS)){const s=this.gl.getShaderInfoLog(i),o=t===this.gl.VERTEX_SHADER?"vertex":"fragment";return s?console.error(`❌ ${o} shader compilation failed:`,s):console.error(`❌ ${o} shader compilation failed: WebGL returned no error info (context may be invalid)`),console.error("Shader source:",e),this.gl.deleteShader(i),null}return i}catch(i){return console.error("❌ Exception during shader creation:",i),null}}initBuffers(){const t=new Float32Array([-1,-1,1,-1,-1,1,1,1]);this.buffer=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.buffer),this.gl.bufferData(this.gl.ARRAY_BUFFER,t,this.gl.STATIC_DRAW);const e=this.gl.getAttribLocation(this.program,"a_position");this.gl.enableVertexAttribArray(e),this.gl.vertexAttribPointer(e,2,this.gl.FLOAT,!1,0,0)}resize(){const t=Math.min(window.devicePixelRatio||1,2),e=this.canvas.clientWidth,i=this.canvas.clientHeight;(this.canvas.width!==e*t||this.canvas.height!==i*t)&&(this.canvas.width=e*t,this.canvas.height=i*t,this.gl.viewport(0,0,this.canvas.width,this.canvas.height))}showWebGLError(){if(!this.canvas)return;const t=this.canvas.getContext("2d");if(t)this.canvas.width=this.canvas.clientWidth,this.canvas.height=this.canvas.clientHeight,t.fillStyle="#1a0033",t.fillRect(0,0,this.canvas.width,this.canvas.height),t.fillStyle="#ff6b6b",t.font=`${Math.min(20,this.canvas.width/15)}px sans-serif`,t.textAlign="center",t.fillText("⚠️ WebGL Error",this.canvas.width/2,this.canvas.height/2-30),t.fillStyle="#ffd93d",t.font=`${Math.min(14,this.canvas.width/20)}px sans-serif`,/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)?(t.fillText("Mobile device detected",this.canvas.width/2,this.canvas.height/2),t.fillText("Enable hardware acceleration",this.canvas.width/2,this.canvas.height/2+20),t.fillText("or try Chrome/Firefox",this.canvas.width/2,this.canvas.height/2+40)):(t.fillText("Please enable WebGL",this.canvas.width/2,this.canvas.height/2),t.fillText("in your browser settings",this.canvas.width/2,this.canvas.height/2+20)),window.mobileDebug&&window.mobileDebug.log(`📱 WebGL error fallback shown for canvas ${this.canvas.id}`);else{const e=document.createElement("div");e.innerHTML=`
                <div style="
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: #1a0033;
                    color: #ff6b6b;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    font-family: sans-serif;
                    text-align: center;
                    padding: 20px;
                ">
                    <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
                    <div style="font-size: 18px; margin-bottom: 10px;">Graphics Error</div>
                    <div style="font-size: 14px; color: #ffd93d;">
                        Your device doesn't support<br>
                        the required graphics features
                    </div>
                </div>
            `,this.canvas.parentNode.insertBefore(e,this.canvas.nextSibling)}}updateParameters(t){this.params={...this.params,...t}}updateInteraction(t,e,i){if(window.interactivityEnabled===!1){this.mouseX=.5,this.mouseY=.5,this.mouseIntensity=0;return}this.mouseX=t,this.mouseY=e,this.mouseIntensity=i}render(){var a,r,n,l,h;if(!this.program){window.mobileDebug&&window.mobileDebug.log(`❌ ${(a=this.canvas)==null?void 0:a.id}: No WebGL program compiled`);return}if(!this.gl){window.mobileDebug&&window.mobileDebug.log(`❌ ${(r=this.canvas)==null?void 0:r.id}: No WebGL context`);return}try{this.resize(),this.gl.useProgram(this.program),this.gl.clearColor(0,0,0,0),this.gl.clear(this.gl.COLOR_BUFFER_BIT)}catch(d){window.mobileDebug&&window.mobileDebug.log(`❌ ${(n=this.canvas)==null?void 0:n.id}: WebGL render error: ${d.message}`);return}const t={background:.3,shadow:.5,content:.8,highlight:1,accent:1.2},e=Date.now()-this.startTime;this.gl.uniform2f(this.uniforms.resolution,this.canvas.width,this.canvas.height),this.gl.uniform1f(this.uniforms.time,e),this.gl.uniform2f(this.uniforms.mouse,this.mouseX,this.mouseY),this.gl.uniform1f(this.uniforms.geometry,this.params.geometry);let i=this.params.gridDensity,s=this.params.hue,o=this.params.intensity;window.audioEnabled&&window.audioReactive&&(i+=window.audioReactive.bass*30,s+=window.audioReactive.mid*60,o+=window.audioReactive.high*.4),this.gl.uniform1f(this.uniforms.gridDensity,Math.min(100,i)),this.gl.uniform1f(this.uniforms.morphFactor,this.params.morphFactor),this.gl.uniform1f(this.uniforms.chaos,this.params.chaos),this.gl.uniform1f(this.uniforms.speed,this.params.speed),this.gl.uniform1f(this.uniforms.hue,s%360),this.gl.uniform1f(this.uniforms.intensity,Math.min(1,o)),this.gl.uniform1f(this.uniforms.saturation,this.params.saturation),this.gl.uniform1f(this.uniforms.dimension,this.params.dimension),this.gl.uniform1f(this.uniforms.rot4dXW,this.params.rot4dXW),this.gl.uniform1f(this.uniforms.rot4dYW,this.params.rot4dYW),this.gl.uniform1f(this.uniforms.rot4dZW,this.params.rot4dZW),this.gl.uniform1f(this.uniforms.mouseIntensity,this.mouseIntensity),this.gl.uniform1f(this.uniforms.clickIntensity,this.clickIntensity),this.gl.uniform1f(this.uniforms.roleIntensity,t[this.role]||1);try{this.gl.drawArrays(this.gl.TRIANGLE_STRIP,0,4),window.mobileDebug&&!this._renderSuccessLogged&&(window.mobileDebug.log(`✅ ${(l=this.canvas)==null?void 0:l.id}: WebGL render successful`),this._renderSuccessLogged=!0)}catch(d){window.mobileDebug&&window.mobileDebug.log(`❌ ${(h=this.canvas)==null?void 0:h.id}: WebGL draw error: ${d.message}`)}}reinitializeContext(){var t,e,i,s,o;if(console.log(`🔄 Reinitializing WebGL context for ${(t=this.canvas)==null?void 0:t.id}`),this.program=null,this.buffer=null,this.uniforms=null,this.gl=null,this.gl=this.canvas.getContext("webgl2")||this.canvas.getContext("webgl")||this.canvas.getContext("experimental-webgl"),!this.gl)return console.error(`❌ No WebGL context available for ${(e=this.canvas)==null?void 0:e.id} - CanvasManager should have created one`),!1;if(this.gl.isContextLost())return console.error(`❌ WebGL context is lost for ${(i=this.canvas)==null?void 0:i.id}`),!1;try{return this.init(),console.log(`✅ ${(s=this.canvas)==null?void 0:s.id}: Context reinitialized successfully`),!0}catch(a){return console.error(`❌ Failed to reinitialize WebGL resources for ${(o=this.canvas)==null?void 0:o.id}:`,a),!1}}destroy(){this.gl&&this.program&&this.gl.deleteProgram(this.program),this.gl&&this.buffer&&this.gl.deleteBuffer(this.buffer)}}class W{constructor(){this.params={variation:0,rot4dXW:0,rot4dYW:0,rot4dZW:0,dimension:3.5,gridDensity:15,morphFactor:1,chaos:.2,speed:1,hue:200,intensity:.5,saturation:.8,geometry:0},this.parameterDefs={variation:{min:0,max:99,step:1,type:"int"},rot4dXW:{min:-2,max:2,step:.01,type:"float"},rot4dYW:{min:-2,max:2,step:.01,type:"float"},rot4dZW:{min:-2,max:2,step:.01,type:"float"},dimension:{min:3,max:4.5,step:.01,type:"float"},gridDensity:{min:4,max:100,step:.1,type:"float"},morphFactor:{min:0,max:2,step:.01,type:"float"},chaos:{min:0,max:1,step:.01,type:"float"},speed:{min:.1,max:3,step:.01,type:"float"},hue:{min:0,max:360,step:1,type:"int"},intensity:{min:0,max:1,step:.01,type:"float"},saturation:{min:0,max:1,step:.01,type:"float"},geometry:{min:0,max:7,step:1,type:"int"}},this.defaults={...this.params}}getAllParameters(){return{...this.params}}setParameter(t,e){if(this.parameterDefs[t]){const i=this.parameterDefs[t];return e=Math.max(i.min,Math.min(i.max,e)),i.type==="int"&&(e=Math.round(e)),this.params[t]=e,!0}return console.warn(`Unknown parameter: ${t}`),!1}setParameters(t){for(const[e,i]of Object.entries(t))this.setParameter(e,i)}getParameter(t){return this.params[t]}setGeometry(t){this.setParameter("geometry",t)}updateFromControls(){["variationSlider","rot4dXW","rot4dYW","rot4dZW","dimension","gridDensity","morphFactor","chaos","speed","hue"].forEach(e=>{const i=document.getElementById(e);if(i){const s=parseFloat(i.value);let o=e;e==="variationSlider"&&(o="variation"),this.setParameter(o,s)}})}updateDisplayValues(){this.updateSliderValue("variationSlider",this.params.variation),this.updateSliderValue("rot4dXW",this.params.rot4dXW),this.updateSliderValue("rot4dYW",this.params.rot4dYW),this.updateSliderValue("rot4dZW",this.params.rot4dZW),this.updateSliderValue("dimension",this.params.dimension),this.updateSliderValue("gridDensity",this.params.gridDensity),this.updateSliderValue("morphFactor",this.params.morphFactor),this.updateSliderValue("chaos",this.params.chaos),this.updateSliderValue("speed",this.params.speed),this.updateSliderValue("hue",this.params.hue),this.updateDisplayText("rot4dXWDisplay",this.params.rot4dXW.toFixed(2)),this.updateDisplayText("rot4dYWDisplay",this.params.rot4dYW.toFixed(2)),this.updateDisplayText("rot4dZWDisplay",this.params.rot4dZW.toFixed(2)),this.updateDisplayText("dimensionDisplay",this.params.dimension.toFixed(2)),this.updateDisplayText("gridDensityDisplay",this.params.gridDensity.toFixed(1)),this.updateDisplayText("morphFactorDisplay",this.params.morphFactor.toFixed(2)),this.updateDisplayText("chaosDisplay",this.params.chaos.toFixed(2)),this.updateDisplayText("speedDisplay",this.params.speed.toFixed(2)),this.updateDisplayText("hueDisplay",this.params.hue+"°"),this.updateVariationInfo(),this.updateGeometryButtons()}updateSliderValue(t,e){const i=document.getElementById(t);i&&(i.value=e)}updateDisplayText(t,e){const i=document.getElementById(t);i&&(i.textContent=e)}updateVariationInfo(){const t=document.getElementById("currentVariationDisplay");if(t){const e=["TETRAHEDRON LATTICE","HYPERCUBE LATTICE","SPHERE LATTICE","TORUS LATTICE","KLEIN BOTTLE LATTICE","FRACTAL LATTICE","WAVE LATTICE","CRYSTAL LATTICE"],i=Math.floor(this.params.variation/4),s=this.params.variation%4+1,o=e[i]||"CUSTOM VARIATION";t.textContent=`${this.params.variation+1} - ${o}`,this.params.variation<30&&(t.textContent+=` ${s}`)}}updateGeometryButtons(){document.querySelectorAll("[data-geometry]").forEach(t=>{t.classList.toggle("active",parseInt(t.dataset.geometry)===this.params.geometry)})}randomizeAll(){this.params.rot4dXW=Math.random()*4-2,this.params.rot4dYW=Math.random()*4-2,this.params.rot4dZW=Math.random()*4-2,this.params.dimension=3+Math.random()*1.5,this.params.gridDensity=4+Math.random()*26,this.params.morphFactor=Math.random()*2,this.params.chaos=Math.random(),this.params.speed=.1+Math.random()*2.9,this.params.hue=Math.random()*360,this.params.geometry=Math.floor(Math.random()*8)}resetToDefaults(){this.params={...this.defaults}}loadConfiguration(t){if(t&&typeof t=="object"){for(const[e,i]of Object.entries(t))this.parameterDefs[e]&&this.setParameter(e,i);return!0}return!1}exportConfiguration(){return{type:"vib34d-integrated-config",version:"1.0.0",timestamp:new Date().toISOString(),name:`VIB34D Config ${new Date().toLocaleDateString()}`,parameters:{...this.params}}}generateVariationParameters(t){if(t<30){const e=Math.floor(t/4),i=t%4;return{geometry:e,gridDensity:8+i*4,morphFactor:.5+i*.3,chaos:i*.15,speed:.8+i*.2,hue:(e*45+i*15)%360,rot4dXW:(i-1.5)*.5,rot4dYW:e%2*.3,rot4dZW:(e+i)%3*.2,dimension:3.2+i*.2}}else return{...this.params}}applyVariation(t){const e=this.generateVariationParameters(t);this.setParameters(e),this.params.variation=t}getColorHSV(){return{h:this.params.hue,s:.8,v:.9}}getColorRGB(){const t=this.getColorHSV();return this.hsvToRgb(t.h,t.s,t.v)}hsvToRgb(t,e,i){t=t/60;const s=i*e,o=s*(1-Math.abs(t%2-1)),a=i-s;let r,n,l;return t<1?[r,n,l]=[s,o,0]:t<2?[r,n,l]=[o,s,0]:t<3?[r,n,l]=[0,s,o]:t<4?[r,n,l]=[0,o,s]:t<5?[r,n,l]=[o,0,s]:[r,n,l]=[s,0,o],{r:Math.round((r+a)*255),g:Math.round((n+a)*255),b:Math.round((l+a)*255)}}validateConfiguration(t){if(!t||typeof t!="object")return{valid:!1,error:"Configuration must be an object"};if(t.type!=="vib34d-integrated-config")return{valid:!1,error:"Invalid configuration type"};if(!t.parameters)return{valid:!1,error:"Missing parameters object"};for(const[e,i]of Object.entries(t.parameters))if(this.parameterDefs[e]){const s=this.parameterDefs[e];if(typeof i!="number"||i<s.min||i>s.max)return{valid:!1,error:`Invalid value for parameter ${e}: ${i}`}}return{valid:!0}}}class Q{constructor(t){this.engine=t,this.variationNames=["TETRAHEDRON LATTICE 1","TETRAHEDRON LATTICE 2","TETRAHEDRON LATTICE 3","TETRAHEDRON LATTICE 4","HYPERCUBE LATTICE 1","HYPERCUBE LATTICE 2","HYPERCUBE LATTICE 3","HYPERCUBE LATTICE 4","SPHERE LATTICE 1","SPHERE LATTICE 2","SPHERE LATTICE 3","SPHERE LATTICE 4","TORUS LATTICE 1","TORUS LATTICE 2","TORUS LATTICE 3","TORUS LATTICE 4","KLEIN BOTTLE LATTICE 1","KLEIN BOTTLE LATTICE 2","KLEIN BOTTLE LATTICE 3","KLEIN BOTTLE LATTICE 4","FRACTAL LATTICE 1","FRACTAL LATTICE 2","FRACTAL LATTICE 3","WAVE LATTICE 1","WAVE LATTICE 2","WAVE LATTICE 3","CRYSTAL LATTICE 1","CRYSTAL LATTICE 2","CRYSTAL LATTICE 3","CRYSTAL LATTICE 4"],this.customVariations=new Array(70).fill(null),this.totalVariations=100}getVariationName(t){if(t<30)return this.variationNames[t];{const e=t-30,i=this.customVariations[e];return i?i.name:`CUSTOM ${e+1}`}}generateDefaultVariation(t){if(t>=30)return null;const e=Math.floor(t/4);let i=t%4,s=e;return e===5&&i>2&&(s=5,i=2),e===6&&i>2&&(s=6,i=2),{variation:t,geometry:s,gridDensity:8+s*2+i*1.5,morphFactor:.2+i*.2,chaos:i*.2,speed:.8+i*.2,hue:t*12.27%360,rot4dXW:(i-1.5)*.3,rot4dYW:s%2*.2,rot4dZW:(s+i)%3*.15,dimension:3.2+i*.2}}applyVariation(t){if(t<0||t>=this.totalVariations)return!1;let e;if(t<30)e=this.generateDefaultVariation(t);else{const i=t-30,s=this.customVariations[i];s?e={...s.parameters,variation:t}:e={...this.engine.parameterManager.getAllParameters(),variation:t}}return e?(this.engine.parameterManager.setParameters(e),this.engine.currentVariation=t,!0):!1}saveCurrentAsCustom(){const t=this.customVariations.findIndex(o=>o===null);if(t===-1)return-1;const e=this.engine.parameterManager.getAllParameters(),s={name:`${Z.getGeometryName(e.geometry)} CUSTOM ${t+1}`,timestamp:new Date().toISOString(),parameters:{...e},metadata:{basedOnVariation:this.engine.currentVariation,createdFrom:"current-state"}};return this.customVariations[t]=s,this.saveCustomVariations(),30+t}deleteCustomVariation(t){return t>=0&&t<70?(this.customVariations[t]=null,this.saveCustomVariations(),!0):!1}populateGrid(){const t=document.getElementById("variationGrid");if(!t)return;t.innerHTML="",[{name:"Tetrahedron",range:[0,3],class:"tetrahedron"},{name:"Hypercube",range:[4,7],class:"hypercube"},{name:"Sphere",range:[8,11],class:"sphere"},{name:"Torus",range:[12,15],class:"torus"},{name:"Klein Bottle",range:[16,19],class:"klein"},{name:"Fractal",range:[20,22],class:"fractal"},{name:"Wave",range:[23,25],class:"wave"},{name:"Crystal",range:[26,29],class:"crystal"}].forEach(o=>{const a=document.createElement("div");a.className="variation-section",a.innerHTML=`<h3>${o.name} Lattice</h3>`;const r=document.createElement("div");r.className="variation-buttons";for(let n=o.range[0];n<=o.range[1];n++)if(n<this.variationNames.length){const l=this.createVariationButton(n,!0,o.class);r.appendChild(l)}a.appendChild(r),t.appendChild(a)});const i=document.createElement("div");i.className="variation-section custom-section",i.innerHTML="<h3>Custom Variations</h3>";const s=document.createElement("div");s.className="variation-buttons custom-grid";for(let o=0;o<70;o++){const a=this.createVariationButton(30+o,!1,"custom");s.appendChild(a)}i.appendChild(s),t.appendChild(i)}createVariationButton(t,e,i){const s=document.createElement("button"),o=this.getVariationName(t);if(s.className=`preset-btn ${i} ${e?"default-variation":"custom-variation"}`,s.dataset.variation=t,s.title=`${t+1}. ${o}`,e)s.innerHTML=`
                <div class="variation-number">${(t+1).toString().padStart(2,"0")}</div>
                <div class="variation-level">Level ${t%4+1}</div>
            `;else{const a=t-30,r=this.customVariations[a]!==null;s.innerHTML=`
                <div class="variation-number">${(t+1).toString()}</div>
                <div class="variation-type">${r?"CUSTOM":"EMPTY"}</div>
            `,r||s.classList.add("empty-slot")}return s.addEventListener("click",()=>{(e||this.customVariations[t-30]!==null)&&(this.engine.setVariation(t),this.updateVariationGrid())}),e||s.addEventListener("contextmenu",a=>{a.preventDefault();const r=t-30;this.customVariations[r]!==null&&confirm(`Delete custom variation ${t+1}?`)&&(this.deleteCustomVariation(r),this.populateGrid())}),s}updateVariationGrid(){document.querySelectorAll(".preset-btn").forEach(e=>{e.classList.remove("active"),parseInt(e.dataset.variation)===this.engine.currentVariation&&e.classList.add("active")})}loadCustomVariations(){try{const t=localStorage.getItem("vib34d-custom-variations");if(t){const e=JSON.parse(t);Array.isArray(e)&&e.length===70&&(this.customVariations=e)}}catch(t){console.warn("Failed to load custom variations:",t)}}saveCustomVariations(){try{localStorage.setItem("vib34d-custom-variations",JSON.stringify(this.customVariations))}catch(t){console.warn("Failed to save custom variations:",t)}}exportCustomVariations(){const t={type:"vib34d-custom-variations",version:"1.0.0",timestamp:new Date().toISOString(),variations:this.customVariations.filter(a=>a!==null)},e=JSON.stringify(t,null,2),i=new Blob([e],{type:"application/json"}),s=URL.createObjectURL(i),o=document.createElement("a");o.href=s,o.download="vib34d-custom-variations.json",o.click(),URL.revokeObjectURL(s)}async importCustomVariations(t){try{const e=await t.text(),i=JSON.parse(e);if(i.type==="vib34d-custom-variations"&&Array.isArray(i.variations)){let s=0;return i.variations.forEach(o=>{const a=this.customVariations.findIndex(r=>r===null);a!==-1&&(this.customVariations[a]=o,s++)}),this.saveCustomVariations(),this.populateGrid(),s}}catch(e){console.error("Failed to import custom variations:",e)}return 0}getStatistics(){const t=this.customVariations.filter(e=>e!==null).length;return{totalVariations:this.totalVariations,defaultVariations:30,customVariations:t,emptySlots:70-t,currentVariation:this.engine.currentVariation,isCustom:this.engine.currentVariation>=30}}}class J{constructor(t){this.engine=t}addToGallery(t){console.log("🖼️ GallerySystem: Add to gallery stub")}loadFromGallery(t){console.log("🖼️ GallerySystem: Load from gallery stub")}}class tt{constructor(t){this.engine=t}exportCurrent(){console.log("💾 ExportManager: Export stub")}importVariation(t){console.log("📥 ExportManager: Import stub")}}class et{setStatus(t,e="info"){console.log(`📡 StatusManager [${e}]: ${t}`)}clearStatus(){}}class it{constructor(){this.visualizers=[],this.parameterManager=new W,this.variationManager=new Q(this),this.gallerySystem=new J(this),this.exportManager=new tt(this),this.statusManager=new et,this.isActive=!1,this.currentVariation=0,this.totalVariations=100,this.mouseX=.5,this.mouseY=.5,this.mouseIntensity=0,this.clickIntensity=0,this.time=0,this.animationId=null,this.init()}init(){console.log("🌌 Initializing VIB34D Integrated Holographic Engine...");try{this.createVisualizers(),this.setupControls(),this.setupInteractions(),this.loadCustomVariations(),this.populateVariationGrid(),this.startRenderLoop(),this.statusManager.setStatus("VIB34D Engine initialized successfully","success"),console.log("✅ VIB34D Engine ready")}catch(t){console.error("❌ Failed to initialize VIB34D Engine:",t),this.statusManager.setStatus("Initialization failed: "+t.message,"error")}}createVisualizers(){[{id:"background-canvas",role:"background",reactivity:.5},{id:"shadow-canvas",role:"shadow",reactivity:.7},{id:"content-canvas",role:"content",reactivity:.9},{id:"highlight-canvas",role:"highlight",reactivity:1.1},{id:"accent-canvas",role:"accent",reactivity:1.5}].forEach(e=>{const i=new K(e.id,e.role,e.reactivity,this.currentVariation);this.visualizers.push(i)}),console.log("✅ Created 5-layer integrated holographic system")}setupControls(){this.setupTabSystem(),this.setupParameterControls(),this.setupGeometryPresets(),this.updateDisplayValues()}setupTabSystem(){document.querySelectorAll(".tab-btn").forEach(t=>{t.addEventListener("click",()=>{document.querySelectorAll(".tab-btn").forEach(e=>e.classList.remove("active")),document.querySelectorAll(".tab-content").forEach(e=>e.classList.remove("active")),t.classList.add("active"),document.getElementById(t.dataset.tab+"-tab").classList.add("active")})})}setupParameterControls(){["variationSlider","rot4dXW","rot4dYW","rot4dZW","dimension","gridDensity","morphFactor","chaos","speed","hue"].forEach(e=>{const i=document.getElementById(e);i&&i.addEventListener("input",()=>this.updateFromControls())})}setupGeometryPresets(){document.querySelectorAll("[data-geometry]").forEach(t=>{t.addEventListener("click",()=>{document.querySelectorAll("[data-geometry]").forEach(e=>e.classList.remove("active")),t.classList.add("active"),this.parameterManager.setGeometry(parseInt(t.dataset.geometry)),this.updateVisualizers(),this.updateDisplayValues()})})}setupInteractions(){console.log("🔷 Faceted: Using ReactivityManager for all interactions")}loadCustomVariations(){this.variationManager.loadCustomVariations()}populateVariationGrid(){this.variationManager.populateGrid()}startRenderLoop(){var e;window.mobileDebug&&window.mobileDebug.log(`🎬 VIB34D Faceted Engine: Starting render loop with ${(e=this.visualizers)==null?void 0:e.length} visualizers`);const t=()=>{this.time+=.016,this.updateVisualizers(),this.animationId=requestAnimationFrame(t)};t(),window.mobileDebug&&window.mobileDebug.log(`✅ VIB34D Faceted Engine: Render loop started, animationId=${!!this.animationId}`)}updateVisualizers(){const t=this.parameterManager.getAllParameters();t.mouseX=this.mouseX,t.mouseY=this.mouseY,t.mouseIntensity=this.mouseIntensity,t.clickIntensity=this.clickIntensity,t.time=this.time,this.visualizers.forEach(e=>{e.updateParameters(t),e.render()}),this.mouseIntensity*=.95,this.clickIntensity*=.92}updateFromControls(){this.parameterManager.updateFromControls(),this.updateDisplayValues()}updateDisplayValues(){this.parameterManager.updateDisplayValues()}setVariation(t){if(t>=0&&t<this.totalVariations){this.currentVariation=t,this.variationManager.applyVariation(t),this.updateDisplayValues(),this.updateVisualizers();const e=document.getElementById("variationSlider");e&&(e.value=t),this.statusManager.setStatus(`Variation ${t+1} loaded`,"info")}}nextVariation(){this.setVariation((this.currentVariation+1)%this.totalVariations)}previousVariation(){this.setVariation((this.currentVariation-1+this.totalVariations)%this.totalVariations)}randomVariation(){const t=Math.floor(Math.random()*this.totalVariations);this.setVariation(t)}randomizeAll(){this.parameterManager.randomizeAll(),this.updateDisplayValues(),this.updateVisualizers(),this.statusManager.setStatus("All parameters randomized","info")}resetToDefaults(){this.parameterManager.resetToDefaults(),this.updateDisplayValues(),this.updateVisualizers(),this.statusManager.setStatus("Reset to default parameters","info")}saveAsCustomVariation(){const t=this.variationManager.saveCurrentAsCustom();t!==-1?(this.statusManager.setStatus(`Saved as custom variation ${t+1}`,"success"),this.populateVariationGrid()):this.statusManager.setStatus("All custom slots are full","warning")}openGalleryView(){this.gallerySystem.openGallery()}exportJSON(){this.exportManager.exportJSON()}exportCSS(){this.exportManager.exportCSS()}exportHTML(){this.exportManager.exportHTML()}exportPNG(){this.exportManager.exportPNG()}importJSON(){this.exportManager.importJSON()}importFolder(){this.exportManager.importFolder()}setActive(t){console.log(`🔷 Faceted Engine setActive: ${t}`),this.isActive=t,t&&!this.animationId?(console.log("🎬 Faceted Engine: Starting animation loop"),this.startRenderLoop()):!t&&this.animationId&&(console.log("⏹️ Faceted Engine: Stopping animation loop"),cancelAnimationFrame(this.animationId),this.animationId=null)}updateInteraction(t,e,i=.5){this.mouseX=t,this.mouseY=e,this.mouseIntensity=i,this.visualizers.forEach(s=>{s.updateInteraction&&s.updateInteraction(t,e,i)})}triggerClick(t=1){this.clickIntensity=t}applyAudioReactivityGrid(t){const e=this.audioReactivitySettings||window.audioReactivitySettings;if(!e)return;const i=e.sensitivity[e.activeSensitivity];e.activeVisualModes.forEach(s=>{const[o,a]=s.split("-");if(a==="color"){const r=t.energy*i,n=t.bass*i;if(t.rhythm*i,t.mid>.2){const l=this.parameterManager.getParameter("hue")||180,h=t.mid*i*30;this.parameterManager.setParameter("hue",(l+h)%360)}r>.3&&this.parameterManager.setParameter("intensity",Math.min(1,.5+r*.8)),n>.4&&this.parameterManager.setParameter("saturation",Math.min(1,.7+n*.3))}else if(a==="geometry"){const r=t.bass*i,n=t.high*i;if(r>.3){const l=this.parameterManager.getParameter("gridDensity")||15;this.parameterManager.setParameter("gridDensity",Math.min(100,l+r*25))}if(t.mid>.2){const l=t.mid*i*.5;this.parameterManager.setParameter("morphFactor",Math.min(2,l))}n>.4&&this.parameterManager.setParameter("chaos",Math.min(1,n*.6))}else if(a==="movement"){const r=t.energy*i;if(r>.2&&this.parameterManager.setParameter("speed",Math.min(3,.5+r*1.5)),t.bass>.3){const n=this.parameterManager.getParameter("rot4dXW")||0;this.parameterManager.setParameter("rot4dXW",n+t.bass*i*.1)}if(t.mid>.3){const n=this.parameterManager.getParameter("rot4dYW")||0;this.parameterManager.setParameter("rot4dYW",n+t.mid*i*.08)}if(t.high>.3){const n=this.parameterManager.getParameter("rot4dZW")||0;this.parameterManager.setParameter("rot4dZW",n+t.high*i*.06)}}})}updateClick(t){this.clickIntensity=Math.min(1,this.clickIntensity+t),this.visualizers.forEach(e=>{e.triggerClick&&e.triggerClick(t)})}updateScroll(t){if(this.visualizers.forEach(i=>{i.updateScroll&&i.updateScroll(t)}),Math.abs(t)>.1){const i=this.parameterManager.getParameter("morphFactor")||1;this.parameterManager.setParameter("morphFactor",Math.max(.1,i+t*.5))}}destroy(){window.universalReactivity&&window.universalReactivity.disconnectSystem("faceted"),this.animationId&&cancelAnimationFrame(this.animationId),this.visualizers.forEach(t=>{t.destroy&&t.destroy()}),console.log("🔄 VIB34D Engine destroyed")}}class ot{constructor(t,e,i,s){if(this.canvas=document.getElementById(t),this.role=e,this.reactivity=i,this.variant=s,this.contextOptions={alpha:!0,depth:!0,stencil:!1,antialias:!1,premultipliedAlpha:!0,preserveDrawingBuffer:!1,powerPreference:"high-performance",failIfMajorPerformanceCaveat:!1},this.gl=this.canvas.getContext("webgl2",this.contextOptions)||this.canvas.getContext("webgl",this.contextOptions)||this.canvas.getContext("experimental-webgl",this.contextOptions),this.gl){if(window.mobileDebug){const o=this.gl.getParameter(this.gl.VERSION);window.mobileDebug.log(`✅ ${t}: WebGL context created - ${o}`)}}else{console.error(`WebGL not supported for ${t}`),window.mobileDebug&&window.mobileDebug.log(`❌ ${t}: WebGL context creation failed`),this.showWebGLError();return}this.mouseX=.5,this.mouseY=.5,this.mouseIntensity=0,this.clickIntensity=0,this.startTime=Date.now(),this.params={geometry:0,gridDensity:15,morphFactor:1,chaos:.2,speed:1,hue:200,intensity:.5,saturation:.8,dimension:3.5,rot4dXW:0,rot4dYW:0,rot4dZW:0},this.init()}async ensureCanvasSizedThenInitWebGL(){let t=this.canvas.getBoundingClientRect();const e=Math.min(window.devicePixelRatio||1,2);t.width===0||t.height===0?await new Promise(i=>{setTimeout(()=>{if(t=this.canvas.getBoundingClientRect(),t.width===0||t.height===0){const s=window.innerWidth,o=window.innerHeight;this.canvas.width=s*e,this.canvas.height=o*e,window.mobileDebug&&window.mobileDebug.log(`📐 Quantum Canvas ${this.canvas.id}: Using viewport fallback ${this.canvas.width}x${this.canvas.height}`)}else this.canvas.width=t.width*e,this.canvas.height=t.height*e,window.mobileDebug&&window.mobileDebug.log(`📐 Quantum Canvas ${this.canvas.id}: Layout ready ${this.canvas.width}x${this.canvas.height}`);i()},100)}):(this.canvas.width=t.width*e,this.canvas.height=t.height*e,window.mobileDebug&&window.mobileDebug.log(`📐 Quantum Canvas ${this.canvas.id}: ${this.canvas.width}x${this.canvas.height} (DPR: ${e})`)),this.createWebGLContext(),this.gl&&this.init()}createWebGLContext(){let t=this.canvas.getContext("webgl2")||this.canvas.getContext("webgl")||this.canvas.getContext("experimental-webgl");if(t&&!t.isContextLost()){console.log(`🔄 Reusing existing WebGL context for ${this.canvas.id}`),this.gl=t;return}if(this.gl=this.canvas.getContext("webgl2",this.contextOptions)||this.canvas.getContext("webgl",this.contextOptions)||this.canvas.getContext("experimental-webgl",this.contextOptions),this.gl){if(window.mobileDebug){const e=this.gl.getParameter(this.gl.VERSION);window.mobileDebug.log(`✅ Quantum ${this.canvas.id}: WebGL context created - ${e} (size: ${this.canvas.width}x${this.canvas.height})`)}}else{console.error(`WebGL not supported for ${this.canvas.id}`),window.mobileDebug&&window.mobileDebug.log(`❌ Quantum ${this.canvas.id}: WebGL context creation failed (size: ${this.canvas.width}x${this.canvas.height})`),this.showWebGLError();return}}init(){this.initShaders(),this.initBuffers(),this.resize()}reinitializeContext(){if(console.log(`🔄 Reinitializing WebGL context for ${this.canvas.id}`),this.program=null,this.buffer=null,this.uniforms=null,this.gl=null,this.gl=this.canvas.getContext("webgl2")||this.canvas.getContext("webgl")||this.canvas.getContext("experimental-webgl"),!this.gl)return console.error(`❌ No WebGL context available for ${this.canvas.id} - SmartCanvasPool should have created one`),!1;if(this.gl.isContextLost())return console.error(`❌ WebGL context is lost for ${this.canvas.id}`),!1;try{return this.initShaders(),this.initBuffers(),this.resize(),console.log(`✅ WebGL context reinitialized for ${this.canvas.id}`),!0}catch(t){return console.error(`❌ Failed to reinitialize WebGL resources for ${this.canvas.id}:`,t),!1}}initShaders(){const t=`attribute vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}`,e=`
#ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
#else
    precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_geometry;
uniform float u_gridDensity;
uniform float u_morphFactor;
uniform float u_chaos;
uniform float u_speed;
uniform float u_hue;
uniform float u_intensity;
uniform float u_saturation;
uniform float u_dimension;
uniform float u_rot4dXW;
uniform float u_rot4dYW;
uniform float u_rot4dZW;
uniform float u_mouseIntensity;
uniform float u_clickIntensity;
uniform float u_roleIntensity;

// 4D rotation matrices
mat4 rotateXW(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat4(c, 0.0, 0.0, -s, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, s, 0.0, 0.0, c);
}

mat4 rotateYW(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat4(1.0, 0.0, 0.0, 0.0, 0.0, c, 0.0, -s, 0.0, 0.0, 1.0, 0.0, 0.0, s, 0.0, c);
}

mat4 rotateZW(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat4(1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, c, -s, 0.0, 0.0, s, c);
}

vec3 project4Dto3D(vec4 p) {
    float w = 2.5 / (2.5 + p.w);
    return vec3(p.x * w, p.y * w, p.z * w);
}

// Complex 3D Lattice Functions - Superior Quantum Shaders
float tetrahedronLattice(vec3 p, float gridSize) {
    vec3 q = fract(p * gridSize) - 0.5;
    float d1 = length(q);
    float d2 = length(q - vec3(0.4, 0.0, 0.0));
    float d3 = length(q - vec3(0.0, 0.4, 0.0));
    float d4 = length(q - vec3(0.0, 0.0, 0.4));
    float vertices = 1.0 - smoothstep(0.0, 0.04, min(min(d1, d2), min(d3, d4)));
    float edges = 0.0;
    edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.xy) - 0.2)));
    edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.yz) - 0.2)));
    edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.xz) - 0.2)));
    return max(vertices, edges * 0.5);
}

float hypercubeLattice(vec3 p, float gridSize) {
    vec3 grid = fract(p * gridSize);
    vec3 edges = min(grid, 1.0 - grid);
    float minEdge = min(min(edges.x, edges.y), edges.z);
    float lattice = 1.0 - smoothstep(0.0, 0.03, minEdge);
    
    vec3 centers = abs(grid - 0.5);
    float maxCenter = max(max(centers.x, centers.y), centers.z);
    float vertices = 1.0 - smoothstep(0.45, 0.5, maxCenter);
    
    return max(lattice * 0.7, vertices);
}

float sphereLattice(vec3 p, float gridSize) {
    vec3 cell = fract(p * gridSize) - 0.5;
    float sphere = 1.0 - smoothstep(0.15, 0.25, length(cell));
    
    float rings = 0.0;
    float ringRadius = length(cell.xy);
    rings = max(rings, 1.0 - smoothstep(0.0, 0.02, abs(ringRadius - 0.3)));
    rings = max(rings, 1.0 - smoothstep(0.0, 0.02, abs(ringRadius - 0.2)));
    
    return max(sphere, rings * 0.6);
}

float torusLattice(vec3 p, float gridSize) {
    vec3 cell = fract(p * gridSize) - 0.5;
    float majorRadius = 0.3;
    float minorRadius = 0.1;
    
    float toroidalDist = length(vec2(length(cell.xy) - majorRadius, cell.z));
    float torus = 1.0 - smoothstep(minorRadius - 0.02, minorRadius + 0.02, toroidalDist);
    
    float rings = 0.0;
    float angle = atan(cell.y, cell.x);
    rings = sin(angle * 8.0) * 0.02;
    
    return max(torus, 0.0) + rings;
}

float kleinLattice(vec3 p, float gridSize) {
    vec3 cell = fract(p * gridSize) - 0.5;
    float u = atan(cell.y, cell.x) / 3.14159 + 1.0;
    float v = cell.z + 0.5;
    
    float x = (2.0 + cos(u * 0.5)) * cos(u);
    float y = (2.0 + cos(u * 0.5)) * sin(u);
    float z = sin(u * 0.5) + v;
    
    vec3 kleinPoint = vec3(x, y, z) * 0.1;
    float dist = length(cell - kleinPoint);
    
    return 1.0 - smoothstep(0.1, 0.15, dist);
}

float fractalLattice(vec3 p, float gridSize) {
    vec3 cell = fract(p * gridSize);
    cell = abs(cell * 2.0 - 1.0);
    
    float dist = length(max(abs(cell) - 0.3, 0.0));
    
    // Recursive subdivision
    for(int i = 0; i < 3; i++) {
        cell = abs(cell * 2.0 - 1.0);
        float subdist = length(max(abs(cell) - 0.3, 0.0)) / pow(2.0, float(i + 1));
        dist = min(dist, subdist);
    }
    
    return 1.0 - smoothstep(0.0, 0.05, dist);
}

float waveLattice(vec3 p, float gridSize) {
    float time = u_time * 0.001 * u_speed;
    vec3 cell = fract(p * gridSize) - 0.5;
    
    float wave1 = sin(p.x * gridSize * 2.0 + time * 2.0);
    float wave2 = sin(p.y * gridSize * 1.8 + time * 1.5);
    float wave3 = sin(p.z * gridSize * 2.2 + time * 1.8);
    
    float interference = (wave1 + wave2 + wave3) / 3.0;
    float amplitude = 1.0 - length(cell) * 2.0;
    
    return max(0.0, interference * amplitude);
}

float crystalLattice(vec3 p, float gridSize) {
    vec3 cell = fract(p * gridSize) - 0.5;
    
    // Octahedral crystal structure
    float crystal = max(max(abs(cell.x) + abs(cell.y), abs(cell.y) + abs(cell.z)), abs(cell.x) + abs(cell.z));
    crystal = 1.0 - smoothstep(0.3, 0.4, crystal);
    
    // Add crystalline faces
    float faces = 0.0;
    faces = max(faces, 1.0 - smoothstep(0.0, 0.02, abs(abs(cell.x) - 0.35)));
    faces = max(faces, 1.0 - smoothstep(0.0, 0.02, abs(abs(cell.y) - 0.35)));
    faces = max(faces, 1.0 - smoothstep(0.0, 0.02, abs(abs(cell.z) - 0.35)));
    
    return max(crystal, faces * 0.5);
}

// Enhanced geometry function with holographic effects
float geometryFunction(vec4 p) {
    int geomType = int(u_geometry);
    vec3 p3d = project4Dto3D(p);
    float gridSize = u_gridDensity * 0.08;
    
    if (geomType == 0) {
        return tetrahedronLattice(p3d, gridSize) * u_morphFactor;
    }
    else if (geomType == 1) {
        return hypercubeLattice(p3d, gridSize) * u_morphFactor;
    }
    else if (geomType == 2) {
        return sphereLattice(p3d, gridSize) * u_morphFactor;
    }
    else if (geomType == 3) {
        return torusLattice(p3d, gridSize) * u_morphFactor;
    }
    else if (geomType == 4) {
        return kleinLattice(p3d, gridSize) * u_morphFactor;
    }
    else if (geomType == 5) {
        return fractalLattice(p3d, gridSize) * u_morphFactor;
    }
    else if (geomType == 6) {
        return waveLattice(p3d, gridSize) * u_morphFactor;
    }
    else if (geomType == 7) {
        return crystalLattice(p3d, gridSize) * u_morphFactor;
    }
    else {
        return hypercubeLattice(p3d, gridSize) * u_morphFactor;
    }
}

// EXTREME LAYER-BY-LAYER COLOR SYSTEM
// Each canvas layer gets completely different color behavior

// Layer-specific color palettes with extreme juxtapositions
vec3 getLayerColorPalette(int layerIndex, float t) {
    if (layerIndex == 0) {
        // BACKGROUND LAYER: Deep space colors - purple/black/deep blue
        vec3 color1 = vec3(0.05, 0.0, 0.2);   // Deep purple
        vec3 color2 = vec3(0.0, 0.0, 0.1);    // Near black
        vec3 color3 = vec3(0.0, 0.05, 0.3);   // Deep blue
        return mix(mix(color1, color2, sin(t * 3.0) * 0.5 + 0.5), color3, cos(t * 2.0) * 0.5 + 0.5);
    }
    else if (layerIndex == 1) {
        // SHADOW LAYER: Toxic greens and sickly yellows - high contrast
        vec3 color1 = vec3(0.0, 1.0, 0.0);    // Pure toxic green
        vec3 color2 = vec3(0.8, 1.0, 0.0);    // Sickly yellow-green
        vec3 color3 = vec3(0.0, 0.8, 0.3);    // Forest green
        return mix(mix(color1, color2, sin(t * 7.0) * 0.5 + 0.5), color3, cos(t * 5.0) * 0.5 + 0.5);
    }
    else if (layerIndex == 2) {
        // CONTENT LAYER: Blazing hot colors - red/orange/white hot
        vec3 color1 = vec3(1.0, 0.0, 0.0);    // Pure red
        vec3 color2 = vec3(1.0, 0.5, 0.0);    // Blazing orange
        vec3 color3 = vec3(1.0, 1.0, 1.0);    // White hot
        return mix(mix(color1, color2, sin(t * 11.0) * 0.5 + 0.5), color3, cos(t * 8.0) * 0.5 + 0.5);
    }
    else if (layerIndex == 3) {
        // HIGHLIGHT LAYER: Electric blues and cyans - crackling energy
        vec3 color1 = vec3(0.0, 1.0, 1.0);    // Electric cyan
        vec3 color2 = vec3(0.0, 0.5, 1.0);    // Electric blue
        vec3 color3 = vec3(0.5, 1.0, 1.0);    // Bright cyan
        return mix(mix(color1, color2, sin(t * 13.0) * 0.5 + 0.5), color3, cos(t * 9.0) * 0.5 + 0.5);
    }
    else {
        // ACCENT LAYER: Violent magentas and purples - chaotic
        vec3 color1 = vec3(1.0, 0.0, 1.0);    // Pure magenta
        vec3 color2 = vec3(0.8, 0.0, 1.0);    // Violet
        vec3 color3 = vec3(1.0, 0.3, 1.0);    // Hot pink
        return mix(mix(color1, color2, sin(t * 17.0) * 0.5 + 0.5), color3, cos(t * 12.0) * 0.5 + 0.5);
    }
}

// Extreme RGB separation and distortion for each layer
vec3 extremeRGBSeparation(vec3 baseColor, vec2 uv, float intensity, int layerIndex) {
    vec2 offset = vec2(0.01, 0.005) * intensity;
    
    // Different separation patterns per layer
    if (layerIndex == 0) {
        // Background: Minimal separation, smooth
        return baseColor + vec3(
            sin(uv.x * 10.0 + u_time * 0.001) * 0.02,
            cos(uv.y * 8.0 + u_time * 0.0015) * 0.02,
            sin(uv.x * uv.y * 6.0 + u_time * 0.0008) * 0.02
        ) * intensity;
    }
    else if (layerIndex == 1) {
        // Shadow: Heavy vertical separation
        float r = baseColor.r + sin(uv.y * 50.0 + u_time * 0.003) * intensity * 0.15;
        float g = baseColor.g + sin((uv.y + 0.1) * 45.0 + u_time * 0.0025) * intensity * 0.12;
        float b = baseColor.b + sin((uv.y - 0.1) * 55.0 + u_time * 0.0035) * intensity * 0.18;
        return vec3(r, g, b);
    }
    else if (layerIndex == 2) {
        // Content: Explosive radial separation
        float dist = length(uv);
        float angle = atan(uv.y, uv.x);
        float r = baseColor.r + sin(dist * 30.0 + angle * 10.0 + u_time * 0.004) * intensity * 0.2;
        float g = baseColor.g + cos(dist * 25.0 + angle * 8.0 + u_time * 0.0035) * intensity * 0.18;
        float b = baseColor.b + sin(dist * 35.0 + angle * 12.0 + u_time * 0.0045) * intensity * 0.22;
        return vec3(r, g, b);
    }
    else if (layerIndex == 3) {
        // Highlight: Lightning-like separation
        float lightning = sin(uv.x * 80.0 + u_time * 0.008) * cos(uv.y * 60.0 + u_time * 0.006);
        float r = baseColor.r + lightning * intensity * 0.25;
        float g = baseColor.g + sin(lightning * 40.0 + u_time * 0.005) * intensity * 0.2;
        float b = baseColor.b + cos(lightning * 30.0 + u_time * 0.007) * intensity * 0.3;
        return vec3(r, g, b);
    }
    else {
        // Accent: Chaotic multi-directional separation
        float chaos1 = sin(uv.x * 100.0 + uv.y * 80.0 + u_time * 0.01);
        float chaos2 = cos(uv.x * 70.0 - uv.y * 90.0 + u_time * 0.008);
        float chaos3 = sin(uv.x * uv.y * 150.0 + u_time * 0.012);
        return baseColor + vec3(chaos1, chaos2, chaos3) * intensity * 0.3;
    }
}

void main() {
    vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / min(u_resolution.x, u_resolution.y);
    
    // Enhanced 4D position with holographic depth
    float timeSpeed = u_time * 0.0001 * u_speed;
    vec4 pos = vec4(uv * 3.0, sin(timeSpeed * 3.0), cos(timeSpeed * 2.0));
    pos.xy += (u_mouse - 0.5) * u_mouseIntensity * 2.0;
    
    // Apply 4D rotations
    pos = rotateXW(u_rot4dXW) * pos;
    pos = rotateYW(u_rot4dYW) * pos;
    pos = rotateZW(u_rot4dZW) * pos;
    
    // Calculate enhanced geometry value
    float value = geometryFunction(pos);
    
    // Enhanced chaos with holographic effects
    float noise = sin(pos.x * 7.0) * cos(pos.y * 11.0) * sin(pos.z * 13.0);
    value += noise * u_chaos;
    
    // Enhanced intensity calculation with holographic glow
    float geometryIntensity = 1.0 - clamp(abs(value * 0.8), 0.0, 1.0);
    geometryIntensity = pow(geometryIntensity, 1.5); // More dramatic falloff
    geometryIntensity += u_clickIntensity * 0.3;
    
    // Holographic shimmer effect
    float shimmer = sin(uv.x * 20.0 + timeSpeed * 5.0) * cos(uv.y * 15.0 + timeSpeed * 3.0) * 0.1;
    geometryIntensity += shimmer * geometryIntensity;
    
    // Apply user intensity control
    float finalIntensity = geometryIntensity * u_intensity;
    
    // Old hemispheric color system completely removed - now using extreme layer-by-layer system
    
    // EXTREME LAYER-BY-LAYER COLOR SYSTEM
    // Determine canvas layer from role/variant (0=background, 1=shadow, 2=content, 3=highlight, 4=accent)
    int layerIndex = 0;
    if (u_roleIntensity == 0.7) layerIndex = 1;      // shadow layer
    else if (u_roleIntensity == 1.0) layerIndex = 2; // content layer  
    else if (u_roleIntensity == 0.85) layerIndex = 3; // highlight layer
    else if (u_roleIntensity == 0.6) layerIndex = 4;  // accent layer
    
    // Get layer-specific base color with extreme dynamics
    // Use u_hue as global intensity modifier (0-1) affecting all layers
    float globalIntensity = u_hue; // Now 0-1 from JavaScript
    float colorTime = timeSpeed * 2.0 + value * 3.0 + globalIntensity * 5.0;
    vec3 layerColor = getLayerColorPalette(layerIndex, colorTime) * (0.5 + globalIntensity * 1.5);
    
    // Apply geometry-based intensity modulation per layer
    vec3 extremeBaseColor;
    if (layerIndex == 0) {
        // Background: Subtle, fills empty space
        extremeBaseColor = layerColor * (0.3 + geometryIntensity * 0.4);
    }
    else if (layerIndex == 1) {
        // Shadow: Aggressive, high contrast where geometry is weak
        float shadowIntensity = pow(1.0 - geometryIntensity, 2.0); // Inverted for shadows
        extremeBaseColor = layerColor * (shadowIntensity * 0.8 + 0.1);
    }
    else if (layerIndex == 2) {
        // Content: Dominant, follows geometry strongly
        extremeBaseColor = layerColor * (geometryIntensity * 1.2 + 0.2);
    }
    else if (layerIndex == 3) {
        // Highlight: Electric, peaks only
        float peakIntensity = pow(geometryIntensity, 3.0); // Cubic for sharp peaks
        extremeBaseColor = layerColor * (peakIntensity * 1.5 + 0.1);
    }
    else {
        // Accent: Chaotic, random bursts
        float randomBurst = sin(value * 50.0 + timeSpeed * 10.0) * 0.5 + 0.5;
        extremeBaseColor = layerColor * (randomBurst * geometryIntensity * 2.0 + 0.05);
    }
    
    // Apply extreme RGB separation per layer
    vec3 extremeColor = extremeRGBSeparation(extremeBaseColor, uv, finalIntensity, layerIndex);
    
    // Layer-specific particle systems with extreme colors
    float extremeParticles = 0.0;
    if (layerIndex == 2 || layerIndex == 3) {
        // Only content and highlight layers get particles
        vec2 particleUV = uv * (layerIndex == 2 ? 12.0 : 20.0);
        vec2 particleID = floor(particleUV);
        vec2 particlePos = fract(particleUV) - 0.5;
        float particleDist = length(particlePos);
        
        float particleTime = timeSpeed * (layerIndex == 2 ? 3.0 : 8.0) + dot(particleID, vec2(127.1, 311.7));
        float particleAlpha = sin(particleTime) * 0.5 + 0.5;
        float particleSize = layerIndex == 2 ? 0.2 : 0.1;
        extremeParticles = (1.0 - smoothstep(0.05, particleSize, particleDist)) * particleAlpha * 0.4;
    }
    
    // Combine extreme color with particles based on layer
    vec3 finalColor;
    if (layerIndex == 0) {
        // Background: Pure extreme color
        finalColor = extremeColor;
    }
    else if (layerIndex == 1) {
        // Shadow: Dark with toxic highlights
        finalColor = extremeColor * 0.8;
    }
    else if (layerIndex == 2) {
        // Content: Blazing with white-hot particles
        finalColor = extremeColor + extremeParticles * vec3(1.0, 1.0, 1.0);
    }
    else if (layerIndex == 3) {
        // Highlight: Electric with cyan particles
        finalColor = extremeColor + extremeParticles * vec3(0.0, 1.0, 1.0);
    }
    else {
        // Accent: Chaotic magenta madness
        finalColor = extremeColor * (1.0 + sin(timeSpeed * 20.0) * 0.3);
    }
    
    // Layer-specific alpha intensity with extreme contrast
    float layerAlpha;
    if (layerIndex == 0) layerAlpha = 0.6;        // Background: Medium
    else if (layerIndex == 1) layerAlpha = 0.4;   // Shadow: Lower
    else if (layerIndex == 2) layerAlpha = 1.0;   // Content: Full intensity
    else if (layerIndex == 3) layerAlpha = 0.8;   // Highlight: High
    else layerAlpha = 0.3;                        // Accent: Subtle bursts
    
    gl_FragColor = vec4(finalColor, finalIntensity * layerAlpha);
}`;this.program=this.createProgram(t,e),this.uniforms={resolution:this.gl.getUniformLocation(this.program,"u_resolution"),time:this.gl.getUniformLocation(this.program,"u_time"),mouse:this.gl.getUniformLocation(this.program,"u_mouse"),geometry:this.gl.getUniformLocation(this.program,"u_geometry"),gridDensity:this.gl.getUniformLocation(this.program,"u_gridDensity"),morphFactor:this.gl.getUniformLocation(this.program,"u_morphFactor"),chaos:this.gl.getUniformLocation(this.program,"u_chaos"),speed:this.gl.getUniformLocation(this.program,"u_speed"),hue:this.gl.getUniformLocation(this.program,"u_hue"),intensity:this.gl.getUniformLocation(this.program,"u_intensity"),saturation:this.gl.getUniformLocation(this.program,"u_saturation"),dimension:this.gl.getUniformLocation(this.program,"u_dimension"),rot4dXW:this.gl.getUniformLocation(this.program,"u_rot4dXW"),rot4dYW:this.gl.getUniformLocation(this.program,"u_rot4dYW"),rot4dZW:this.gl.getUniformLocation(this.program,"u_rot4dZW"),mouseIntensity:this.gl.getUniformLocation(this.program,"u_mouseIntensity"),clickIntensity:this.gl.getUniformLocation(this.program,"u_clickIntensity"),roleIntensity:this.gl.getUniformLocation(this.program,"u_roleIntensity")}}createProgram(t,e){var a,r;const i=this.createShader(this.gl.VERTEX_SHADER,t),s=this.createShader(this.gl.FRAGMENT_SHADER,e);if(!i||!s)return null;const o=this.gl.createProgram();if(this.gl.attachShader(o,i),this.gl.attachShader(o,s),this.gl.linkProgram(o),this.gl.getProgramParameter(o,this.gl.LINK_STATUS))window.mobileDebug&&window.mobileDebug.log(`✅ ${(r=this.canvas)==null?void 0:r.id}: Shader program linked successfully`);else{const n=this.gl.getProgramInfoLog(o);return console.error("Program linking failed:",n),window.mobileDebug&&window.mobileDebug.log(`❌ ${(a=this.canvas)==null?void 0:a.id}: Shader program link failed - ${n}`),null}return o}createShader(t,e){var i,s,o,a,r,n;if(!this.gl)return console.error("❌ Cannot create shader: WebGL context is null"),window.mobileDebug&&window.mobileDebug.log(`❌ ${(i=this.canvas)==null?void 0:i.id}: Cannot create shader - WebGL context is null`),null;if(this.gl.isContextLost())return console.error("❌ Cannot create shader: WebGL context is lost"),window.mobileDebug&&window.mobileDebug.log(`❌ ${(s=this.canvas)==null?void 0:s.id}: Cannot create shader - WebGL context is lost`),null;try{const l=this.gl.createShader(t);if(!l)return console.error("❌ Failed to create shader object - WebGL context may be invalid"),window.mobileDebug&&window.mobileDebug.log(`❌ ${(o=this.canvas)==null?void 0:o.id}: Failed to create shader object`),null;if(this.gl.shaderSource(l,e),this.gl.compileShader(l),this.gl.getShaderParameter(l,this.gl.COMPILE_STATUS)){if(window.mobileDebug){const h=t===this.gl.VERTEX_SHADER?"vertex":"fragment";window.mobileDebug.log(`✅ ${(r=this.canvas)==null?void 0:r.id}: ${h} shader compiled successfully`)}}else{const h=this.gl.getShaderInfoLog(l),d=t===this.gl.VERTEX_SHADER?"vertex":"fragment";if(h?console.error(`❌ ${d} shader compilation failed:`,h):console.error(`❌ ${d} shader compilation failed: WebGL returned no error info (context may be invalid)`),console.error("Shader source:",e),window.mobileDebug){const u=h||"No error info (context may be invalid)";window.mobileDebug.log(`❌ ${(a=this.canvas)==null?void 0:a.id}: ${d} shader compile failed - ${u}`);const m=e.split(`
`).slice(0,5).join("\\n");window.mobileDebug.log(`🔍 ${d} shader source start: ${m}...`)}return this.gl.deleteShader(l),null}return l}catch(l){return console.error("❌ Exception during shader creation:",l),window.mobileDebug&&window.mobileDebug.log(`❌ ${(n=this.canvas)==null?void 0:n.id}: Exception during shader creation - ${l.message}`),null}}initBuffers(){const t=new Float32Array([-1,-1,1,-1,-1,1,1,1]);this.buffer=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.buffer),this.gl.bufferData(this.gl.ARRAY_BUFFER,t,this.gl.STATIC_DRAW);const e=this.gl.getAttribLocation(this.program,"a_position");this.gl.enableVertexAttribArray(e),this.gl.vertexAttribPointer(e,2,this.gl.FLOAT,!1,0,0)}resize(){var s,o;const t=Math.min(window.devicePixelRatio||1,2),e=this.canvas.clientWidth,i=this.canvas.clientHeight;window.mobileDebug&&(e===0||i===0)&&!this._zeroDimWarned&&(window.mobileDebug.log(`⚠️ ${(s=this.canvas)==null?void 0:s.id}: Canvas clientWidth=${e}, clientHeight=${i} - will be invisible`),this._zeroDimWarned=!0),(this.canvas.width!==e*t||this.canvas.height!==i*t)&&(this.canvas.width=e*t,this.canvas.height=i*t,this.gl.viewport(0,0,this.canvas.width,this.canvas.height),window.mobileDebug&&!this._finalSizeLogged&&(window.mobileDebug.log(`📐 ${(o=this.canvas)==null?void 0:o.id}: Final canvas buffer ${this.canvas.width}x${this.canvas.height} (DPR=${t})`),this._finalSizeLogged=!0))}showWebGLError(){if(!this.canvas)return;const t=this.canvas.getContext("2d");t&&(t.fillStyle="#000",t.fillRect(0,0,this.canvas.width,this.canvas.height),t.fillStyle="#64ff96",t.font="16px Orbitron, monospace",t.textAlign="center",t.fillText("WebGL Required",this.canvas.width/2,this.canvas.height/2),t.fillStyle="#888",t.font="12px Orbitron, monospace",t.fillText("Please enable WebGL in your browser",this.canvas.width/2,this.canvas.height/2+25))}updateParameters(t){this.params={...this.params,...t}}updateInteraction(t,e,i){this.mouseX=t,this.mouseY=e,this.mouseIntensity=i}render(){var r,n;if(!this.program){window.mobileDebug&&!this._noProgramWarned&&(window.mobileDebug.log(`❌ ${(r=this.canvas)==null?void 0:r.id}: No WebGL program for render`),this._noProgramWarned=!0);return}this.resize(),this.gl.useProgram(this.program),this.gl.clearColor(0,0,0,0),this.gl.clear(this.gl.COLOR_BUFFER_BIT),this._renderParamsLogged||(console.log(`[Mobile] ${(n=this.canvas)==null?void 0:n.id}: Render params - geometry=${this.params.geometry}, gridDensity=${this.params.gridDensity}, intensity=${this.params.intensity}`),this._renderParamsLogged=!0);const t={background:.4,shadow:.6,content:1,highlight:1.3,accent:1.6},e=Date.now()-this.startTime;this.gl.uniform2f(this.uniforms.resolution,this.canvas.width,this.canvas.height),this.gl.uniform1f(this.uniforms.time,e),this.gl.uniform2f(this.uniforms.mouse,this.mouseX,this.mouseY),this.gl.uniform1f(this.uniforms.geometry,this.params.geometry);let i=this.params.gridDensity,s=this.params.morphFactor,o=this.params.hue,a=this.params.chaos;window.audioEnabled&&window.audioReactive&&(i+=window.audioReactive.bass*40,s+=window.audioReactive.mid*1.2,o+=window.audioReactive.high*120,a+=window.audioReactive.energy*.6,Date.now()%1e4<16&&console.log(`🌌 Quantum audio reactivity: Density+${(window.audioReactive.bass*40).toFixed(1)} Morph+${(window.audioReactive.mid*1.2).toFixed(2)} Hue+${(window.audioReactive.high*120).toFixed(1)} Chaos+${(window.audioReactive.energy*.6).toFixed(2)}`)),this.gl.uniform1f(this.uniforms.gridDensity,Math.min(100,i)),this.gl.uniform1f(this.uniforms.morphFactor,Math.min(2,s)),this.gl.uniform1f(this.uniforms.chaos,Math.min(1,a)),this.gl.uniform1f(this.uniforms.speed,this.params.speed),this.gl.uniform1f(this.uniforms.hue,o%360/360),this.gl.uniform1f(this.uniforms.intensity,this.params.intensity),this.gl.uniform1f(this.uniforms.saturation,this.params.saturation),this.gl.uniform1f(this.uniforms.dimension,this.params.dimension),this.gl.uniform1f(this.uniforms.rot4dXW,this.params.rot4dXW),this.gl.uniform1f(this.uniforms.rot4dYW,this.params.rot4dYW),this.gl.uniform1f(this.uniforms.rot4dZW,this.params.rot4dZW),this.gl.uniform1f(this.uniforms.mouseIntensity,this.mouseIntensity),this.gl.uniform1f(this.uniforms.clickIntensity,this.clickIntensity),this.gl.uniform1f(this.uniforms.roleIntensity,t[this.role]||1),this.gl.drawArrays(this.gl.TRIANGLE_STRIP,0,4)}destroy(){this.gl&&this.program&&this.gl.deleteProgram(this.program),this.gl&&this.buffer&&this.gl.deleteBuffer(this.buffer)}}class st{constructor(){console.log("🔮 Initializing VIB34D Quantum Engine..."),this.visualizers=[],this.parameters=new W,this.isActive=!1,this.parameters.setParameter("hue",280),this.parameters.setParameter("intensity",.7),this.parameters.setParameter("saturation",.9),this.parameters.setParameter("gridDensity",20),this.parameters.setParameter("morphFactor",1),this.init()}init(){this.createVisualizers(),this.setupAudioReactivity(),this.startRenderLoop(),console.log("✨ Quantum Engine initialized with audio reactivity")}createVisualizers(){[{id:"quantum-background-canvas",role:"background",reactivity:.4},{id:"quantum-shadow-canvas",role:"shadow",reactivity:.6},{id:"quantum-content-canvas",role:"content",reactivity:1},{id:"quantum-highlight-canvas",role:"highlight",reactivity:1.3},{id:"quantum-accent-canvas",role:"accent",reactivity:1.6}].forEach(e=>{try{if(!document.getElementById(e.id)){console.warn(`⚠️ Canvas ${e.id} not found in DOM - skipping`);return}const s=new ot(e.id,e.role,e.reactivity,0);s.gl?(this.visualizers.push(s),console.log(`🌌 Created quantum layer: ${e.role}`)):console.warn(`⚠️ No WebGL context for quantum layer ${e.id}`)}catch(i){console.warn(`Failed to create quantum layer ${e.id}:`,i)}}),console.log(`✅ Created ${this.visualizers.length} quantum visualizers with enhanced effects`)}setActive(t){if(this.isActive=t,t){const e=document.getElementById("quantumLayers");e&&(e.style.display="block"),window.audioEnabled&&!this.audioEnabled&&this.enableAudio(),console.log("🔮 Quantum System ACTIVATED - Audio frequency reactivity mode")}else{const e=document.getElementById("quantumLayers");e&&(e.style.display="none"),console.log("🔮 Quantum System DEACTIVATED")}}toggleAudio(t){t&&this.isActive&&!this.audioEnabled?this.enableAudio():!t&&this.audioEnabled&&(this.audioEnabled=!1,this.audioContext&&(this.audioContext.close(),this.audioContext=null),console.log("🔇 Quantum audio reactivity disabled"))}setupAudioReactivity(){console.log("🌌 Setting up Quantum audio frequency reactivity")}async enableAudio(){if(!this.audioEnabled)try{const t=await navigator.mediaDevices.getUserMedia({audio:!0});this.audioContext=new(window.AudioContext||window.webkitAudioContext),this.analyser=this.audioContext.createAnalyser(),this.analyser.fftSize=256,this.analyser.smoothingTimeConstant=.8,this.frequencyData=new Uint8Array(this.analyser.frequencyBinCount),this.audioContext.createMediaStreamSource(t).connect(this.analyser),this.audioEnabled=!0,console.log("🎵 Quantum audio reactivity enabled")}catch(t){console.error("❌ Failed to enable Quantum audio:",t),this.audioEnabled=!1}}updateParameter(t,e){this.parameters.setParameter(t,e),this.visualizers.forEach(i=>{if(i.updateParameters){const s={};s[t]=e,i.updateParameters(s)}else i.params&&(i.params[t]=e,i.render&&i.render())}),console.log(`🔮 Updated quantum ${t}: ${e}`)}updateParameters(t){Object.keys(t).forEach(e=>{this.updateParameter(e,t[e])})}updateInteraction(t,e,i){this.visualizers.forEach(s=>{s.updateInteraction&&s.updateInteraction(t,e,i)})}getParameters(){return this.parameters.getAllParameters()}setParameters(t){Object.keys(t).forEach(e=>{this.parameters.setParameter(e,t[e])}),this.updateParameters(t)}startRenderLoop(){var e;window.mobileDebug&&window.mobileDebug.log(`🎬 Quantum Engine: Starting render loop with ${(e=this.visualizers)==null?void 0:e.length} visualizers, isActive=${this.isActive}`);const t=()=>{var i;if(this.isActive){const s=this.parameters.getAllParameters();this.visualizers.forEach(o=>{o.updateParameters&&o.render&&(o.updateParameters(s),o.render())}),window.mobileDebug&&!this._renderActivityLogged&&(window.mobileDebug.log(`🎬 Quantum Engine: Actively rendering ${(i=this.visualizers)==null?void 0:i.length} visualizers`),this._renderActivityLogged=!0)}else window.mobileDebug&&!this._inactiveWarningLogged&&(window.mobileDebug.log("⚠️ Quantum Engine: Not rendering because isActive=false"),this._inactiveWarningLogged=!0);requestAnimationFrame(t)};t(),console.log("🎬 Quantum render loop started"),window.mobileDebug&&window.mobileDebug.log("✅ Quantum Engine: Render loop started, will render when isActive=true")}updateClick(t){this.visualizers.forEach(e=>{e.triggerClick&&e.triggerClick(.5,.5,t)})}updateScroll(t){this.visualizers.forEach(e=>{e.updateScroll&&e.updateScroll(t)})}destroy(){window.universalReactivity&&window.universalReactivity.disconnectSystem("quantum"),this.visualizers.forEach(t=>{t.destroy&&t.destroy()}),this.visualizers=[],console.log("🧹 Quantum Engine destroyed")}}class rt{constructor(t,e="content",i=1,s=0){this.canvas=document.getElementById(t),this.role=e,this.reactivity=i,this.variant=s,this.contextOptions={alpha:!0,depth:!0,stencil:!1,antialias:!1,premultipliedAlpha:!0,preserveDrawingBuffer:!1,powerPreference:"high-performance",failIfMajorPerformanceCaveat:!1};let o=this.canvas.getContext("webgl2")||this.canvas.getContext("webgl")||this.canvas.getContext("experimental-webgl");if(o&&!o.isContextLost()?(console.log(`🔄 Reusing existing WebGL context for ${t}`),this.gl=o):this.gl=this.canvas.getContext("webgl2",this.contextOptions)||this.canvas.getContext("webgl",this.contextOptions)||this.canvas.getContext("experimental-webgl",this.contextOptions),!this.gl)throw console.error(`WebGL not supported for ${t}`),this.showWebGLError(),new Error(`WebGL not supported for ${t}`);this.variantParams=this.generateVariantParams(s),this.roleParams=this.generateRoleParams(e),this.mouseX=.5,this.mouseY=.5,this.mouseIntensity=0,this.clickIntensity=0,this.clickDecay=.95,this.touchX=.5,this.touchY=.5,this.touchActive=!1,this.touchMorph=0,this.touchChaos=0,this.scrollPosition=0,this.scrollVelocity=0,this.scrollDecay=.92,this.parallaxDepth=0,this.gridDensityShift=0,this.colorScrollShift=0,this.densityVariation=0,this.densityTarget=0,this.audioData={bass:0,mid:0,high:0},this.audioDensityBoost=0,this.audioMorphBoost=0,this.audioSpeedBoost=0,this.audioChaosBoost=0,this.audioColorShift=0,this.startTime=Date.now(),this.initShaders(),this.initBuffers(),this.resize()}generateVariantParams(t){const e=["TETRAHEDRON","HYPERCUBE","SPHERE","TORUS","KLEIN BOTTLE","FRACTAL","WAVE","CRYSTAL"],s=[0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,6,6,6,7,7,7,7][t]||0,o=t%4,n=e[s]+[" LATTICE"," FIELD"," MATRIX"," RESONANCE"][o],h={0:{density:.8+o*.2,speed:.3+o*.1,chaos:o*.1,morph:0+o*.2},1:{density:1+o*.3,speed:.5+o*.1,chaos:o*.15,morph:o*.2},2:{density:1.2+o*.4,speed:.4+o*.2,chaos:.1+o*.1,morph:.3+o*.2},3:{density:.9+o*.3,speed:.6+o*.2,chaos:.2+o*.2,morph:.5+o*.1},4:{density:1.4+o*.5,speed:.7+o*.1,chaos:.3+o*.2,morph:.7+o*.1},5:{density:1.8+o*.3,speed:.5+o*.3,chaos:.5+o*.2,morph:.8+o*.05},6:{density:.6+o*.4,speed:.8+o*.4,chaos:.4+o*.3,morph:.6+o*.2},7:{density:1.6+o*.2,speed:.2+o*.1,chaos:.1+o*.1,morph:.2+o*.2}}[s];return{geometryType:s,name:n,density:h.density,speed:h.speed,hue:t*12.27%360,saturation:.8+o*.05,intensity:.5+o*.1,chaos:h.chaos,morph:h.morph}}generateRoleParams(t){const e=this.variantParams;return{background:{densityMult:.4,speedMult:.2,colorShift:0,intensity:.2,mouseReactivity:.3,clickReactivity:.1},shadow:{densityMult:.8,speedMult:.3,colorShift:180,intensity:.4,mouseReactivity:.5,clickReactivity:.3},content:{densityMult:e.density,speedMult:e.speed,colorShift:e.hue,intensity:e.intensity,mouseReactivity:1,clickReactivity:.8},highlight:{densityMult:1.5+e.density*.3,speedMult:.8+e.speed*.2,colorShift:e.hue+60,intensity:.6+e.intensity*.2,mouseReactivity:1.2,clickReactivity:1},accent:{densityMult:2.5+e.density*.5,speedMult:.4+e.speed*.1,colorShift:e.hue+300,intensity:.3+e.intensity*.1,mouseReactivity:1.5,clickReactivity:1.2}}[t]||{densityMult:1,speedMult:.5,colorShift:0,intensity:.5,mouseReactivity:1,clickReactivity:.5}}initShaders(){const t=`
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `,e=`
            precision highp float;
            
            uniform vec2 u_resolution;
            uniform float u_time;
            uniform vec2 u_mouse;
            uniform float u_geometry;
            uniform float u_density;
            uniform float u_speed;
            uniform vec3 u_color;
            uniform float u_intensity;
            uniform float u_roleDensity;
            uniform float u_roleSpeed;
            uniform float u_colorShift;
            uniform float u_chaosIntensity;
            uniform float u_mouseIntensity;
            uniform float u_clickIntensity;
            uniform float u_densityVariation;
            uniform float u_geometryType;
            uniform float u_chaos;
            uniform float u_morph;
            uniform float u_touchMorph;
            uniform float u_touchChaos;
            uniform float u_scrollParallax;
            uniform float u_gridDensityShift;
            uniform float u_colorScrollShift;
            uniform float u_audioDensityBoost;
            uniform float u_audioMorphBoost;
            uniform float u_audioSpeedBoost;
            uniform float u_audioChaosBoost;
            uniform float u_audioColorShift;
            uniform float u_rot4dXW;
            uniform float u_rot4dYW;
            uniform float u_rot4dZW;
            
            // 4D rotation matrices
            mat4 rotateXW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(c, 0, 0, -s, 0, 1, 0, 0, 0, 0, 1, 0, s, 0, 0, c);
            }
            
            mat4 rotateYW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(1, 0, 0, 0, 0, c, 0, -s, 0, 0, 1, 0, 0, s, 0, c);
            }
            
            mat4 rotateZW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, c, -s, 0, 0, s, c);
            }
            
            // 4D to 3D projection
            vec3 project4Dto3D(vec4 p) {
                float w = 2.5 / (2.5 + p.w);
                return vec3(p.x * w, p.y * w, p.z * w);
            }
            
            // Enhanced VIB3 Geometry Library - Higher Fidelity
            float tetrahedronLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                
                // Enhanced tetrahedron vertices with holographic shimmer
                float d1 = length(q);
                float d2 = length(q - vec3(0.35, 0.0, 0.0));
                float d3 = length(q - vec3(0.0, 0.35, 0.0));
                float d4 = length(q - vec3(0.0, 0.0, 0.35));
                float d5 = length(q - vec3(0.2, 0.2, 0.0));
                float d6 = length(q - vec3(0.2, 0.0, 0.2));
                float d7 = length(q - vec3(0.0, 0.2, 0.2));
                
                float vertices = 1.0 - smoothstep(0.0, 0.03, min(min(min(d1, d2), min(d3, d4)), min(min(d5, d6), d7)));
                
                // Enhanced edge network with interference patterns
                float edges = 0.0;
                float shimmer = sin(u_time * 0.002) * 0.02;
                edges = max(edges, 1.0 - smoothstep(0.0, 0.015, abs(length(q.xy) - (0.18 + shimmer))));
                edges = max(edges, 1.0 - smoothstep(0.0, 0.015, abs(length(q.yz) - (0.18 + shimmer * 0.8))));
                edges = max(edges, 1.0 - smoothstep(0.0, 0.015, abs(length(q.xz) - (0.18 + shimmer * 1.2))));
                
                // Add interference patterns between vertices
                float interference = sin(d1 * 25.0 + u_time * 0.003) * sin(d2 * 22.0 + u_time * 0.0025) * 0.1;
                
                // Volumetric density based on distance field
                float volume = exp(-length(q) * 3.0) * 0.15;
                
                return max(vertices, edges * 0.7) + interference + volume;
            }
            
            float hypercubeLattice(vec3 p, float gridSize) {
                vec3 grid = fract(p * gridSize);
                vec3 q = grid - 0.5;
                
                // Enhanced hypercube with 4D projection effects
                vec3 edges = 1.0 - smoothstep(0.0, 0.025, abs(q));
                float wireframe = max(max(edges.x, edges.y), edges.z);
                
                // Add 4D hypercube vertices (8 corners + 8 hypervertices)
                float vertices = 0.0;
                for(int i = 0; i < 8; i++) {
                    // WebGL 1.0 compatible modulus replacement
                    float iFloat = float(i);
                    vec3 corner = vec3(
                        floor(iFloat - floor(iFloat / 2.0) * 2.0) - 0.5,
                        floor((iFloat / 2.0) - floor((iFloat / 2.0) / 2.0) * 2.0) - 0.5,
                        float(i / 4) - 0.5
                    );
                    float dist = length(q - corner * 0.4);
                    vertices = max(vertices, 1.0 - smoothstep(0.0, 0.04, dist));
                }
                
                // Holographic interference patterns
                float interference = sin(length(q) * 20.0 + u_time * 0.002) * 0.08;
                
                // Cross-dimensional glow
                float glow = exp(-length(q) * 2.5) * 0.12;
                
                return wireframe * 0.8 + vertices + interference + glow;
            }
            
            float sphereLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                float r = length(q);
                return 1.0 - smoothstep(0.2, 0.5, r);
            }
            
            float torusLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                float r1 = sqrt(q.x*q.x + q.y*q.y);
                float r2 = sqrt((r1 - 0.3)*(r1 - 0.3) + q.z*q.z);
                return 1.0 - smoothstep(0.0, 0.1, r2);
            }
            
            float kleinLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize);
                float u = q.x * 2.0 * 3.14159;
                float v = q.y * 2.0 * 3.14159;
                float x = cos(u) * (3.0 + cos(u/2.0) * sin(v) - sin(u/2.0) * sin(2.0*v));
                float klein = length(vec2(x, q.z)) - 0.1;
                return 1.0 - smoothstep(0.0, 0.05, abs(klein));
            }
            
            float fractalLattice(vec3 p, float gridSize) {
                vec3 q = p * gridSize;
                float scale = 1.0;
                float fractal = 0.0;
                for(int i = 0; i < 4; i++) {
                  q = fract(q) - 0.5;
                  fractal += abs(length(q)) / scale;
                  scale *= 2.0;
                  q *= 2.0;
                }
                return 1.0 - smoothstep(0.0, 1.0, fractal);
            }
            
            float waveLattice(vec3 p, float gridSize) {
                vec3 q = p * gridSize;
                float wave = sin(q.x * 2.0) * sin(q.y * 2.0) * sin(q.z * 2.0 + u_time);
                return smoothstep(-0.5, 0.5, wave);
            }
            
            float crystalLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                float d = max(max(abs(q.x), abs(q.y)), abs(q.z));
                return 1.0 - smoothstep(0.3, 0.5, d);
            }
            
            float getDynamicGeometry(vec3 p, float gridSize, float geometryType) {
                // WebGL 1.0 compatible modulus replacement
                float baseGeomFloat = geometryType - floor(geometryType / 8.0) * 8.0;
                int baseGeom = int(baseGeomFloat);
                float variation = floor(geometryType / 8.0) / 4.0;
                float variedGridSize = gridSize * (0.5 + variation * 1.5);
                
                if (baseGeom == 0) return tetrahedronLattice(p, variedGridSize);
                else if (baseGeom == 1) return hypercubeLattice(p, variedGridSize);
                else if (baseGeom == 2) return sphereLattice(p, variedGridSize);
                else if (baseGeom == 3) return torusLattice(p, variedGridSize);
                else if (baseGeom == 4) return kleinLattice(p, variedGridSize);
                else if (baseGeom == 5) return fractalLattice(p, variedGridSize);
                else if (baseGeom == 6) return waveLattice(p, variedGridSize);
                else return crystalLattice(p, variedGridSize);
            }
            
            vec3 hsv2rgb(vec3 c) {
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }
            
            vec3 rgbGlitch(vec3 color, vec2 uv, float intensity) {
                vec2 offset = vec2(intensity * 0.005, 0.0);
                float r = color.r + sin(uv.y * 30.0 + u_time * 0.001) * intensity * 0.06;
                float g = color.g + sin(uv.y * 28.0 + u_time * 0.0012) * intensity * 0.06;
                float b = color.b + sin(uv.y * 32.0 + u_time * 0.0008) * intensity * 0.06;
                return vec3(r, g, b);
            }
            
            float moirePattern(vec2 uv, float intensity) {
                float freq1 = 12.0 + intensity * 6.0 + u_densityVariation * 3.0;
                float freq2 = 14.0 + intensity * 8.0 + u_densityVariation * 4.0;
                float pattern1 = sin(uv.x * freq1) * sin(uv.y * freq1);
                float pattern2 = sin(uv.x * freq2) * sin(uv.y * freq2);
                return (pattern1 * pattern2) * intensity * 0.15;
            }
            
            float gridOverlay(vec2 uv, float intensity) {
                vec2 grid = fract(uv * (8.0 + u_densityVariation * 4.0));
                float lines = 0.0;
                lines = max(lines, 1.0 - smoothstep(0.0, 0.02, abs(grid.x - 0.5)));
                lines = max(lines, 1.0 - smoothstep(0.0, 0.02, abs(grid.y - 0.5)));
                return lines * intensity * 0.1;
            }
            
            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                float aspectRatio = u_resolution.x / u_resolution.y;
                uv.x *= aspectRatio;
                uv -= 0.5;
                
                float time = u_time * 0.0004 * u_speed * u_roleSpeed;
                
                float mouseInfluence = u_mouseIntensity * 0.25; // FIX: Reduce mouse jarring by 50%
                vec2 mouseOffset = (u_mouse - 0.5) * mouseInfluence;
                
                float parallaxOffset = u_scrollParallax * 0.2;
                vec2 scrollOffset = vec2(parallaxOffset * 0.1, parallaxOffset * 0.05);
                
                float morphOffset = u_touchMorph * 0.3;
                
                vec4 p4d = vec4(uv + mouseOffset * 0.1 + scrollOffset, 
                               sin(time * 0.1 + morphOffset) * 0.15, 
                               cos(time * 0.08 + morphOffset * 0.5) * 0.15);
                
                float scrollRotation = u_scrollParallax * 0.1;
                float touchRotation = u_touchMorph * 0.2;
                
                // Combine manual rotation with automatic/interactive rotation
                p4d = rotateXW(u_rot4dXW + time * 0.2 + mouseOffset.y * 0.5 + scrollRotation) * p4d;
                p4d = rotateYW(u_rot4dYW + time * 0.15 + mouseOffset.x * 0.5 + touchRotation) * p4d;
                p4d = rotateZW(u_rot4dZW + time * 0.25 + u_clickIntensity * 0.3 + u_touchChaos * 0.4) * p4d;
                
                vec3 p = project4Dto3D(p4d);
                
                float scrollDensityMod = 1.0 + u_gridDensityShift * 0.3;
                float audioDensityMod = 1.0 + u_audioDensityBoost * 0.5;
                // FIX: Prevent density doubling by using base density with controlled variations
                float baseDensity = u_density * u_roleDensity;
                float densityVariations = (u_densityVariation * 0.3 + (scrollDensityMod - 1.0) * 0.4 + (audioDensityMod - 1.0) * 0.2);
                float roleDensity = baseDensity + densityVariations;
                
                float morphedGeometry = u_geometryType + u_morph * 3.0 + u_touchMorph * 2.0 + u_audioMorphBoost * 1.5;
                float lattice = getDynamicGeometry(p, roleDensity, morphedGeometry);
                
                // Enhanced holographic color processing
                vec3 baseColor = u_color;
                float latticeIntensity = lattice * u_intensity;
                
                // Multi-layer color composition for higher fidelity
                vec3 color = baseColor * (0.2 + latticeIntensity * 0.8);
                
                // Holographic shimmer layers
                vec3 shimmer1 = baseColor * lattice * 0.5;
                vec3 shimmer2 = baseColor * sin(lattice * 8.0 + u_time * 0.001) * 0.2;
                vec3 shimmer3 = baseColor * cos(lattice * 12.0 + u_time * 0.0008) * 0.15;
                
                color += shimmer1 + shimmer2 + shimmer3;
                
                // Enhanced brightness variations with interference
                color += vec3(lattice * 0.6) * baseColor;
                color += vec3(sin(lattice * 15.0) * 0.1) * baseColor;
                
                // Depth-based coloring for 3D effect
                float depth = 1.0 - length(p) * 0.3;
                color *= (0.7 + depth * 0.3);
                
                float enhancedChaos = u_chaos + u_chaosIntensity + u_touchChaos * 0.3 + u_audioChaosBoost * 0.4;
                color += vec3(moirePattern(uv + scrollOffset, enhancedChaos));
                color += vec3(gridOverlay(uv, u_mouseIntensity + u_scrollParallax * 0.1));
                color = rgbGlitch(color, uv, enhancedChaos);
                
                // Apply morph distortion to position
                vec2 morphDistortion = vec2(sin(uv.y * 10.0 + u_time * 0.001) * u_morph * 0.1, 
                                           cos(uv.x * 10.0 + u_time * 0.001) * u_morph * 0.1);
                color = mix(color, color * (1.0 + length(morphDistortion)), u_morph * 0.5);
                
                // Enhanced holographic interaction effects
                float mouseDist = length(uv - (u_mouse - 0.5) * vec2(aspectRatio, 1.0));
                
                // Multi-layer mouse glow with holographic ripples
                float mouseGlow = exp(-mouseDist * 1.2) * u_mouseIntensity * 0.25;
                float mouseRipple = sin(mouseDist * 15.0 - u_time * 0.003) * exp(-mouseDist * 2.0) * u_mouseIntensity * 0.1;
                color += vec3(mouseGlow + mouseRipple) * baseColor * 0.8;
                
                // Enhanced click pulse with interference
                float clickPulse = u_clickIntensity * exp(-mouseDist * 1.8) * 0.4;
                float clickRing = sin(mouseDist * 20.0 - u_clickIntensity * 5.0) * u_clickIntensity * 0.15;
                color += vec3(clickPulse + clickRing, (clickPulse + clickRing) * 0.6, (clickPulse + clickRing) * 1.2);
                
                // Holographic interference from interactions
                float interference = sin(mouseDist * 25.0 + u_time * 0.002) * u_mouseIntensity * 0.05;
                color += vec3(interference) * baseColor;
                
                gl_FragColor = vec4(color, 0.95);
            }
        `;this.program=this.createProgram(t,e),this.uniforms={resolution:this.gl.getUniformLocation(this.program,"u_resolution"),time:this.gl.getUniformLocation(this.program,"u_time"),mouse:this.gl.getUniformLocation(this.program,"u_mouse"),geometry:this.gl.getUniformLocation(this.program,"u_geometry"),density:this.gl.getUniformLocation(this.program,"u_density"),speed:this.gl.getUniformLocation(this.program,"u_speed"),color:this.gl.getUniformLocation(this.program,"u_color"),intensity:this.gl.getUniformLocation(this.program,"u_intensity"),roleDensity:this.gl.getUniformLocation(this.program,"u_roleDensity"),roleSpeed:this.gl.getUniformLocation(this.program,"u_roleSpeed"),colorShift:this.gl.getUniformLocation(this.program,"u_colorShift"),chaosIntensity:this.gl.getUniformLocation(this.program,"u_chaosIntensity"),mouseIntensity:this.gl.getUniformLocation(this.program,"u_mouseIntensity"),clickIntensity:this.gl.getUniformLocation(this.program,"u_clickIntensity"),densityVariation:this.gl.getUniformLocation(this.program,"u_densityVariation"),geometryType:this.gl.getUniformLocation(this.program,"u_geometryType"),chaos:this.gl.getUniformLocation(this.program,"u_chaos"),morph:this.gl.getUniformLocation(this.program,"u_morph"),touchMorph:this.gl.getUniformLocation(this.program,"u_touchMorph"),touchChaos:this.gl.getUniformLocation(this.program,"u_touchChaos"),scrollParallax:this.gl.getUniformLocation(this.program,"u_scrollParallax"),gridDensityShift:this.gl.getUniformLocation(this.program,"u_gridDensityShift"),colorScrollShift:this.gl.getUniformLocation(this.program,"u_colorScrollShift"),audioDensityBoost:this.gl.getUniformLocation(this.program,"u_audioDensityBoost"),audioMorphBoost:this.gl.getUniformLocation(this.program,"u_audioMorphBoost"),audioSpeedBoost:this.gl.getUniformLocation(this.program,"u_audioSpeedBoost"),audioChaosBoost:this.gl.getUniformLocation(this.program,"u_audioChaosBoost"),audioColorShift:this.gl.getUniformLocation(this.program,"u_audioColorShift"),rot4dXW:this.gl.getUniformLocation(this.program,"u_rot4dXW"),rot4dYW:this.gl.getUniformLocation(this.program,"u_rot4dYW"),rot4dZW:this.gl.getUniformLocation(this.program,"u_rot4dZW")}}createProgram(t,e){const i=this.createShader(this.gl.VERTEX_SHADER,t),s=this.createShader(this.gl.FRAGMENT_SHADER,e),o=this.gl.createProgram();if(this.gl.attachShader(o,i),this.gl.attachShader(o,s),this.gl.linkProgram(o),!this.gl.getProgramParameter(o,this.gl.LINK_STATUS))throw new Error("Program linking failed: "+this.gl.getProgramInfoLog(o));return o}createShader(t,e){if(!this.gl)throw console.error("❌ Cannot create shader: WebGL context is null"),new Error("WebGL context is null");if(this.gl.isContextLost())throw console.error("❌ Cannot create shader: WebGL context is lost"),new Error("WebGL context is lost");try{const i=this.gl.createShader(t);if(!i)throw console.error("❌ Failed to create shader object - WebGL context may be invalid"),new Error("Failed to create shader object - WebGL context may be invalid");if(this.gl.shaderSource(i,e),this.gl.compileShader(i),!this.gl.getShaderParameter(i,this.gl.COMPILE_STATUS)){const s=this.gl.getShaderInfoLog(i),o=t===this.gl.VERTEX_SHADER?"vertex":"fragment";throw s?(console.error(`❌ ${o} shader compilation failed:`,s),new Error(`${o} shader compilation failed: ${s}`)):(console.error(`❌ ${o} shader compilation failed: WebGL returned no error info (context may be invalid)`),new Error(`${o} shader compilation failed: WebGL returned no error info (context may be invalid)`))}return i}catch(i){throw console.error("❌ Exception during shader creation:",i),i}}initBuffers(){const t=new Float32Array([-1,-1,1,-1,-1,1,1,1]);this.buffer=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.buffer),this.gl.bufferData(this.gl.ARRAY_BUFFER,t,this.gl.STATIC_DRAW);const e=this.gl.getAttribLocation(this.program,"a_position");this.gl.enableVertexAttribArray(e),this.gl.vertexAttribPointer(e,2,this.gl.FLOAT,!1,0,0)}resize(){const t=Math.min(window.devicePixelRatio||1,2),e=this.canvas.clientWidth,i=this.canvas.clientHeight;(this.canvas.width!==e*t||this.canvas.height!==i*t)&&(this.canvas.width=e*t,this.canvas.height=i*t,this.gl.viewport(0,0,this.canvas.width,this.canvas.height))}showWebGLError(){if(!this.canvas)return;const t=this.canvas.getContext("2d");t&&(t.fillStyle="#000",t.fillRect(0,0,this.canvas.width,this.canvas.height),t.fillStyle="#ff64ff",t.font="16px Orbitron, monospace",t.textAlign="center",t.fillText("WebGL Required",this.canvas.width/2,this.canvas.height/2),t.fillStyle="#888",t.font="12px Orbitron, monospace",t.fillText("Please enable WebGL in your browser",this.canvas.width/2,this.canvas.height/2+25))}updateInteraction(t,e,i){this.mouseX=t,this.mouseY=e,this.mouseIntensity=i*this.roleParams.mouseReactivity*this.reactivity}triggerClick(t,e){this.clickIntensity=Math.min(1,this.clickIntensity+this.roleParams.clickReactivity*this.reactivity)}updateDensity(t){this.densityTarget=t}updateTouch(t,e,i){this.touchX=t,this.touchY=e,this.touchActive=i,this.touchMorph=(t-.5)*2,this.touchChaos=Math.abs(e-.5)*2}updateScroll(t){this.scrollVelocity+=t*.001,this.scrollVelocity=Math.max(-2,Math.min(2,this.scrollVelocity))}updateAudio_DISABLED(){}updateScrollPhysics(){this.scrollPosition+=this.scrollVelocity,this.scrollVelocity*=this.scrollDecay,this.parallaxDepth=Math.sin(this.scrollPosition*.1)*.5,this.gridDensityShift=Math.sin(this.scrollPosition*.05)*.3,this.colorScrollShift=this.scrollPosition*.02%(Math.PI*2)}render(){if(!this.program)return;this.resize(),this.gl.useProgram(this.program),this.densityVariation+=(this.densityTarget-this.densityVariation)*.05,this.clickIntensity*=this.clickDecay,this.updateScrollPhysics();const t=Date.now()-this.startTime,e=(this.variantParams.hue||0)/360,i=this.variantParams.saturation||.8,s=Math.max(.2,Math.min(.8,this.variantParams.intensity||.5)),a=((p,y,f)=>{let g,v,x;if(y===0)g=v=x=f;else{const S=(C,A,E)=>(E<0&&(E+=1),E>1&&(E-=1),E<.16666666666666666?C+(A-C)*6*E:E<.5?A:E<.6666666666666666?C+(A-C)*(.6666666666666666-E)*6:C),I=f<.5?f*(1+y):f+y-f*y,L=2*f-I;g=S(L,I,p+1/3),v=S(L,I,p),x=S(L,I,p-1/3)}return[g,v,x]})(e,i,s);this.gl.uniform2f(this.uniforms.resolution,this.canvas.width,this.canvas.height),this.gl.uniform1f(this.uniforms.time,t),this.gl.uniform2f(this.uniforms.mouse,this.mouseX,this.mouseY),this.gl.uniform1f(this.uniforms.geometryType,this.variantParams.geometryType||0),this.gl.uniform1f(this.uniforms.density,this.variantParams.density||1);const r=(this.variantParams.speed||.5)*.2,n=(this.audioSpeedBoost||0)*.1;this.gl.uniform1f(this.uniforms.speed,r+n),this.gl.uniform3fv(this.uniforms.color,new Float32Array(a)),this.gl.uniform1f(this.uniforms.intensity,(this.variantParams.intensity||.5)*this.roleParams.intensity),this.gl.uniform1f(this.uniforms.roleDensity,this.roleParams.densityMult),this.gl.uniform1f(this.uniforms.roleSpeed,this.roleParams.speedMult),this.gl.uniform1f(this.uniforms.colorShift,this.roleParams.colorShift+(this.variantParams.hue||0)/360),this.gl.uniform1f(this.uniforms.chaosIntensity,this.variantParams.chaos||0),this.gl.uniform1f(this.uniforms.mouseIntensity,this.mouseIntensity),this.gl.uniform1f(this.uniforms.clickIntensity,this.clickIntensity),this.gl.uniform1f(this.uniforms.densityVariation,this.densityVariation),this.gl.uniform1f(this.uniforms.geometryType,this.variantParams.geometryType!==void 0?this.variantParams.geometryType:this.variant||0),this.gl.uniform1f(this.uniforms.chaos,this.variantParams.chaos||0),this.gl.uniform1f(this.uniforms.morph,this.variantParams.morph||0),this.gl.uniform1f(this.uniforms.touchMorph,this.touchMorph),this.gl.uniform1f(this.uniforms.touchChaos,this.touchChaos),this.gl.uniform1f(this.uniforms.scrollParallax,this.parallaxDepth),this.gl.uniform1f(this.uniforms.gridDensityShift,this.gridDensityShift),this.gl.uniform1f(this.uniforms.colorScrollShift,this.colorScrollShift);let l=0,h=0,d=0,u=0,m=0;window.audioEnabled&&window.audioReactive&&(l=window.audioReactive.bass*1.5,h=window.audioReactive.mid*1.2,d=window.audioReactive.high*.8,u=window.audioReactive.energy*.6,m=window.audioReactive.bass*45,Date.now()%1e4<16&&console.log(`✨ Holographic audio reactivity: Density+${l.toFixed(2)} Morph+${h.toFixed(2)} Speed+${d.toFixed(2)} Chaos+${u.toFixed(2)} Color+${m.toFixed(1)}`)),this.gl.uniform1f(this.uniforms.audioDensityBoost,l),this.gl.uniform1f(this.uniforms.audioMorphBoost,h),this.gl.uniform1f(this.uniforms.audioSpeedBoost,d),this.gl.uniform1f(this.uniforms.audioChaosBoost,u),this.gl.uniform1f(this.uniforms.audioColorShift,m),this.gl.uniform1f(this.uniforms.rot4dXW,this.variantParams.rot4dXW||0),this.gl.uniform1f(this.uniforms.rot4dYW,this.variantParams.rot4dYW||0),this.gl.uniform1f(this.uniforms.rot4dZW,this.variantParams.rot4dZW||0),this.gl.drawArrays(this.gl.TRIANGLE_STRIP,0,4)}reinitializeContext(){var t,e,i,s,o;if(console.log(`🔄 Reinitializing WebGL context for ${(t=this.canvas)==null?void 0:t.id}`),this.program=null,this.buffer=null,this.uniforms=null,this.gl=null,this.gl=this.canvas.getContext("webgl2")||this.canvas.getContext("webgl")||this.canvas.getContext("experimental-webgl"),!this.gl)return console.error(`❌ No WebGL context available for ${(e=this.canvas)==null?void 0:e.id} - SmartCanvasPool should have created one`),!1;if(this.gl.isContextLost())return console.error(`❌ WebGL context is lost for ${(i=this.canvas)==null?void 0:i.id}`),!1;try{return this.initShaders(),this.initBuffers(),this.resize(),console.log(`✅ ${(s=this.canvas)==null?void 0:s.id}: Holographic context reinitialized successfully`),!0}catch(a){return console.error(`❌ Failed to reinitialize holographic WebGL resources for ${(o=this.canvas)==null?void 0:o.id}:`,a),!1}}updateParameters(t){this.variantParams&&Object.keys(t).forEach(e=>{const i=this.mapParameterName(e);if(i!==null){let s=t[e];e==="gridDensity"&&(s=.3+(parseFloat(t[e])-5)/95*2.2,console.log(`🔧 Density scaling: gridDensity=${t[e]} → density=${s.toFixed(3)} (normal range)`)),this.variantParams[i]=s,i==="geometryType"&&(this.roleParams=this.generateRoleParams(this.role))}})}mapParameterName(t){return{gridDensity:"density",morphFactor:"morph",rot4dXW:"rot4dXW",rot4dYW:"rot4dYW",rot4dZW:"rot4dZW",hue:"hue",intensity:"intensity",saturation:"saturation",chaos:"chaos",speed:"speed",geometry:"geometryType"}[t]||t}}class at{constructor(){this.visualizers=[],this.currentVariant=0,this.baseVariants=30,this.totalVariants=30,this.isActive=!1,this.audioEnabled=!1,this.audioContext=null,this.analyser=null,this.frequencyData=null,this.audioData={bass:0,mid:0,high:0},this.variantNames=["TETRAHEDRON LATTICE","TETRAHEDRON FIELD","TETRAHEDRON MATRIX","TETRAHEDRON RESONANCE","HYPERCUBE LATTICE","HYPERCUBE FIELD","HYPERCUBE MATRIX","HYPERCUBE QUANTUM","SPHERE LATTICE","SPHERE FIELD","SPHERE MATRIX","SPHERE RESONANCE","TORUS LATTICE","TORUS FIELD","TORUS MATRIX","TORUS QUANTUM","KLEIN BOTTLE LATTICE","KLEIN BOTTLE FIELD","KLEIN BOTTLE MATRIX","KLEIN BOTTLE QUANTUM","FRACTAL LATTICE","FRACTAL FIELD","FRACTAL QUANTUM","WAVE LATTICE","WAVE FIELD","WAVE QUANTUM","CRYSTAL LATTICE","CRYSTAL FIELD","CRYSTAL MATRIX","CRYSTAL QUANTUM"],this.initialize()}initialize(){console.log("🎨 Initializing REAL Holographic System for Active Holograms tab..."),this.createVisualizers(),this.updateVariantDisplay(),this.startRenderLoop()}createVisualizers(){const t=[{id:"holo-background-canvas",role:"background",reactivity:.5},{id:"holo-shadow-canvas",role:"shadow",reactivity:.7},{id:"holo-content-canvas",role:"content",reactivity:.9},{id:"holo-highlight-canvas",role:"highlight",reactivity:1.1},{id:"holo-accent-canvas",role:"accent",reactivity:1.5}];let e=0;t.forEach(i=>{try{if(!document.getElementById(i.id)){console.error(`❌ Canvas not found: ${i.id}`);return}console.log(`🔍 Creating holographic visualizer for: ${i.id}`);const o=new rt(i.id,i.role,i.reactivity,this.currentVariant);o.gl?(this.visualizers.push(o),e++,console.log(`✅ Created REAL holographic layer: ${i.role} (${i.id})`)):console.error(`❌ No WebGL context for: ${i.id}`)}catch(s){console.error(`❌ Failed to create REAL holographic layer ${i.id}:`,s)}}),console.log(`✅ Created ${e}/5 REAL holographic layers`),e===0&&console.error("🚨 NO HOLOGRAPHIC VISUALIZERS CREATED! Check canvas elements and WebGL support.")}setActive(t){if(this.isActive=t,t){const e=document.getElementById("holographicLayers");e&&(e.style.display="block"),!this.audioEnabled&&window.audioEnabled===!0&&this.initAudio(),console.log("🌌 REAL Active Holograms ACTIVATED with audio reactivity")}else{const e=document.getElementById("holographicLayers");e&&(e.style.display="none"),console.log("🌌 REAL Active Holograms DEACTIVATED")}}updateVariantDisplay(){const t=this.variantNames[this.currentVariant];return{variant:this.currentVariant,name:t,geometryType:Math.floor(this.currentVariant/4)}}nextVariant(){this.updateVariant(this.currentVariant+1)}previousVariant(){this.updateVariant(this.currentVariant-1)}randomVariant(){const t=Math.floor(Math.random()*this.totalVariants);this.updateVariant(t)}setVariant(t){this.updateVariant(t)}updateParameter(t,e){this.customParams||(this.customParams={}),this.customParams[t]=e,console.log(`🌌 Updating holographic ${t}: ${e} (${this.visualizers.length} visualizers)`),this.visualizers.forEach((i,s)=>{try{if(i.updateParameters){const o={};o[t]=e,i.updateParameters(o),console.log(`✅ Updated holographic layer ${s} (${i.role}) with ${t}=${e}`)}else console.warn(`⚠️ Holographic layer ${s} missing updateParameters method, using fallback`),i.variantParams&&(i.variantParams[t]=e,t==="geometryType"&&(i.roleParams=i.generateRoleParams(i.role)),i.render&&i.render())}catch(o){console.error(`❌ Failed to update holographic layer ${s}:`,o)}}),console.log(`🔄 Holographic parameter update complete: ${t}=${e}`)}updateVariant(t){t<0&&(t=this.totalVariants-1),t>=this.totalVariants&&(t=0),this.currentVariant=t,this.visualizers.forEach(e=>{e.variant=this.currentVariant,e.variantParams=e.generateVariantParams(this.currentVariant),e.roleParams=e.generateRoleParams(e.role),this.customParams&&Object.keys(this.customParams).forEach(i=>{e.variantParams[i]=this.customParams[i]})}),this.updateVariantDisplay(),console.log(`🔄 REAL Holograms switched to variant ${this.currentVariant+1}: ${this.variantNames[this.currentVariant]}`)}getCurrentVariantInfo(){return{variant:this.currentVariant,name:this.variantNames[this.currentVariant],geometryType:Math.floor(this.currentVariant/4)}}getParameters(){var e,i,s,o,a,r,n,l,h,d;const t={geometry:Math.floor(this.currentVariant/4),gridDensity:parseFloat(((e=document.getElementById("gridDensity"))==null?void 0:e.value)||15),morphFactor:parseFloat(((i=document.getElementById("morphFactor"))==null?void 0:i.value)||1),chaos:parseFloat(((s=document.getElementById("chaos"))==null?void 0:s.value)||.2),speed:parseFloat(((o=document.getElementById("speed"))==null?void 0:o.value)||1),hue:parseFloat(((a=document.getElementById("hue"))==null?void 0:a.value)||320),intensity:parseFloat(((r=document.getElementById("intensity"))==null?void 0:r.value)||.6),saturation:parseFloat(((n=document.getElementById("saturation"))==null?void 0:n.value)||.8),rot4dXW:parseFloat(((l=document.getElementById("rot4dXW"))==null?void 0:l.value)||0),rot4dYW:parseFloat(((h=document.getElementById("rot4dYW"))==null?void 0:h.value)||0),rot4dZW:parseFloat(((d=document.getElementById("rot4dZW"))==null?void 0:d.value)||0),variant:this.currentVariant};return this.customParams&&Object.assign(t,this.customParams),console.log("🌌 Holographic system getParameters:",t),t}async initAudio(){try{this.audioContext=new(window.AudioContext||window.webkitAudioContext),this.audioContext.state==="suspended"&&await this.audioContext.resume(),this.analyser=this.audioContext.createAnalyser(),this.analyser.fftSize=256,this.frequencyData=new Uint8Array(this.analyser.frequencyBinCount);const t={audio:{echoCancellation:!1,noiseSuppression:!1,autoGainControl:!1,sampleRate:44100}},e=await navigator.mediaDevices.getUserMedia(t);this.audioContext.createMediaStreamSource(e).connect(this.analyser),this.audioEnabled=!0,console.log("🎵 REAL Holograms audio reactivity enabled")}catch(t){console.error("REAL Holograms audio initialization failed:",t)}}disableAudio(){this.audioEnabled&&(this.audioEnabled=!1,this.audioContext&&(this.audioContext.close(),this.audioContext=null),this.analyser=null,this.frequencyData=null,this.audioData={bass:0,mid:0,high:0},console.log("🎵 REAL Holograms audio reactivity disabled"))}updateAudio(){if(!this.audioEnabled||!this.analyser||!this.isActive||window.audioEnabled===!1)return;this.analyser.getByteFrequencyData(this.frequencyData);const t=Math.floor(this.frequencyData.length*.1),e=Math.floor(this.frequencyData.length*.4);let i=0,s=0,o=0;for(let r=0;r<t;r++)i+=this.frequencyData[r];i/=t*255;for(let r=t;r<e;r++)s+=this.frequencyData[r];s/=(e-t)*255;for(let r=e;r<this.frequencyData.length;r++)o+=this.frequencyData[r];o/=(this.frequencyData.length-e)*255;const a={bass:this.smoothAudioValue(i,"bass"),mid:this.smoothAudioValue(s,"mid"),high:this.smoothAudioValue(o,"high"),energy:(i+s+o)/3,rhythm:this.detectRhythm(i),melody:this.detectMelody(s,o)};this.audioData=a,window.audioReactivitySettings&&this.applyAudioReactivityGrid(a),this.visualizers.forEach(r=>{r.updateAudio(this.audioData)})}smoothAudioValue(t,e){this.audioSmoothing||(this.audioSmoothing={bass:0,mid:0,high:0});const i=.4;return this.audioSmoothing[e]=this.audioSmoothing[e]*i+t*(1-i),this.audioSmoothing[e]>.05?this.audioSmoothing[e]:0}detectRhythm(t){this.previousBass||(this.previousBass=0);const e=t>this.previousBass+.2;return this.previousBass=t,e?1:0}detectMelody(t,e){const i=(t+e)/2;return i>.3?i:0}applyAudioReactivityGrid(t){const e=window.audioReactivitySettings;if(!e||e.activeVisualModes.size===0)return;const i=e.sensitivity[e.activeSensitivity];e.activeVisualModes.forEach(s=>{const[o,a]=s.split("-"),r=e.visualModes[a];if(!r)return;const n=t.energy*i,l=t.bass*i,h=t.rhythm*i;r.forEach(d=>{let u=0;switch(d){case"hue":this.audioHueBase||(this.audioHueBase=320),this.audioHueBase+=n*5,u=this.audioHueBase%360;break;case"saturation":u=Math.min(1,.6+h*.4);break;case"intensity":u=Math.min(1,.4+n*.6);break;case"morphFactor":u=Math.min(2,1+l*1);break;case"gridDensity":u=Math.min(100,15+h*50);break;case"chaos":u=Math.min(1,n*.8);break;case"speed":u=Math.min(3,1+n*2);break;case"rot4dXW":this.audioRotationXW||(this.audioRotationXW=0),this.audioRotationXW+=l*.1,u=this.audioRotationXW%(Math.PI*2);break;case"rot4dYW":this.audioRotationYW||(this.audioRotationYW=0),this.audioRotationYW+=t.mid*i*.08,u=this.audioRotationYW%(Math.PI*2);break;case"rot4dZW":this.audioRotationZW||(this.audioRotationZW=0),this.audioRotationZW+=t.high*i*.06,u=this.audioRotationZW%(Math.PI*2);break}window.updateParameter&&u!==void 0&&window.updateParameter(d,u.toFixed(2))})})}removedSetupCenterDistanceReactivity(){{console.log("✨ Holographic built-in reactivity DISABLED - ReactivityManager active");return}}updateHolographicShimmer(t,e){const i=(t-.5)*Math.PI,s=(e-.5)*Math.PI,o=320,r=Math.sin(i*2)*Math.cos(s*2)*120,n=(o+r+360)%360,l=.4+.5*Math.abs(Math.sin(i)*Math.cos(s)),h=.7+.3*Math.abs(Math.cos(i*1.5)*Math.sin(s*1.5)),d=1+.15*Math.sin(i*.8)*Math.cos(s*.8);window.updateParameter&&(window.updateParameter("hue",Math.round(n)),window.updateParameter("intensity",l.toFixed(2)),window.updateParameter("saturation",h.toFixed(2)),window.updateParameter("morphFactor",d.toFixed(2))),console.log(`✨ Holographic shimmer: angle=(${i.toFixed(2)}, ${s.toFixed(2)}) → Hue=${Math.round(n)}, Intensity=${l.toFixed(2)}`)}triggerHolographicColorBurst(t,e){const o=Math.sqrt((t-.5)**2+(e-.5)**2);this.colorBurstIntensity=1,this.burstHueShift=180,this.burstIntensityBoost=.7,this.burstSaturationSpike=.8,this.burstChaosEffect=.6,this.burstSpeedBoost=1.8,console.log(`🌈💥 HOLOGRAPHIC COLOR BURST: position=(${t.toFixed(2)}, ${e.toFixed(2)}), distance=${o.toFixed(3)}`)}startHolographicColorBurstLoop(){const t=()=>{if(this.colorBurstIntensity>.01){const e=this.colorBurstIntensity;if(this.burstHueShift>1){const o=(320+this.burstHueShift*Math.sin(e*Math.PI*2))%360;window.updateParameter&&window.updateParameter("hue",Math.round(o)),this.burstHueShift*=.93}if(this.burstIntensityBoost>.01){const s=Math.min(1,.5+this.burstIntensityBoost*e);window.updateParameter&&window.updateParameter("intensity",s.toFixed(2)),this.burstIntensityBoost*=.92}if(this.burstSaturationSpike>.01){const s=Math.min(1,.8+this.burstSaturationSpike*e);window.updateParameter&&window.updateParameter("saturation",s.toFixed(2)),this.burstSaturationSpike*=.91}if(this.burstChaosEffect>.01){const s=.2+this.burstChaosEffect*e;window.updateParameter&&window.updateParameter("chaos",s.toFixed(2)),this.burstChaosEffect*=.9}if(this.burstSpeedBoost>.01){const s=1+this.burstSpeedBoost*e;window.updateParameter&&window.updateParameter("speed",s.toFixed(2)),this.burstSpeedBoost*=.89}this.colorBurstIntensity*=.94}this.isActive&&requestAnimationFrame(t)};t()}startRenderLoop(){const t=()=>{this.isActive&&(this.updateAudio(),this.visualizers.forEach(e=>{e.render()})),requestAnimationFrame(t)};t(),console.log("🎬 REAL Holographic render loop started")}getVariantName(t=this.currentVariant){return this.variantNames[t]||"UNKNOWN"}destroy(){this.visualizers.forEach(t=>{t.destroy&&t.destroy()}),this.visualizers=[],this.audioContext&&this.audioContext.close(),console.log("🧹 REAL Holographic System destroyed")}}class nt{constructor(t){this.container=t,this.activeLayers=new Map,this.layerDefinitions={faceted:[{id:"background-canvas",role:"background",reactivity:.5},{id:"shadow-canvas",role:"shadow",reactivity:.7},{id:"content-canvas",role:"content",reactivity:.9},{id:"highlight-canvas",role:"highlight",reactivity:1.1},{id:"accent-canvas",role:"accent",reactivity:1.5}],quantum:[{id:"quantum-background-canvas",role:"background",reactivity:.4},{id:"quantum-shadow-canvas",role:"shadow",reactivity:.6},{id:"quantum-content-canvas",role:"content",reactivity:1},{id:"quantum-highlight-canvas",role:"highlight",reactivity:1.3},{id:"quantum-accent-canvas",role:"accent",reactivity:1.6}],holographic:[{id:"holo-background-canvas",role:"background",reactivity:.5},{id:"holo-shadow-canvas",role:"shadow",reactivity:.7},{id:"holo-content-canvas",role:"content",reactivity:.9},{id:"holo-highlight-canvas",role:"highlight",reactivity:1.1},{id:"holo-accent-canvas",role:"accent",reactivity:1.5}]}}createLayers(t){this.activeLayers.has(t)&&(console.warn(`⚠️ Layers for ${t} already exist, destroying old ones...`),this.destroyLayers(t));const e=this.layerDefinitions[t];if(!e)throw new Error(`Unknown system: ${t}`);const i=document.createElement("div");i.id=`${t}Layers`,i.className="canvas-layer-system",i.style.cssText=`
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        `;const s=[],o=[];return e.forEach((a,r)=>{const n=document.createElement("canvas");n.id=a.id,n.className=`layer-${a.role}`,n.width=window.innerWidth,n.height=window.innerHeight,n.style.cssText=`
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: ${r+1};
                pointer-events: none;
            `,i.appendChild(n),s.push(n),o.push({canvas:n,id:a.id,role:a.role,reactivity:a.reactivity,index:r}),console.log(`✅ Created layer ${r+1}/5: ${a.id} (${a.role})`)}),this.container.appendChild(i),this.activeLayers.set(t,{canvases:s,layerSpecs:o,wrapper:i}),console.log(`🎨 Created ${s.length}-layer system for: ${t}`),{canvases:s,layerSpecs:o}}destroyLayers(t){const e=this.activeLayers.get(t);if(!e){console.warn(`⚠️ No layers to destroy for: ${t}`);return}console.log(`🧹 Destroying ${e.canvases.length} layers for: ${t}`),e.canvases.forEach((i,s)=>{const o=i.getContext("webgl")||i.getContext("webgl2");if(o){const r=o.getExtension("WEBGL_lose_context");r&&(r.loseContext(),console.log(`🧹 Lost WebGL context for layer ${s+1}`))}const a=i.getContext("2d");a&&a.clearRect(0,0,i.width,i.height),i.parentNode&&i.parentNode.removeChild(i)}),e.wrapper&&e.wrapper.parentNode&&e.wrapper.parentNode.removeChild(e.wrapper),this.activeLayers.delete(t),console.log(`✅ Destroyed all layers for: ${t}`)}switchSystem(t,e){console.log(`🔄 Switching from ${t} to ${e}...`),t&&this.activeLayers.has(t)&&this.destroyLayers(t);const i=this.createLayers(e);return console.log(`✅ System switch complete: ${t} → ${e}`),i}getLayers(t){return this.activeLayers.get(t)}hasLayers(t){return this.activeLayers.has(t)}handleResize(){const t=window.innerWidth,e=window.innerHeight;this.activeLayers.forEach((i,s)=>{i.canvases.forEach(o=>{o.width=t,o.height=e}),console.log(`📐 Resized ${i.canvases.length} canvases for ${s}`)})}hideLayers(t){const e=this.activeLayers.get(t);e&&e.wrapper&&(e.wrapper.style.display="none",console.log(`👁️ Hidden layers for: ${t}`))}showLayers(t){const e=this.activeLayers.get(t);e&&e.wrapper&&(e.wrapper.style.display="block",console.log(`👁️ Showing layers for: ${t}`))}destroyAll(){console.log("🧹 Destroying all active canvas systems..."),Array.from(this.activeLayers.keys()).forEach(e=>{this.destroyLayers(e)}),console.log("✅ All canvas systems destroyed")}}class ct{constructor(){this.currentSystem="faceted",this.systemSwitchInProgress=!1,this.systems={faceted:{engine:null,canvases:[],active:!0},quantum:{engine:null,canvases:[],active:!1},holographic:{engine:null,canvases:[],active:!1}},this.canvasManager=null,this.baseParams={geometry:1,gridDensity:15,morphFactor:1,chaos:.2,speed:1,hue:200,intensity:.5,saturation:.8,rot4dXW:0,rot4dYW:0,rot4dZW:0},this.audioContext=null,this.audioElement=null,this.audioReactive=!0,this.reactivityStrength=.5,this.sequences=[],this.currentTime=0,this.duration=0,this.isPlaying=!1,this.activeColorPalette=null,this.activeSweeps={},this.choreographyMode="dynamic",this.lastModeChange=0,this.patternTemplates={},this.sectionPatterns=[],this.songStructure="",this.recordingEngine=null,this.audioAnalyzer=null,this.sequenceMonitorInterval=null,this.performanceMonitor=null,this.presetManager=null,this.keyboardController=null}async init(){console.log("🎬 Initializing Choreographer..."),this.performanceMonitor=new B,this.presetManager=new _(this),this.keyboardController=new $(this),await this.initCanvases(),await this.initCurrentSystem(),this.performanceMonitor.start(),this.setupAudio(),this.setupUI(),this.recordingEngine=new P(this),this.audioAnalyzer=new F(this),console.log("✅ Choreographer ready!")}async initCanvases(){const t=document.getElementById("stage-container");if(!t)throw new Error("stage-container element not found");this.canvasManager=new nt(t),console.log("✅ Canvas layer manager initialized")}async initCurrentSystem(){await this.createSystem(this.currentSystem)}async createSystem(t){console.log(`🔧 Creating ${t} system...`);const e=this.systems[t],i=console.log,s={};if(console.log=(...r)=>{const l=r.join(" ").substring(0,50),h=Date.now();(!s[l]||h-s[l]>1e3)&&(s[l]=h,i.apply(console,r))},e.engine&&await this.destroySystem(t),!this.canvasManager)throw new Error("CanvasLayerManager not initialized");const{canvases:o,layerSpecs:a}=this.canvasManager.createLayers(t);e.canvases=o,console.log(`✅ Created ${o.length} layers for ${t}`),await new Promise(r=>requestAnimationFrame(r)),await new Promise(r=>requestAnimationFrame(r));try{t==="faceted"?(e.engine=new it,console.log("✅ Faceted engine created (stub)")):t==="quantum"?(e.engine=new st,console.log("✅ Quantum engine created (stub)")):t==="holographic"&&(e.engine=new at,console.log("✅ Holographic engine created (stub)"),e.engine.audioEnabled=!1,e.engine.audioContext=null,e.engine.analyser=null,e.engine.initAudio=()=>{},e.engine.updateAudio=()=>{},e.engine.disableAudio=()=>{},e.engine.applyAudioReactivityGrid=()=>{}),this.updateSystemParameters(e.engine),e.engine&&e.engine.setActive&&e.engine.setActive(!0),console.log(`✅ ${t} system created with real WebGL engine`)}catch(r){console.error(`❌ Failed to create ${t}:`,r),console.error("Error details:",r.stack)}finally{console.log=i}}async switchSystem(t){if(t===this.currentSystem)return;console.log(`🔄 Switching from ${this.currentSystem} to ${t}`);const e=this.currentSystem;await this.destroySystem(e),this.currentSystem=t,await this.createSystem(t),document.querySelectorAll(".system-pill").forEach(i=>{i.classList.toggle("active",i.dataset.system===t)}),console.log(`✅ Switched from ${e} to ${t} with proper layer cleanup`)}async destroySystem(t){const e=this.systems[t];console.log(`🗑️ Destroying ${t} system...`),e.engine&&(e.engine.setActive&&e.engine.setActive(!1),e.engine.visualizers&&Array.isArray(e.engine.visualizers)&&(e.engine.visualizers.forEach(i=>{if(i.stop&&i.stop(),i.gl){const s=i.gl.getExtension("WEBGL_lose_context");s&&s.loseContext()}}),e.engine.visualizers=[]),e.engine=null),this.canvasManager&&this.canvasManager.destroyLayers(t),e.canvases=[],console.log(`✅ ${t} destroyed with proper WebGL context cleanup`)}updateSystemParameters(t){t&&Object.entries(this.baseParams).forEach(([e,i])=>{t.parameterManager&&t.parameterManager.setParameter?t.parameterManager.setParameter(e,i):t.updateParameter&&t.updateParameter(e,i)})}setParameter(t,e){this.baseParams[t]=e,Object.values(this.systems).forEach(i=>{if(i.engine){if(i.engine.parameterManager&&i.engine.parameterManager.setParameter&&(i.engine.parameterManager.setParameter(t,e),i.engine.updateVisualizers&&i.engine.updateVisualizers()),i.engine.visualizers&&Array.isArray(i.engine.visualizers)){const s=this.baseParams;i.engine.visualizers.forEach(o=>{o.updateParameters&&o.updateParameters(s)})}i.engine.updateParameter&&i.engine.updateParameter(t,e)}})}getCurrentParameters(){return{...this.baseParams}}setupAudio(){this.audioContext=new(window.AudioContext||window.webkitAudioContext),this.audioAnalyzer&&this.audioAnalyzer.setupAnalyzer(this.audioContext)}async loadAudioFile(t){if(!t)return;const e=URL.createObjectURL(t);this.audioContext.state==="suspended"&&(await this.audioContext.resume(),console.log("🎵 AudioContext resumed")),console.log(`🔍 Audio state check: element=${!!this.audioElement}, source=${!!this.mediaSource}`),this.audioElement&&this.mediaSource?(console.log("🔄 Reusing existing audio element and source"),this.audioElement.pause(),this.audioElement.src=e,this.audioElement.load()):(console.log("🎵 Creating new audio element and Web Audio connection"),this.audioElement&&!this.mediaSource&&console.warn("⚠️  Audio element exists but mediaSource is missing!"),this.audioElement=new Audio(e),this.audioElement.crossOrigin="anonymous",this.mediaSource=this.audioContext.createMediaElementSource(this.audioElement),this.mediaSource.connect(this.analyser),this.analyser.connect(this.audioContext.destination),console.log("✅ Web Audio API connected - mediaSource stored"),console.log(`✅ Verification: element=${!!this.audioElement}, source=${!!this.mediaSource}`)),this.audioAnalyzer&&this.audioAnalyzer.startAnalysisLoop(),this.audioElement.addEventListener("loadedmetadata",()=>{this.duration=this.audioElement.duration,console.log(`🎵 Audio loaded: ${this.duration.toFixed(2)}s`)}),this.audioElement.addEventListener("error",i=>{console.error("Audio element error:",i)})}applyAdvancedChoreography(t){const e=this.reactivityStrength,i=this.systems[this.currentSystem];if(!i.engine)return;const s=(o,a)=>{i.engine.parameterManager&&i.engine.parameterManager.setParameter?i.engine.parameterManager.setParameter(o,a):i.engine.updateParameter&&i.engine.updateParameter(o,a)};k(this.choreographyMode,t,s,e,this.baseParams)}async analyzeSongWithAI(t){if(!t)throw new Error("No API key provided");if(!this.audioElement)throw new Error("No audio file loaded");const e=this.duration||180,i=this.audioAnalyzer&&this.audioAnalyzer.avgBeatInterval>0?(6e4/this.audioAnalyzer.avgBeatInterval).toFixed(0):120,s=`Create a music choreography plan for a ${e.toFixed(0)} second song at ${i} BPM. Return JSON with sections array containing: name, pattern, startTime, duration, system (faceted/quantum/holographic), geometry (0-7), choreographyMode, parameters, colorPalette, parameterSweeps.`,o=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${t}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:s}]}]})});if(!o.ok)throw new Error(`Gemini API error: ${o.status}`);let r=(await o.json()).candidates[0].content.parts[0].text.trim();return r.startsWith("```json")?r=r.replace(/```json\n/,"").replace(/\n```$/,""):r.startsWith("```")&&(r=r.replace(/```\n/,"").replace(/\n```$/,"")),JSON.parse(r)}applyAIChoreography(t){console.log("🎭 Applying AI Choreography:",t),this.sequences=[],t.sections&&Array.isArray(t.sections)&&(this.processPatternRecognition(t.sections).forEach((i,s)=>{const o={name:i.name,startTime:i.startTime,duration:i.duration,system:i.system,geometry:i.geometry,mode:i.choreographyMode,parameters:i.parameters,pattern:i.pattern,colorPalette:i.colorPalette,parameterSweeps:i.parameterSweeps,active:!1};this.sequences.push(o)}),this.startSequenceMonitoring(),this.renderTimeline())}processPatternRecognition(t){const e={};return t.map((i,s)=>{const o=i.pattern;if(!o)return i;e[o]||(e[o]=0),e[o]++;const a=e[o];if(a===1)return this.patternTemplates[o]=this.createPatternTemplate(i,o),i.patternVariation="first",i;const r=this.patternTemplates[o];let n="second";return a>=3&&(n="final-climax"),this.applyPatternToSection(r,i,i.system,n),i.patternVariation=n,i})}createPatternTemplate(t,e){return{type:e,geometry:t.geometry,mode:t.mode||t.choreographyMode,parameters:{...t.parameters},colorPalette:t.colorPalette?{...t.colorPalette}:null,parameterSweeps:t.parameterSweeps?{...t.parameterSweeps}:null}}applyPatternToSection(t,e,i=null,s=null){e.geometry=t.geometry,e.mode=t.mode,e.parameters={...t.parameters},t.colorPalette&&(e.colorPalette={...t.colorPalette,colors:t.colorPalette.colors?t.colorPalette.colors.map(o=>({...o})):[]},s&&this.applyPatternVariation(e,s)),t.parameterSweeps&&(e.parameterSweeps={},Object.entries(t.parameterSweeps).forEach(([o,a])=>{e.parameterSweeps[o]={...a}})),i&&(e.system=i)}applyPatternVariation(t,e){switch(e){case"second":t.parameters&&(t.parameters.gridDensity=Math.min(95,(t.parameters.gridDensity||50)*1.1),t.parameters.intensity=Math.min(1,(t.parameters.intensity||.8)*1.1));break;case"final-climax":t.parameters&&(t.parameters.gridDensity=Math.min(100,(t.parameters.gridDensity||50)*1.5),t.parameters.chaos=Math.min(.95,(t.parameters.chaos||.5)*1.3),t.parameters.speed=Math.min(3,(t.parameters.speed||1)*1.5)),t.colorPalette&&t.colorPalette.colors&&(t.colorPalette.colors=t.colorPalette.colors.map(i=>({...i,intensity:Math.min(1,(i.intensity||.8)*1.2),saturation:Math.min(1,(i.saturation||.9)*1.1)})));break}}startSequenceMonitoring(){this.sequenceMonitorInterval&&clearInterval(this.sequenceMonitorInterval),this.sequenceMonitorInterval=setInterval(()=>{if(!this.audioElement||!this.isPlaying)return;const t=this.audioElement.currentTime;this.updateChoreographyAtTime(t)},100)}updateChoreographyAtTime(t){this.sequences.forEach(e=>{const i=t>=e.startTime&&t<e.startTime+e.duration;if(i&&!e.active&&(e.active=!0,e.system&&e.system!==this.currentSystem&&this.switchSystem(e.system),e.parameters&&Object.entries(e.parameters).forEach(([s,o])=>{this.setParameter(s,o),this.baseParams[s]=o}),e.mode&&(this.choreographyMode=e.mode),e.geometry!==void 0&&this.setParameter("geometry",e.geometry)),i&&e.colorPalette){const o=(t-e.startTime)/e.duration,a=this.audioAnalyzer?this.audioAnalyzer.beatPhase:0,r=this.audioAnalyzer?this.audioAnalyzer.getAudioData():null;j(e.colorPalette,o,a,r,(n,l)=>this.setParameter(n,l))}if(i&&e.parameterSweeps){const o=(t-e.startTime)/e.duration;X(e.parameterSweeps,o,e.duration,(a,r)=>this.setParameter(a,r))}!i&&e.active&&(e.active=!1)})}async play(){if(!this.audioElement){console.warn("⚠️ No audio file loaded");return}this.audioContext.state==="suspended"&&await this.audioContext.resume(),await this.audioElement.play(),this.isPlaying=!0,this.audioAnalyzer&&this.audioAnalyzer.startAnalysis()}pause(){this.audioElement&&(this.audioElement.pause(),this.isPlaying=!1)}stop(){this.audioElement&&(this.audioElement.pause(),this.audioElement.currentTime=0,this.isPlaying=!1)}renderTimeline(){console.log("📝 TODO: Implement timeline rendering UI")}setupUI(){console.log("📝 TODO: Implement UI setup")}exportChoreography(){const t={version:"1.0",duration:this.duration,sequences:this.sequences,baseParams:this.baseParams},e=JSON.stringify(t,null,2),i=new Blob([e],{type:"application/json"}),s=URL.createObjectURL(i),o=document.createElement("a");o.href=s,o.download=`choreography-${Date.now()}.json`,o.click(),console.log("💾 Choreography exported")}get currentEngine(){const t=this.systems[this.currentSystem];return t?t.engine:null}updateGeometry(t){const e=this.currentEngine;if(!e){console.warn("⚠️ No active engine to update geometry");return}console.log(`🔺 Updating geometry for ${this.currentSystem} engine (${t.length} vertices)`),e.updateGeometry?e.updateGeometry(t):e.parameterManager&&e.parameterManager.setGeometry?e.parameterManager.setGeometry(t):e.setParameter?e.setParameter("vertices",t):console.warn(`⚠️ Engine ${this.currentSystem} does not support geometry updates`),e.updateVisualizers?e.updateVisualizers():e.update&&e.update()}setGeometry(t){this.baseParams.geometry=t,this.updateParameter("geometry",t)}}class b{static generate5Cell(t=1){const e=[],i=Math.sqrt(5)*t;return e.push([1,1,1,-1/i]),e.push([1,-1,-1,-1/i]),e.push([-1,1,-1,-1/i]),e.push([-1,-1,1,-1/i]),e.push([0,0,0,i]),e}static generate16Cell(t=1){const e=[],i=t;return e.push([i,0,0,0]),e.push([-i,0,0,0]),e.push([0,i,0,0]),e.push([0,-i,0,0]),e.push([0,0,i,0]),e.push([0,0,-i,0]),e.push([0,0,0,i]),e.push([0,0,0,-i]),e}static generate24Cell(t=1){const e=[],i=t;return[[1,1,0,0],[1,-1,0,0],[-1,1,0,0],[-1,-1,0,0],[1,0,1,0],[1,0,-1,0],[-1,0,1,0],[-1,0,-1,0],[1,0,0,1],[1,0,0,-1],[-1,0,0,1],[-1,0,0,-1],[0,1,1,0],[0,1,-1,0],[0,-1,1,0],[0,-1,-1,0],[0,1,0,1],[0,1,0,-1],[0,-1,0,1],[0,-1,0,-1],[0,0,1,1],[0,0,1,-1],[0,0,-1,1],[0,0,-1,-1]].forEach(o=>e.push(o.map(a=>a*i))),e}static generate120Cell(t=1,e=2){const i=[],s=(1+Math.sqrt(5))/2,o=t*.5;for(let a=0;a<e*10;a++){const r=a/(e*10)*Math.PI*2;i.push([Math.cos(r)*o,Math.sin(r)*o,Math.cos(r*s)*o,Math.sin(r*s)*o])}return i}static generateHypercube(t=1){const e=[],i=t;for(let s=-1;s<=1;s+=2)for(let o=-1;o<=1;o+=2)for(let a=-1;a<=1;a+=2)for(let r=-1;r<=1;r+=2)e.push([r*i,a*i,o*i,s*i]);return e}static generateHypersphere(t=1,e=20){const i=[],s=t;for(let o=0;o<=e;o++){const a=o/e*Math.PI;for(let r=0;r<=e;r++){const n=r/e*Math.PI*2;for(let l=0;l<=e/2;l++){const h=l/(e/2)*Math.PI,d=s*Math.sin(a)*Math.cos(n)*Math.sin(h),u=s*Math.sin(a)*Math.sin(n)*Math.sin(h),m=s*Math.cos(a)*Math.sin(h),p=s*Math.cos(h);i.push([d,u,m,p])}}}return i}static generateHopfFibration(t=1,e=15){const i=[],s=t;for(let o=0;o<e;o++){const a=o/e*Math.PI*2;for(let r=0;r<e;r++){const n=r/e*Math.PI*2,l=s*Math.cos(a)*Math.cos(n),h=s*Math.cos(a)*Math.sin(n),d=s*Math.sin(a)*Math.cos(n),u=s*Math.sin(a)*Math.sin(n);i.push([l,h,d,u])}}return i}static generateCliffordTorus(t=1,e=20){const i=[],s=t*.7;for(let o=0;o<e;o++){const a=o/e*Math.PI*2;for(let r=0;r<e;r++){const n=r/e*Math.PI*2,l=s*Math.cos(a),h=s*Math.sin(a),d=s*Math.cos(n),u=s*Math.sin(n);i.push([l,h,d,u])}}return i}static generateDuocylinder(t=1,e=20){const i=[],s=t;for(let o=0;o<e;o++){const a=o/e*Math.PI*2;for(let r=0;r<e;r++){const n=r/e*Math.PI*2;i.push([s*Math.cos(a),s*Math.sin(a),s*Math.cos(n),s*Math.sin(n)])}}return i}static generateSpheritorus(t=1,e=15){const i=[],s=t,o=s*.3;for(let a=0;a<e;a++){const r=a/e*Math.PI*2;for(let n=0;n<e;n++){const l=n/e*Math.PI;for(let h=0;h<e;h++){const d=h/e*Math.PI*2,u=(s+o*Math.cos(l))*Math.cos(r),m=(s+o*Math.cos(l))*Math.sin(r),p=o*Math.sin(l)*Math.cos(d),y=o*Math.sin(l)*Math.sin(d);i.push([u,m,p,y])}}}return i}static generateKleinBottle4D(t=1,e=20){const i=[],s=t;for(let o=0;o<e;o++){const a=o/e*Math.PI*2;for(let r=0;r<e;r++){const n=r/e*Math.PI*2,l=s*(2+Math.cos(n)),h=l*Math.cos(a),d=l*Math.sin(a),u=s*Math.sin(n)*Math.cos(a/2),m=s*Math.sin(n)*Math.sin(a/2);i.push([h,d,u,m])}}return i}static generateMobiusStrip4D(t=1,e=20){const i=[],s=t;for(let o=0;o<e;o++){const a=o/e*Math.PI*2;for(let r=-1;r<=1;r+=.2){const n=r,l=a/2,h=(s+n*Math.cos(l))*Math.cos(a),d=(s+n*Math.cos(l))*Math.sin(a),u=n*Math.sin(l)*Math.cos(a),m=n*Math.sin(l)*Math.sin(a);i.push([h,d,u,m])}}return i}static generateCalabiYau(t=1,e=10){const i=[],s=t;for(let o=0;o<e;o++){const a=o/e*Math.PI*2;for(let r=0;r<e;r++){const n=r/e*Math.PI*2,l=s*Math.cos(a)*(1+.3*Math.sin(3*n)),h=s*Math.sin(a)*(1+.3*Math.sin(3*n)),d=s*Math.cos(n)*(1+.3*Math.sin(3*a)),u=s*Math.sin(n)*(1+.3*Math.sin(3*a));i.push([l,h,d,u])}}return i}static generateTesseractFractal(t=1,e=2){const i=[];function s(o,a,r){if(r===0){i.push(o);return}const n=a/3;for(let l=-1;l<=1;l++)for(let h=-1;h<=1;h++)for(let d=-1;d<=1;d++)for(let u=-1;u<=1;u++)u===0&&d===0&&h===0&&l===0||s([o[0]+u*n,o[1]+d*n,o[2]+h*n,o[3]+l*n],n,r-1)}return s([0,0,0,0],t,e),i}static generateSierpinski4D(t=1,e=3){const i=[],s=t,o=b.generate5Cell(s);function a(r,n){if(n===0){r.forEach(l=>i.push(l));return}for(let l=0;l<r.length;l++)for(let h=l+1;h<r.length;h++){const d=[(r[l][0]+r[h][0])/2,(r[l][1]+r[h][1])/2,(r[l][2]+r[h][2])/2,(r[l][3]+r[h][3])/2];a([r[l],d],n-1)}}return a(o,e),i}static generateQuaternionJulia(t=1,e=15,i=[0,.5,0,0]){const s=[],o=t,a=10;for(let r=0;r<e;r++){const n=(r/e-.5)*2*o;for(let l=0;l<e;l++){const h=(l/e-.5)*2*o;for(let d=0;d<e;d++){const u=(d/e-.5)*2*o;for(let m=0;m<e;m++){const p=(m/e-.5)*2*o;let y=n,f=h,g=u,v=p,x=0;for(;x<a&&y*y+f*f+g*g+v*v<4;){const S=y*y-f*f-g*g-v*v+i[0],I=2*y*f+i[1],L=2*y*g+i[2],C=2*y*v+i[3];y=S,f=I,g=L,v=C,x++}x>=a&&s.push([n,h,u,p])}}}}return s}static generateLorenz4D(t=1,e=100){const i=[],s=t*.1;let o=.1,a=0,r=0,n=0;const l=.01,h=10,d=28,u=8/3,m=1;for(let p=0;p<e;p++){const y=h*(a-o),f=o*(d-r)-a,g=o*a-u*r,v=m*(o-n);o+=y*l,a+=f*l,r+=g*l,n+=v*l,i.push([o*s,a*s,r*s,n*s])}return i}static generateLissajous4D(t=1,e=50,i=[1,2,3,4]){const s=[],o=t;for(let a=0;a<e;a++){const r=a/e*Math.PI*2;s.push([o*Math.sin(i[0]*r),o*Math.sin(i[1]*r),o*Math.sin(i[2]*r),o*Math.sin(i[3]*r)])}return s}static generateHypersphereSlices(t=1,e=10,i=20){const s=[],o=t;for(let a=0;a<e;a++){const r=(a/(e-1)-.5)*2*o,n=Math.sqrt(Math.max(0,o*o-r*r));for(let l=0;l<=i;l++){const h=l/i*Math.PI;for(let d=0;d<=i;d++){const u=d/i*Math.PI*2,m=n*Math.sin(h)*Math.cos(u),p=n*Math.sin(h)*Math.sin(u),y=n*Math.cos(h);s.push([m,p,y,r])}}}return s}static generateStereographicProjection(t=1,e=20){const i=[],s=t;for(let o=0;o<e;o++){const a=o/e*Math.PI;for(let r=0;r<e;r++){const n=r/e*Math.PI*2;for(let l=0;l<e;l++){const h=l/e*Math.PI*2,d=Math.sin(a)*Math.cos(n),u=Math.sin(a)*Math.sin(n),m=Math.cos(a)*Math.cos(h),p=Math.cos(a)*Math.sin(h);if(p<.99){const y=s/(1-p);i.push([d*y,u*y,m*y,0])}}}}return i}static generateHyperbolicTesseract(t=1,e=.3){const i=b.generateHypercube(t),s=e;return i.map(o=>{const a=Math.sqrt(o[0]*o[0]+o[1]*o[1]+o[2]*o[2]+o[3]*o[3]),r=Math.sinh(a*s)/(a*s||1);return o.map(n=>n*r)})}static generatePenroseTiling4D(t=1,e=15){const i=[],s=t,o=(1+Math.sqrt(5))/2;for(let a=0;a<e;a++)for(let r=0;r<e;r++)for(let n=0;n<e;n++)for(let l=0;l<e;l++){const h=(a-e/2)*s/e,d=(r-e/2)*s/e,u=(n-e/2)*s/e,m=(l-e/2)*s/e,p=Math.cos(h*o)+Math.cos(d*o)+Math.cos(u*o)+Math.cos(m*o);Math.abs(p)>3&&i.push([h,d,u,m])}return i}static getAllGeometryNames(){return["5-Cell (Pentachoron)","16-Cell (Hyperoctahedron)","24-Cell","120-Cell","Hypercube (Tesseract)","Hypersphere","Hopf Fibration","Clifford Torus","Duocylinder","Spheritorus","Klein Bottle 4D","Mobius Strip 4D","Calabi-Yau","Tesseract Fractal","Sierpinski 4D","Quaternion Julia","Lorenz 4D","Lissajous 4D","Hypersphere Slices","Stereographic Projection","Hyperbolic Tesseract","Penrose Tiling 4D"]}static getGeometry(t,e=1,i={}){const s={"5-Cell (Pentachoron)":()=>b.generate5Cell(e),"16-Cell (Hyperoctahedron)":()=>b.generate16Cell(e),"24-Cell":()=>b.generate24Cell(e),"120-Cell":()=>b.generate120Cell(e,i.detail||2),"Hypercube (Tesseract)":()=>b.generateHypercube(e),Hypersphere:()=>b.generateHypersphere(e,i.segments||20),"Hopf Fibration":()=>b.generateHopfFibration(e,i.segments||15),"Clifford Torus":()=>b.generateCliffordTorus(e,i.segments||20),Duocylinder:()=>b.generateDuocylinder(e,i.segments||20),Spheritorus:()=>b.generateSpheritorus(e,i.segments||15),"Klein Bottle 4D":()=>b.generateKleinBottle4D(e,i.segments||20),"Mobius Strip 4D":()=>b.generateMobiusStrip4D(e,i.segments||20),"Calabi-Yau":()=>b.generateCalabiYau(e,i.segments||10),"Tesseract Fractal":()=>b.generateTesseractFractal(e,i.iterations||2),"Sierpinski 4D":()=>b.generateSierpinski4D(e,i.iterations||3),"Quaternion Julia":()=>b.generateQuaternionJulia(e,i.segments||15,i.c||[0,.5,0,0]),"Lorenz 4D":()=>b.generateLorenz4D(e,i.segments||100),"Lissajous 4D":()=>b.generateLissajous4D(e,i.segments||50,i.freq||[1,2,3,4]),"Hypersphere Slices":()=>b.generateHypersphereSlices(e,i.slices||10,i.segments||20),"Stereographic Projection":()=>b.generateStereographicProjection(e,i.segments||20),"Hyperbolic Tesseract":()=>b.generateHyperbolicTesseract(e,i.curvature||.3),"Penrose Tiling 4D":()=>b.generatePenroseTiling4D(e,i.segments||15)};return s[t]?s[t]():b.generateHypercube(e)}}class lt{constructor(){this.sourceGeometry=null,this.targetGeometry=null,this.morphProgress=0,this.morphSpeed=.02,this.autoMorph=!1,this.pingPong=!0,this.morphDirection=1}setGeometries(t,e){this.sourceGeometry=this.normalizeVertexCount(t),this.targetGeometry=this.normalizeVertexCount(e),this.morphProgress=0}normalizeVertexCount(t){return t}matchVertexCounts(t,e){const i=t.length,s=e.length;return i===s?{source:t,target:e}:i<s?{source:this.interpolateVertices(t,s),target:e}:{source:t,target:this.interpolateVertices(e,i)}}interpolateVertices(t,e){if(t.length===0||t.length===e)return t;const i=[],s=t.length/e;for(let o=0;o<e;o++){const a=o*s,r=Math.floor(a),n=Math.ceil(a)%t.length,l=a-r,h=t[r],d=t[n];i.push([h[0]*(1-l)+d[0]*l,h[1]*(1-l)+d[1]*l,h[2]*(1-l)+d[2]*l,h[3]*(1-l)+d[3]*l])}return i}update(t=.016){this.autoMorph&&(this.morphProgress+=this.morphSpeed*this.morphDirection*(t/.016),this.pingPong?this.morphProgress>=1?(this.morphProgress=1,this.morphDirection=-1):this.morphProgress<=0&&(this.morphProgress=0,this.morphDirection=1):this.morphProgress=(this.morphProgress%1+1)%1)}getMorphedGeometry(){if(!this.sourceGeometry||!this.targetGeometry)return this.sourceGeometry||this.targetGeometry||[];const t=this.matchVertexCounts(this.sourceGeometry,this.targetGeometry),e=this.easeInOutCubic(this.morphProgress);return t.source.map((i,s)=>{const o=t.target[s];return[i[0]*(1-e)+o[0]*e,i[1]*(1-e)+o[1]*e,i[2]*(1-e)+o[2]*e,i[3]*(1-e)+o[3]*e]})}blendGeometries(t,e){if(t.length===0)return[];if(t.length===1)return t[0];const i=e.reduce((n,l)=>n+l,0),s=e.map(n=>n/i),o=Math.max(...t.map(n=>n.length)),a=t.map(n=>this.interpolateVertices(n,o)),r=[];for(let n=0;n<o;n++){const l=[0,0,0,0];for(let h=0;h<a.length;h++){const d=a[h][n],u=s[h];l[0]+=d[0]*u,l[1]+=d[1]*u,l[2]+=d[2]*u,l[3]+=d[3]*u}r.push(l)}return r}easeInOutCubic(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}easeLinear(t){return t}easeInQuad(t){return t*t}easeOutQuad(t){return 1-(1-t)*(1-t)}easeInOutQuad(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}easeInElastic(t){const e=2*Math.PI/3;return t===0?0:t===1?1:-Math.pow(2,10*t-10)*Math.sin((t*10-10.75)*e)}easeOutElastic(t){const e=2*Math.PI/3;return t===0?0:t===1?1:Math.pow(2,-10*t)*Math.sin((t*10-.75)*e)+1}easeInOutElastic(t){const e=2*Math.PI/4.5;return t===0?0:t===1?1:t<.5?-(Math.pow(2,20*t-10)*Math.sin((20*t-11.125)*e))/2:Math.pow(2,-20*t+10)*Math.sin((20*t-11.125)*e)/2+1}easeInBounce(t){return 1-this.easeOutBounce(1-t)}easeOutBounce(t){return t<1/2.75?7.5625*t*t:t<2/2.75?7.5625*(t-=1.5/2.75)*t+.75:t<2.5/2.75?7.5625*(t-=2.25/2.75)*t+.9375:7.5625*(t-=2.625/2.75)*t+.984375}easeInOutBounce(t){return t<.5?(1-this.easeOutBounce(1-2*t))/2:(1+this.easeOutBounce(2*t-1))/2}setEasing(t){const e={linear:this.easeLinear,"in-quad":this.easeInQuad,"out-quad":this.easeOutQuad,"in-out-quad":this.easeInOutQuad,"in-out-cubic":this.easeInOutCubic,"in-elastic":this.easeInElastic,"out-elastic":this.easeOutElastic,"in-out-elastic":this.easeInOutElastic,"in-bounce":this.easeInBounce,"out-bounce":this.easeOutBounce,"in-out-bounce":this.easeInOutBounce};e[t]&&(this.easingFunction=e[t].bind(this))}sphericalMorph(t,e,i){const s=this.matchVertexCounts(t,e);return s.source.map((o,a)=>{const r=s.target[a],n=Math.sqrt(o[0]**2+o[1]**2+o[2]**2+o[3]**2),l=Math.sqrt(r[0]**2+r[1]**2+r[2]**2+r[3]**2),h=n*(1-i)+l*i,d=(o[0]*r[0]+o[1]*r[1]+o[2]*r[2]+o[3]*r[3])/(n*l),u=Math.acos(Math.max(-1,Math.min(1,d)));if(u<.001)return[o[0]*(1-i)+r[0]*i,o[1]*(1-i)+r[1]*i,o[2]*(1-i)+r[2]*i,o[3]*(1-i)+r[3]*i];const m=Math.sin(u),p=Math.sin((1-i)*u)/m,y=Math.sin(i*u)/m;return[(o[0]*p+r[0]*y)*h/n,(o[1]*p+r[1]*y)*h/n,(o[2]*p+r[2]*y)*h/n,(o[3]*p+r[3]*y)*h/n]})}chaoticMorph(t,e,i,s=.3){const o=this.matchVertexCounts(t,e),a=Math.sin(i*Math.PI)*s;return o.source.map((r,n)=>{const l=o.target[n],h=[(Math.random()-.5)*a,(Math.random()-.5)*a,(Math.random()-.5)*a,(Math.random()-.5)*a];return[r[0]*(1-i)+l[0]*i+h[0],r[1]*(1-i)+l[1]*i+h[1],r[2]*(1-i)+l[2]*i+h[2],r[3]*(1-i)+l[3]*i+h[3]]})}radialMorph(t,e,i){const s=this.matchVertexCounts(t,e),o=i<.5,a=o?i*2:(i-.5)*2;return o?s.source.map(r=>r.map(n=>n*(1-a))):s.target.map(r=>r.map(n=>n*a))}twistMorph(t,e,i,s=2){const o=this.matchVertexCounts(t,e),a=i*s*Math.PI*2;return o.source.map((r,n)=>{const l=o.target[n],h=[r[0]*(1-i)+l[0]*i,r[1]*(1-i)+l[1]*i,r[2]*(1-i)+l[2]*i,r[3]*(1-i)+l[3]*i],d=Math.cos(a),u=Math.sin(a);return[h[0]*d-h[1]*u,h[0]*u+h[1]*d,h[2],h[3]]})}getMorphFunction(t){const e={linear:(i,s,o)=>this.getMorphedGeometry(),spherical:(i,s,o)=>this.sphericalMorph(i,s,o),chaotic:(i,s,o)=>this.chaoticMorph(i,s,o),radial:(i,s,o)=>this.radialMorph(i,s,o),twist:(i,s,o)=>this.twistMorph(i,s,o)};return e[t]||e.linear}}class ht{constructor(t){this.choreographer=t,this.morpher=new lt,this.currentGeometry="Hypercube (Tesseract)",this.morphTargetGeometry="Hypersphere",this.morphEnabled=!1,this.init()}init(){this.createGeometryControls(),this.setupEventListeners()}createGeometryControls(){const t=document.getElementById("control-panel");if(!t){console.warn("⚠️ Control panel not found");return}const e=document.createElement("div");e.className="control-group geometry-controls",e.id="geometry-controls-section",e.innerHTML=`
            <label>🔺 GEOMETRY SYSTEM</label>

            <div style="margin-bottom: 10px;">
                <label style="font-size: 9px; opacity: 0.7;">Primary Geometry</label>
                <select id="geometry-primary" style="width: 100%; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 10px;">
                    ${this.createGeometryOptions()}
                </select>
            </div>

            <div style="margin-bottom: 10px;">
                <input type="checkbox" id="geometry-morph-toggle" style="margin-right: 5px;">
                <label for="geometry-morph-toggle" style="font-size: 10px; display: inline;">Enable Morphing</label>
            </div>

            <div id="morph-controls" style="display: none; margin-top: 10px; padding: 10px; background: rgba(0,255,255,0.05); border: 1px solid rgba(0,255,255,0.2); border-radius: 3px;">
                <div style="margin-bottom: 10px;">
                    <label style="font-size: 9px; opacity: 0.7;">Morph Target</label>
                    <select id="geometry-morph-target" style="width: 100%; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 10px;">
                        ${this.createGeometryOptions()}
                    </select>
                </div>

                <div style="margin-bottom: 10px;">
                    <label style="font-size: 9px;">Morph Progress: <span id="morph-progress-val">0%</span></label>
                    <input type="range" id="morph-progress" min="0" max="100" value="0" style="width: 100%;">
                </div>

                <div style="margin-bottom: 10px;">
                    <label style="font-size: 9px;">Morph Speed: <span id="morph-speed-val">0.02</span></label>
                    <input type="range" id="morph-speed" min="0.01" max="0.2" step="0.01" value="0.02" style="width: 100%;">
                </div>

                <div style="margin-bottom: 10px;">
                    <input type="checkbox" id="morph-auto-toggle" style="margin-right: 5px;">
                    <label for="morph-auto-toggle" style="font-size: 10px; display: inline;">Auto-Morph</label>
                </div>

                <div style="margin-bottom: 10px;">
                    <input type="checkbox" id="morph-pingpong-toggle" checked style="margin-right: 5px;">
                    <label for="morph-pingpong-toggle" style="font-size: 10px; display: inline;">Ping-Pong</label>
                </div>

                <div style="margin-bottom: 10px;">
                    <label style="font-size: 9px; opacity: 0.7;">Morph Type</label>
                    <select id="morph-type" style="width: 100%; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 10px;">
                        <option value="linear">Linear</option>
                        <option value="spherical">Spherical (SLERP)</option>
                        <option value="chaotic">Chaotic (Noise)</option>
                        <option value="radial">Radial (Contract/Expand)</option>
                        <option value="twist">Twist</option>
                    </select>
                </div>

                <div style="margin-bottom: 10px;">
                    <label style="font-size: 9px; opacity: 0.7;">Easing</label>
                    <select id="morph-easing" style="width: 100%; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 10px;">
                        <option value="linear">Linear</option>
                        <option value="in-out-cubic" selected>Cubic</option>
                        <option value="in-out-quad">Quadratic</option>
                        <option value="in-out-elastic">Elastic</option>
                        <option value="in-out-bounce">Bounce</option>
                    </select>
                </div>
            </div>

            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(0,255,255,0.2);">
                <label style="font-size: 9px; opacity: 0.7;">Geometry Parameters</label>

                <div style="margin-top: 5px;">
                    <label style="font-size: 9px;">Vertex Scale: <span id="geom-scale-val">1.0</span></label>
                    <input type="range" id="geom-scale" min="0.1" max="2" step="0.1" value="1.0" style="width: 100%;">
                </div>

                <div style="margin-top: 5px;">
                    <label style="font-size: 9px;">Segments: <span id="geom-segments-val">20</span></label>
                    <input type="range" id="geom-segments" min="5" max="50" step="1" value="20" style="width: 100%;">
                </div>

                <div style="margin-top: 5px;">
                    <label style="font-size: 9px; opacity: 0.7;">Edge Rendering</label>
                    <select id="geom-edge-mode" style="width: 100%; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 10px;">
                        <option value="solid">Solid</option>
                        <option value="wireframe">Wireframe</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="glow">Glow</option>
                    </select>
                </div>

                <div style="margin-top: 5px;">
                    <label style="font-size: 9px; opacity: 0.7;">Face Culling</label>
                    <select id="geom-culling" style="width: 100%; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 10px;">
                        <option value="none">None</option>
                        <option value="front">Front</option>
                        <option value="back">Back</option>
                    </select>
                </div>
            </div>

            <div style="margin-top: 10px; font-size: 8px; opacity: 0.5; text-align: center;">
                22 4D Geometries Available
            </div>
        `;const i=t.querySelector(".system-pills");i?i.before(e):t.appendChild(e),console.log("✅ GeometryControls UI created")}createGeometryOptions(){return b.getAllGeometryNames().map(e=>{const i=e===this.currentGeometry?"selected":"";return`<option value="${e}" ${i}>${e}</option>`}).join("")}setupEventListeners(){const t=document.getElementById("geometry-primary");t&&t.addEventListener("change",g=>{this.currentGeometry=g.target.value,this.updateGeometry()});const e=document.getElementById("geometry-morph-toggle"),i=document.getElementById("morph-controls");e&&i&&e.addEventListener("change",g=>{this.morphEnabled=g.target.checked,i.style.display=g.target.checked?"block":"none",g.target.checked&&this.initMorphing()});const s=document.getElementById("geometry-morph-target");s&&s.addEventListener("change",g=>{this.morphTargetGeometry=g.target.value,this.initMorphing()});const o=document.getElementById("morph-progress"),a=document.getElementById("morph-progress-val");o&&o.addEventListener("input",g=>{const v=parseFloat(g.target.value)/100;this.morpher.morphProgress=v,this.morpher.autoMorph=!1,document.getElementById("morph-auto-toggle").checked=!1,a&&(a.textContent=`${Math.round(v*100)}%`),this.updateMorphedGeometry()});const r=document.getElementById("morph-speed"),n=document.getElementById("morph-speed-val");r&&r.addEventListener("input",g=>{const v=parseFloat(g.target.value);this.morpher.morphSpeed=v,n&&(n.textContent=v.toFixed(2))});const l=document.getElementById("morph-auto-toggle");l&&l.addEventListener("change",g=>{this.morpher.autoMorph=g.target.checked,g.target.checked?this.startAutoMorph():this.stopAutoMorph()});const h=document.getElementById("morph-pingpong-toggle");h&&h.addEventListener("change",g=>{this.morpher.pingPong=g.target.checked});const d=document.getElementById("morph-type");d&&d.addEventListener("change",g=>{this.morphType=g.target.value});const u=document.getElementById("morph-easing");u&&u.addEventListener("change",g=>{this.morpher.setEasing(g.target.value)});const m=document.getElementById("geom-scale"),p=document.getElementById("geom-scale-val");m&&m.addEventListener("input",g=>{const v=parseFloat(g.target.value);this.geometryScale=v,p&&(p.textContent=v.toFixed(1)),this.updateGeometry()});const y=document.getElementById("geom-segments"),f=document.getElementById("geom-segments-val");y&&y.addEventListener("input",g=>{const v=parseInt(g.target.value);this.geometrySegments=v,f&&(f.textContent=v),this.updateGeometry()}),console.log("✅ GeometryControls event listeners setup")}initMorphing(){const t=b.getGeometry(this.currentGeometry,this.geometryScale||1,{segments:this.geometrySegments||20}),e=b.getGeometry(this.morphTargetGeometry,this.geometryScale||1,{segments:this.geometrySegments||20});this.morpher.setGeometries(t,e),console.log(`🔀 Morphing initialized: ${this.currentGeometry} → ${this.morphTargetGeometry}`)}startAutoMorph(){if(this.morphAnimationFrame)return;const t=()=>{this.morpher.update(),this.updateMorphedGeometry();const e=document.getElementById("morph-progress"),i=document.getElementById("morph-progress-val");e&&i&&(e.value=this.morpher.morphProgress*100,i.textContent=`${Math.round(this.morpher.morphProgress*100)}%`),this.morpher.autoMorph&&(this.morphAnimationFrame=requestAnimationFrame(t))};t()}stopAutoMorph(){this.morphAnimationFrame&&(cancelAnimationFrame(this.morphAnimationFrame),this.morphAnimationFrame=null)}updateGeometry(){const t=b.getGeometry(this.currentGeometry,this.geometryScale||1,{segments:this.geometrySegments||20});this.choreographer.updateGeometry(t),console.log(`🔺 Geometry updated: ${this.currentGeometry} (${t.length} vertices)`)}updateMorphedGeometry(){if(!this.morphEnabled)return;const t=this.morpher.getMorphedGeometry();this.choreographer.updateGeometry(t)}setGeometry(t){this.currentGeometry=t;const e=document.getElementById("geometry-primary");e&&(e.value=t),this.updateGeometry()}enableMorphing(t){this.morphTargetGeometry=t;const e=document.getElementById("geometry-morph-toggle");e&&(e.checked=!0,e.dispatchEvent(new Event("change")))}setMorphProgress(t){this.morpher.morphProgress=Math.max(0,Math.min(1,t));const e=document.getElementById("morph-progress");e&&(e.value=this.morpher.morphProgress*100),this.updateMorphedGeometry()}startAutoMorphing(){const t=document.getElementById("morph-auto-toggle");t&&(t.checked=!0,t.dispatchEvent(new Event("change")))}stopAutoMorphing(){const t=document.getElementById("morph-auto-toggle");t&&(t.checked=!1,t.dispatchEvent(new Event("change")))}}class dt{constructor(t){this.choreographer=t,this.elements={},this.geometryControls=null,this.init()}init(){console.log("🎛️ Initializing EnhancedControls..."),console.log("  📊 Creating performance display..."),this.createPerformanceDisplay(),console.log("  🎨 Creating preset selector..."),this.createPresetSelector(),console.log("  🎛️ Creating parameter controls..."),this.createParameterControls(),console.log("  🔺 Initializing geometry controls..."),this.geometryControls=new ht(this.choreographer),console.log("  ⏱️ Setting up update loop..."),this.setupUpdateLoop();const t={perfDisplay:!!document.getElementById("performance-display"),presetSelector:!!document.getElementById("preset-selector"),intensitySlider:!!document.getElementById("intensity-slider"),speedSlider:!!document.getElementById("speed-slider"),chaosSlider:!!document.getElementById("chaos-slider")};console.log("✅ EnhancedControls initialized:",t),t.presetSelector||console.error("❌ Preset selector missing! Check control panel structure"),t.intensitySlider||console.error("❌ Parameter sliders missing! Check control panel structure")}createPerformanceDisplay(){const t=document.getElementById("performance-display");if(t){this.elements.performanceDisplay=t;return}const e=document.createElement("div");e.id="performance-display",e.style.cssText=`
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid #0ff;
            padding: 10px;
            font-family: 'Courier New', monospace;
            font-size: 10px;
            color: #0ff;
            min-width: 200px;
            z-index: 200;
            display: none;
        `,e.innerHTML=`
            <h4 style="margin: 0 0 10px 0; font-size: 12px;">📊 PERFORMANCE</h4>
            <div id="perf-fps">FPS: --</div>
            <div id="perf-frame-time">Frame Time: --</div>
            <div id="perf-render-time">Render Time: --</div>
            <div id="perf-visualizers">Visualizers: --</div>
            <div id="perf-canvases">Canvases: --</div>
            <div id="perf-grade" style="margin-top: 5px; font-size: 14px; font-weight: bold;">Grade: --</div>
            <div id="perf-status" style="margin-top: 5px; font-size: 10px;">Status: --</div>
        `,document.body.appendChild(e),this.elements.performanceDisplay=e;const i=document.createElement("button");i.textContent="📊",i.style.cssText=`
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0, 255, 255, 0.2);
            border: 1px solid #0ff;
            color: #0ff;
            cursor: pointer;
            padding: 5px 10px;
            font-size: 14px;
            z-index: 199;
        `,i.onclick=()=>{const s=e.style.display==="none";e.style.display=s?"block":"none",i.style.left=s?"240px":"20px"},document.body.appendChild(i)}createPresetSelector(){const t=document.getElementById("control-panel");if(!t){console.warn("⚠️ Control panel not found - cannot add preset selector");return}if(document.getElementById("preset-selector")){console.log("✅ Preset selector already exists");return}const e=document.createElement("div");e.className="control-group",e.innerHTML=`
            <label>🎨 PRESETS</label>
            <select id="preset-selector" style="width: 100%; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-family: inherit; font-size: 10px;">
                <option value="">-- Select Preset --</option>
            </select>
            <button id="save-preset-btn" style="margin-top: 5px; padding: 5px; width: 100%;">💾 Save Current</button>
        `;const i=t.querySelectorAll(".control-group");if(console.log(`📊 Found ${i.length} control groups`),i.length>=3)i[2].after(e),console.log("✅ Preset selector inserted after VISUALIZATION SYSTEM");else{const a=t.querySelector(".control-group");a?a.before(e):t.insertBefore(e,t.firstChild),console.log("⚠️ Preset selector inserted at fallback position")}this.populatePresets();const s=document.getElementById("preset-selector"),o=document.getElementById("save-preset-btn");s&&s.addEventListener("change",a=>{a.target.value&&(console.log(`🎨 Applying preset: ${a.target.value}`),this.choreographer.presetManager.applyPreset(a.target.value))}),o&&o.addEventListener("click",()=>{const a=prompt("Enter preset name:");a&&(this.choreographer.presetManager.saveCurrentAsPreset(a),this.populatePresets(),console.log(`💾 Saved preset: ${a}`))})}populatePresets(){const t=document.getElementById("preset-selector");if(!t||!this.choreographer.presetManager)return;const e=this.choreographer.presetManager.getPresetList();t.innerHTML='<option value="">-- Select Preset --</option>';const i=e.filter(o=>!o.custom),s=e.filter(o=>o.custom);if(i.length>0){const o=document.createElement("optgroup");o.label="Built-in Presets",i.forEach(a=>{const r=document.createElement("option");r.value=a.key,r.textContent=a.name,o.appendChild(r)}),t.appendChild(o)}if(s.length>0){const o=document.createElement("optgroup");o.label="Custom Presets",s.forEach(a=>{const r=document.createElement("option");r.value=a.key,r.textContent=a.name,o.appendChild(r)}),t.appendChild(o)}}createParameterControls(){const t=document.getElementById("control-panel");if(!t){console.warn("⚠️ Control panel not found - cannot add parameter controls");return}if(Array.from(document.querySelectorAll(".control-group label")).find(o=>o.textContent.includes("PARAMETERS"))){console.log("✅ Parameter controls already exist");return}const i=document.createElement("div");i.className="control-group",i.innerHTML=`
            <label>🎛️ PARAMETERS</label>
            <div style="font-size: 9px; opacity: 0.7; margin-bottom: 5px;">Use arrow keys and [ ] to adjust</div>
            ${this.createSlider("intensity","Intensity",0,1,.01)}
            ${this.createSlider("speed","Speed",.1,5,.1)}
            ${this.createSlider("chaos","Chaos",0,1,.01)}
            ${this.createSlider("gridDensity","Grid Density",1,50,1)}
            ${this.createSlider("hue","Hue",0,360,1)}
            ${this.createSlider("saturation","Saturation",0,1,.01)}
        `;const s=Array.from(t.querySelectorAll(".control-group")).find(o=>{var a;return(a=o.querySelector("label"))==null?void 0:a.textContent.includes("STATUS LOG")});s?(s.before(i),console.log("✅ Parameter controls inserted before STATUS LOG")):(t.appendChild(i),console.log("⚠️ Parameter controls appended to end")),this.setupParameterSliders()}createSlider(t,e,i,s,o){const a=this.choreographer.baseParams[t]||i;return`
            <div style="margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; font-size: 9px; margin-bottom: 2px;">
                    <span>${e}</span>
                    <span id="${t}-value">${a.toFixed(2)}</span>
                </div>
                <input type="range" id="${t}-slider"
                    min="${i}" max="${s}" step="${o}" value="${a}"
                    style="width: 100%; height: 20px; background: rgba(0,255,255,0.1); cursor: pointer;">
            </div>
        `}setupParameterSliders(){["intensity","speed","chaos","gridDensity","hue","saturation"].forEach(e=>{const i=document.getElementById(`${e}-slider`),s=document.getElementById(`${e}-value`);i&&i.addEventListener("input",o=>{const a=parseFloat(o.target.value);this.choreographer.baseParams[e]=a,s&&(s.textContent=a.toFixed(2));const r=this.choreographer.systems[this.choreographer.currentSystem];r.engine&&this.choreographer.updateSystemParameters(r.engine)})})}updatePerformanceDisplay(){if(!this.choreographer.performanceMonitor)return;const t=this.choreographer.performanceMonitor.getSummary(),e=document.getElementById("perf-fps"),i=document.getElementById("perf-frame-time"),s=document.getElementById("perf-render-time"),o=document.getElementById("perf-visualizers"),a=document.getElementById("perf-canvases"),r=document.getElementById("perf-grade"),n=document.getElementById("perf-status");if(e&&(e.textContent=`FPS: ${t.current.fps}`),i&&(i.textContent=`Frame Time: ${t.current.frameTime.toFixed(2)}ms`),s&&(s.textContent=`Render Time: ${t.current.renderTime.toFixed(2)}ms`),o&&(o.textContent=`Visualizers: ${t.current.activeVisualizers}`),a&&(a.textContent=`Canvases: ${t.current.canvasCount}`),r){const l=this.choreographer.performanceMonitor.getGrade(),h={A:"#0f0",B:"#8f0",C:"#ff0",D:"#f80",F:"#f00"};r.textContent=`Grade: ${l}`,r.style.color=h[l]||"#0ff"}if(n){const l={excellent:"#0f0",good:"#8f0",poor:"#ff0",critical:"#f00"};n.textContent=`Status: ${t.status}`,n.style.color=l[t.status]||"#0ff"}}setupUpdateLoop(){setInterval(()=>{this.updatePerformanceDisplay()},100)}showNotification(t,e=3e3){const i=document.createElement("div");i.style.cssText=`
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 255, 255, 0.9);
            color: #000;
            padding: 20px 40px;
            border: 2px solid #0ff;
            font-family: 'Courier New', monospace;
            font-size: 16px;
            z-index: 10000;
            animation: fadeIn 0.3s ease-in-out;
        `,i.textContent=t,document.body.appendChild(i),setTimeout(()=>{i.style.animation="fadeOut 0.3s ease-in-out",setTimeout(()=>i.remove(),300)},e)}}let M=null;const T=document.getElementById("status-display");function w(c,t="info"){const e=document.createElement("div");for(e.className=`status-line ${t}`,e.textContent=`${new Date().toLocaleTimeString()}: ${c}`,T.insertBefore(e,T.firstChild);T.children.length>20;)T.removeChild(T.lastChild)}async function ut(){try{w("Creating Choreographer instance...","info"),M=new ct,w("Initializing systems...","info"),await M.init(),w("Choreographer ready!","success"),document.getElementById("current-mode").textContent="READY",document.getElementById("current-system").textContent=M.currentSystem,document.getElementById("loading-indicator").classList.add("hidden"),window.choreographer=M,window.enhancedControls=new dt(M),mt()}catch(c){w(`Initialization error: ${c.message}`,"error"),console.error("Choreographer init failed:",c)}}function mt(){document.getElementById("audio-file-input").addEventListener("change",async c=>{const t=c.target.files[0];if(t){w(`Loading audio: ${t.name}`,"info");try{await M.loadAudioFile(t),w("Audio loaded successfully","success"),document.getElementById("audio-status").textContent=t.name,document.getElementById("play-btn").disabled=!1,document.getElementById("pause-btn").disabled=!1,document.getElementById("stop-btn").disabled=!1,document.getElementById("analyze-btn").disabled=!1,document.getElementById("export-video-btn").disabled=!1,document.getElementById("manual-record-btn").disabled=!1}catch(e){w(`Audio load error: ${e.message}`,"error")}}}),document.getElementById("play-btn").addEventListener("click",async()=>{try{await M.play(),w("Playback started","success"),document.getElementById("current-mode").textContent=M.choreographyMode.toUpperCase()}catch(c){w(`Play error: ${c.message}`,"error")}}),document.getElementById("pause-btn").addEventListener("click",()=>{M.pause(),w("Playback paused","info")}),document.getElementById("stop-btn").addEventListener("click",()=>{M.stop(),w("Playback stopped","info"),document.getElementById("current-mode").textContent="STOPPED"}),document.querySelectorAll(".system-pill").forEach(c=>{c.addEventListener("click",async()=>{const t=c.dataset.system;w(`Switching to ${t} system...`,"info");try{await M.switchSystem(t),document.getElementById("current-system").textContent=t,document.querySelectorAll(".system-pill").forEach(e=>{e.classList.toggle("active",e.dataset.system===t)}),w(`Switched to ${t}`,"success")}catch(e){w(`System switch error: ${e.message}`,"error")}})}),document.getElementById("analyze-btn").addEventListener("click",async()=>{const c=document.getElementById("gemini-api-key").value.trim();if(!c){w("Please enter Gemini API key","error");return}w("Starting AI analysis...","info");try{const t=await M.analyzeSongWithAI(c);M.applyAIChoreography(t);const e=t.sections?t.sections.length:0;document.getElementById("sequence-count").textContent=e,w(`AI analysis complete: ${e} sections`,"success")}catch(t){w(`AI analysis error: ${t.message}`,"error")}}),document.getElementById("export-video-btn").addEventListener("click",()=>{w("Video export not yet implemented","info"),w("RecordingEngine integration pending","info")}),document.getElementById("manual-record-btn").addEventListener("click",()=>{w("Manual recording not yet implemented","info")})}window.addEventListener("DOMContentLoaded",()=>{w("DOM ready, initializing...","info"),ut()});
