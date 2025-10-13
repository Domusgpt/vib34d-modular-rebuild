(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function e(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(o){if(o.ep)return;o.ep=!0;const s=e(o);fetch(o.href,s)}})();class O{constructor(t){this.choreographer=t,this.mediaRecorder=null,this.recordedChunks=[],this.isRecording=!1,this.recordingStartTime=0,this.recordingTimer=null,this.recordingCanvas=null,this.recordingAudioDest=null}async startRecording(){try{console.log("🎥 Starting stable recording system...");const t=document.getElementById("stage-container"),e=window.innerWidth,i=window.innerHeight;this.recordingCanvas=document.createElement("canvas"),this.recordingCanvas.width=e,this.recordingCanvas.height=i,this.recordingCanvas.id="recording-canvas",this.recordingCanvas.style.display="none",document.body.appendChild(this.recordingCanvas);const o=this.recordingCanvas.getContext("2d",{alpha:!1});console.log(`📐 Recording canvas: ${e}x${i}`);const s=this.recordingCanvas.captureStream(30);if(this.choreographer.audioElement&&this.choreographer.audioSource){this.recordingAudioDest=this.choreographer.audioContext.createMediaStreamDestination(),this.choreographer.audioSource.connect(this.recordingAudioDest);const m=this.recordingAudioDest.stream.getAudioTracks()[0];m&&(s.addTrack(m),console.log("🔊 Audio track added to recording"))}const a={mimeType:"video/webm;codecs=vp9",videoBitsPerSecond:8e6};MediaRecorder.isTypeSupported(a.mimeType)||(a.mimeType="video/webm;codecs=vp8",a.videoBitsPerSecond=6e6),this.mediaRecorder=new MediaRecorder(s,a),this.recordedChunks=[],this.mediaRecorder.ondataavailable=m=>{m.data.size>0&&this.recordedChunks.push(m.data)},this.mediaRecorder.onstop=()=>{this.saveRecording()};let r=null,n=0,c=0;const h=()=>{if(!this.isRecording)return;if(n++,this.choreographer.audioElement&&this.choreographer.sequences&&this.choreographer.sequences.length>0){const g=this.choreographer.audioElement.currentTime;this.choreographer.updateChoreographyAtTime(g)}const m=this.choreographer.systems[this.choreographer.currentSystem];if(m&&m.engine)try{if(this.choreographer.audioElement&&(m.engine.time=this.choreographer.audioElement.currentTime),m.engine.updateVisualizers)m.engine.updateVisualizers();else if(m.engine.visualizers){const g=this.choreographer.getCurrentParameters();g.time=m.engine.time||0,m.engine.visualizers.forEach(y=>{y&&y.updateParameters&&y.render&&(y.updateParameters(g),y.render())})}}catch(g){console.warn("📹 Visualizer render failed:",g.message)}o.fillStyle="#000000",o.fillRect(0,0,this.recordingCanvas.width,this.recordingCanvas.height);const p=Array.from(t.querySelectorAll("canvas"));p.length!==c&&(console.log(`📹 Recording frame ${n}: ${p.length} canvases (was ${c})`),c=p.length);let f=!1;if(p.forEach(g=>{if(g&&g.width>0&&g.height>0)try{o.drawImage(g,0,0,this.recordingCanvas.width,this.recordingCanvas.height),f=!0}catch(y){console.warn(`📹 Frame ${n}: Failed to capture canvas`,y.message)}}),f)try{r=o.getImageData(0,0,this.recordingCanvas.width,this.recordingCanvas.height)}catch{}else if(r){console.log(`📹 Frame ${n}: Using buffered frame (${p.length} canvases available)`);try{o.putImageData(r,0,0)}catch{}}else console.log(`📹 Frame ${n}: No frame to capture (${p.length} canvases, no buffer)`);requestAnimationFrame(h)};this.mediaRecorder.start(100),this.isRecording=!0,requestAnimationFrame(h);const d=document.getElementById("start-recording-btn"),u=document.getElementById("stop-recording-btn");d&&(d.style.display="none"),u&&(u.style.display="block"),this.recordingStartTime=Date.now(),this.recordingTimer=setInterval(()=>{const m=Math.floor((Date.now()-this.recordingStartTime)/1e3),p=Math.floor(m/60),f=m%60,g=document.getElementById("recording-timer");g&&(g.textContent=`⏺ REC ${p}:${f.toString().padStart(2,"0")}`,g.style.display="block")},1e3),console.log("✅ Recording started - stable system-switch-proof capture")}catch(t){console.error("❌ Recording error:",t),alert(`Failed to start recording: ${t.message}`),this.isRecording=!1}}stopRecording(){if(!this.mediaRecorder||!this.isRecording)return;if(this.isRecording=!1,this.mediaRecorder.stop(),this.recordingCanvas&&this.recordingCanvas.parentNode&&(this.recordingCanvas.parentNode.removeChild(this.recordingCanvas),this.recordingCanvas=null),this.recordingAudioDest)try{this.recordingAudioDest.disconnect(),this.recordingAudioDest=null}catch(o){console.warn("Error disconnecting recording audio:",o)}this.recordingTimer&&(clearInterval(this.recordingTimer),this.recordingTimer=null);const t=document.getElementById("start-recording-btn"),e=document.getElementById("stop-recording-btn"),i=document.getElementById("recording-timer");t&&(t.style.display="block"),e&&(e.style.display="none"),i&&(i.textContent="💾 Saving video..."),console.log("🎥 Recording stopped - processing video...")}saveRecording(){const t=new Blob(this.recordedChunks,{type:"video/webm"}),e=(t.size/(1024*1024)).toFixed(2);console.log(`💾 Saving video: ${e} MB`);const i=URL.createObjectURL(t),o=document.createElement("a");o.style.display="none",o.href=i,o.download=`vib34d-choreography-${Date.now()}.webm`,document.body.appendChild(o),o.click(),setTimeout(()=>{document.body.removeChild(o),URL.revokeObjectURL(i)},100);const s=document.getElementById("recording-timer");s&&(s.textContent=`✅ Video saved! (${e} MB)`,setTimeout(()=>{s.style.display="none",s.textContent=""},5e3)),console.log(`✅ Recording saved: ${e} MB`)}}class G{constructor(t){this.choreographer=t,this.lastBeatTime=0,this.beatHistory=[],this.avgBeatInterval=0,this.beatPhase=0,this.rhythmicPulse=0,this.peakDetector={bass:0,mid:0,high:0,energy:0},this.energyMomentum={bass:0,mid:0,high:0},this.energyHistory=[],this.lastModeChange=0}getAudioData(){return{bass:this.energyMomentum.bass,mid:this.energyMomentum.mid,high:this.energyMomentum.high,energy:this.peakDetector.energy,isBeat:performance.now()-this.lastBeatTime<100,beatPhase:this.beatPhase,rhythmicPulse:this.rhythmicPulse}}getFrequencyRange(t,e,i){let o=0;for(let s=e;s<i&&s<t.length;s++)o+=t[s];return o/(i-e)}startAnalysisLoop(){const t=this.choreographer.analyser;if(!t){console.warn("⚠️ No analyser available");return}const e=t.frequencyBinCount,i=new Uint8Array(e);let o=performance.now();const s=()=>{if(requestAnimationFrame(s),!this.choreographer.audioReactive||!t)return;const a=performance.now(),r=(a-o)/1e3;o=a,t.getByteFrequencyData(i);const n=this.getFrequencyRange(i,0,100)/255,c=this.getFrequencyRange(i,100,250)/255,h=this.getFrequencyRange(i,250,500)/255,d=this.getFrequencyRange(i,500,800)/255,u=this.getFrequencyRange(i,800,1024)/255,m=(n*2+c+h+d+u)/6,p=this.peakDetector.bass*.7+.3;let f=!1;if(n>p&&a-this.lastBeatTime>250&&(f=!0,this.lastBeatTime=a,this.beatHistory.push(a),this.beatHistory.length>8&&this.beatHistory.shift(),this.beatHistory.length>=4)){const g=[];for(let y=1;y<this.beatHistory.length;y++)g.push(this.beatHistory[y]-this.beatHistory[y-1]);this.avgBeatInterval=g.reduce((y,v)=>y+v,0)/g.length}if(this.avgBeatInterval>0){const g=a-this.lastBeatTime;this.beatPhase=g/this.avgBeatInterval%1,this.rhythmicPulse=Math.sin(this.beatPhase*Math.PI*2)*.5+.5}if(this.peakDetector.bass=Math.max(this.peakDetector.bass*.99,n),this.peakDetector.mid=Math.max(this.peakDetector.mid*.99,h),this.peakDetector.high=Math.max(this.peakDetector.high*.99,u),this.peakDetector.energy=Math.max(this.peakDetector.energy*.99,m),this.energyMomentum.bass+=(n-this.energyMomentum.bass)*.15,this.energyMomentum.mid+=(h-this.energyMomentum.mid)*.12,this.energyMomentum.high+=(u-this.energyMomentum.high)*.18,this.energyHistory.push(m),this.energyHistory.length>120&&this.energyHistory.shift(),a-this.lastModeChange>5e3){const g=this.energyHistory.reduce((x,M)=>x+M,0)/this.energyHistory.length,y=this.energyHistory.map(x=>Math.abs(x-g)).reduce((x,M)=>x+M,0)/this.energyHistory.length;let v=this.choreographer.choreographyMode;g>.7&&y>.2?v="chaos":g>.5?v="pulse":y>.15?v="dynamic":g<.3?v="flow":v="wave",v!==this.choreographer.choreographyMode&&(this.choreographer.choreographyMode=v,this.lastModeChange=a,console.log(`🎭 Choreography mode: ${v} (energy=${g.toFixed(2)}, variance=${y.toFixed(2)})`))}this.choreographer.applyAdvancedChoreography({bass:n,lowMid:c,mid:h,highMid:d,high:u,energy:m,isBeat:f,beatPhase:this.beatPhase,rhythmicPulse:this.rhythmicPulse,momentum:this.energyMomentum,peaks:this.peakDetector,dt:r})};s()}getAudioData(){return{bass:this.energyMomentum.bass,mid:this.energyMomentum.mid,high:this.energyMomentum.high,bassPeak:this.peakDetector.bass,midPeak:this.peakDetector.mid,highPeak:this.peakDetector.high,energy:this.peakDetector.energy,beatPhase:this.beatPhase,rhythmicPulse:this.rhythmicPulse,isBeat:performance.now()-this.lastBeatTime<100}}getBPM(){return this.avgBeatInterval===0?0:Math.round(6e4/this.avgBeatInterval)}}class U{constructor(){this.enabled=!0,this.metrics={fps:0,frameTime:0,renderTime:0,cpuUsage:0,memoryUsage:0,gpuStalls:0,activeVisualizers:0,canvasCount:0},this.history={fps:[],frameTime:[],renderTime:[],maxHistorySize:300},this.thresholds={targetFPS:60,minAcceptableFPS:30,maxFrameTime:33.33,memoryWarning:500,memoryCritical:1e3},this.lastFrameTime=performance.now(),this.frameCount=0,this.startTime=performance.now(),this.optimizationSuggestions=[],this.warningCallbacks=[],console.log("📊 PerformanceMonitor initialized")}start(){this.enabled&&this.monitoringLoop()}monitoringLoop(){this.enabled&&requestAnimationFrame(()=>{this.update(),this.monitoringLoop()})}update(){const t=performance.now(),e=t-this.lastFrameTime;this.frameCount++;const i=t-this.startTime;this.metrics.fps=Math.round(this.frameCount/i*1e3),this.metrics.frameTime=e,this.addToHistory("fps",this.metrics.fps),this.addToHistory("frameTime",e),i>=1e3&&(this.frameCount=0,this.startTime=t),this.lastFrameTime=t,this.checkPerformance()}addToHistory(t,e){this.history[t]&&(this.history[t].push(e),this.history[t].length>this.history.maxHistorySize&&this.history[t].shift())}startRender(){this.renderStartTime=performance.now()}endRender(){this.renderStartTime&&(this.metrics.renderTime=performance.now()-this.renderStartTime,this.addToHistory("renderTime",this.metrics.renderTime))}setVisualizerCount(t){this.metrics.activeVisualizers=t}setCanvasCount(t){this.metrics.canvasCount=t}recordGPUStall(){this.metrics.gpuStalls++}checkPerformance(){this.optimizationSuggestions=[],this.metrics.fps<this.thresholds.minAcceptableFPS&&(this.optimizationSuggestions.push({severity:"high",message:`Low FPS detected: ${this.metrics.fps} (target: ${this.thresholds.targetFPS})`,suggestions:["Reduce number of active visualizers","Lower grid density parameter","Disable some canvas layers","Switch to simpler visualization system"]}),this.triggerWarning("low_fps",this.metrics.fps)),this.metrics.frameTime>this.thresholds.maxFrameTime&&this.optimizationSuggestions.push({severity:"medium",message:`High frame time: ${this.metrics.frameTime.toFixed(2)}ms`,suggestions:["Optimize render loop","Reduce complexity of active geometry","Consider using lower quality settings"]}),this.metrics.activeVisualizers>10&&this.optimizationSuggestions.push({severity:"medium",message:`High visualizer count: ${this.metrics.activeVisualizers}`,suggestions:["Some systems may be creating redundant visualizers","Consider cleaning up unused visualizers"]}),this.metrics.gpuStalls>100&&this.optimizationSuggestions.push({severity:"high",message:`Frequent GPU stalls detected: ${this.metrics.gpuStalls}`,suggestions:["Reduce ReadPixels operations","Optimize shader complexity","Use texture pooling"]})}getAverage(t){return!this.history[t]||this.history[t].length===0?0:this.history[t].reduce((i,o)=>i+o,0)/this.history[t].length}getSummary(){return{current:{...this.metrics},averages:{fps:Math.round(this.getAverage("fps")),frameTime:this.getAverage("frameTime").toFixed(2),renderTime:this.getAverage("renderTime").toFixed(2)},status:this.getPerformanceStatus(),suggestions:this.optimizationSuggestions}}getPerformanceStatus(){return this.metrics.fps>=this.thresholds.targetFPS?"excellent":this.metrics.fps>=this.thresholds.minAcceptableFPS?"good":this.metrics.fps>=20?"poor":"critical"}onWarning(t){this.warningCallbacks.push(t)}triggerWarning(t,e){this.warningCallbacks.forEach(i=>{try{i(t,e,this.getSummary())}catch(o){console.error("Performance warning callback error:",o)}})}getGrade(){const t=this.getAverage("fps");return t>=55?"A":t>=45?"B":t>=35?"C":t>=25?"D":"F"}reset(){this.frameCount=0,this.startTime=performance.now(),this.history.fps=[],this.history.frameTime=[],this.history.renderTime=[],this.metrics.gpuStalls=0,console.log("📊 Performance metrics reset")}setEnabled(t){this.enabled=t,t?(console.log("📊 Performance monitoring enabled"),this.start()):console.log("📊 Performance monitoring disabled")}getReport(){return{summary:this.getSummary(),grade:this.getGrade(),recommendations:this.getRecommendations(),timestamp:new Date().toISOString()}}getRecommendations(){const t=this.getPerformanceStatus(),e=[];return(t==="poor"||t==="critical")&&(e.push({priority:"high",category:"quality",action:"Reduce visual quality settings",impact:"Will improve FPS by 20-40%"}),e.push({priority:"high",category:"system",action:"Switch to simpler visualization system",impact:"Faceted system is lighter than Quantum or Holographic"})),this.metrics.activeVisualizers>5&&e.push({priority:"medium",category:"optimization",action:"Reduce number of canvas layers",impact:"Each layer adds ~10-20% overhead"}),e}}class Y{constructor(t){this.choreographer=t,this.presets=this.getDefaultPresets(),this.currentPreset=null,this.loadPresetsFromStorage(),console.log("🎨 PresetManager initialized with",Object.keys(this.presets).length,"presets")}getDefaultPresets(){return{"chill-ambient":{name:"Chill Ambient",description:"Smooth, flowing visuals for ambient music",system:"holographic",mode:"flow",parameters:{geometry:3,gridDensity:8,morphFactor:.5,chaos:.1,speed:.5,hue:200,intensity:.3,saturation:.6,rot4dXW:.001,rot4dYW:.002,rot4dZW:.001},reactivity:.3,colorPalette:"ocean",sweeps:[]},"edm-drop":{name:"EDM Drop",description:"Intense, chaotic visuals for drops and heavy sections",system:"quantum",mode:"chaos",parameters:{geometry:7,gridDensity:25,morphFactor:2,chaos:.8,speed:2,hue:330,intensity:.9,saturation:1,rot4dXW:.05,rot4dYW:.08,rot4dZW:.06},reactivity:1,colorPalette:"fire",sweeps:["pulse-train","exponential-decay"]},"techno-pulse":{name:"Techno Pulse",description:"Rhythmic, beat-locked visuals for techno",system:"faceted",mode:"pulse",parameters:{geometry:4,gridDensity:18,morphFactor:1.2,chaos:.3,speed:1.5,hue:180,intensity:.7,saturation:.8,rot4dXW:.02,rot4dYW:.03,rot4dZW:.02},reactivity:.8,colorPalette:"neon",sweeps:["sine-wave"]},"progressive-build":{name:"Progressive Build",description:"Gradually intensifying visuals for buildups",system:"quantum",mode:"build",parameters:{geometry:5,gridDensity:12,morphFactor:.8,chaos:.2,speed:1,hue:270,intensity:.4,saturation:.7,rot4dXW:.01,rot4dYW:.015,rot4dZW:.01},reactivity:.6,colorPalette:"rainbow",sweeps:["linear-sweep"]},"glitch-experimental":{name:"Glitch Experimental",description:"Stuttering, glitchy visuals for IDM/experimental",system:"holographic",mode:"glitch",parameters:{geometry:9,gridDensity:20,morphFactor:1.5,chaos:.9,speed:1.8,hue:120,intensity:.8,saturation:.9,rot4dXW:.1,rot4dYW:.15,rot4dZW:.12},reactivity:.9,colorPalette:"neon",sweeps:["pulse-train","sawtooth"]},"dnb-liquid":{name:"Liquid DnB",description:"Fluid, organic morphing for liquid drum & bass",system:"faceted",mode:"liquid",parameters:{geometry:6,gridDensity:15,morphFactor:1.8,chaos:.4,speed:1.3,hue:180,intensity:.6,saturation:.75,rot4dXW:.03,rot4dYW:.04,rot4dZW:.035},reactivity:.75,colorPalette:"ocean",sweeps:["triangle","sine-wave"]},"minimal-deep":{name:"Minimal Deep",description:"Subtle, minimalist visuals for deep house",system:"holographic",mode:"wave",parameters:{geometry:2,gridDensity:10,morphFactor:.6,chaos:.15,speed:.7,hue:240,intensity:.4,saturation:.5,rot4dXW:.005,rot4dYW:.008,rot4dZW:.006},reactivity:.4,colorPalette:"ocean",sweeps:[]},"strobe-hard":{name:"Hard Strobe",description:"Extreme flashing for hard techno/industrial",system:"quantum",mode:"strobe",parameters:{geometry:8,gridDensity:30,morphFactor:2.5,chaos:1,speed:2.5,hue:0,intensity:1,saturation:1,rot4dXW:.08,rot4dYW:.1,rot4dZW:.09},reactivity:1,colorPalette:"fire",sweeps:["pulse-train"]}}}async applyPreset(t){const e=this.presets[t];if(!e)return console.warn(`Preset "${t}" not found`),!1;console.log(`🎨 Applying preset: ${e.name}`);try{return e.system!==this.choreographer.currentSystem&&await this.choreographer.switchSystem(e.system),this.choreographer.choreographyMode=e.mode,Object.entries(e.parameters).forEach(([i,o])=>{this.choreographer.baseParams[i]=o}),this.choreographer.updateSystemParameters(this.choreographer.systems[e.system].engine),this.choreographer.reactivityStrength=e.reactivity,this.currentPreset=t,console.log(`✅ Preset "${e.name}" applied successfully`),!0}catch(i){return console.error(`Failed to apply preset "${t}":`,i),!1}}saveCurrentAsPreset(t,e=""){const i={name:t,description:e,system:this.choreographer.currentSystem,mode:this.choreographer.choreographyMode,parameters:{...this.choreographer.baseParams},reactivity:this.choreographer.reactivityStrength,custom:!0,createdAt:new Date().toISOString()};return this.presets[t.toLowerCase().replace(/\s+/g,"-")]=i,this.savePresetsToStorage(),console.log(`💾 Saved preset: ${t}`),i}deletePreset(t){const e=this.presets[t];return e?e.custom?(delete this.presets[t],this.savePresetsToStorage(),console.log(`🗑️ Deleted preset: ${e.name}`),!0):(console.warn(`Cannot delete built-in preset "${t}"`),!1):(console.warn(`Preset "${t}" not found`),!1)}getPresetList(){return Object.entries(this.presets).map(([t,e])=>({key:t,name:e.name,description:e.description,system:e.system,mode:e.mode,custom:e.custom||!1}))}getPreset(t){return this.presets[t]}savePresetsToStorage(){try{const t={};Object.entries(this.presets).forEach(([e,i])=>{i.custom&&(t[e]=i)}),localStorage.setItem("vib34d_custom_presets",JSON.stringify(t))}catch(t){console.error("Failed to save presets to localStorage:",t)}}loadPresetsFromStorage(){try{const t=localStorage.getItem("vib34d_custom_presets");if(t){const e=JSON.parse(t);Object.assign(this.presets,e),console.log(`📂 Loaded ${Object.keys(e).length} custom presets`)}}catch(t){console.error("Failed to load presets from localStorage:",t)}}exportPresets(){const t=JSON.stringify(this.presets,null,2),e=new Blob([t],{type:"application/json"}),i=URL.createObjectURL(e),o=document.createElement("a");o.href=i,o.download=`vib34d_presets_${Date.now()}.json`,o.click(),URL.revokeObjectURL(i),console.log("📥 Presets exported")}async importPresets(t){try{const e=await t.text(),i=JSON.parse(e);let o=0;return Object.entries(i).forEach(([s,a])=>{a.custom=!0,a.importedAt=new Date().toISOString(),this.presets[s]=a,o++}),this.savePresetsToStorage(),console.log(`📤 Imported ${o} presets`),o}catch(e){throw console.error("Failed to import presets:",e),e}}}class H{constructor(t){this.choreographer=t,this.enabled=!0,this.shortcuts=this.getDefaultShortcuts(),this.pressedKeys=new Set,this.setupEventListeners(),console.log("⌨️ KeyboardController initialized")}getDefaultShortcuts(){return{Space:{name:"Play/Pause",action:()=>this.togglePlayback(),category:"playback"},KeyS:{name:"Stop",action:()=>this.choreographer.stop(),category:"playback"},Digit1:{name:"Switch to Faceted",action:()=>this.choreographer.switchSystem("faceted"),category:"system"},Digit2:{name:"Switch to Quantum",action:()=>this.choreographer.switchSystem("quantum"),category:"system"},Digit3:{name:"Switch to Holographic",action:()=>this.choreographer.switchSystem("holographic"),category:"system"},"shift+Digit1":{name:"Chaos Mode",action:()=>this.setMode("chaos"),category:"mode"},"shift+Digit2":{name:"Pulse Mode",action:()=>this.setMode("pulse"),category:"mode"},"shift+Digit3":{name:"Wave Mode",action:()=>this.setMode("wave"),category:"mode"},"shift+Digit4":{name:"Flow Mode",action:()=>this.setMode("flow"),category:"mode"},"shift+Digit5":{name:"Dynamic Mode",action:()=>this.setMode("dynamic"),category:"mode"},ArrowUp:{name:"Increase Intensity",action:()=>this.adjustParameter("intensity",.1),category:"parameters"},ArrowDown:{name:"Decrease Intensity",action:()=>this.adjustParameter("intensity",-.1),category:"parameters"},ArrowRight:{name:"Increase Speed",action:()=>this.adjustParameter("speed",.2),category:"parameters"},ArrowLeft:{name:"Decrease Speed",action:()=>this.adjustParameter("speed",-.2),category:"parameters"},BracketRight:{name:"Increase Grid Density",action:()=>this.adjustParameter("gridDensity",2),category:"parameters"},BracketLeft:{name:"Decrease Grid Density",action:()=>this.adjustParameter("gridDensity",-2),category:"parameters"},Equal:{name:"Increase Chaos",action:()=>this.adjustParameter("chaos",.1),category:"parameters"},Minus:{name:"Decrease Chaos",action:()=>this.adjustParameter("chaos",-.1),category:"parameters"},KeyR:{name:"Toggle Audio Reactivity",action:()=>this.toggleReactivity(),category:"audio"},"shift+KeyR":{name:"Increase Reactivity",action:()=>this.adjustReactivity(.1),category:"audio"},"ctrl+KeyR":{name:"Decrease Reactivity",action:()=>this.adjustReactivity(-.1),category:"audio"},KeyE:{name:"Start/Stop Export",action:()=>this.toggleExport(),category:"export"},"shift+KeyE":{name:"Quick Screenshot",action:()=>this.takeScreenshot(),category:"export"},KeyF:{name:"Toggle Fullscreen",action:()=>this.toggleFullscreen(),category:"view"},KeyH:{name:"Toggle UI",action:()=>this.toggleUI(),category:"view"},KeyP:{name:"Toggle Performance Monitor",action:()=>this.togglePerformanceMonitor(),category:"view"},"ctrl+KeyZ":{name:"Undo Last Change",action:()=>this.undo(),category:"utility"},"ctrl+KeyS":{name:"Save Current State",action:()=>this.saveState(),category:"utility"},Escape:{name:"Cancel/Close",action:()=>this.cancel(),category:"utility"},slash:{name:"Show Shortcuts Help",action:()=>this.showHelp(),category:"utility"}}}setupEventListeners(){window.addEventListener("keydown",t=>this.handleKeyDown(t)),window.addEventListener("keyup",t=>this.handleKeyUp(t))}handleKeyDown(t){if(!this.enabled||t.target.tagName==="INPUT"||t.target.tagName==="TEXTAREA")return;this.pressedKeys.add(t.code);const e=[];t.ctrlKey&&e.push("ctrl"),t.shiftKey&&e.push("shift"),t.altKey&&e.push("alt");const i=[...e,t.code].join("+");let o=this.shortcuts[i];if(!o&&e.length>0&&(o=this.shortcuts[t.code]),o){t.preventDefault();try{o.action(),console.log(`⌨️ Executed: ${o.name}`)}catch(s){console.error(`Failed to execute ${o.name}:`,s)}}}handleKeyUp(t){this.pressedKeys.delete(t.code)}togglePlayback(){this.choreographer.audioElement&&!this.choreographer.audioElement.paused?this.choreographer.pause():this.choreographer.play().catch(t=>console.error("Play failed:",t))}setMode(t){this.choreographer.choreographyMode=t,console.log(`🎭 Mode set to: ${t}`)}adjustParameter(t,e){let o=(this.choreographer.baseParams[t]||0)+e;t==="intensity"||t==="chaos"?o=Math.max(0,Math.min(1,o)):t==="speed"?o=Math.max(.1,Math.min(5,o)):t==="gridDensity"&&(o=Math.max(1,Math.min(50,o))),this.choreographer.baseParams[t]=o;const s=this.choreographer.systems[this.choreographer.currentSystem];s.engine&&this.choreographer.updateSystemParameters(s.engine),console.log(`📊 ${t} = ${o.toFixed(2)}`)}toggleReactivity(){this.choreographer.audioReactive=!this.choreographer.audioReactive,console.log(`🔊 Audio reactivity: ${this.choreographer.audioReactive?"ON":"OFF"}`)}adjustReactivity(t){this.choreographer.reactivityStrength=Math.max(0,Math.min(1,this.choreographer.reactivityStrength+t)),console.log(`🔊 Reactivity strength: ${this.choreographer.reactivityStrength.toFixed(2)}`)}toggleExport(){console.log("📹 Export toggled (not yet implemented)")}takeScreenshot(){const t=document.querySelector("canvas");t&&t.toBlob(e=>{const i=URL.createObjectURL(e),o=document.createElement("a");o.href=i,o.download=`vib34d_${Date.now()}.png`,o.click(),URL.revokeObjectURL(i),console.log("📸 Screenshot saved")})}toggleFullscreen(){document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen().catch(t=>{console.error("Fullscreen failed:",t)})}toggleUI(){const t=document.getElementById("control-panel"),e=document.getElementById("mode-display");t&&(t.style.display=t.style.display==="none"?"block":"none"),e&&(e.style.display=e.style.display==="none"?"block":"none")}togglePerformanceMonitor(){console.log("📊 Performance monitor toggled (UI pending)")}undo(){console.log("↶ Undo (history system pending)")}saveState(){if(this.choreographer.presetManager){const t=prompt("Enter preset name:");t&&this.choreographer.presetManager.saveCurrentAsPreset(t)}}cancel(){console.log("❌ Cancel")}showHelp(){const t={};Object.entries(this.shortcuts).forEach(([e,i])=>{t[i.category]||(t[i.category]=[]),t[i.category].push({key:this.formatKey(e),name:i.name})}),console.log("⌨️ KEYBOARD SHORTCUTS:"),Object.entries(t).forEach(([e,i])=>{console.log(`
${e.toUpperCase()}:`),i.forEach(o=>{console.log(`  ${o.key.padEnd(20)} - ${o.name}`)})}),this.showHelpUI(t)}formatKey(t){return t.replace("shift+","⇧ ").replace("ctrl+","⌃ ").replace("alt+","⌥ ").replace("Key","").replace("Digit","").replace("Arrow","⬆️⬇️⬅️➡️ ")}showHelpUI(t){let e=document.getElementById("shortcuts-help-modal");e||(e=document.createElement("div"),e.id="shortcuts-help-modal",e.style.cssText=`
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
            `,document.body.appendChild(e));let i='<h2 style="margin-top: 0; text-align: center;">⌨️ KEYBOARD SHORTCUTS</h2>';i+='<p style="text-align: center; font-size: 10px; opacity: 0.7;">Press ESC or / to close</p>',Object.entries(t).forEach(([s,a])=>{i+=`<h3 style="margin-top: 20px; color: #0ff;">${s.toUpperCase()}</h3>`,i+='<table style="width: 100%; font-size: 11px;">',a.forEach(r=>{i+=`<tr>
                    <td style="padding: 5px; color: #fff;">${r.key}</td>
                    <td style="padding: 5px;">${r.name}</td>
                </tr>`}),i+="</table>"}),i+=`<p style="text-align: center; margin-top: 20px;"><button onclick="this.parentElement.parentElement.style.display='none'" style="background: #0ff; color: #000; border: none; padding: 10px 20px; cursor: pointer;">Close</button></p>`,e.innerHTML=i,e.style.display="block";const o=s=>{(s.key==="Escape"||s.key==="/")&&(e.style.display="none",window.removeEventListener("keydown",o))};window.addEventListener("keydown",o)}setEnabled(t){this.enabled=t,console.log(`⌨️ Keyboard controls: ${t?"enabled":"disabled"}`)}addShortcut(t,e,i,o="custom"){this.shortcuts[t]={name:e,action:i,category:o},console.log(`⌨️ Added shortcut: ${t} -> ${e}`)}removeShortcut(t){delete this.shortcuts[t],console.log(`⌨️ Removed shortcut: ${t}`)}}function q(l,t,e,i,o){switch(l){case"chaos":X(t,e,i,o);break;case"pulse":N(t,e,i,o);break;case"wave":Z(t,e,i,o);break;case"flow":j(t,e,i,o);break;case"dynamic":_(t,e,i,o);break;case"strobe":K(t,e,i,o);break;case"glitch":Q(t,e,i,o);break;case"build":J(t,e,i,o);break;case"breakdown":tt(t,e,i,o);break;case"liquid":et(t,e,i,o);break;default:_(t,e,i,o)}}function X(l,t,e,i){const o=l.isBeat?1:l.momentum.bass,s=i.gridDensity+l.bass*60*e+o*20,a=l.high*180*e+l.rhythmicPulse*60,r=(i.hue+a)%360,n=i.morphFactor+Math.pow(l.mid,2)*1.5*e,c=i.chaos+l.energy*.8*e+(l.isBeat?.2:0),h=i.speed*(1+l.energy*2*e)*(l.isBeat?1.5:1),d=Math.min(1,i.intensity*(.6+l.peaks.energy*.8*e)),u=Math.min(1,i.saturation*(.8+l.high*.5*e)),m=i.rot4dXW+l.bass*4*e+(l.isBeat?1.5:0),p=i.rot4dYW+l.mid*5*e-l.lowMid*2*e,f=i.rot4dZW+l.high*6*e+l.rhythmicPulse*2;t("gridDensity",Math.floor(s)),t("hue",Math.floor(r)),t("morphFactor",Math.min(2,n)),t("chaos",Math.min(1,c)),t("speed",Math.min(3,h)),t("intensity",d),t("saturation",u),t("rot4dXW",Math.max(-6.28,Math.min(6.28,m))),t("rot4dYW",Math.max(-6.28,Math.min(6.28,p))),t("rot4dZW",Math.max(-6.28,Math.min(6.28,f)))}function N(l,t,e,i){const o=.7+l.rhythmicPulse*.6,s=i.gridDensity*o+l.bass*40*e,a=Math.floor(l.beatPhase*4)*90,r=(i.hue+a+l.lowMid*30*e)%360,n=i.morphFactor*(.8+l.rhythmicPulse*.4),c=l.isBeat?1:.6+l.momentum.bass*.4,h=Math.min(1,i.intensity*c),d=i.speed*(.9+l.rhythmicPulse*.3*e),u=Math.min(1,i.saturation*(.85+l.mid*.3*e)),m=i.rot4dXW+l.rhythmicPulse*3*e,p=i.rot4dYW+Math.sin(l.beatPhase*Math.PI)*2*e,f=i.rot4dZW+(l.isBeat?.8:0)+l.bass*1.5*e;t("gridDensity",Math.floor(s)),t("hue",Math.floor(r)),t("morphFactor",Math.min(2,n)),t("intensity",h),t("speed",Math.min(3,d)),t("saturation",u),t("rot4dXW",Math.max(-6.28,Math.min(6.28,m))),t("rot4dYW",Math.max(-6.28,Math.min(6.28,p))),t("rot4dZW",Math.max(-6.28,Math.min(6.28,f)))}function Z(l,t,e,i){const o=performance.now()*3e-4,s=Math.sin(o)*.3+Math.sin(o*1.7)*.2,a=i.gridDensity+l.momentum.bass*25*e+s*15,r=Math.sin(o*.8)*45,n=(i.hue+r+l.mid*20*e)%360,c=i.morphFactor+l.momentum.mid*.8*e,h=i.chaos+(Math.sin(o*2.3)*.2+.2)*(l.energy*e),d=i.speed*(.9+l.momentum.high*.4*e),u=Math.min(1,i.intensity*(.75+l.momentum.mid*.4*e+Math.sin(o*1.5)*.15)),m=i.rot4dXW+Math.sin(o*1.2)*1.5*e+l.momentum.bass*.5,p=i.rot4dYW+Math.cos(o*.9)*1.8*e+l.momentum.mid*.6,f=i.rot4dZW+Math.sin(o*1.5+Math.PI/3)*1.2*e+l.momentum.high*.4;t("gridDensity",Math.floor(a)),t("hue",Math.floor(n)),t("morphFactor",Math.min(2,c)),t("chaos",Math.min(1,h)),t("speed",Math.min(3,d)),t("intensity",u),t("rot4dXW",Math.max(-6.28,Math.min(6.28,m))),t("rot4dYW",Math.max(-6.28,Math.min(6.28,p))),t("rot4dZW",Math.max(-6.28,Math.min(6.28,f)))}function j(l,t,e,i){const o=i.gridDensity+l.bass*10*e,s=(i.hue+l.lowMid*15*e)%360,a=i.morphFactor+l.mid*.3*e,r=i.chaos*(.5+l.energy*.3*e),n=i.speed*(.85+l.high*.2*e),c=Math.min(1,i.intensity*(.8+l.energy*.25*e)),h=Math.min(1,i.saturation*(.9+l.mid*.15*e)),d=performance.now()*1e-4,u=i.rot4dXW+Math.sin(d)*.5*e+l.bass*.2,m=i.rot4dYW+Math.cos(d*1.3)*.6*e+l.mid*.15,p=i.rot4dZW+Math.sin(d*.7)*.4*e+l.high*.1;t("gridDensity",Math.floor(o)),t("hue",Math.floor(s)),t("morphFactor",Math.min(2,a)),t("chaos",Math.min(1,r)),t("speed",Math.min(3,n)),t("intensity",c),t("saturation",h),t("rot4dXW",Math.max(-6.28,Math.min(6.28,u))),t("rot4dYW",Math.max(-6.28,Math.min(6.28,m))),t("rot4dZW",Math.max(-6.28,Math.min(6.28,p)))}function _(l,t,e,i){const o=i.gridDensity+l.bass*35*e+l.mid*15*e,s=l.bass*30,a=l.mid*45,r=l.high*60,n=(i.hue+s+a+r*e)%360,c=i.morphFactor+l.mid*1*e+(l.isBeat?.3:0),h=i.chaos+l.highMid*.6*e+(l.peaks.energy-l.energy)*.3,d=i.speed*(1+l.high*1.2*e)*(l.isBeat?1.2:1),u=Math.min(1,i.intensity*(.7+l.momentum.mid*.5*e+l.energy*.3)),m=Math.min(1,i.saturation*(.85+l.energy*.3*e)),p=i.rot4dXW+l.bass*2.5*e+l.momentum.bass*1,f=i.rot4dYW+l.mid*3*e+(l.isBeat?.5:0),g=i.rot4dZW+l.high*3.5*e+l.momentum.high*.8;t("gridDensity",Math.floor(o)),t("hue",Math.floor(n)),t("morphFactor",Math.min(2,c)),t("chaos",Math.min(1,h)),t("speed",Math.min(3,d)),t("intensity",u),t("saturation",m),t("rot4dXW",Math.max(-6.28,Math.min(6.28,p))),t("rot4dYW",Math.max(-6.28,Math.min(6.28,f))),t("rot4dZW",Math.max(-6.28,Math.min(6.28,g)))}function K(l,t,e,i){const o=Math.floor(performance.now()/100)%2,s=l.isBeat?1.5:o,a=i.gridDensity+l.bass*50*e*s,r=Math.floor(l.beatPhase*8)*45,n=(i.hue+r+l.high*90*e)%360,h=(l.isBeat?2:o?1.5:.5)*e,d=o?i.chaos+.5*e:i.chaos,u=i.speed*(1+l.isBeat?2:o*1.5*e),m=o?i.intensity+l.bass*e:i.intensity*.3,p=Math.min(1,o?1:.5),f=i.rot4dXW+(o?l.bass*4*e:0),g=i.rot4dYW+(l.isBeat?2:o*1.5*e),y=i.rot4dZW+l.high*5*e*o;t("gridDensity",Math.floor(a)),t("hue",Math.floor(n)),t("morphFactor",Math.min(2,h)),t("chaos",Math.min(1,d)),t("speed",Math.min(3,u)),t("intensity",Math.min(1,m)),t("saturation",p),t("rot4dXW",Math.max(-6.28,Math.min(6.28,f))),t("rot4dYW",Math.max(-6.28,Math.min(6.28,g))),t("rot4dZW",Math.max(-6.28,Math.min(6.28,y)))}function Q(l,t,e,i){const o=l.high>.7||Math.random()<.05,s=o?Math.random()*80-40:0,a=i.gridDensity+l.mid*30*e+s,r=o?Math.random()*360:0,n=(i.hue+l.bass*45+r)%360,c=o?Math.random()*1.5:l.mid*e,h=i.morphFactor+c,d=i.chaos+l.highMid*.8*e+(o?.4:0),u=o?Math.random()*2:1,m=i.speed*u*(1+l.energy*e),p=o?Math.random()<.5?.1:1:.7+l.momentum.bass*.4,f=Math.min(1,i.intensity*p),g=o?Math.random():i.saturation*(.8+l.mid*.3),y=i.rot4dXW+(o?Math.random()*6-3:l.bass*2*e),v=i.rot4dYW+(o?Math.random()*6-3:l.mid*2.5*e),x=i.rot4dZW+(o?Math.random()*6-3:l.high*3*e);t("gridDensity",Math.floor(Math.max(5,Math.min(100,a)))),t("hue",Math.floor(n)),t("morphFactor",Math.min(2,Math.max(0,h))),t("chaos",Math.min(1,Math.max(0,d))),t("speed",Math.min(3,Math.max(.1,m))),t("intensity",Math.min(1,Math.max(0,f))),t("saturation",Math.min(1,Math.max(0,g))),t("rot4dXW",Math.max(-6.28,Math.min(6.28,y))),t("rot4dYW",Math.max(-6.28,Math.min(6.28,v))),t("rot4dZW",Math.max(-6.28,Math.min(6.28,x)))}function J(l,t,e,i){const o=performance.now()%3e4/3e4,s=Math.pow(o,1.5),a=i.gridDensity+s*40+l.bass*30*e,r=(i.hue+o*180+l.mid*20*e)%360,n=i.morphFactor+s*1.2+l.momentum.mid*.5*e,c=i.chaos+s*.6+l.energy*.3*e,h=i.speed*(1+s*1.5)*(1+l.high*.5*e),d=Math.min(1,i.intensity*(.5+s*.7)+l.energy*.3),u=Math.min(1,i.saturation*(.7+s*.4)),m=i.rot4dXW+s*2*e+l.bass*1.5,p=i.rot4dYW+s*2.5*e+l.mid*2,f=i.rot4dZW+s*3*e+l.high*2.5;t("gridDensity",Math.floor(a)),t("hue",Math.floor(r)),t("morphFactor",Math.min(2,n)),t("chaos",Math.min(1,c)),t("speed",Math.min(3,h)),t("intensity",d),t("saturation",u),t("rot4dXW",Math.max(-6.28,Math.min(6.28,m))),t("rot4dYW",Math.max(-6.28,Math.min(6.28,p))),t("rot4dZW",Math.max(-6.28,Math.min(6.28,f)))}function tt(l,t,e,i){const o=Math.max(5,i.gridDensity*.5+l.bass*15*e),s=(i.hue+l.lowMid*10*e)%360,a=i.morphFactor*.6+l.momentum.bass*.3*e,r=i.chaos*.3+l.mid*.2*e,n=i.speed*(.6+l.momentum.mid*.3*e),c=Math.min(1,i.intensity*(.5+l.energy*.4*e)),h=Math.min(1,i.saturation*(.9+l.mid*.15*e)),d=i.rot4dXW+(l.isBeat?l.bass*2*e:0),u=i.rot4dYW+l.momentum.bass*.5*e,m=i.rot4dZW+l.momentum.mid*.6*e;t("gridDensity",Math.floor(o)),t("hue",Math.floor(s)),t("morphFactor",Math.min(2,a)),t("chaos",Math.min(1,r)),t("speed",Math.min(3,n)),t("intensity",c),t("saturation",h),t("rot4dXW",Math.max(-6.28,Math.min(6.28,d))),t("rot4dYW",Math.max(-6.28,Math.min(6.28,u))),t("rot4dZW",Math.max(-6.28,Math.min(6.28,m)))}function et(l,t,e,i){const o=performance.now()*2e-4,s=Math.sin(o)*Math.cos(o*1.7),a=i.gridDensity+l.momentum.bass*30*e+s*12,r=Math.sin(o*1.3)*35+Math.cos(o*.7)*25,n=(i.hue+r+l.mid*15*e)%360,c=i.morphFactor+s*.4+l.momentum.mid*.7*e,h=i.chaos+Math.abs(s)*.3+l.momentum.high*.4*e,d=i.speed*(.85+Math.abs(s)*.3)*(1+l.momentum.bass*.3*e),u=Math.min(1,i.intensity*(.7+l.momentum.mid*.4*e+s*.2)),m=Math.min(1,i.saturation*(.9+l.mid*.2*e)),p=i.rot4dXW+Math.sin(o*1.1)*1.2*e+l.momentum.bass*.6,f=i.rot4dYW+Math.cos(o*.9)*1.5*e+l.momentum.mid*.7,g=i.rot4dZW+Math.sin(o*1.4+Math.PI/4)*1*e+l.momentum.high*.5;t("gridDensity",Math.floor(a)),t("hue",Math.floor(n)),t("morphFactor",Math.min(2,c)),t("chaos",Math.min(1,h)),t("speed",Math.min(3,d)),t("intensity",u),t("saturation",m),t("rot4dXW",Math.max(-6.28,Math.min(6.28,p))),t("rot4dYW",Math.max(-6.28,Math.min(6.28,f))),t("rot4dZW",Math.max(-6.28,Math.min(6.28,g)))}function it(l,t,e,i){Object.entries(l).forEach(([o,s])=>{let a=0;const r=t*2*Math.PI;switch(s.function){case"sine-wave":a=s.offset+s.amplitude*Math.sin(r*(s.frequency||1));break;case"sawtooth":const n=t*(s.frequency||1)%1;a=s.min+(s.max-s.min)*n;break;case"triangle":const c=t*(s.frequency||1)%1;a=s.min+(s.max-s.min)*(c<.5?c*2:(1-c)*2);break;case"pulse-train":a=Math.sin(r*(s.frequency||4))>0?s.max:s.min;break;case"exponential-decay":a=s.max-(s.max-s.min)*(1-Math.exp(-t*3));break;case"linear-sweep":a=s.min+(s.max-s.min)*t;break;default:a=s.offset||0}i(o,a)})}function ot(l,t,e,i,o){const s=l.colors;if(!s||s.length===0)return;let a=0;switch(l.transitionMode){case"beat-pulse":a=Math.floor(e*s.length)%s.length;break;case"smooth-fade":const n=t*s.length;a=Math.floor(n)%s.length;break;case"snap-change":const c=l.barsPerChange||4;a=Math.floor(t*s.length/c)%s.length;break;case"frequency-map":i&&(a=Math.floor(i.bass*s.length)%s.length);break;default:a=0}const r=s[a];r&&(o("hue",r.hue),o("saturation",r.saturation),o("intensity",r.intensity))}function W(l,t="smooth-fade",e=4){return{colors:l.map(i=>({hue:i.hue||0,saturation:i.saturation||.8,intensity:i.intensity||.5})),transitionMode:t,barsPerChange:e}}W([{hue:0,saturation:.8,intensity:.5},{hue:60,saturation:.8,intensity:.5},{hue:120,saturation:.8,intensity:.5},{hue:180,saturation:.8,intensity:.5},{hue:240,saturation:.8,intensity:.5},{hue:300,saturation:.8,intensity:.5}]),W([{hue:0,saturation:1,intensity:.5},{hue:30,saturation:1,intensity:.6},{hue:60,saturation:1,intensity:.7}]),W([{hue:180,saturation:.8,intensity:.4},{hue:200,saturation:.7,intensity:.5},{hue:220,saturation:.6,intensity:.6}]),W([{hue:180,saturation:1,intensity:.8},{hue:300,saturation:1,intensity:.8},{hue:120,saturation:1,intensity:.8}]);class st{constructor(t,e,i,o){if(this.canvas=document.getElementById(t),this.role=e,this.reactivity=i,this.variant=o,!this.canvas){console.error(`Canvas ${t} not found`);return}let s=this.canvas.getBoundingClientRect();const a=Math.min(window.devicePixelRatio||1,2);this.contextOptions={alpha:!0,depth:!0,stencil:!1,antialias:!1,premultipliedAlpha:!0,preserveDrawingBuffer:!1,powerPreference:"high-performance",failIfMajorPerformanceCaveat:!1},this.ensureCanvasSizedThenInitWebGL(s,a),this.mouseX=.5,this.mouseY=.5,this.mouseIntensity=0,this.clickIntensity=0,this.startTime=Date.now(),this.params={geometry:0,gridDensity:15,morphFactor:1,chaos:.2,speed:1,hue:200,intensity:.5,saturation:.8,dimension:3.5,rot4dXW:0,rot4dYW:0,rot4dZW:0,moireScale:1.01,glitchIntensity:.05,lineThickness:.02}}async ensureCanvasSizedThenInitWebGL(t,e){t.width===0||t.height===0?await new Promise(i=>{setTimeout(()=>{if(t=this.canvas.getBoundingClientRect(),t.width===0||t.height===0){const o=window.innerWidth,s=window.innerHeight;this.canvas.width=o*e,this.canvas.height=s*e,window.mobileDebug&&window.mobileDebug.log(`📐 Canvas ${this.canvas.id}: Using viewport fallback ${this.canvas.width}x${this.canvas.height}`)}else this.canvas.width=t.width*e,this.canvas.height=t.height*e,window.mobileDebug&&window.mobileDebug.log(`📐 Canvas ${this.canvas.id}: Layout ready ${this.canvas.width}x${this.canvas.height}`);i()},100)}):(this.canvas.width=t.width*e,this.canvas.height=t.height*e,window.mobileDebug&&window.mobileDebug.log(`📐 Canvas ${this.canvas.id}: ${this.canvas.width}x${this.canvas.height} (DPR: ${e})`)),this.createWebGLContext(),this.gl&&this.init()}createWebGLContext(){let t=this.canvas.getContext("webgl2")||this.canvas.getContext("webgl")||this.canvas.getContext("experimental-webgl");if(t&&!t.isContextLost()){console.log(`🔄 Reusing existing WebGL context for ${this.canvas.id}`),this.gl=t;return}if(this.gl=this.canvas.getContext("webgl2",this.contextOptions)||this.canvas.getContext("webgl",this.contextOptions)||this.canvas.getContext("experimental-webgl",this.contextOptions),this.gl){if(window.mobileDebug){const e=this.gl.getParameter(this.gl.VERSION);window.mobileDebug.log(`✅ WebGL context created for ${this.canvas.id}: ${e} (size: ${this.canvas.width}x${this.canvas.height})`)}}else{console.error(`WebGL not supported for ${this.canvas.id}`),window.mobileDebug&&window.mobileDebug.log(`❌ WebGL context failed for ${this.canvas.id} (size: ${this.canvas.width}x${this.canvas.height})`),this.showWebGLError();return}}init(){this.initShaders(),this.initBuffers(),this.resize()}initShaders(){const t=`attribute vec2 a_position;
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

// MVEP-style audio reactivity enhancements
uniform float u_moireScale;
uniform float u_glitchIntensity;
uniform float u_lineThickness;

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

// MVEP-style moiré pattern function - NOW USES u_moireScale
float moirePattern(vec2 uv, float intensity) {
    float freq1 = 12.0 * u_moireScale + intensity * 6.0;
    float freq2 = 14.0 * u_moireScale + intensity * 8.0;
    float pattern1 = sin(uv.x * freq1) * sin(uv.y * freq1);
    float pattern2 = sin(uv.x * freq2) * sin(uv.y * freq2);
    return (pattern1 * pattern2) * intensity * 0.2 * u_moireScale;
}

// MVEP-style RGB color splitting glitch
vec3 rgbGlitch(vec3 color, vec2 uv, float intensity) {
    vec2 offset = vec2(intensity * 0.005, 0.0);
    float r = color.r + sin(uv.y * 30.0 + u_time * 0.001) * intensity * 0.06;
    float g = color.g + sin(uv.y * 28.0 + u_time * 0.0012) * intensity * 0.06;
    float b = color.b + sin(uv.y * 32.0 + u_time * 0.0008) * intensity * 0.06;
    return vec3(r, g, b);
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

    // Apply line thickness - makes geometry edges thicker or thinner
    value = value / u_lineThickness;

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

    // MVEP-style enhancements: Apply moiré pattern
    color += vec3(moirePattern(uv, u_glitchIntensity));

    // MVEP-style enhancements: Apply RGB color splitting glitch
    color = rgbGlitch(color, uv, u_glitchIntensity);

    gl_FragColor = vec4(color, finalIntensity * u_roleIntensity);
}`;this.program=this.createProgram(t,e),this.uniforms={resolution:this.gl.getUniformLocation(this.program,"u_resolution"),time:this.gl.getUniformLocation(this.program,"u_time"),mouse:this.gl.getUniformLocation(this.program,"u_mouse"),geometry:this.gl.getUniformLocation(this.program,"u_geometry"),gridDensity:this.gl.getUniformLocation(this.program,"u_gridDensity"),morphFactor:this.gl.getUniformLocation(this.program,"u_morphFactor"),chaos:this.gl.getUniformLocation(this.program,"u_chaos"),speed:this.gl.getUniformLocation(this.program,"u_speed"),hue:this.gl.getUniformLocation(this.program,"u_hue"),intensity:this.gl.getUniformLocation(this.program,"u_intensity"),saturation:this.gl.getUniformLocation(this.program,"u_saturation"),dimension:this.gl.getUniformLocation(this.program,"u_dimension"),rot4dXW:this.gl.getUniformLocation(this.program,"u_rot4dXW"),rot4dYW:this.gl.getUniformLocation(this.program,"u_rot4dYW"),rot4dZW:this.gl.getUniformLocation(this.program,"u_rot4dZW"),mouseIntensity:this.gl.getUniformLocation(this.program,"u_mouseIntensity"),clickIntensity:this.gl.getUniformLocation(this.program,"u_clickIntensity"),roleIntensity:this.gl.getUniformLocation(this.program,"u_roleIntensity"),moireScale:this.gl.getUniformLocation(this.program,"u_moireScale"),glitchIntensity:this.gl.getUniformLocation(this.program,"u_glitchIntensity"),lineThickness:this.gl.getUniformLocation(this.program,"u_lineThickness")}}createProgram(t,e){const i=this.createShader(this.gl.VERTEX_SHADER,t),o=this.createShader(this.gl.FRAGMENT_SHADER,e);if(!i||!o)return null;const s=this.gl.createProgram();return this.gl.attachShader(s,i),this.gl.attachShader(s,o),this.gl.linkProgram(s),this.gl.getProgramParameter(s,this.gl.LINK_STATUS)?s:(console.error("Program linking failed:",this.gl.getProgramInfoLog(s)),null)}createShader(t,e){if(!this.gl)return console.error("❌ Cannot create shader: WebGL context is null"),null;if(this.gl.isContextLost())return console.error("❌ Cannot create shader: WebGL context is lost"),null;try{const i=this.gl.createShader(t);if(!i)return console.error("❌ Failed to create shader object - WebGL context may be invalid"),null;if(this.gl.shaderSource(i,e),this.gl.compileShader(i),!this.gl.getShaderParameter(i,this.gl.COMPILE_STATUS)){const o=this.gl.getShaderInfoLog(i),s=t===this.gl.VERTEX_SHADER?"vertex":"fragment";return o?console.error(`❌ ${s} shader compilation failed:`,o):console.error(`❌ ${s} shader compilation failed: WebGL returned no error info (context may be invalid)`),console.error("Shader source:",e),this.gl.deleteShader(i),null}return i}catch(i){return console.error("❌ Exception during shader creation:",i),null}}initBuffers(){const t=new Float32Array([-1,-1,1,-1,-1,1,1,1]);this.buffer=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.buffer),this.gl.bufferData(this.gl.ARRAY_BUFFER,t,this.gl.STATIC_DRAW);const e=this.gl.getAttribLocation(this.program,"a_position");this.gl.enableVertexAttribArray(e),this.gl.vertexAttribPointer(e,2,this.gl.FLOAT,!1,0,0)}resize(){const t=Math.min(window.devicePixelRatio||1,2),e=this.canvas.clientWidth,i=this.canvas.clientHeight;(this.canvas.width!==e*t||this.canvas.height!==i*t)&&(this.canvas.width=e*t,this.canvas.height=i*t,this.gl.viewport(0,0,this.canvas.width,this.canvas.height))}showWebGLError(){if(!this.canvas)return;const t=this.canvas.getContext("2d");if(t)this.canvas.width=this.canvas.clientWidth,this.canvas.height=this.canvas.clientHeight,t.fillStyle="#1a0033",t.fillRect(0,0,this.canvas.width,this.canvas.height),t.fillStyle="#ff6b6b",t.font=`${Math.min(20,this.canvas.width/15)}px sans-serif`,t.textAlign="center",t.fillText("⚠️ WebGL Error",this.canvas.width/2,this.canvas.height/2-30),t.fillStyle="#ffd93d",t.font=`${Math.min(14,this.canvas.width/20)}px sans-serif`,/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)?(t.fillText("Mobile device detected",this.canvas.width/2,this.canvas.height/2),t.fillText("Enable hardware acceleration",this.canvas.width/2,this.canvas.height/2+20),t.fillText("or try Chrome/Firefox",this.canvas.width/2,this.canvas.height/2+40)):(t.fillText("Please enable WebGL",this.canvas.width/2,this.canvas.height/2),t.fillText("in your browser settings",this.canvas.width/2,this.canvas.height/2+20)),window.mobileDebug&&window.mobileDebug.log(`📱 WebGL error fallback shown for canvas ${this.canvas.id}`);else{const e=document.createElement("div");e.innerHTML=`
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
            `,this.canvas.parentNode.insertBefore(e,this.canvas.nextSibling)}}updateParameters(t){this.params={...this.params,...t}}updateInteraction(t,e,i){if(window.interactivityEnabled===!1){this.mouseX=.5,this.mouseY=.5,this.mouseIntensity=0;return}this.mouseX=t,this.mouseY=e,this.mouseIntensity=i}render(){var a,r,n,c,h;if(!this.program){window.mobileDebug&&window.mobileDebug.log(`❌ ${(a=this.canvas)==null?void 0:a.id}: No WebGL program compiled`);return}if(!this.gl){window.mobileDebug&&window.mobileDebug.log(`❌ ${(r=this.canvas)==null?void 0:r.id}: No WebGL context`);return}try{this.resize(),this.gl.useProgram(this.program),this.gl.clearColor(0,0,0,0),this.gl.clear(this.gl.COLOR_BUFFER_BIT)}catch(d){window.mobileDebug&&window.mobileDebug.log(`❌ ${(n=this.canvas)==null?void 0:n.id}: WebGL render error: ${d.message}`);return}const t={background:.3,shadow:.5,content:.8,highlight:1,accent:1.2},e=Date.now()-this.startTime;this.gl.uniform2f(this.uniforms.resolution,this.canvas.width,this.canvas.height),this.gl.uniform1f(this.uniforms.time,e),this.gl.uniform2f(this.uniforms.mouse,this.mouseX,this.mouseY),this.gl.uniform1f(this.uniforms.geometry,this.params.geometry);let i=this.params.gridDensity,o=this.params.hue,s=this.params.intensity;window.audioEnabled&&window.audioReactive&&(i+=window.audioReactive.bass*30,o+=window.audioReactive.mid*60,s+=window.audioReactive.high*.4),this.gl.uniform1f(this.uniforms.gridDensity,Math.min(100,i)),this.gl.uniform1f(this.uniforms.morphFactor,this.params.morphFactor),this.gl.uniform1f(this.uniforms.chaos,this.params.chaos),this.gl.uniform1f(this.uniforms.speed,this.params.speed),this.gl.uniform1f(this.uniforms.hue,o%360),this.gl.uniform1f(this.uniforms.intensity,Math.min(1,s)),this.gl.uniform1f(this.uniforms.saturation,this.params.saturation),this.gl.uniform1f(this.uniforms.dimension,this.params.dimension),this.gl.uniform1f(this.uniforms.rot4dXW,this.params.rot4dXW),this.gl.uniform1f(this.uniforms.rot4dYW,this.params.rot4dYW),this.gl.uniform1f(this.uniforms.rot4dZW,this.params.rot4dZW),this.gl.uniform1f(this.uniforms.mouseIntensity,this.mouseIntensity),this.gl.uniform1f(this.uniforms.clickIntensity,this.clickIntensity),this.gl.uniform1f(this.uniforms.roleIntensity,t[this.role]||1),this.gl.uniform1f(this.uniforms.moireScale,this.params.moireScale||1.01),this.gl.uniform1f(this.uniforms.glitchIntensity,this.params.glitchIntensity||.05),this.gl.uniform1f(this.uniforms.lineThickness,this.params.lineThickness||.02);try{this.gl.drawArrays(this.gl.TRIANGLE_STRIP,0,4),window.mobileDebug&&!this._renderSuccessLogged&&(window.mobileDebug.log(`✅ ${(c=this.canvas)==null?void 0:c.id}: WebGL render successful`),this._renderSuccessLogged=!0)}catch(d){window.mobileDebug&&window.mobileDebug.log(`❌ ${(h=this.canvas)==null?void 0:h.id}: WebGL draw error: ${d.message}`)}}reinitializeContext(){var t,e,i,o,s;if(console.log(`🔄 Reinitializing WebGL context for ${(t=this.canvas)==null?void 0:t.id}`),this.program=null,this.buffer=null,this.uniforms=null,this.gl=null,this.gl=this.canvas.getContext("webgl2")||this.canvas.getContext("webgl")||this.canvas.getContext("experimental-webgl"),!this.gl)return console.error(`❌ No WebGL context available for ${(e=this.canvas)==null?void 0:e.id} - CanvasManager should have created one`),!1;if(this.gl.isContextLost())return console.error(`❌ WebGL context is lost for ${(i=this.canvas)==null?void 0:i.id}`),!1;try{return this.init(),console.log(`✅ ${(o=this.canvas)==null?void 0:o.id}: Context reinitialized successfully`),!0}catch(a){return console.error(`❌ Failed to reinitialize WebGL resources for ${(s=this.canvas)==null?void 0:s.id}:`,a),!1}}destroy(){this.gl&&this.program&&this.gl.deleteProgram(this.program),this.gl&&this.buffer&&this.gl.deleteBuffer(this.buffer)}}class z{constructor(){this.params={variation:0,rot4dXW:0,rot4dYW:0,rot4dZW:0,dimension:3.5,gridDensity:15,morphFactor:1,chaos:.2,speed:1,hue:200,intensity:.5,saturation:.8,moireScale:1.01,glitchIntensity:.05,lineThickness:.02,geometry:0},this.parameterDefs={variation:{min:0,max:99,step:1,type:"int"},rot4dXW:{min:-2,max:2,step:.01,type:"float"},rot4dYW:{min:-2,max:2,step:.01,type:"float"},rot4dZW:{min:-2,max:2,step:.01,type:"float"},dimension:{min:3,max:4.5,step:.01,type:"float"},gridDensity:{min:4,max:100,step:.1,type:"float"},morphFactor:{min:0,max:2,step:.01,type:"float"},chaos:{min:0,max:1,step:.01,type:"float"},speed:{min:.1,max:3,step:.01,type:"float"},hue:{min:0,max:360,step:1,type:"int"},intensity:{min:0,max:1,step:.01,type:"float"},saturation:{min:0,max:1,step:.01,type:"float"},moireScale:{min:0,max:5,step:.01,type:"float"},glitchIntensity:{min:0,max:1,step:.01,type:"float"},lineThickness:{min:.001,max:5,step:.01,type:"float"},geometry:{min:0,max:7,step:1,type:"int"}},this.defaults={...this.params}}getAllParameters(){return{...this.params}}setParameter(t,e){if(this.parameterDefs[t]){const i=this.parameterDefs[t];return e=Math.max(i.min,Math.min(i.max,e)),i.type==="int"&&(e=Math.round(e)),this.params[t]=e,!0}return console.warn(`Unknown parameter: ${t}`),!1}setParameters(t){for(const[e,i]of Object.entries(t))this.setParameter(e,i)}getParameter(t){return this.params[t]}setGeometry(t){this.setParameter("geometry",t)}updateFromControls(){["variationSlider","rot4dXW","rot4dYW","rot4dZW","dimension","gridDensity","morphFactor","chaos","speed","hue"].forEach(e=>{const i=document.getElementById(e);if(i){const o=parseFloat(i.value);let s=e;e==="variationSlider"&&(s="variation"),this.setParameter(s,o)}})}updateDisplayValues(){this.updateSliderValue("variationSlider",this.params.variation),this.updateSliderValue("rot4dXW",this.params.rot4dXW),this.updateSliderValue("rot4dYW",this.params.rot4dYW),this.updateSliderValue("rot4dZW",this.params.rot4dZW),this.updateSliderValue("dimension",this.params.dimension),this.updateSliderValue("gridDensity",this.params.gridDensity),this.updateSliderValue("morphFactor",this.params.morphFactor),this.updateSliderValue("chaos",this.params.chaos),this.updateSliderValue("speed",this.params.speed),this.updateSliderValue("hue",this.params.hue),this.updateDisplayText("rot4dXWDisplay",this.params.rot4dXW.toFixed(2)),this.updateDisplayText("rot4dYWDisplay",this.params.rot4dYW.toFixed(2)),this.updateDisplayText("rot4dZWDisplay",this.params.rot4dZW.toFixed(2)),this.updateDisplayText("dimensionDisplay",this.params.dimension.toFixed(2)),this.updateDisplayText("gridDensityDisplay",this.params.gridDensity.toFixed(1)),this.updateDisplayText("morphFactorDisplay",this.params.morphFactor.toFixed(2)),this.updateDisplayText("chaosDisplay",this.params.chaos.toFixed(2)),this.updateDisplayText("speedDisplay",this.params.speed.toFixed(2)),this.updateDisplayText("hueDisplay",this.params.hue+"°"),this.updateVariationInfo(),this.updateGeometryButtons()}updateSliderValue(t,e){const i=document.getElementById(t);i&&(i.value=e)}updateDisplayText(t,e){const i=document.getElementById(t);i&&(i.textContent=e)}updateVariationInfo(){const t=document.getElementById("currentVariationDisplay");if(t){const e=["TETRAHEDRON LATTICE","HYPERCUBE LATTICE","SPHERE LATTICE","TORUS LATTICE","KLEIN BOTTLE LATTICE","FRACTAL LATTICE","WAVE LATTICE","CRYSTAL LATTICE"],i=Math.floor(this.params.variation/4),o=this.params.variation%4+1,s=e[i]||"CUSTOM VARIATION";t.textContent=`${this.params.variation+1} - ${s}`,this.params.variation<30&&(t.textContent+=` ${o}`)}}updateGeometryButtons(){document.querySelectorAll("[data-geometry]").forEach(t=>{t.classList.toggle("active",parseInt(t.dataset.geometry)===this.params.geometry)})}randomizeAll(){this.params.rot4dXW=Math.random()*4-2,this.params.rot4dYW=Math.random()*4-2,this.params.rot4dZW=Math.random()*4-2,this.params.dimension=3+Math.random()*1.5,this.params.gridDensity=4+Math.random()*26,this.params.morphFactor=Math.random()*2,this.params.chaos=Math.random(),this.params.speed=.1+Math.random()*2.9,this.params.hue=Math.random()*360,this.params.geometry=Math.floor(Math.random()*8)}resetToDefaults(){this.params={...this.defaults}}loadConfiguration(t){if(t&&typeof t=="object"){for(const[e,i]of Object.entries(t))this.parameterDefs[e]&&this.setParameter(e,i);return!0}return!1}exportConfiguration(){return{type:"vib34d-integrated-config",version:"1.0.0",timestamp:new Date().toISOString(),name:`VIB34D Config ${new Date().toLocaleDateString()}`,parameters:{...this.params}}}generateVariationParameters(t){if(t<30){const e=Math.floor(t/4),i=t%4;return{geometry:e,gridDensity:8+i*4,morphFactor:.5+i*.3,chaos:i*.15,speed:.8+i*.2,hue:(e*45+i*15)%360,rot4dXW:(i-1.5)*.5,rot4dYW:e%2*.3,rot4dZW:(e+i)%3*.2,dimension:3.2+i*.2}}else return{...this.params}}applyVariation(t){const e=this.generateVariationParameters(t);this.setParameters(e),this.params.variation=t}getColorHSV(){return{h:this.params.hue,s:.8,v:.9}}getColorRGB(){const t=this.getColorHSV();return this.hsvToRgb(t.h,t.s,t.v)}hsvToRgb(t,e,i){t=t/60;const o=i*e,s=o*(1-Math.abs(t%2-1)),a=i-o;let r,n,c;return t<1?[r,n,c]=[o,s,0]:t<2?[r,n,c]=[s,o,0]:t<3?[r,n,c]=[0,o,s]:t<4?[r,n,c]=[0,s,o]:t<5?[r,n,c]=[s,0,o]:[r,n,c]=[o,0,s],{r:Math.round((r+a)*255),g:Math.round((n+a)*255),b:Math.round((c+a)*255)}}validateConfiguration(t){if(!t||typeof t!="object")return{valid:!1,error:"Configuration must be an object"};if(t.type!=="vib34d-integrated-config")return{valid:!1,error:"Invalid configuration type"};if(!t.parameters)return{valid:!1,error:"Missing parameters object"};for(const[e,i]of Object.entries(t.parameters))if(this.parameterDefs[e]){const o=this.parameterDefs[e];if(typeof i!="number"||i<o.min||i>o.max)return{valid:!1,error:`Invalid value for parameter ${e}: ${i}`}}return{valid:!0}}}class b{static generate5Cell(t=1){const e=[],i=Math.sqrt(5)*t;return e.push([1,1,1,-1/i]),e.push([1,-1,-1,-1/i]),e.push([-1,1,-1,-1/i]),e.push([-1,-1,1,-1/i]),e.push([0,0,0,i]),e}static generate16Cell(t=1){const e=[],i=t;return e.push([i,0,0,0]),e.push([-i,0,0,0]),e.push([0,i,0,0]),e.push([0,-i,0,0]),e.push([0,0,i,0]),e.push([0,0,-i,0]),e.push([0,0,0,i]),e.push([0,0,0,-i]),e}static generate24Cell(t=1){const e=[],i=t;return[[1,1,0,0],[1,-1,0,0],[-1,1,0,0],[-1,-1,0,0],[1,0,1,0],[1,0,-1,0],[-1,0,1,0],[-1,0,-1,0],[1,0,0,1],[1,0,0,-1],[-1,0,0,1],[-1,0,0,-1],[0,1,1,0],[0,1,-1,0],[0,-1,1,0],[0,-1,-1,0],[0,1,0,1],[0,1,0,-1],[0,-1,0,1],[0,-1,0,-1],[0,0,1,1],[0,0,1,-1],[0,0,-1,1],[0,0,-1,-1]].forEach(s=>e.push(s.map(a=>a*i))),e}static generate120Cell(t=1,e=2){const i=[],o=(1+Math.sqrt(5))/2,s=t*.5;for(let a=0;a<e*10;a++){const r=a/(e*10)*Math.PI*2;i.push([Math.cos(r)*s,Math.sin(r)*s,Math.cos(r*o)*s,Math.sin(r*o)*s])}return i}static generateHypercube(t=1){const e=[],i=t;for(let o=-1;o<=1;o+=2)for(let s=-1;s<=1;s+=2)for(let a=-1;a<=1;a+=2)for(let r=-1;r<=1;r+=2)e.push([r*i,a*i,s*i,o*i]);return e}static generateHypersphere(t=1,e=20){const i=[],o=t;for(let s=0;s<=e;s++){const a=s/e*Math.PI;for(let r=0;r<=e;r++){const n=r/e*Math.PI*2;for(let c=0;c<=e/2;c++){const h=c/(e/2)*Math.PI,d=o*Math.sin(a)*Math.cos(n)*Math.sin(h),u=o*Math.sin(a)*Math.sin(n)*Math.sin(h),m=o*Math.cos(a)*Math.sin(h),p=o*Math.cos(h);i.push([d,u,m,p])}}}return i}static generateHopfFibration(t=1,e=15){const i=[],o=t;for(let s=0;s<e;s++){const a=s/e*Math.PI*2;for(let r=0;r<e;r++){const n=r/e*Math.PI*2,c=o*Math.cos(a)*Math.cos(n),h=o*Math.cos(a)*Math.sin(n),d=o*Math.sin(a)*Math.cos(n),u=o*Math.sin(a)*Math.sin(n);i.push([c,h,d,u])}}return i}static generateCliffordTorus(t=1,e=20){const i=[],o=t*.7;for(let s=0;s<e;s++){const a=s/e*Math.PI*2;for(let r=0;r<e;r++){const n=r/e*Math.PI*2,c=o*Math.cos(a),h=o*Math.sin(a),d=o*Math.cos(n),u=o*Math.sin(n);i.push([c,h,d,u])}}return i}static generateDuocylinder(t=1,e=20){const i=[],o=t;for(let s=0;s<e;s++){const a=s/e*Math.PI*2;for(let r=0;r<e;r++){const n=r/e*Math.PI*2;i.push([o*Math.cos(a),o*Math.sin(a),o*Math.cos(n),o*Math.sin(n)])}}return i}static generateSpheritorus(t=1,e=15){const i=[],o=t,s=o*.3;for(let a=0;a<e;a++){const r=a/e*Math.PI*2;for(let n=0;n<e;n++){const c=n/e*Math.PI;for(let h=0;h<e;h++){const d=h/e*Math.PI*2,u=(o+s*Math.cos(c))*Math.cos(r),m=(o+s*Math.cos(c))*Math.sin(r),p=s*Math.sin(c)*Math.cos(d),f=s*Math.sin(c)*Math.sin(d);i.push([u,m,p,f])}}}return i}static generateKleinBottle4D(t=1,e=20){const i=[],o=t;for(let s=0;s<e;s++){const a=s/e*Math.PI*2;for(let r=0;r<e;r++){const n=r/e*Math.PI*2,c=o*(2+Math.cos(n)),h=c*Math.cos(a),d=c*Math.sin(a),u=o*Math.sin(n)*Math.cos(a/2),m=o*Math.sin(n)*Math.sin(a/2);i.push([h,d,u,m])}}return i}static generateMobiusStrip4D(t=1,e=20){const i=[],o=t;for(let s=0;s<e;s++){const a=s/e*Math.PI*2;for(let r=-1;r<=1;r+=.2){const n=r,c=a/2,h=(o+n*Math.cos(c))*Math.cos(a),d=(o+n*Math.cos(c))*Math.sin(a),u=n*Math.sin(c)*Math.cos(a),m=n*Math.sin(c)*Math.sin(a);i.push([h,d,u,m])}}return i}static generateCalabiYau(t=1,e=10){const i=[],o=t;for(let s=0;s<e;s++){const a=s/e*Math.PI*2;for(let r=0;r<e;r++){const n=r/e*Math.PI*2,c=o*Math.cos(a)*(1+.3*Math.sin(3*n)),h=o*Math.sin(a)*(1+.3*Math.sin(3*n)),d=o*Math.cos(n)*(1+.3*Math.sin(3*a)),u=o*Math.sin(n)*(1+.3*Math.sin(3*a));i.push([c,h,d,u])}}return i}static generateTesseractFractal(t=1,e=2){const i=[];function o(s,a,r){if(r===0){i.push(s);return}const n=a/3;for(let c=-1;c<=1;c++)for(let h=-1;h<=1;h++)for(let d=-1;d<=1;d++)for(let u=-1;u<=1;u++)u===0&&d===0&&h===0&&c===0||o([s[0]+u*n,s[1]+d*n,s[2]+h*n,s[3]+c*n],n,r-1)}return o([0,0,0,0],t,e),i}static generateSierpinski4D(t=1,e=3){const i=[],o=t,s=b.generate5Cell(o);function a(r,n){if(n===0){r.forEach(c=>i.push(c));return}for(let c=0;c<r.length;c++)for(let h=c+1;h<r.length;h++){const d=[(r[c][0]+r[h][0])/2,(r[c][1]+r[h][1])/2,(r[c][2]+r[h][2])/2,(r[c][3]+r[h][3])/2];a([r[c],d],n-1)}}return a(s,e),i}static generateQuaternionJulia(t=1,e=15,i=[0,.5,0,0]){const o=[],s=t,a=10;for(let r=0;r<e;r++){const n=(r/e-.5)*2*s;for(let c=0;c<e;c++){const h=(c/e-.5)*2*s;for(let d=0;d<e;d++){const u=(d/e-.5)*2*s;for(let m=0;m<e;m++){const p=(m/e-.5)*2*s;let f=n,g=h,y=u,v=p,x=0;for(;x<a&&f*f+g*g+y*y+v*v<4;){const M=f*f-g*g-y*y-v*v+i[0],I=2*f*g+i[1],L=2*f*y+i[2],C=2*f*v+i[3];f=M,g=I,y=L,v=C,x++}x>=a&&o.push([n,h,u,p])}}}}return o}static generateLorenz4D(t=1,e=100){const i=[],o=t*.1;let s=.1,a=0,r=0,n=0;const c=.01,h=10,d=28,u=8/3,m=1;for(let p=0;p<e;p++){const f=h*(a-s),g=s*(d-r)-a,y=s*a-u*r,v=m*(s-n);s+=f*c,a+=g*c,r+=y*c,n+=v*c,i.push([s*o,a*o,r*o,n*o])}return i}static generateLissajous4D(t=1,e=50,i=[1,2,3,4]){const o=[],s=t;for(let a=0;a<e;a++){const r=a/e*Math.PI*2;o.push([s*Math.sin(i[0]*r),s*Math.sin(i[1]*r),s*Math.sin(i[2]*r),s*Math.sin(i[3]*r)])}return o}static generateHypersphereSlices(t=1,e=10,i=20){const o=[],s=t;for(let a=0;a<e;a++){const r=(a/(e-1)-.5)*2*s,n=Math.sqrt(Math.max(0,s*s-r*r));for(let c=0;c<=i;c++){const h=c/i*Math.PI;for(let d=0;d<=i;d++){const u=d/i*Math.PI*2,m=n*Math.sin(h)*Math.cos(u),p=n*Math.sin(h)*Math.sin(u),f=n*Math.cos(h);o.push([m,p,f,r])}}}return o}static generateStereographicProjection(t=1,e=20){const i=[],o=t;for(let s=0;s<e;s++){const a=s/e*Math.PI;for(let r=0;r<e;r++){const n=r/e*Math.PI*2;for(let c=0;c<e;c++){const h=c/e*Math.PI*2,d=Math.sin(a)*Math.cos(n),u=Math.sin(a)*Math.sin(n),m=Math.cos(a)*Math.cos(h),p=Math.cos(a)*Math.sin(h);if(p<.99){const f=o/(1-p);i.push([d*f,u*f,m*f,0])}}}}return i}static generateHyperbolicTesseract(t=1,e=.3){const i=b.generateHypercube(t),o=e;return i.map(s=>{const a=Math.sqrt(s[0]*s[0]+s[1]*s[1]+s[2]*s[2]+s[3]*s[3]),r=Math.sinh(a*o)/(a*o||1);return s.map(n=>n*r)})}static generatePenroseTiling4D(t=1,e=15){const i=[],o=t,s=(1+Math.sqrt(5))/2;for(let a=0;a<e;a++)for(let r=0;r<e;r++)for(let n=0;n<e;n++)for(let c=0;c<e;c++){const h=(a-e/2)*o/e,d=(r-e/2)*o/e,u=(n-e/2)*o/e,m=(c-e/2)*o/e,p=Math.cos(h*s)+Math.cos(d*s)+Math.cos(u*s)+Math.cos(m*s);Math.abs(p)>3&&i.push([h,d,u,m])}return i}static getAllGeometryNames(){return["5-Cell (Pentachoron)","16-Cell (Hyperoctahedron)","24-Cell","120-Cell","Hypercube (Tesseract)","Hypersphere","Hopf Fibration","Clifford Torus","Duocylinder","Spheritorus","Klein Bottle 4D","Mobius Strip 4D","Calabi-Yau","Tesseract Fractal","Sierpinski 4D","Quaternion Julia","Lorenz 4D","Lissajous 4D","Hypersphere Slices","Stereographic Projection","Hyperbolic Tesseract","Penrose Tiling 4D"]}static getGeometry(t,e=1,i={}){const o={"5-Cell (Pentachoron)":()=>b.generate5Cell(e),"16-Cell (Hyperoctahedron)":()=>b.generate16Cell(e),"24-Cell":()=>b.generate24Cell(e),"120-Cell":()=>b.generate120Cell(e,i.detail||2),"Hypercube (Tesseract)":()=>b.generateHypercube(e),Hypersphere:()=>b.generateHypersphere(e,i.segments||20),"Hopf Fibration":()=>b.generateHopfFibration(e,i.segments||15),"Clifford Torus":()=>b.generateCliffordTorus(e,i.segments||20),Duocylinder:()=>b.generateDuocylinder(e,i.segments||20),Spheritorus:()=>b.generateSpheritorus(e,i.segments||15),"Klein Bottle 4D":()=>b.generateKleinBottle4D(e,i.segments||20),"Mobius Strip 4D":()=>b.generateMobiusStrip4D(e,i.segments||20),"Calabi-Yau":()=>b.generateCalabiYau(e,i.segments||10),"Tesseract Fractal":()=>b.generateTesseractFractal(e,i.iterations||2),"Sierpinski 4D":()=>b.generateSierpinski4D(e,i.iterations||3),"Quaternion Julia":()=>b.generateQuaternionJulia(e,i.segments||15,i.c||[0,.5,0,0]),"Lorenz 4D":()=>b.generateLorenz4D(e,i.segments||100),"Lissajous 4D":()=>b.generateLissajous4D(e,i.segments||50,i.freq||[1,2,3,4]),"Hypersphere Slices":()=>b.generateHypersphereSlices(e,i.slices||10,i.segments||20),"Stereographic Projection":()=>b.generateStereographicProjection(e,i.segments||20),"Hyperbolic Tesseract":()=>b.generateHyperbolicTesseract(e,i.curvature||.3),"Penrose Tiling 4D":()=>b.generatePenroseTiling4D(e,i.segments||15)};return o[t]?o[t]():b.generateHypercube(e)}}class at{constructor(t){this.choreographer=t,this.variationNames=this.generateVariationNames(),this.customVariations=new Array(140).fill(null),this.totalVariations=200,this.currentVariation=0,this.categories={minimal:[],balanced:[],intense:[],extreme:[],genre:[],mood:[]},this.initializeCategories(),this.loadCustomVariations()}generateVariationNames(){const t=[];return b.getAllGeometryNames().forEach(i=>{t.push(`${i} - BALANCED`),t.push(`${i} - INTENSE`)}),t.push("EDM DROP HEAVY","LO-FI CHILL","HEAVY METAL AGGRO","CLASSICAL ELEGANT","JAZZ SMOOTH","HIP-HOP BOUNCE","AMBIENT ETHEREAL","TECHNO PULSE"),t.push("ENERGETIC ORANGE","CALM BLUE","ROMANTIC PURPLE","AGGRESSIVE RED","HAPPY YELLOW","MYSTERIOUS BLACK","PEACEFUL GREEN","PASSIONATE MAGENTA"),t.slice(0,60)}initializeCategories(){for(let t=0;t<44;t+=2)this.categories.minimal.push(t);for(let t=1;t<44;t+=2)this.categories.balanced.push(t);for(let t=44;t<52;t++)this.categories.intense.push(t);for(let t=52;t<60;t++)this.categories.extreme.push(t);this.categories.genre=[44,45,46,47,48,49,50,51],this.categories.mood=[52,53,54,55,56,57,58,59]}getVariationName(t){if(t<60)return this.variationNames[t]||`DEFAULT ${t+1}`;{const e=t-60,i=this.customVariations[e];return i?i.name:`CUSTOM ${e+1}`}}generateDefaultVariation(t){if(t>=60)return null;if(t<44){const e=Math.floor(t/2),i=t%2,o=b.getAllGeometryNames();return{variation:t,geometry:o[e],geometryScale:1+i*.5,segments:15+i*15,gridDensity:20+i*20,morphFactor:.5+i*.5,chaos:i*.5,speed:1+i*1,hue:e*16.36%360,intensity:.5+i*.3,saturation:.7+i*.2}}return t>=44&&t<52?{variation:t,geometry:"Hypercube (Tesseract)",...[{gridDensity:50,chaos:.8,speed:2.5,hue:280,intensity:.9},{gridDensity:10,chaos:.1,speed:.5,hue:200,intensity:.3},{gridDensity:60,chaos:1,speed:3,hue:0,intensity:1},{gridDensity:25,chaos:.2,speed:.8,hue:45,intensity:.5},{gridDensity:30,chaos:.4,speed:1.2,hue:180,intensity:.6},{gridDensity:35,chaos:.6,speed:1.5,hue:320,intensity:.7},{gridDensity:15,chaos:.3,speed:.6,hue:160,intensity:.4},{gridDensity:45,chaos:.7,speed:2,hue:260,intensity:.8}][t-44],morphFactor:1,saturation:.8}:t>=52?{variation:t,geometry:"Hopf Fibration",gridDensity:30,...[{hue:30,intensity:.9,chaos:.7,speed:2},{hue:200,intensity:.3,chaos:.1,speed:.5},{hue:280,intensity:.6,chaos:.3,speed:.8},{hue:0,intensity:1,chaos:.9,speed:2.5},{hue:60,intensity:.8,chaos:.5,speed:1.5},{hue:270,intensity:.4,chaos:.6,speed:1},{hue:120,intensity:.5,chaos:.2,speed:.7},{hue:320,intensity:.9,chaos:.8,speed:1.8}][t-52],morphFactor:1,saturation:.8}:null}applyVariation(t){var i;if(t<0||t>=this.totalVariations)return!1;let e=t<60?this.generateDefaultVariation(t):this.customVariations[t-60]?{...this.customVariations[t-60].parameters,variation:t}:{...this.choreographer.baseParams,variation:t};return e?(Object.keys(e).forEach(o=>{o!=="variation"&&o!=="geometry"&&this.choreographer.setParameter(o,e[o])}),e.geometry&&((i=window.enhancedControls)!=null&&i.geometryControls)&&window.enhancedControls.geometryControls.setGeometry(e.geometry),this.currentVariation=t,console.log(`✅ Applied variation ${t}: ${this.getVariationName(t)}`),!0):!1}saveCurrentAsCustom(t=null){var s,a;const e=this.customVariations.findIndex(r=>r===null);if(e===-1)return console.warn("⚠️ No empty slots"),-1;const i={...this.choreographer.baseParams},o=((a=(s=window.enhancedControls)==null?void 0:s.geometryControls)==null?void 0:a.currentGeometry)||"Hypercube (Tesseract)";return this.customVariations[e]={name:t||`${o} CUSTOM ${e+1}`,timestamp:new Date().toISOString(),parameters:{...i,geometry:o},metadata:{basedOnVariation:this.currentVariation,createdFrom:"current-state"}},this.saveCustomVariations(),console.log(`💾 Saved custom variation ${60+e}`),60+e}deleteCustomVariation(t){return t>=0&&t<140?(this.customVariations[t]=null,this.saveCustomVariations(),console.log(`🗑️ Deleted custom variation ${t}`),!0):!1}getByCategory(t){return(this.categories[t]||[]).map(e=>({index:e,name:this.getVariationName(e),params:this.generateDefaultVariation(e)}))}searchVariations(t){const e=[],i=t.toLowerCase();return this.variationNames.forEach((o,s)=>{o.toLowerCase().includes(i)&&e.push({index:s,name:o,isCustom:!1})}),this.customVariations.forEach((o,s)=>{o&&o.name.toLowerCase().includes(i)&&e.push({index:60+s,name:o.name,isCustom:!0})}),e}loadCustomVariations(){try{const t=localStorage.getItem("vib34d-custom-variations-v2");if(t){const e=JSON.parse(t);Array.isArray(e)&&e.length===140&&(this.customVariations=e,console.log("✅ Loaded custom variations"))}}catch(t){console.warn("Failed to load:",t)}}saveCustomVariations(){try{localStorage.setItem("vib34d-custom-variations-v2",JSON.stringify(this.customVariations))}catch(t){console.warn("Failed to save:",t)}}exportCustomVariations(){const t={type:"vib34d-custom-variations-v2",version:"2.0.0",timestamp:new Date().toISOString(),variations:this.customVariations.filter(s=>s!==null)},e=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),i=URL.createObjectURL(e),o=document.createElement("a");o.href=i,o.download=`vib34d-variations-${Date.now()}.json`,o.click(),URL.revokeObjectURL(i),console.log("💾 Exported custom variations")}async importCustomVariations(t){try{const e=JSON.parse(await t.text());if((e.type==="vib34d-custom-variations-v2"||e.type==="vib34d-custom-variations")&&Array.isArray(e.variations)){let i=0;return e.variations.forEach(o=>{const s=this.customVariations.findIndex(a=>a===null);s!==-1&&(this.customVariations[s]=o,i++)}),this.saveCustomVariations(),console.log(`✅ Imported ${i} variations`),i}}catch(e){console.error("Import failed:",e)}return 0}getStatistics(){const t=this.customVariations.filter(e=>e!==null).length;return{totalVariations:this.totalVariations,defaultVariations:60,customVariations:t,emptySlots:140-t,currentVariation:this.currentVariation,isCustom:this.currentVariation>=60,categories:Object.keys(this.categories).map(e=>({name:e,count:this.categories[e].length}))}}getRandomFromCategory(t){const e=this.categories[t]||[];return e.length>0?e[Math.floor(Math.random()*e.length)]:-1}getNextVariation(){return(this.currentVariation+1)%this.totalVariations}getPreviousVariation(){return(this.currentVariation-1+this.totalVariations)%this.totalVariations}}class rt{constructor(t){this.engine=t}addToGallery(t){console.log("🖼️ GallerySystem: Add to gallery stub")}loadFromGallery(t){console.log("🖼️ GallerySystem: Load from gallery stub")}}class nt{constructor(t){this.engine=t}exportCurrent(){console.log("💾 ExportManager: Export stub")}importVariation(t){console.log("📥 ExportManager: Import stub")}}class lt{setStatus(t,e="info"){console.log(`📡 StatusManager [${e}]: ${t}`)}clearStatus(){}}class ct{constructor(){this.visualizers=[],this.parameterManager=new z,this.variationManager=new at(this),this.gallerySystem=new rt(this),this.exportManager=new nt(this),this.statusManager=new lt,this.isActive=!1,this.currentVariation=0,this.totalVariations=100,this.mouseX=.5,this.mouseY=.5,this.mouseIntensity=0,this.clickIntensity=0,this.time=0,this.animationId=null,this.init()}init(){console.log("🌌 Initializing VIB34D Integrated Holographic Engine...");try{this.createVisualizers(),this.setupControls(),this.setupInteractions(),this.loadCustomVariations(),this.startRenderLoop(),this.statusManager.setStatus("VIB34D Engine initialized successfully","success"),console.log("✅ VIB34D Engine ready")}catch(t){console.error("❌ Failed to initialize VIB34D Engine:",t),this.statusManager.setStatus("Initialization failed: "+t.message,"error")}}createVisualizers(){[{id:"background-canvas",role:"background",reactivity:.5},{id:"shadow-canvas",role:"shadow",reactivity:.7},{id:"content-canvas",role:"content",reactivity:.9},{id:"highlight-canvas",role:"highlight",reactivity:1.1},{id:"accent-canvas",role:"accent",reactivity:1.5}].forEach(e=>{const i=new st(e.id,e.role,e.reactivity,this.currentVariation);this.visualizers.push(i)}),console.log("✅ Created 5-layer integrated holographic system")}setupControls(){this.setupTabSystem(),this.setupParameterControls(),this.setupGeometryPresets(),this.updateDisplayValues()}setupTabSystem(){document.querySelectorAll(".tab-btn").forEach(t=>{t.addEventListener("click",()=>{document.querySelectorAll(".tab-btn").forEach(e=>e.classList.remove("active")),document.querySelectorAll(".tab-content").forEach(e=>e.classList.remove("active")),t.classList.add("active"),document.getElementById(t.dataset.tab+"-tab").classList.add("active")})})}setupParameterControls(){["variationSlider","rot4dXW","rot4dYW","rot4dZW","dimension","gridDensity","morphFactor","chaos","speed","hue"].forEach(e=>{const i=document.getElementById(e);i&&i.addEventListener("input",()=>this.updateFromControls())})}setupGeometryPresets(){document.querySelectorAll("[data-geometry]").forEach(t=>{t.addEventListener("click",()=>{document.querySelectorAll("[data-geometry]").forEach(e=>e.classList.remove("active")),t.classList.add("active"),this.parameterManager.setGeometry(parseInt(t.dataset.geometry)),this.updateVisualizers(),this.updateDisplayValues()})})}setupInteractions(){console.log("🔷 Faceted: Using ReactivityManager for all interactions")}loadCustomVariations(){this.variationManager.loadCustomVariations()}populateVariationGrid(){this.variationManager.populateGrid()}startRenderLoop(){var e;window.mobileDebug&&window.mobileDebug.log(`🎬 VIB34D Faceted Engine: Starting render loop with ${(e=this.visualizers)==null?void 0:e.length} visualizers`);const t=()=>{this.time+=.016,this.updateVisualizers(),this.animationId=requestAnimationFrame(t)};t(),window.mobileDebug&&window.mobileDebug.log(`✅ VIB34D Faceted Engine: Render loop started, animationId=${!!this.animationId}`)}updateVisualizers(){const t=this.parameterManager.getAllParameters();t.mouseX=this.mouseX,t.mouseY=this.mouseY,t.mouseIntensity=this.mouseIntensity,t.clickIntensity=this.clickIntensity,t.time=this.time,this.visualizers.forEach(e=>{e.updateParameters(t),e.render()}),this.mouseIntensity*=.95,this.clickIntensity*=.92}updateFromControls(){this.parameterManager.updateFromControls(),this.updateDisplayValues()}updateDisplayValues(){this.parameterManager.updateDisplayValues()}setVariation(t){if(t>=0&&t<this.totalVariations){this.currentVariation=t,this.variationManager.applyVariation(t),this.updateDisplayValues(),this.updateVisualizers();const e=document.getElementById("variationSlider");e&&(e.value=t),this.statusManager.setStatus(`Variation ${t+1} loaded`,"info")}}nextVariation(){this.setVariation((this.currentVariation+1)%this.totalVariations)}previousVariation(){this.setVariation((this.currentVariation-1+this.totalVariations)%this.totalVariations)}randomVariation(){const t=Math.floor(Math.random()*this.totalVariations);this.setVariation(t)}randomizeAll(){this.parameterManager.randomizeAll(),this.updateDisplayValues(),this.updateVisualizers(),this.statusManager.setStatus("All parameters randomized","info")}resetToDefaults(){this.parameterManager.resetToDefaults(),this.updateDisplayValues(),this.updateVisualizers(),this.statusManager.setStatus("Reset to default parameters","info")}saveAsCustomVariation(){const t=this.variationManager.saveCurrentAsCustom();t!==-1?(this.statusManager.setStatus(`Saved as custom variation ${t+1}`,"success"),this.populateVariationGrid()):this.statusManager.setStatus("All custom slots are full","warning")}openGalleryView(){this.gallerySystem.openGallery()}exportJSON(){this.exportManager.exportJSON()}exportCSS(){this.exportManager.exportCSS()}exportHTML(){this.exportManager.exportHTML()}exportPNG(){this.exportManager.exportPNG()}importJSON(){this.exportManager.importJSON()}importFolder(){this.exportManager.importFolder()}setActive(t){console.log(`🔷 Faceted Engine setActive: ${t}`),this.isActive=t,t&&!this.animationId?(console.log("🎬 Faceted Engine: Starting animation loop"),this.startRenderLoop()):!t&&this.animationId&&(console.log("⏹️ Faceted Engine: Stopping animation loop"),cancelAnimationFrame(this.animationId),this.animationId=null)}updateInteraction(t,e,i=.5){this.mouseX=t,this.mouseY=e,this.mouseIntensity=i,this.visualizers.forEach(o=>{o.updateInteraction&&o.updateInteraction(t,e,i)})}triggerClick(t=1){this.clickIntensity=t}applyAudioReactivityGrid(t){const e=this.audioReactivitySettings||window.audioReactivitySettings;if(!e)return;const i=e.sensitivity[e.activeSensitivity];e.activeVisualModes.forEach(o=>{const[s,a]=o.split("-");if(a==="color"){const r=t.energy*i,n=t.bass*i;if(t.rhythm*i,t.mid>.2){const c=this.parameterManager.getParameter("hue")||180,h=t.mid*i*30;this.parameterManager.setParameter("hue",(c+h)%360)}r>.3&&this.parameterManager.setParameter("intensity",Math.min(1,.5+r*.8)),n>.4&&this.parameterManager.setParameter("saturation",Math.min(1,.7+n*.3))}else if(a==="geometry"){const r=t.bass*i,n=t.high*i;if(r>.3){const c=this.parameterManager.getParameter("gridDensity")||15;this.parameterManager.setParameter("gridDensity",Math.min(100,c+r*25))}if(t.mid>.2){const c=t.mid*i*.5;this.parameterManager.setParameter("morphFactor",Math.min(2,c))}n>.4&&this.parameterManager.setParameter("chaos",Math.min(1,n*.6))}else if(a==="movement"){const r=t.energy*i;if(r>.2&&this.parameterManager.setParameter("speed",Math.min(3,.5+r*1.5)),t.bass>.3){const n=this.parameterManager.getParameter("rot4dXW")||0;this.parameterManager.setParameter("rot4dXW",n+t.bass*i*.1)}if(t.mid>.3){const n=this.parameterManager.getParameter("rot4dYW")||0;this.parameterManager.setParameter("rot4dYW",n+t.mid*i*.08)}if(t.high>.3){const n=this.parameterManager.getParameter("rot4dZW")||0;this.parameterManager.setParameter("rot4dZW",n+t.high*i*.06)}}})}updateClick(t){this.clickIntensity=Math.min(1,this.clickIntensity+t),this.visualizers.forEach(e=>{e.triggerClick&&e.triggerClick(t)})}updateScroll(t){if(this.visualizers.forEach(i=>{i.updateScroll&&i.updateScroll(t)}),Math.abs(t)>.1){const i=this.parameterManager.getParameter("morphFactor")||1;this.parameterManager.setParameter("morphFactor",Math.max(.1,i+t*.5))}}destroy(){window.universalReactivity&&window.universalReactivity.disconnectSystem("faceted"),this.animationId&&cancelAnimationFrame(this.animationId),this.visualizers.forEach(t=>{t.destroy&&t.destroy()}),console.log("🔄 VIB34D Engine destroyed")}}class ht{constructor(t,e,i,o){if(this.canvas=document.getElementById(t),this.role=e,this.reactivity=i,this.variant=o,this.contextOptions={alpha:!0,depth:!0,stencil:!1,antialias:!1,premultipliedAlpha:!0,preserveDrawingBuffer:!1,powerPreference:"high-performance",failIfMajorPerformanceCaveat:!1},this.gl=this.canvas.getContext("webgl2",this.contextOptions)||this.canvas.getContext("webgl",this.contextOptions)||this.canvas.getContext("experimental-webgl",this.contextOptions),this.gl){if(window.mobileDebug){const s=this.gl.getParameter(this.gl.VERSION);window.mobileDebug.log(`✅ ${t}: WebGL context created - ${s}`)}}else{console.error(`WebGL not supported for ${t}`),window.mobileDebug&&window.mobileDebug.log(`❌ ${t}: WebGL context creation failed`),this.showWebGLError();return}this.mouseX=.5,this.mouseY=.5,this.mouseIntensity=0,this.clickIntensity=0,this.startTime=Date.now(),this.params={geometry:0,gridDensity:15,morphFactor:1,chaos:.2,speed:1,hue:200,intensity:.5,saturation:.8,dimension:3.5,rot4dXW:0,rot4dYW:0,rot4dZW:0},this.init()}async ensureCanvasSizedThenInitWebGL(){let t=this.canvas.getBoundingClientRect();const e=Math.min(window.devicePixelRatio||1,2);t.width===0||t.height===0?await new Promise(i=>{setTimeout(()=>{if(t=this.canvas.getBoundingClientRect(),t.width===0||t.height===0){const o=window.innerWidth,s=window.innerHeight;this.canvas.width=o*e,this.canvas.height=s*e,window.mobileDebug&&window.mobileDebug.log(`📐 Quantum Canvas ${this.canvas.id}: Using viewport fallback ${this.canvas.width}x${this.canvas.height}`)}else this.canvas.width=t.width*e,this.canvas.height=t.height*e,window.mobileDebug&&window.mobileDebug.log(`📐 Quantum Canvas ${this.canvas.id}: Layout ready ${this.canvas.width}x${this.canvas.height}`);i()},100)}):(this.canvas.width=t.width*e,this.canvas.height=t.height*e,window.mobileDebug&&window.mobileDebug.log(`📐 Quantum Canvas ${this.canvas.id}: ${this.canvas.width}x${this.canvas.height} (DPR: ${e})`)),this.createWebGLContext(),this.gl&&this.init()}createWebGLContext(){let t=this.canvas.getContext("webgl2")||this.canvas.getContext("webgl")||this.canvas.getContext("experimental-webgl");if(t&&!t.isContextLost()){console.log(`🔄 Reusing existing WebGL context for ${this.canvas.id}`),this.gl=t;return}if(this.gl=this.canvas.getContext("webgl2",this.contextOptions)||this.canvas.getContext("webgl",this.contextOptions)||this.canvas.getContext("experimental-webgl",this.contextOptions),this.gl){if(window.mobileDebug){const e=this.gl.getParameter(this.gl.VERSION);window.mobileDebug.log(`✅ Quantum ${this.canvas.id}: WebGL context created - ${e} (size: ${this.canvas.width}x${this.canvas.height})`)}}else{console.error(`WebGL not supported for ${this.canvas.id}`),window.mobileDebug&&window.mobileDebug.log(`❌ Quantum ${this.canvas.id}: WebGL context creation failed (size: ${this.canvas.width}x${this.canvas.height})`),this.showWebGLError();return}}init(){this.initShaders(),this.initBuffers(),this.resize()}reinitializeContext(){if(console.log(`🔄 Reinitializing WebGL context for ${this.canvas.id}`),this.program=null,this.buffer=null,this.uniforms=null,this.gl=null,this.gl=this.canvas.getContext("webgl2")||this.canvas.getContext("webgl")||this.canvas.getContext("experimental-webgl"),!this.gl)return console.error(`❌ No WebGL context available for ${this.canvas.id} - SmartCanvasPool should have created one`),!1;if(this.gl.isContextLost())return console.error(`❌ WebGL context is lost for ${this.canvas.id}`),!1;try{return this.initShaders(),this.initBuffers(),this.resize(),console.log(`✅ WebGL context reinitialized for ${this.canvas.id}`),!0}catch(t){return console.error(`❌ Failed to reinitialize WebGL resources for ${this.canvas.id}:`,t),!1}}initShaders(){const t=`attribute vec2 a_position;
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
}`;this.program=this.createProgram(t,e),this.uniforms={resolution:this.gl.getUniformLocation(this.program,"u_resolution"),time:this.gl.getUniformLocation(this.program,"u_time"),mouse:this.gl.getUniformLocation(this.program,"u_mouse"),geometry:this.gl.getUniformLocation(this.program,"u_geometry"),gridDensity:this.gl.getUniformLocation(this.program,"u_gridDensity"),morphFactor:this.gl.getUniformLocation(this.program,"u_morphFactor"),chaos:this.gl.getUniformLocation(this.program,"u_chaos"),speed:this.gl.getUniformLocation(this.program,"u_speed"),hue:this.gl.getUniformLocation(this.program,"u_hue"),intensity:this.gl.getUniformLocation(this.program,"u_intensity"),saturation:this.gl.getUniformLocation(this.program,"u_saturation"),dimension:this.gl.getUniformLocation(this.program,"u_dimension"),rot4dXW:this.gl.getUniformLocation(this.program,"u_rot4dXW"),rot4dYW:this.gl.getUniformLocation(this.program,"u_rot4dYW"),rot4dZW:this.gl.getUniformLocation(this.program,"u_rot4dZW"),mouseIntensity:this.gl.getUniformLocation(this.program,"u_mouseIntensity"),clickIntensity:this.gl.getUniformLocation(this.program,"u_clickIntensity"),roleIntensity:this.gl.getUniformLocation(this.program,"u_roleIntensity")}}createProgram(t,e){var a,r;const i=this.createShader(this.gl.VERTEX_SHADER,t),o=this.createShader(this.gl.FRAGMENT_SHADER,e);if(!i||!o)return null;const s=this.gl.createProgram();if(this.gl.attachShader(s,i),this.gl.attachShader(s,o),this.gl.linkProgram(s),this.gl.getProgramParameter(s,this.gl.LINK_STATUS))window.mobileDebug&&window.mobileDebug.log(`✅ ${(r=this.canvas)==null?void 0:r.id}: Shader program linked successfully`);else{const n=this.gl.getProgramInfoLog(s);return console.error("Program linking failed:",n),window.mobileDebug&&window.mobileDebug.log(`❌ ${(a=this.canvas)==null?void 0:a.id}: Shader program link failed - ${n}`),null}return s}createShader(t,e){var i,o,s,a,r,n;if(!this.gl)return console.error("❌ Cannot create shader: WebGL context is null"),window.mobileDebug&&window.mobileDebug.log(`❌ ${(i=this.canvas)==null?void 0:i.id}: Cannot create shader - WebGL context is null`),null;if(this.gl.isContextLost())return console.error("❌ Cannot create shader: WebGL context is lost"),window.mobileDebug&&window.mobileDebug.log(`❌ ${(o=this.canvas)==null?void 0:o.id}: Cannot create shader - WebGL context is lost`),null;try{const c=this.gl.createShader(t);if(!c)return console.error("❌ Failed to create shader object - WebGL context may be invalid"),window.mobileDebug&&window.mobileDebug.log(`❌ ${(s=this.canvas)==null?void 0:s.id}: Failed to create shader object`),null;if(this.gl.shaderSource(c,e),this.gl.compileShader(c),this.gl.getShaderParameter(c,this.gl.COMPILE_STATUS)){if(window.mobileDebug){const h=t===this.gl.VERTEX_SHADER?"vertex":"fragment";window.mobileDebug.log(`✅ ${(r=this.canvas)==null?void 0:r.id}: ${h} shader compiled successfully`)}}else{const h=this.gl.getShaderInfoLog(c),d=t===this.gl.VERTEX_SHADER?"vertex":"fragment";if(h?console.error(`❌ ${d} shader compilation failed:`,h):console.error(`❌ ${d} shader compilation failed: WebGL returned no error info (context may be invalid)`),console.error("Shader source:",e),window.mobileDebug){const u=h||"No error info (context may be invalid)";window.mobileDebug.log(`❌ ${(a=this.canvas)==null?void 0:a.id}: ${d} shader compile failed - ${u}`);const m=e.split(`
`).slice(0,5).join("\\n");window.mobileDebug.log(`🔍 ${d} shader source start: ${m}...`)}return this.gl.deleteShader(c),null}return c}catch(c){return console.error("❌ Exception during shader creation:",c),window.mobileDebug&&window.mobileDebug.log(`❌ ${(n=this.canvas)==null?void 0:n.id}: Exception during shader creation - ${c.message}`),null}}initBuffers(){const t=new Float32Array([-1,-1,1,-1,-1,1,1,1]);this.buffer=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.buffer),this.gl.bufferData(this.gl.ARRAY_BUFFER,t,this.gl.STATIC_DRAW);const e=this.gl.getAttribLocation(this.program,"a_position");this.gl.enableVertexAttribArray(e),this.gl.vertexAttribPointer(e,2,this.gl.FLOAT,!1,0,0)}resize(){var o,s;const t=Math.min(window.devicePixelRatio||1,2),e=this.canvas.clientWidth,i=this.canvas.clientHeight;window.mobileDebug&&(e===0||i===0)&&!this._zeroDimWarned&&(window.mobileDebug.log(`⚠️ ${(o=this.canvas)==null?void 0:o.id}: Canvas clientWidth=${e}, clientHeight=${i} - will be invisible`),this._zeroDimWarned=!0),(this.canvas.width!==e*t||this.canvas.height!==i*t)&&(this.canvas.width=e*t,this.canvas.height=i*t,this.gl.viewport(0,0,this.canvas.width,this.canvas.height),window.mobileDebug&&!this._finalSizeLogged&&(window.mobileDebug.log(`📐 ${(s=this.canvas)==null?void 0:s.id}: Final canvas buffer ${this.canvas.width}x${this.canvas.height} (DPR=${t})`),this._finalSizeLogged=!0))}showWebGLError(){if(!this.canvas)return;const t=this.canvas.getContext("2d");t&&(t.fillStyle="#000",t.fillRect(0,0,this.canvas.width,this.canvas.height),t.fillStyle="#64ff96",t.font="16px Orbitron, monospace",t.textAlign="center",t.fillText("WebGL Required",this.canvas.width/2,this.canvas.height/2),t.fillStyle="#888",t.font="12px Orbitron, monospace",t.fillText("Please enable WebGL in your browser",this.canvas.width/2,this.canvas.height/2+25))}updateParameters(t){this.params={...this.params,...t}}updateInteraction(t,e,i){this.mouseX=t,this.mouseY=e,this.mouseIntensity=i}render(){var r,n;if(!this.program){window.mobileDebug&&!this._noProgramWarned&&(window.mobileDebug.log(`❌ ${(r=this.canvas)==null?void 0:r.id}: No WebGL program for render`),this._noProgramWarned=!0);return}this.resize(),this.gl.useProgram(this.program),this.gl.clearColor(0,0,0,0),this.gl.clear(this.gl.COLOR_BUFFER_BIT),this._renderParamsLogged||(console.log(`[Mobile] ${(n=this.canvas)==null?void 0:n.id}: Render params - geometry=${this.params.geometry}, gridDensity=${this.params.gridDensity}, intensity=${this.params.intensity}`),this._renderParamsLogged=!0);const t={background:.4,shadow:.6,content:1,highlight:1.3,accent:1.6},e=Date.now()-this.startTime;this.gl.uniform2f(this.uniforms.resolution,this.canvas.width,this.canvas.height),this.gl.uniform1f(this.uniforms.time,e),this.gl.uniform2f(this.uniforms.mouse,this.mouseX,this.mouseY),this.gl.uniform1f(this.uniforms.geometry,this.params.geometry);let i=this.params.gridDensity,o=this.params.morphFactor,s=this.params.hue,a=this.params.chaos;window.audioEnabled&&window.audioReactive&&(i+=window.audioReactive.bass*40,o+=window.audioReactive.mid*1.2,s+=window.audioReactive.high*120,a+=window.audioReactive.energy*.6,Date.now()%1e4<16&&console.log(`🌌 Quantum audio reactivity: Density+${(window.audioReactive.bass*40).toFixed(1)} Morph+${(window.audioReactive.mid*1.2).toFixed(2)} Hue+${(window.audioReactive.high*120).toFixed(1)} Chaos+${(window.audioReactive.energy*.6).toFixed(2)}`)),this.gl.uniform1f(this.uniforms.gridDensity,Math.min(100,i)),this.gl.uniform1f(this.uniforms.morphFactor,Math.min(2,o)),this.gl.uniform1f(this.uniforms.chaos,Math.min(1,a)),this.gl.uniform1f(this.uniforms.speed,this.params.speed),this.gl.uniform1f(this.uniforms.hue,s%360/360),this.gl.uniform1f(this.uniforms.intensity,this.params.intensity),this.gl.uniform1f(this.uniforms.saturation,this.params.saturation),this.gl.uniform1f(this.uniforms.dimension,this.params.dimension),this.gl.uniform1f(this.uniforms.rot4dXW,this.params.rot4dXW),this.gl.uniform1f(this.uniforms.rot4dYW,this.params.rot4dYW),this.gl.uniform1f(this.uniforms.rot4dZW,this.params.rot4dZW),this.gl.uniform1f(this.uniforms.mouseIntensity,this.mouseIntensity),this.gl.uniform1f(this.uniforms.clickIntensity,this.clickIntensity),this.gl.uniform1f(this.uniforms.roleIntensity,t[this.role]||1),this.gl.drawArrays(this.gl.TRIANGLE_STRIP,0,4)}destroy(){this.gl&&this.program&&this.gl.deleteProgram(this.program),this.gl&&this.buffer&&this.gl.deleteBuffer(this.buffer)}}class dt{constructor(){console.log("🔮 Initializing VIB34D Quantum Engine..."),this.visualizers=[],this.parameters=new z,this.isActive=!1,this.parameters.setParameter("hue",280),this.parameters.setParameter("intensity",.7),this.parameters.setParameter("saturation",.9),this.parameters.setParameter("gridDensity",20),this.parameters.setParameter("morphFactor",1),this.init()}init(){this.createVisualizers(),this.setupAudioReactivity(),this.startRenderLoop(),console.log("✨ Quantum Engine initialized with audio reactivity")}createVisualizers(){[{id:"quantum-background-canvas",role:"background",reactivity:.4},{id:"quantum-shadow-canvas",role:"shadow",reactivity:.6},{id:"quantum-content-canvas",role:"content",reactivity:1},{id:"quantum-highlight-canvas",role:"highlight",reactivity:1.3},{id:"quantum-accent-canvas",role:"accent",reactivity:1.6}].forEach(e=>{try{if(!document.getElementById(e.id)){console.warn(`⚠️ Canvas ${e.id} not found in DOM - skipping`);return}const o=new ht(e.id,e.role,e.reactivity,0);o.gl?(this.visualizers.push(o),console.log(`🌌 Created quantum layer: ${e.role}`)):console.warn(`⚠️ No WebGL context for quantum layer ${e.id}`)}catch(i){console.warn(`Failed to create quantum layer ${e.id}:`,i)}}),console.log(`✅ Created ${this.visualizers.length} quantum visualizers with enhanced effects`)}setActive(t){if(this.isActive=t,t){const e=document.getElementById("quantumLayers");e&&(e.style.display="block"),window.audioEnabled&&!this.audioEnabled&&this.enableAudio(),console.log("🔮 Quantum System ACTIVATED - Audio frequency reactivity mode")}else{const e=document.getElementById("quantumLayers");e&&(e.style.display="none"),console.log("🔮 Quantum System DEACTIVATED")}}toggleAudio(t){t&&this.isActive&&!this.audioEnabled?this.enableAudio():!t&&this.audioEnabled&&(this.audioEnabled=!1,this.audioContext&&(this.audioContext.close(),this.audioContext=null),console.log("🔇 Quantum audio reactivity disabled"))}setupAudioReactivity(){console.log("🌌 Setting up Quantum audio frequency reactivity")}async enableAudio(){if(!this.audioEnabled)try{const t=await navigator.mediaDevices.getUserMedia({audio:!0});this.audioContext=new(window.AudioContext||window.webkitAudioContext),this.analyser=this.audioContext.createAnalyser(),this.analyser.fftSize=256,this.analyser.smoothingTimeConstant=.8,this.frequencyData=new Uint8Array(this.analyser.frequencyBinCount),this.audioContext.createMediaStreamSource(t).connect(this.analyser),this.audioEnabled=!0,console.log("🎵 Quantum audio reactivity enabled")}catch(t){console.error("❌ Failed to enable Quantum audio:",t),this.audioEnabled=!1}}updateParameter(t,e){this.parameters.setParameter(t,e),this.visualizers.forEach(i=>{if(i.updateParameters){const o={};o[t]=e,i.updateParameters(o)}else i.params&&(i.params[t]=e,i.render&&i.render())}),console.log(`🔮 Updated quantum ${t}: ${e}`)}updateParameters(t){Object.keys(t).forEach(e=>{this.updateParameter(e,t[e])})}updateInteraction(t,e,i){this.visualizers.forEach(o=>{o.updateInteraction&&o.updateInteraction(t,e,i)})}getParameters(){return this.parameters.getAllParameters()}setParameters(t){Object.keys(t).forEach(e=>{this.parameters.setParameter(e,t[e])}),this.updateParameters(t)}startRenderLoop(){var e;window.mobileDebug&&window.mobileDebug.log(`🎬 Quantum Engine: Starting render loop with ${(e=this.visualizers)==null?void 0:e.length} visualizers, isActive=${this.isActive}`);const t=()=>{var i;if(this.isActive){const o=this.parameters.getAllParameters();this.visualizers.forEach(s=>{s.updateParameters&&s.render&&(s.updateParameters(o),s.render())}),window.mobileDebug&&!this._renderActivityLogged&&(window.mobileDebug.log(`🎬 Quantum Engine: Actively rendering ${(i=this.visualizers)==null?void 0:i.length} visualizers`),this._renderActivityLogged=!0)}else window.mobileDebug&&!this._inactiveWarningLogged&&(window.mobileDebug.log("⚠️ Quantum Engine: Not rendering because isActive=false"),this._inactiveWarningLogged=!0);requestAnimationFrame(t)};t(),console.log("🎬 Quantum render loop started"),window.mobileDebug&&window.mobileDebug.log("✅ Quantum Engine: Render loop started, will render when isActive=true")}updateClick(t){this.visualizers.forEach(e=>{e.triggerClick&&e.triggerClick(.5,.5,t)})}updateScroll(t){this.visualizers.forEach(e=>{e.updateScroll&&e.updateScroll(t)})}destroy(){window.universalReactivity&&window.universalReactivity.disconnectSystem("quantum"),this.visualizers.forEach(t=>{t.destroy&&t.destroy()}),this.visualizers=[],console.log("🧹 Quantum Engine destroyed")}}class ut{constructor(t,e="content",i=1,o=0){this.canvas=document.getElementById(t),this.role=e,this.reactivity=i,this.variant=o,this.contextOptions={alpha:!0,depth:!0,stencil:!1,antialias:!1,premultipliedAlpha:!0,preserveDrawingBuffer:!1,powerPreference:"high-performance",failIfMajorPerformanceCaveat:!1};let s=this.canvas.getContext("webgl2")||this.canvas.getContext("webgl")||this.canvas.getContext("experimental-webgl");if(s&&!s.isContextLost()?(console.log(`🔄 Reusing existing WebGL context for ${t}`),this.gl=s):this.gl=this.canvas.getContext("webgl2",this.contextOptions)||this.canvas.getContext("webgl",this.contextOptions)||this.canvas.getContext("experimental-webgl",this.contextOptions),!this.gl)throw console.error(`WebGL not supported for ${t}`),this.showWebGLError(),new Error(`WebGL not supported for ${t}`);this.variantParams=this.generateVariantParams(o),this.roleParams=this.generateRoleParams(e),this.mouseX=.5,this.mouseY=.5,this.mouseIntensity=0,this.clickIntensity=0,this.clickDecay=.95,this.touchX=.5,this.touchY=.5,this.touchActive=!1,this.touchMorph=0,this.touchChaos=0,this.scrollPosition=0,this.scrollVelocity=0,this.scrollDecay=.92,this.parallaxDepth=0,this.gridDensityShift=0,this.colorScrollShift=0,this.densityVariation=0,this.densityTarget=0,this.audioData={bass:0,mid:0,high:0},this.audioDensityBoost=0,this.audioMorphBoost=0,this.audioSpeedBoost=0,this.audioChaosBoost=0,this.audioColorShift=0,this.startTime=Date.now(),this.initShaders(),this.initBuffers(),this.resize()}generateVariantParams(t){const e=["TETRAHEDRON","HYPERCUBE","SPHERE","TORUS","KLEIN BOTTLE","FRACTAL","WAVE","CRYSTAL"],o=[0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,6,6,6,7,7,7,7][t]||0,s=t%4,n=e[o]+[" LATTICE"," FIELD"," MATRIX"," RESONANCE"][s],h={0:{density:.8+s*.2,speed:.3+s*.1,chaos:s*.1,morph:0+s*.2},1:{density:1+s*.3,speed:.5+s*.1,chaos:s*.15,morph:s*.2},2:{density:1.2+s*.4,speed:.4+s*.2,chaos:.1+s*.1,morph:.3+s*.2},3:{density:.9+s*.3,speed:.6+s*.2,chaos:.2+s*.2,morph:.5+s*.1},4:{density:1.4+s*.5,speed:.7+s*.1,chaos:.3+s*.2,morph:.7+s*.1},5:{density:1.8+s*.3,speed:.5+s*.3,chaos:.5+s*.2,morph:.8+s*.05},6:{density:.6+s*.4,speed:.8+s*.4,chaos:.4+s*.3,morph:.6+s*.2},7:{density:1.6+s*.2,speed:.2+s*.1,chaos:.1+s*.1,morph:.2+s*.2}}[o];return{geometryType:o,name:n,density:h.density,speed:h.speed,hue:t*12.27%360,saturation:.8+s*.05,intensity:.5+s*.1,chaos:h.chaos,morph:h.morph}}generateRoleParams(t){const e=this.variantParams;return{background:{densityMult:.4,speedMult:.2,colorShift:0,intensity:.2,mouseReactivity:.3,clickReactivity:.1},shadow:{densityMult:.8,speedMult:.3,colorShift:180,intensity:.4,mouseReactivity:.5,clickReactivity:.3},content:{densityMult:e.density,speedMult:e.speed,colorShift:e.hue,intensity:e.intensity,mouseReactivity:1,clickReactivity:.8},highlight:{densityMult:1.5+e.density*.3,speedMult:.8+e.speed*.2,colorShift:e.hue+60,intensity:.6+e.intensity*.2,mouseReactivity:1.2,clickReactivity:1},accent:{densityMult:2.5+e.density*.5,speedMult:.4+e.speed*.1,colorShift:e.hue+300,intensity:.3+e.intensity*.1,mouseReactivity:1.5,clickReactivity:1.2}}[t]||{densityMult:1,speedMult:.5,colorShift:0,intensity:.5,mouseReactivity:1,clickReactivity:.5}}initShaders(){const t=`
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
        `;this.program=this.createProgram(t,e),this.uniforms={resolution:this.gl.getUniformLocation(this.program,"u_resolution"),time:this.gl.getUniformLocation(this.program,"u_time"),mouse:this.gl.getUniformLocation(this.program,"u_mouse"),geometry:this.gl.getUniformLocation(this.program,"u_geometry"),density:this.gl.getUniformLocation(this.program,"u_density"),speed:this.gl.getUniformLocation(this.program,"u_speed"),color:this.gl.getUniformLocation(this.program,"u_color"),intensity:this.gl.getUniformLocation(this.program,"u_intensity"),roleDensity:this.gl.getUniformLocation(this.program,"u_roleDensity"),roleSpeed:this.gl.getUniformLocation(this.program,"u_roleSpeed"),colorShift:this.gl.getUniformLocation(this.program,"u_colorShift"),chaosIntensity:this.gl.getUniformLocation(this.program,"u_chaosIntensity"),mouseIntensity:this.gl.getUniformLocation(this.program,"u_mouseIntensity"),clickIntensity:this.gl.getUniformLocation(this.program,"u_clickIntensity"),densityVariation:this.gl.getUniformLocation(this.program,"u_densityVariation"),geometryType:this.gl.getUniformLocation(this.program,"u_geometryType"),chaos:this.gl.getUniformLocation(this.program,"u_chaos"),morph:this.gl.getUniformLocation(this.program,"u_morph"),touchMorph:this.gl.getUniformLocation(this.program,"u_touchMorph"),touchChaos:this.gl.getUniformLocation(this.program,"u_touchChaos"),scrollParallax:this.gl.getUniformLocation(this.program,"u_scrollParallax"),gridDensityShift:this.gl.getUniformLocation(this.program,"u_gridDensityShift"),colorScrollShift:this.gl.getUniformLocation(this.program,"u_colorScrollShift"),audioDensityBoost:this.gl.getUniformLocation(this.program,"u_audioDensityBoost"),audioMorphBoost:this.gl.getUniformLocation(this.program,"u_audioMorphBoost"),audioSpeedBoost:this.gl.getUniformLocation(this.program,"u_audioSpeedBoost"),audioChaosBoost:this.gl.getUniformLocation(this.program,"u_audioChaosBoost"),audioColorShift:this.gl.getUniformLocation(this.program,"u_audioColorShift"),rot4dXW:this.gl.getUniformLocation(this.program,"u_rot4dXW"),rot4dYW:this.gl.getUniformLocation(this.program,"u_rot4dYW"),rot4dZW:this.gl.getUniformLocation(this.program,"u_rot4dZW")}}createProgram(t,e){const i=this.createShader(this.gl.VERTEX_SHADER,t),o=this.createShader(this.gl.FRAGMENT_SHADER,e),s=this.gl.createProgram();if(this.gl.attachShader(s,i),this.gl.attachShader(s,o),this.gl.linkProgram(s),!this.gl.getProgramParameter(s,this.gl.LINK_STATUS))throw new Error("Program linking failed: "+this.gl.getProgramInfoLog(s));return s}createShader(t,e){if(!this.gl)throw console.error("❌ Cannot create shader: WebGL context is null"),new Error("WebGL context is null");if(this.gl.isContextLost())throw console.error("❌ Cannot create shader: WebGL context is lost"),new Error("WebGL context is lost");try{const i=this.gl.createShader(t);if(!i)throw console.error("❌ Failed to create shader object - WebGL context may be invalid"),new Error("Failed to create shader object - WebGL context may be invalid");if(this.gl.shaderSource(i,e),this.gl.compileShader(i),!this.gl.getShaderParameter(i,this.gl.COMPILE_STATUS)){const o=this.gl.getShaderInfoLog(i),s=t===this.gl.VERTEX_SHADER?"vertex":"fragment";throw o?(console.error(`❌ ${s} shader compilation failed:`,o),new Error(`${s} shader compilation failed: ${o}`)):(console.error(`❌ ${s} shader compilation failed: WebGL returned no error info (context may be invalid)`),new Error(`${s} shader compilation failed: WebGL returned no error info (context may be invalid)`))}return i}catch(i){throw console.error("❌ Exception during shader creation:",i),i}}initBuffers(){const t=new Float32Array([-1,-1,1,-1,-1,1,1,1]);this.buffer=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.buffer),this.gl.bufferData(this.gl.ARRAY_BUFFER,t,this.gl.STATIC_DRAW);const e=this.gl.getAttribLocation(this.program,"a_position");this.gl.enableVertexAttribArray(e),this.gl.vertexAttribPointer(e,2,this.gl.FLOAT,!1,0,0)}resize(){const t=Math.min(window.devicePixelRatio||1,2),e=this.canvas.clientWidth,i=this.canvas.clientHeight;(this.canvas.width!==e*t||this.canvas.height!==i*t)&&(this.canvas.width=e*t,this.canvas.height=i*t,this.gl.viewport(0,0,this.canvas.width,this.canvas.height))}showWebGLError(){if(!this.canvas)return;const t=this.canvas.getContext("2d");t&&(t.fillStyle="#000",t.fillRect(0,0,this.canvas.width,this.canvas.height),t.fillStyle="#ff64ff",t.font="16px Orbitron, monospace",t.textAlign="center",t.fillText("WebGL Required",this.canvas.width/2,this.canvas.height/2),t.fillStyle="#888",t.font="12px Orbitron, monospace",t.fillText("Please enable WebGL in your browser",this.canvas.width/2,this.canvas.height/2+25))}updateInteraction(t,e,i){this.mouseX=t,this.mouseY=e,this.mouseIntensity=i*this.roleParams.mouseReactivity*this.reactivity}triggerClick(t,e){this.clickIntensity=Math.min(1,this.clickIntensity+this.roleParams.clickReactivity*this.reactivity)}updateDensity(t){this.densityTarget=t}updateTouch(t,e,i){this.touchX=t,this.touchY=e,this.touchActive=i,this.touchMorph=(t-.5)*2,this.touchChaos=Math.abs(e-.5)*2}updateScroll(t){this.scrollVelocity+=t*.001,this.scrollVelocity=Math.max(-2,Math.min(2,this.scrollVelocity))}updateAudio_DISABLED(){}updateScrollPhysics(){this.scrollPosition+=this.scrollVelocity,this.scrollVelocity*=this.scrollDecay,this.parallaxDepth=Math.sin(this.scrollPosition*.1)*.5,this.gridDensityShift=Math.sin(this.scrollPosition*.05)*.3,this.colorScrollShift=this.scrollPosition*.02%(Math.PI*2)}render(){if(!this.program)return;this.resize(),this.gl.useProgram(this.program),this.densityVariation+=(this.densityTarget-this.densityVariation)*.05,this.clickIntensity*=this.clickDecay,this.updateScrollPhysics();const t=Date.now()-this.startTime,e=(this.variantParams.hue||0)/360,i=this.variantParams.saturation||.8,o=Math.max(.2,Math.min(.8,this.variantParams.intensity||.5)),a=((p,f,g)=>{let y,v,x;if(f===0)y=v=x=g;else{const M=(C,A,E)=>(E<0&&(E+=1),E>1&&(E-=1),E<.16666666666666666?C+(A-C)*6*E:E<.5?A:E<.6666666666666666?C+(A-C)*(.6666666666666666-E)*6:C),I=g<.5?g*(1+f):g+f-g*f,L=2*g-I;y=M(L,I,p+1/3),v=M(L,I,p),x=M(L,I,p-1/3)}return[y,v,x]})(e,i,o);this.gl.uniform2f(this.uniforms.resolution,this.canvas.width,this.canvas.height),this.gl.uniform1f(this.uniforms.time,t),this.gl.uniform2f(this.uniforms.mouse,this.mouseX,this.mouseY),this.gl.uniform1f(this.uniforms.geometryType,this.variantParams.geometryType||0),this.gl.uniform1f(this.uniforms.density,this.variantParams.density||1);const r=(this.variantParams.speed||.5)*.2,n=(this.audioSpeedBoost||0)*.1;this.gl.uniform1f(this.uniforms.speed,r+n),this.gl.uniform3fv(this.uniforms.color,new Float32Array(a)),this.gl.uniform1f(this.uniforms.intensity,(this.variantParams.intensity||.5)*this.roleParams.intensity),this.gl.uniform1f(this.uniforms.roleDensity,this.roleParams.densityMult),this.gl.uniform1f(this.uniforms.roleSpeed,this.roleParams.speedMult),this.gl.uniform1f(this.uniforms.colorShift,this.roleParams.colorShift+(this.variantParams.hue||0)/360),this.gl.uniform1f(this.uniforms.chaosIntensity,this.variantParams.chaos||0),this.gl.uniform1f(this.uniforms.mouseIntensity,this.mouseIntensity),this.gl.uniform1f(this.uniforms.clickIntensity,this.clickIntensity),this.gl.uniform1f(this.uniforms.densityVariation,this.densityVariation),this.gl.uniform1f(this.uniforms.geometryType,this.variantParams.geometryType!==void 0?this.variantParams.geometryType:this.variant||0),this.gl.uniform1f(this.uniforms.chaos,this.variantParams.chaos||0),this.gl.uniform1f(this.uniforms.morph,this.variantParams.morph||0),this.gl.uniform1f(this.uniforms.touchMorph,this.touchMorph),this.gl.uniform1f(this.uniforms.touchChaos,this.touchChaos),this.gl.uniform1f(this.uniforms.scrollParallax,this.parallaxDepth),this.gl.uniform1f(this.uniforms.gridDensityShift,this.gridDensityShift),this.gl.uniform1f(this.uniforms.colorScrollShift,this.colorScrollShift);let c=0,h=0,d=0,u=0,m=0;window.audioEnabled&&window.audioReactive&&(c=window.audioReactive.bass*1.5,h=window.audioReactive.mid*1.2,d=window.audioReactive.high*.8,u=window.audioReactive.energy*.6,m=window.audioReactive.bass*45,Date.now()%1e4<16&&console.log(`✨ Holographic audio reactivity: Density+${c.toFixed(2)} Morph+${h.toFixed(2)} Speed+${d.toFixed(2)} Chaos+${u.toFixed(2)} Color+${m.toFixed(1)}`)),this.gl.uniform1f(this.uniforms.audioDensityBoost,c),this.gl.uniform1f(this.uniforms.audioMorphBoost,h),this.gl.uniform1f(this.uniforms.audioSpeedBoost,d),this.gl.uniform1f(this.uniforms.audioChaosBoost,u),this.gl.uniform1f(this.uniforms.audioColorShift,m),this.gl.uniform1f(this.uniforms.rot4dXW,this.variantParams.rot4dXW||0),this.gl.uniform1f(this.uniforms.rot4dYW,this.variantParams.rot4dYW||0),this.gl.uniform1f(this.uniforms.rot4dZW,this.variantParams.rot4dZW||0),this.gl.drawArrays(this.gl.TRIANGLE_STRIP,0,4)}reinitializeContext(){var t,e,i,o,s;if(console.log(`🔄 Reinitializing WebGL context for ${(t=this.canvas)==null?void 0:t.id}`),this.program=null,this.buffer=null,this.uniforms=null,this.gl=null,this.gl=this.canvas.getContext("webgl2")||this.canvas.getContext("webgl")||this.canvas.getContext("experimental-webgl"),!this.gl)return console.error(`❌ No WebGL context available for ${(e=this.canvas)==null?void 0:e.id} - SmartCanvasPool should have created one`),!1;if(this.gl.isContextLost())return console.error(`❌ WebGL context is lost for ${(i=this.canvas)==null?void 0:i.id}`),!1;try{return this.initShaders(),this.initBuffers(),this.resize(),console.log(`✅ ${(o=this.canvas)==null?void 0:o.id}: Holographic context reinitialized successfully`),!0}catch(a){return console.error(`❌ Failed to reinitialize holographic WebGL resources for ${(s=this.canvas)==null?void 0:s.id}:`,a),!1}}updateParameters(t){this.variantParams&&Object.keys(t).forEach(e=>{const i=this.mapParameterName(e);if(i!==null){let o=t[e];e==="gridDensity"&&(o=.3+(parseFloat(t[e])-5)/95*2.2,console.log(`🔧 Density scaling: gridDensity=${t[e]} → density=${o.toFixed(3)} (normal range)`)),this.variantParams[i]=o,i==="geometryType"&&(this.roleParams=this.generateRoleParams(this.role))}})}mapParameterName(t){return{gridDensity:"density",morphFactor:"morph",rot4dXW:"rot4dXW",rot4dYW:"rot4dYW",rot4dZW:"rot4dZW",hue:"hue",intensity:"intensity",saturation:"saturation",chaos:"chaos",speed:"speed",geometry:"geometryType"}[t]||t}}class mt{constructor(){this.visualizers=[],this.currentVariant=0,this.baseVariants=30,this.totalVariants=30,this.isActive=!1,this.audioEnabled=!1,this.audioContext=null,this.analyser=null,this.frequencyData=null,this.audioData={bass:0,mid:0,high:0},this.variantNames=["TETRAHEDRON LATTICE","TETRAHEDRON FIELD","TETRAHEDRON MATRIX","TETRAHEDRON RESONANCE","HYPERCUBE LATTICE","HYPERCUBE FIELD","HYPERCUBE MATRIX","HYPERCUBE QUANTUM","SPHERE LATTICE","SPHERE FIELD","SPHERE MATRIX","SPHERE RESONANCE","TORUS LATTICE","TORUS FIELD","TORUS MATRIX","TORUS QUANTUM","KLEIN BOTTLE LATTICE","KLEIN BOTTLE FIELD","KLEIN BOTTLE MATRIX","KLEIN BOTTLE QUANTUM","FRACTAL LATTICE","FRACTAL FIELD","FRACTAL QUANTUM","WAVE LATTICE","WAVE FIELD","WAVE QUANTUM","CRYSTAL LATTICE","CRYSTAL FIELD","CRYSTAL MATRIX","CRYSTAL QUANTUM"],this.initialize()}initialize(){console.log("🎨 Initializing REAL Holographic System for Active Holograms tab..."),this.createVisualizers(),this.updateVariantDisplay(),this.startRenderLoop()}createVisualizers(){const t=[{id:"holo-background-canvas",role:"background",reactivity:.5},{id:"holo-shadow-canvas",role:"shadow",reactivity:.7},{id:"holo-content-canvas",role:"content",reactivity:.9},{id:"holo-highlight-canvas",role:"highlight",reactivity:1.1},{id:"holo-accent-canvas",role:"accent",reactivity:1.5}];let e=0;t.forEach(i=>{try{if(!document.getElementById(i.id)){console.error(`❌ Canvas not found: ${i.id}`);return}console.log(`🔍 Creating holographic visualizer for: ${i.id}`);const s=new ut(i.id,i.role,i.reactivity,this.currentVariant);s.gl?(this.visualizers.push(s),e++,console.log(`✅ Created REAL holographic layer: ${i.role} (${i.id})`)):console.error(`❌ No WebGL context for: ${i.id}`)}catch(o){console.error(`❌ Failed to create REAL holographic layer ${i.id}:`,o)}}),console.log(`✅ Created ${e}/5 REAL holographic layers`),e===0&&console.error("🚨 NO HOLOGRAPHIC VISUALIZERS CREATED! Check canvas elements and WebGL support.")}setActive(t){if(this.isActive=t,t){const e=document.getElementById("holographicLayers");e&&(e.style.display="block"),!this.audioEnabled&&window.audioEnabled===!0&&this.initAudio(),console.log("🌌 REAL Active Holograms ACTIVATED with audio reactivity")}else{const e=document.getElementById("holographicLayers");e&&(e.style.display="none"),console.log("🌌 REAL Active Holograms DEACTIVATED")}}updateVariantDisplay(){const t=this.variantNames[this.currentVariant];return{variant:this.currentVariant,name:t,geometryType:Math.floor(this.currentVariant/4)}}nextVariant(){this.updateVariant(this.currentVariant+1)}previousVariant(){this.updateVariant(this.currentVariant-1)}randomVariant(){const t=Math.floor(Math.random()*this.totalVariants);this.updateVariant(t)}setVariant(t){this.updateVariant(t)}updateParameter(t,e){this.customParams||(this.customParams={}),this.customParams[t]=e,console.log(`🌌 Updating holographic ${t}: ${e} (${this.visualizers.length} visualizers)`),this.visualizers.forEach((i,o)=>{try{if(i.updateParameters){const s={};s[t]=e,i.updateParameters(s),console.log(`✅ Updated holographic layer ${o} (${i.role}) with ${t}=${e}`)}else console.warn(`⚠️ Holographic layer ${o} missing updateParameters method, using fallback`),i.variantParams&&(i.variantParams[t]=e,t==="geometryType"&&(i.roleParams=i.generateRoleParams(i.role)),i.render&&i.render())}catch(s){console.error(`❌ Failed to update holographic layer ${o}:`,s)}}),console.log(`🔄 Holographic parameter update complete: ${t}=${e}`)}updateVariant(t){t<0&&(t=this.totalVariants-1),t>=this.totalVariants&&(t=0),this.currentVariant=t,this.visualizers.forEach(e=>{e.variant=this.currentVariant,e.variantParams=e.generateVariantParams(this.currentVariant),e.roleParams=e.generateRoleParams(e.role),this.customParams&&Object.keys(this.customParams).forEach(i=>{e.variantParams[i]=this.customParams[i]})}),this.updateVariantDisplay(),console.log(`🔄 REAL Holograms switched to variant ${this.currentVariant+1}: ${this.variantNames[this.currentVariant]}`)}getCurrentVariantInfo(){return{variant:this.currentVariant,name:this.variantNames[this.currentVariant],geometryType:Math.floor(this.currentVariant/4)}}getParameters(){var e,i,o,s,a,r,n,c,h,d;const t={geometry:Math.floor(this.currentVariant/4),gridDensity:parseFloat(((e=document.getElementById("gridDensity"))==null?void 0:e.value)||15),morphFactor:parseFloat(((i=document.getElementById("morphFactor"))==null?void 0:i.value)||1),chaos:parseFloat(((o=document.getElementById("chaos"))==null?void 0:o.value)||.2),speed:parseFloat(((s=document.getElementById("speed"))==null?void 0:s.value)||1),hue:parseFloat(((a=document.getElementById("hue"))==null?void 0:a.value)||320),intensity:parseFloat(((r=document.getElementById("intensity"))==null?void 0:r.value)||.6),saturation:parseFloat(((n=document.getElementById("saturation"))==null?void 0:n.value)||.8),rot4dXW:parseFloat(((c=document.getElementById("rot4dXW"))==null?void 0:c.value)||0),rot4dYW:parseFloat(((h=document.getElementById("rot4dYW"))==null?void 0:h.value)||0),rot4dZW:parseFloat(((d=document.getElementById("rot4dZW"))==null?void 0:d.value)||0),variant:this.currentVariant};return this.customParams&&Object.assign(t,this.customParams),console.log("🌌 Holographic system getParameters:",t),t}async initAudio(){try{this.audioContext=new(window.AudioContext||window.webkitAudioContext),this.audioContext.state==="suspended"&&await this.audioContext.resume(),this.analyser=this.audioContext.createAnalyser(),this.analyser.fftSize=256,this.frequencyData=new Uint8Array(this.analyser.frequencyBinCount);const t={audio:{echoCancellation:!1,noiseSuppression:!1,autoGainControl:!1,sampleRate:44100}},e=await navigator.mediaDevices.getUserMedia(t);this.audioContext.createMediaStreamSource(e).connect(this.analyser),this.audioEnabled=!0,console.log("🎵 REAL Holograms audio reactivity enabled")}catch(t){console.error("REAL Holograms audio initialization failed:",t)}}disableAudio(){this.audioEnabled&&(this.audioEnabled=!1,this.audioContext&&(this.audioContext.close(),this.audioContext=null),this.analyser=null,this.frequencyData=null,this.audioData={bass:0,mid:0,high:0},console.log("🎵 REAL Holograms audio reactivity disabled"))}updateAudio(){if(!this.audioEnabled||!this.analyser||!this.isActive||window.audioEnabled===!1)return;this.analyser.getByteFrequencyData(this.frequencyData);const t=Math.floor(this.frequencyData.length*.1),e=Math.floor(this.frequencyData.length*.4);let i=0,o=0,s=0;for(let r=0;r<t;r++)i+=this.frequencyData[r];i/=t*255;for(let r=t;r<e;r++)o+=this.frequencyData[r];o/=(e-t)*255;for(let r=e;r<this.frequencyData.length;r++)s+=this.frequencyData[r];s/=(this.frequencyData.length-e)*255;const a={bass:this.smoothAudioValue(i,"bass"),mid:this.smoothAudioValue(o,"mid"),high:this.smoothAudioValue(s,"high"),energy:(i+o+s)/3,rhythm:this.detectRhythm(i),melody:this.detectMelody(o,s)};this.audioData=a,window.audioReactivitySettings&&this.applyAudioReactivityGrid(a),this.visualizers.forEach(r=>{r.updateAudio(this.audioData)})}smoothAudioValue(t,e){this.audioSmoothing||(this.audioSmoothing={bass:0,mid:0,high:0});const i=.4;return this.audioSmoothing[e]=this.audioSmoothing[e]*i+t*(1-i),this.audioSmoothing[e]>.05?this.audioSmoothing[e]:0}detectRhythm(t){this.previousBass||(this.previousBass=0);const e=t>this.previousBass+.2;return this.previousBass=t,e?1:0}detectMelody(t,e){const i=(t+e)/2;return i>.3?i:0}applyAudioReactivityGrid(t){const e=window.audioReactivitySettings;if(!e||e.activeVisualModes.size===0)return;const i=e.sensitivity[e.activeSensitivity];e.activeVisualModes.forEach(o=>{const[s,a]=o.split("-"),r=e.visualModes[a];if(!r)return;const n=t.energy*i,c=t.bass*i,h=t.rhythm*i;r.forEach(d=>{let u=0;switch(d){case"hue":this.audioHueBase||(this.audioHueBase=320),this.audioHueBase+=n*5,u=this.audioHueBase%360;break;case"saturation":u=Math.min(1,.6+h*.4);break;case"intensity":u=Math.min(1,.4+n*.6);break;case"morphFactor":u=Math.min(2,1+c*1);break;case"gridDensity":u=Math.min(100,15+h*50);break;case"chaos":u=Math.min(1,n*.8);break;case"speed":u=Math.min(3,1+n*2);break;case"rot4dXW":this.audioRotationXW||(this.audioRotationXW=0),this.audioRotationXW+=c*.1,u=this.audioRotationXW%(Math.PI*2);break;case"rot4dYW":this.audioRotationYW||(this.audioRotationYW=0),this.audioRotationYW+=t.mid*i*.08,u=this.audioRotationYW%(Math.PI*2);break;case"rot4dZW":this.audioRotationZW||(this.audioRotationZW=0),this.audioRotationZW+=t.high*i*.06,u=this.audioRotationZW%(Math.PI*2);break}window.updateParameter&&u!==void 0&&window.updateParameter(d,u.toFixed(2))})})}removedSetupCenterDistanceReactivity(){{console.log("✨ Holographic built-in reactivity DISABLED - ReactivityManager active");return}}updateHolographicShimmer(t,e){const i=(t-.5)*Math.PI,o=(e-.5)*Math.PI,s=320,r=Math.sin(i*2)*Math.cos(o*2)*120,n=(s+r+360)%360,c=.4+.5*Math.abs(Math.sin(i)*Math.cos(o)),h=.7+.3*Math.abs(Math.cos(i*1.5)*Math.sin(o*1.5)),d=1+.15*Math.sin(i*.8)*Math.cos(o*.8);window.updateParameter&&(window.updateParameter("hue",Math.round(n)),window.updateParameter("intensity",c.toFixed(2)),window.updateParameter("saturation",h.toFixed(2)),window.updateParameter("morphFactor",d.toFixed(2))),console.log(`✨ Holographic shimmer: angle=(${i.toFixed(2)}, ${o.toFixed(2)}) → Hue=${Math.round(n)}, Intensity=${c.toFixed(2)}`)}triggerHolographicColorBurst(t,e){const s=Math.sqrt((t-.5)**2+(e-.5)**2);this.colorBurstIntensity=1,this.burstHueShift=180,this.burstIntensityBoost=.7,this.burstSaturationSpike=.8,this.burstChaosEffect=.6,this.burstSpeedBoost=1.8,console.log(`🌈💥 HOLOGRAPHIC COLOR BURST: position=(${t.toFixed(2)}, ${e.toFixed(2)}), distance=${s.toFixed(3)}`)}startHolographicColorBurstLoop(){const t=()=>{if(this.colorBurstIntensity>.01){const e=this.colorBurstIntensity;if(this.burstHueShift>1){const s=(320+this.burstHueShift*Math.sin(e*Math.PI*2))%360;window.updateParameter&&window.updateParameter("hue",Math.round(s)),this.burstHueShift*=.93}if(this.burstIntensityBoost>.01){const o=Math.min(1,.5+this.burstIntensityBoost*e);window.updateParameter&&window.updateParameter("intensity",o.toFixed(2)),this.burstIntensityBoost*=.92}if(this.burstSaturationSpike>.01){const o=Math.min(1,.8+this.burstSaturationSpike*e);window.updateParameter&&window.updateParameter("saturation",o.toFixed(2)),this.burstSaturationSpike*=.91}if(this.burstChaosEffect>.01){const o=.2+this.burstChaosEffect*e;window.updateParameter&&window.updateParameter("chaos",o.toFixed(2)),this.burstChaosEffect*=.9}if(this.burstSpeedBoost>.01){const o=1+this.burstSpeedBoost*e;window.updateParameter&&window.updateParameter("speed",o.toFixed(2)),this.burstSpeedBoost*=.89}this.colorBurstIntensity*=.94}this.isActive&&requestAnimationFrame(t)};t()}startRenderLoop(){const t=()=>{this.isActive&&(this.updateAudio(),this.visualizers.forEach(e=>{e.render()})),requestAnimationFrame(t)};t(),console.log("🎬 REAL Holographic render loop started")}getVariantName(t=this.currentVariant){return this.variantNames[t]||"UNKNOWN"}destroy(){this.visualizers.forEach(t=>{t.destroy&&t.destroy()}),this.visualizers=[],this.audioContext&&this.audioContext.close(),console.log("🧹 REAL Holographic System destroyed")}}class gt{constructor(t){this.container=t,this.activeLayers=new Map,this.layerDefinitions={faceted:[{id:"background-canvas",role:"background",reactivity:.5},{id:"shadow-canvas",role:"shadow",reactivity:.7},{id:"content-canvas",role:"content",reactivity:.9},{id:"highlight-canvas",role:"highlight",reactivity:1.1},{id:"accent-canvas",role:"accent",reactivity:1.5}],quantum:[{id:"quantum-background-canvas",role:"background",reactivity:.4},{id:"quantum-shadow-canvas",role:"shadow",reactivity:.6},{id:"quantum-content-canvas",role:"content",reactivity:1},{id:"quantum-highlight-canvas",role:"highlight",reactivity:1.3},{id:"quantum-accent-canvas",role:"accent",reactivity:1.6}],holographic:[{id:"holo-background-canvas",role:"background",reactivity:.5},{id:"holo-shadow-canvas",role:"shadow",reactivity:.7},{id:"holo-content-canvas",role:"content",reactivity:.9},{id:"holo-highlight-canvas",role:"highlight",reactivity:1.1},{id:"holo-accent-canvas",role:"accent",reactivity:1.5}]}}createLayers(t){this.activeLayers.has(t)&&(console.warn(`⚠️ Layers for ${t} already exist, destroying old ones...`),this.destroyLayers(t));const e=this.layerDefinitions[t];if(!e)throw new Error(`Unknown system: ${t}`);const i=document.createElement("div");i.id=`${t}Layers`,i.className="canvas-layer-system",i.style.cssText=`
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        `;const o=[],s=[];return e.forEach((a,r)=>{const n=document.createElement("canvas");n.id=a.id,n.className=`layer-${a.role}`,n.width=window.innerWidth,n.height=window.innerHeight,n.style.cssText=`
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: ${r+1};
                pointer-events: none;
            `,i.appendChild(n),o.push(n),s.push({canvas:n,id:a.id,role:a.role,reactivity:a.reactivity,index:r}),console.log(`✅ Created layer ${r+1}/5: ${a.id} (${a.role})`)}),this.container.appendChild(i),this.activeLayers.set(t,{canvases:o,layerSpecs:s,wrapper:i}),console.log(`🎨 Created ${o.length}-layer system for: ${t}`),{canvases:o,layerSpecs:s}}destroyLayers(t){const e=this.activeLayers.get(t);if(!e){console.warn(`⚠️ No layers to destroy for: ${t}`);return}console.log(`🧹 Destroying ${e.canvases.length} layers for: ${t}`),e.canvases.forEach((i,o)=>{const s=i.getContext("webgl")||i.getContext("webgl2");if(s){const r=s.getExtension("WEBGL_lose_context");r&&(r.loseContext(),console.log(`🧹 Lost WebGL context for layer ${o+1}`))}const a=i.getContext("2d");a&&a.clearRect(0,0,i.width,i.height),i.parentNode&&i.parentNode.removeChild(i)}),e.wrapper&&e.wrapper.parentNode&&e.wrapper.parentNode.removeChild(e.wrapper),this.activeLayers.delete(t),console.log(`✅ Destroyed all layers for: ${t}`)}switchSystem(t,e){console.log(`🔄 Switching from ${t} to ${e}...`),t&&this.activeLayers.has(t)&&this.destroyLayers(t);const i=this.createLayers(e);return console.log(`✅ System switch complete: ${t} → ${e}`),i}getLayers(t){return this.activeLayers.get(t)}hasLayers(t){return this.activeLayers.has(t)}handleResize(){const t=window.innerWidth,e=window.innerHeight;this.activeLayers.forEach((i,o)=>{i.canvases.forEach(s=>{s.width=t,s.height=e}),console.log(`📐 Resized ${i.canvases.length} canvases for ${o}`)})}hideLayers(t){const e=this.activeLayers.get(t);e&&e.wrapper&&(e.wrapper.style.display="none",console.log(`👁️ Hidden layers for: ${t}`))}showLayers(t){const e=this.activeLayers.get(t);e&&e.wrapper&&(e.wrapper.style.display="block",console.log(`👁️ Showing layers for: ${t}`))}destroyAll(){console.log("🧹 Destroying all active canvas systems..."),Array.from(this.activeLayers.keys()).forEach(e=>{this.destroyLayers(e)}),console.log("✅ All canvas systems destroyed")}}class pt{constructor(){this.currentSystem="faceted",this.systemSwitchInProgress=!1,this.systems={faceted:{engine:null,canvases:[],active:!0},quantum:{engine:null,canvases:[],active:!1},holographic:{engine:null,canvases:[],active:!1}},this.canvasManager=null,this.baseParams={geometry:1,gridDensity:15,morphFactor:1,chaos:.2,speed:1,hue:200,intensity:.5,saturation:.8,rot4dXW:0,rot4dYW:0,rot4dZW:0,moireScale:1.01,glitchIntensity:.05,lineThickness:.02},this.audioContext=null,this.audioElement=null,this.audioReactive=!0,this.reactivityStrength=.5,this.extremeMode=!1,this.sequences=[],this.currentTime=0,this.duration=0,this.isPlaying=!1,this.activeColorPalette=null,this.activeSweeps={},this.choreographyMode="dynamic",this.lastModeChange=0,this.patternTemplates={},this.sectionPatterns=[],this.songStructure="",this.recordingEngine=null,this.audioAnalyzer=null,this.sequenceMonitorInterval=null,this.performanceMonitor=null,this.presetManager=null,this.keyboardController=null}async init(){console.log("🎬 Initializing Choreographer..."),this.performanceMonitor=new U,this.presetManager=new Y(this),this.keyboardController=new H(this),await this.initCanvases(),await this.initCurrentSystem(),this.performanceMonitor.start(),this.setupAudio(),this.setupUI(),this.recordingEngine=new O(this),this.audioAnalyzer=new G(this),console.log("✅ Choreographer ready!")}async initCanvases(){const t=document.getElementById("stage-container");if(!t)throw new Error("stage-container element not found");this.canvasManager=new gt(t),console.log("✅ Canvas layer manager initialized")}async initCurrentSystem(){await this.createSystem(this.currentSystem)}async createSystem(t){console.log(`🔧 Creating ${t} system...`);const e=this.systems[t],i=console.log,o={};if(console.log=(...r)=>{const c=r.join(" ").substring(0,50),h=Date.now();(!o[c]||h-o[c]>1e3)&&(o[c]=h,i.apply(console,r))},e.engine&&await this.destroySystem(t),!this.canvasManager)throw new Error("CanvasLayerManager not initialized");const{canvases:s,layerSpecs:a}=this.canvasManager.createLayers(t);e.canvases=s,console.log(`✅ Created ${s.length} layers for ${t}`),await new Promise(r=>requestAnimationFrame(r)),await new Promise(r=>requestAnimationFrame(r));try{t==="faceted"?(e.engine=new ct,console.log("✅ Faceted engine created (stub)")):t==="quantum"?(e.engine=new dt,console.log("✅ Quantum engine created (stub)")):t==="holographic"&&(e.engine=new mt,console.log("✅ Holographic engine created (stub)"),e.engine.audioEnabled=!1,e.engine.audioContext=null,e.engine.analyser=null,e.engine.initAudio=()=>{},e.engine.updateAudio=()=>{},e.engine.disableAudio=()=>{},e.engine.applyAudioReactivityGrid=()=>{}),this.updateSystemParameters(e.engine),e.engine&&e.engine.setActive&&e.engine.setActive(!0),console.log(`✅ ${t} system created with real WebGL engine`)}catch(r){console.error(`❌ Failed to create ${t}:`,r),console.error("Error details:",r.stack)}finally{console.log=i}}async switchSystem(t){if(t===this.currentSystem)return;console.log(`🔄 Switching from ${this.currentSystem} to ${t}`);const e=this.currentSystem;await this.destroySystem(e),this.currentSystem=t,await this.createSystem(t),document.querySelectorAll(".system-pill").forEach(i=>{i.classList.toggle("active",i.dataset.system===t)}),console.log(`✅ Switched from ${e} to ${t} with proper layer cleanup`)}async destroySystem(t){const e=this.systems[t];console.log(`🗑️ Destroying ${t} system...`),e.engine&&(e.engine.setActive&&e.engine.setActive(!1),e.engine.visualizers&&Array.isArray(e.engine.visualizers)&&(e.engine.visualizers.forEach(i=>{if(i.stop&&i.stop(),i.gl){const o=i.gl.getExtension("WEBGL_lose_context");o&&o.loseContext()}}),e.engine.visualizers=[]),e.engine=null),this.canvasManager&&this.canvasManager.destroyLayers(t),e.canvases=[],console.log(`✅ ${t} destroyed with proper WebGL context cleanup`)}updateSystemParameters(t){t&&Object.entries(this.baseParams).forEach(([e,i])=>{t.parameterManager&&t.parameterManager.setParameter?t.parameterManager.setParameter(e,i):t.updateParameter&&t.updateParameter(e,i)})}setParameter(t,e){this.baseParams[t]=e,Object.values(this.systems).forEach(i=>{if(i.engine){if(i.engine.parameterManager&&i.engine.parameterManager.setParameter&&(i.engine.parameterManager.setParameter(t,e),i.engine.updateVisualizers&&i.engine.updateVisualizers()),i.engine.visualizers&&Array.isArray(i.engine.visualizers)){const o=this.baseParams;i.engine.visualizers.forEach(s=>{s.updateParameters&&s.updateParameters(o)})}i.engine.updateParameter&&i.engine.updateParameter(t,e)}})}getCurrentParameters(){return{...this.baseParams}}setupAudio(){this.audioContext=new(window.AudioContext||window.webkitAudioContext),this.analyser=this.audioContext.createAnalyser(),this.analyser.fftSize=2048,this.analyser.smoothingTimeConstant=.8,console.log("✅ Audio system initialized with analyser node")}async loadAudioFile(t){if(!t)return;const e=URL.createObjectURL(t);this.audioContext.state==="suspended"&&(await this.audioContext.resume(),console.log("🎵 AudioContext resumed")),console.log(`🔍 Audio state check: element=${!!this.audioElement}, source=${!!this.mediaSource}`),this.audioElement&&this.mediaSource?(console.log("🔄 Reusing existing audio element and source"),this.audioElement.pause(),this.audioElement.src=e,this.audioElement.load()):(console.log("🎵 Creating new audio element and Web Audio connection"),this.audioElement&&!this.mediaSource&&console.warn("⚠️  Audio element exists but mediaSource is missing!"),this.audioElement=new Audio(e),this.audioElement.crossOrigin="anonymous",this.mediaSource=this.audioContext.createMediaElementSource(this.audioElement),this.mediaSource.connect(this.analyser),this.analyser.connect(this.audioContext.destination),console.log("✅ Web Audio API connected - mediaSource stored"),console.log(`✅ Verification: element=${!!this.audioElement}, source=${!!this.mediaSource}`)),this.audioAnalyzer&&this.audioAnalyzer.startAnalysisLoop(),this.audioElement.addEventListener("loadedmetadata",()=>{this.duration=this.audioElement.duration,console.log(`🎵 Audio loaded: ${this.duration.toFixed(2)}s`)}),this.audioElement.addEventListener("error",i=>{console.error("Audio element error:",i)})}applyAdvancedChoreography(t){const e=this.reactivityStrength,i=this.systems[this.currentSystem];if(!i.engine)return;const o=(s,a)=>{i.engine.parameterManager&&i.engine.parameterManager.setParameter?i.engine.parameterManager.setParameter(s,a):i.engine.updateParameter&&i.engine.updateParameter(s,a)};q(this.choreographyMode,t,o,e,this.baseParams)}async analyzeSongWithAI(t){if(!t)throw new Error("No API key provided");if(!this.audioElement)throw new Error("No audio file loaded");const e=this.duration||180,i=this.audioAnalyzer&&this.audioAnalyzer.avgBeatInterval>0?(6e4/this.audioAnalyzer.avgBeatInterval).toFixed(0):120,o=`Create a music choreography plan for a ${e.toFixed(0)} second song at ${i} BPM. Return JSON with sections array containing: name, pattern, startTime, duration, system (faceted/quantum/holographic), geometry (0-7), choreographyMode, parameters, colorPalette, parameterSweeps.`,s=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${t}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:o}]}]})});if(!s.ok)throw new Error(`Gemini API error: ${s.status}`);let r=(await s.json()).candidates[0].content.parts[0].text.trim();return r.startsWith("```json")?r=r.replace(/```json\n/,"").replace(/\n```$/,""):r.startsWith("```")&&(r=r.replace(/```\n/,"").replace(/\n```$/,"")),JSON.parse(r)}applyAIChoreography(t){console.log("🎭 Applying AI Choreography:",t),this.sequences=[],t.sections&&Array.isArray(t.sections)&&(this.processPatternRecognition(t.sections).forEach((i,o)=>{const s={name:i.name,startTime:i.startTime,duration:i.duration,system:i.system,geometry:i.geometry,mode:i.choreographyMode,parameters:i.parameters,pattern:i.pattern,colorPalette:i.colorPalette,parameterSweeps:i.parameterSweeps,active:!1};this.sequences.push(s)}),this.startSequenceMonitoring(),this.renderTimeline())}processPatternRecognition(t){const e={};return t.map((i,o)=>{const s=i.pattern;if(!s)return i;e[s]||(e[s]=0),e[s]++;const a=e[s];if(a===1)return this.patternTemplates[s]=this.createPatternTemplate(i,s),i.patternVariation="first",i;const r=this.patternTemplates[s];let n="second";return a>=3&&(n="final-climax"),this.applyPatternToSection(r,i,i.system,n),i.patternVariation=n,i})}createPatternTemplate(t,e){return{type:e,geometry:t.geometry,mode:t.mode||t.choreographyMode,parameters:{...t.parameters},colorPalette:t.colorPalette?{...t.colorPalette}:null,parameterSweeps:t.parameterSweeps?{...t.parameterSweeps}:null}}applyPatternToSection(t,e,i=null,o=null){e.geometry=t.geometry,e.mode=t.mode,e.parameters={...t.parameters},t.colorPalette&&(e.colorPalette={...t.colorPalette,colors:t.colorPalette.colors?t.colorPalette.colors.map(s=>({...s})):[]},o&&this.applyPatternVariation(e,o)),t.parameterSweeps&&(e.parameterSweeps={},Object.entries(t.parameterSweeps).forEach(([s,a])=>{e.parameterSweeps[s]={...a}})),i&&(e.system=i)}applyPatternVariation(t,e){switch(e){case"second":t.parameters&&(t.parameters.gridDensity=Math.min(95,(t.parameters.gridDensity||50)*1.1),t.parameters.intensity=Math.min(1,(t.parameters.intensity||.8)*1.1));break;case"final-climax":t.parameters&&(t.parameters.gridDensity=Math.min(100,(t.parameters.gridDensity||50)*1.5),t.parameters.chaos=Math.min(.95,(t.parameters.chaos||.5)*1.3),t.parameters.speed=Math.min(3,(t.parameters.speed||1)*1.5)),t.colorPalette&&t.colorPalette.colors&&(t.colorPalette.colors=t.colorPalette.colors.map(i=>({...i,intensity:Math.min(1,(i.intensity||.8)*1.2),saturation:Math.min(1,(i.saturation||.9)*1.1)})));break}}startSequenceMonitoring(){this.sequenceMonitorInterval&&clearInterval(this.sequenceMonitorInterval),this.sequenceMonitorInterval=setInterval(()=>{if(!this.audioElement||!this.isPlaying)return;const t=this.audioElement.currentTime;this.updateChoreographyAtTime(t)},100)}updateChoreographyAtTime(t){this.sequences.forEach(e=>{const i=t>=e.startTime&&t<e.startTime+e.duration;if(i&&!e.active&&(e.active=!0,e.system&&e.system!==this.currentSystem&&this.switchSystem(e.system),e.parameters&&Object.entries(e.parameters).forEach(([o,s])=>{this.setParameter(o,s),this.baseParams[o]=s}),e.mode&&(this.choreographyMode=e.mode),e.geometry!==void 0&&this.setParameter("geometry",e.geometry)),i&&e.colorPalette){const s=(t-e.startTime)/e.duration,a=this.audioAnalyzer?this.audioAnalyzer.beatPhase:0,r=this.audioAnalyzer?this.audioAnalyzer.getAudioData():null;ot(e.colorPalette,s,a,r,(n,c)=>this.setParameter(n,c))}if(i&&e.parameterSweeps){const s=(t-e.startTime)/e.duration;it(e.parameterSweeps,s,e.duration,(a,r)=>this.setParameter(a,r))}!i&&e.active&&(e.active=!1)})}async play(){if(!this.audioElement){console.warn("⚠️ No audio file loaded");return}this.audioContext.state==="suspended"&&await this.audioContext.resume(),await this.audioElement.play(),this.isPlaying=!0,this.audioAnalyzer&&this.audioAnalyzer.startAnalysisLoop(),console.log("✅ Playback started")}pause(){this.audioElement&&(this.audioElement.pause(),this.isPlaying=!1)}stop(){this.audioElement&&(this.audioElement.pause(),this.audioElement.currentTime=0,this.isPlaying=!1)}renderTimeline(){console.log("📝 TODO: Implement timeline rendering UI")}setupUI(){console.log("📝 TODO: Implement UI setup")}exportChoreography(){const t={version:"1.0",duration:this.duration,sequences:this.sequences,baseParams:this.baseParams},e=JSON.stringify(t,null,2),i=new Blob([e],{type:"application/json"}),o=URL.createObjectURL(i),s=document.createElement("a");s.href=o,s.download=`choreography-${Date.now()}.json`,s.click(),console.log("💾 Choreography exported")}get currentEngine(){const t=this.systems[this.currentSystem];return t?t.engine:null}updateGeometry(t){const e=this.currentEngine;if(!e){console.warn("⚠️ No active engine to update geometry");return}console.log(`🔺 Updating geometry for ${this.currentSystem} engine (${t.length} vertices)`),e.updateGeometry?e.updateGeometry(t):e.parameterManager&&e.parameterManager.setGeometry?e.parameterManager.setGeometry(t):e.setParameter?e.setParameter("vertices",t):console.warn(`⚠️ Engine ${this.currentSystem} does not support geometry updates`),e.updateVisualizers?e.updateVisualizers():e.update&&e.update()}setGeometry(t){this.baseParams.geometry=t,this.updateParameter("geometry",t)}}class D{constructor(t,e,i,o=!1){this.id=t,this.title=e,this.content=i,this.isExpanded=this.loadState(o),this.element=null}loadState(t){const e=localStorage.getItem(`collapse-${this.id}`);return e!==null?e==="true":t}saveState(){localStorage.setItem(`collapse-${this.id}`,this.isExpanded)}render(){const t=this.isExpanded?"▼":"▶",e=this.isExpanded?"block":"none";return`
            <div class="collapsible-section" data-section-id="${this.id}">
                <div class="section-header" data-header="${this.id}">
                    <span class="section-title">${this.title}</span>
                    <span class="section-arrow">${t}</span>
                </div>
                <div class="section-content" data-content="${this.id}" style="display: ${e};">
                    ${this.content}
                </div>
            </div>
        `}attachListeners(t){const e=t.querySelector(`[data-header="${this.id}"]`),i=t.querySelector(`[data-content="${this.id}"]`),o=e.querySelector(".section-arrow");e.addEventListener("click",()=>{this.isExpanded=!this.isExpanded,this.saveState(),o.textContent=this.isExpanded?"▼":"▶",i.style.display=this.isExpanded?"block":"none"})}}class ft{constructor(t){this.choreographer=t,this.sections=[],this.init()}init(){console.log("🎛️ Initializing Collapsible Controls..."),this.createControlPanel(),this.setupParameterControls(),this.setupUpdateLoop(),console.log("✅ Collapsible Controls initialized")}createControlPanel(){const t=document.getElementById("control-panel");if(!t)return;this.sections=[new D("universal-sliders","🎚️ UNIVERSAL SLIDERS",this.renderUniversalSliders(),!1),new D("core-params","⚙️ CORE PARAMETERS",this.renderCoreParameters(),!1),new D("4d-rotation","🔄 4D ROTATION",this.render4DRotation(),!1),new D("audio","🔊 AUDIO REACTIVITY",this.renderAudioControls(),!0)],t.innerHTML=`
            <div class="panel-collapse-btn" title="Collapse Panel">−</div>
            <div class="panel-tab-label">🎛️ CONTROLS</div>
            <div class="panel-content">
                <h2>🎛️ CONTROLS</h2>
                ${this.sections.map(a=>a.render()).join("")}
            </div>
        `,this.sections.forEach(a=>a.attachListeners(t));const e=t.querySelector(".panel-collapse-btn"),i=a=>{a&&a.stopPropagation(),t.classList.contains("collapsed")?(t.classList.remove("collapsed"),e.textContent="−",localStorage.setItem("controlPanelCollapsed","false")):(t.classList.add("collapsed"),e.textContent="+",localStorage.setItem("controlPanelCollapsed","true"))};e.addEventListener("click",i),t.addEventListener("click",a=>{t.classList.contains("collapsed")&&i(a)});const o=localStorage.getItem("controlPanelCollapsed"),s=window.innerWidth<=480&&window.matchMedia("(orientation: portrait)").matches;(o==="true"||o===null&&s)&&(t.classList.add("collapsed"),e.textContent="+")}renderUniversalSliders(){const t=[{value:"geometry",label:"Geometry",min:1,max:24,step:1},{value:"gridDensity",label:"Grid Density",min:1,max:100,step:1},{value:"morphFactor",label:"Morph Factor",min:0,max:5,step:.01},{value:"chaos",label:"Chaos",min:0,max:3,step:.01},{value:"speed",label:"Speed",min:.1,max:10,step:.1},{value:"hue",label:"Hue",min:0,max:360,step:1},{value:"intensity",label:"Intensity",min:0,max:1,step:.01},{value:"saturation",label:"Saturation",min:0,max:1,step:.01},{value:"moireScale",label:"Moire Scale",min:0,max:5,step:.01},{value:"glitchIntensity",label:"Glitch Intensity",min:0,max:1,step:.01},{value:"lineThickness",label:"Line Thickness",min:0,max:5,step:.01},{value:"rot4dXW",label:"4D Rotation XW",min:-3.14159,max:3.14159,step:.01},{value:"rot4dYW",label:"4D Rotation YW",min:-3.14159,max:3.14159,step:.01},{value:"rot4dZW",label:"4D Rotation ZW",min:-3.14159,max:3.14159,step:.01}],e=JSON.parse(localStorage.getItem("universalSliderAssignments")||'["morphFactor", "chaos", "speed", "hue"]');let i='<div style="font-size: 9px; opacity: 0.7; margin-bottom: 10px;">Assign any parameter to any slider</div>';for(let o=0;o<4;o++){const s=e[o]||t[o].value,a=t.find(n=>n.value===s)||t[o],r=this.choreographer.baseParams[s]||a.min;i+=`
                <div class="control-group universal-slider-group" data-slider-index="${o}">
                    <select class="universal-param-select" data-slider-index="${o}" style="width: 100%; padding: 6px; background: rgba(0,255,255,0.1); border: 1px solid rgba(0,255,255,0.3); color: #0ff; font-family: inherit; font-size: 10px; margin-bottom: 4px;">
                        ${t.map(n=>`<option value="${n.value}" ${n.value===s?"selected":""}>${n.label}</option>`).join("")}
                    </select>
                    <div class="slider-row">
                        <input type="range"
                            class="universal-slider"
                            data-slider-index="${o}"
                            data-param="${s}"
                            min="${a.min}"
                            max="${a.max}"
                            step="${a.step}"
                            value="${r}">
                        <span class="universal-value" data-slider-index="${o}">${this.formatValue(s,r)}</span>
                    </div>
                </div>
            `}return i}formatValue(t,e){return t==="hue"?`${Math.round(e)}°`:t==="geometry"||t==="gridDensity"?Math.round(e):parseFloat(e).toFixed(2)}renderCoreParameters(){const t=this.choreographer.baseParams;return`
            <div class="control-group">
                <label>Geometry (1-24)</label>
                <div class="slider-row">
                    <input type="range" id="param-geometry" min="1" max="24" step="1" value="${t.geometry}">
                    <span id="param-geometry-val">${t.geometry}</span>
                </div>
            </div>
            <div class="control-group">
                <label>Grid Density (1-100 EXTREME)</label>
                <div class="slider-row">
                    <input type="range" id="param-gridDensity" min="1" max="100" step="1" value="${t.gridDensity}">
                    <span id="param-gridDensity-val">${t.gridDensity}</span>
                </div>
            </div>
            <div class="control-group">
                <label>Morph Factor (0-5 EXTREME)</label>
                <div class="slider-row">
                    <input type="range" id="param-morphFactor" min="0" max="5" step="0.01" value="${t.morphFactor}">
                    <span id="param-morphFactor-val">${t.morphFactor.toFixed(2)}</span>
                </div>
            </div>
            <div class="control-group">
                <label>Chaos (0-3 EXTREME)</label>
                <div class="slider-row">
                    <input type="range" id="param-chaos" min="0" max="3" step="0.01" value="${t.chaos}">
                    <span id="param-chaos-val">${t.chaos.toFixed(2)}</span>
                </div>
            </div>
            <div class="control-group">
                <label>Speed (0.1-10 EXTREME)</label>
                <div class="slider-row">
                    <input type="range" id="param-speed" min="0.1" max="10" step="0.1" value="${t.speed}">
                    <span id="param-speed-val">${t.speed.toFixed(1)}</span>
                </div>
            </div>
        `}render4DRotation(){const t=this.choreographer.baseParams;return`
            <div style="font-size: 9px; opacity: 0.7; margin-bottom: 10px;">
                Hyperspace rotation in XW, YW, ZW planes
            </div>
            <div class="control-group">
                <label>XW Plane</label>
                <div class="slider-row">
                    <input type="range" id="param-rot4dXW" min="-3.14159" max="3.14159" step="0.01" value="${t.rot4dXW}">
                    <span id="param-rot4dXW-val">${t.rot4dXW.toFixed(2)}</span>
                </div>
            </div>
            <div class="control-group">
                <label>YW Plane</label>
                <div class="slider-row">
                    <input type="range" id="param-rot4dYW" min="-3.14159" max="3.14159" step="0.01" value="${t.rot4dYW}">
                    <span id="param-rot4dYW-val">${t.rot4dYW.toFixed(2)}</span>
                </div>
            </div>
            <div class="control-group">
                <label>ZW Plane</label>
                <div class="slider-row">
                    <input type="range" id="param-rot4dZW" min="-3.14159" max="3.14159" step="0.01" value="${t.rot4dZW}">
                    <span id="param-rot4dZW-val">${t.rot4dZW.toFixed(2)}</span>
                </div>
            </div>
        `}renderAudioControls(){return`
            <div class="control-group">
                <button id="toggle-audio-reactive" style="width: 100%; margin-bottom: 10px;">
                    ${this.choreographer.audioReactive?"🔊 ON":"🔇 OFF"}
                </button>
                <label>Reactivity Strength</label>
                <div class="slider-row">
                    <input type="range" id="reactivity-strength" min="0" max="1" step="0.05" value="${this.choreographer.reactivityStrength}">
                    <span id="reactivity-strength-val">${this.choreographer.reactivityStrength.toFixed(2)}</span>
                </div>
            </div>
            <div class="control-group">
                <label>Choreography Mode</label>
                <select id="choreography-mode" style="width: 100%; padding: 8px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-family: inherit; font-size: 11px;">
                    <option value="dynamic" ${this.choreographer.choreographyMode==="dynamic"?"selected":""}>Dynamic</option>
                    <option value="smooth" ${this.choreographer.choreographyMode==="smooth"?"selected":""}>Smooth</option>
                    <option value="aggressive" ${this.choreographer.choreographyMode==="aggressive"?"selected":""}>Aggressive</option>
                    <option value="minimal" ${this.choreographer.choreographyMode==="minimal"?"selected":""}>Minimal</option>
                </select>
            </div>
            <div class="control-group">
                <button id="toggle-extreme-mode" style="width: 100%; margin-top: 10px; background: ${this.choreographer.extremeMode?"rgba(255, 0, 0, 0.3)":"rgba(0, 255, 255, 0.1)"}; border: 1px solid ${this.choreographer.extremeMode?"#f00":"#0ff"}; color: ${this.choreographer.extremeMode?"#f00":"#0ff"};">
                    ${this.choreographer.extremeMode?"🔥 EXTREME MODE: ON":"⚡ EXTREME MODE: OFF"}
                </button>
                <div style="font-size: 9px; opacity: 0.7; margin-top: 5px;">
                    5x audio reactivity multiplier
                </div>
            </div>
        `}renderVisualization(){return`
            <div class="system-pills" style="display: flex; gap: 5px; margin-bottom: 10px;">
                <div class="system-pill active" data-system="faceted" style="flex: 1; padding: 8px; text-align: center; background: rgba(0, 255, 255, 0.1); border: 1px solid #0ff; font-size: 9px; cursor: pointer;">FACETED</div>
                <div class="system-pill" data-system="quantum" style="flex: 1; padding: 8px; text-align: center; background: rgba(0, 255, 255, 0.1); border: 1px solid #0ff; font-size: 9px; cursor: pointer;">QUANTUM</div>
                <div class="system-pill" data-system="holographic" style="flex: 1; padding: 8px; text-align: center; background: rgba(0, 255, 255, 0.1); border: 1px solid #0ff; font-size: 9px; cursor: pointer;">HOLO</div>
            </div>
        `}setupParameterControls(){this.setupUniversalSliders(),["geometry","gridDensity","morphFactor","chaos","speed","hue","intensity","saturation","rot4dXW","rot4dYW","rot4dZW"].forEach(r=>{const n=document.getElementById(`param-${r}`),c=document.getElementById(`param-${r}-val`);!n||!c||n.addEventListener("input",h=>{const d=parseFloat(h.target.value);r==="hue"?c.textContent=`${d}°`:r==="geometry"||r==="gridDensity"?c.textContent=d:c.textContent=d.toFixed(2),this.choreographer.setParameter(r,d)})}),document.querySelectorAll(".system-pill").forEach(r=>{r.addEventListener("click",async()=>{const n=r.dataset.system;await this.choreographer.switchSystem(n),document.querySelectorAll(".system-pill").forEach(h=>{h.classList.toggle("active",h.dataset.system===n)});const c=document.getElementById("system-status-top");c&&(c.textContent=`System: ${n.toUpperCase()}`)})});const e=document.getElementById("toggle-audio-reactive");e&&e.addEventListener("click",()=>{this.choreographer.audioReactive=!this.choreographer.audioReactive,e.textContent=this.choreographer.audioReactive?"🔊 ON":"🔇 OFF"});const i=document.getElementById("reactivity-strength"),o=document.getElementById("reactivity-strength-val");i&&o&&i.addEventListener("input",r=>{const n=parseFloat(r.target.value);this.choreographer.reactivityStrength=n,o.textContent=n.toFixed(2)});const s=document.getElementById("choreography-mode");s&&s.addEventListener("change",r=>{this.choreographer.choreographyMode=r.target.value});const a=document.getElementById("toggle-extreme-mode");a&&a.addEventListener("click",()=>{this.choreographer.extremeMode=!this.choreographer.extremeMode,a.textContent=this.choreographer.extremeMode?"🔥 EXTREME MODE: ON":"⚡ EXTREME MODE: OFF",a.style.background=this.choreographer.extremeMode?"rgba(255, 0, 0, 0.3)":"rgba(0, 255, 255, 0.1)",a.style.borderColor=this.choreographer.extremeMode?"#f00":"#0ff",a.style.color=this.choreographer.extremeMode?"#f00":"#0ff",console.log(`🔥 Extreme mode: ${this.choreographer.extremeMode?"ON (5x multiplier)":"OFF"}`)})}setupUniversalSliders(){const t=[{value:"geometry",label:"Geometry",min:1,max:24,step:1},{value:"gridDensity",label:"Grid Density",min:1,max:100,step:1},{value:"morphFactor",label:"Morph Factor",min:0,max:5,step:.01},{value:"chaos",label:"Chaos",min:0,max:3,step:.01},{value:"speed",label:"Speed",min:.1,max:10,step:.1},{value:"hue",label:"Hue",min:0,max:360,step:1},{value:"intensity",label:"Intensity",min:0,max:1,step:.01},{value:"saturation",label:"Saturation",min:0,max:1,step:.01},{value:"moireScale",label:"Moire Scale",min:0,max:5,step:.01},{value:"glitchIntensity",label:"Glitch Intensity",min:0,max:1,step:.01},{value:"lineThickness",label:"Line Thickness",min:0,max:5,step:.01},{value:"rot4dXW",label:"4D Rotation XW",min:-3.14159,max:3.14159,step:.01},{value:"rot4dYW",label:"4D Rotation YW",min:-3.14159,max:3.14159,step:.01},{value:"rot4dZW",label:"4D Rotation ZW",min:-3.14159,max:3.14159,step:.01}];document.querySelectorAll(".universal-param-select").forEach(e=>{e.addEventListener("change",i=>{const o=parseInt(i.target.dataset.sliderIndex),s=i.target.value,a=t.find(c=>c.value===s),r=document.querySelector(`.universal-slider[data-slider-index="${o}"]`),n=document.querySelector(`.universal-value[data-slider-index="${o}"]`);if(r&&a){r.setAttribute("data-param",s),r.min=a.min,r.max=a.max,r.step=a.step,r.value=this.choreographer.baseParams[s]||a.min,n.textContent=this.formatValue(s,r.value);const c=[];document.querySelectorAll(".universal-param-select").forEach(h=>{c.push(h.value)}),localStorage.setItem("universalSliderAssignments",JSON.stringify(c)),console.log(`🎚️ Universal Slider ${o+1} reassigned to ${a.label}`)}})}),document.querySelectorAll(".universal-slider").forEach(e=>{e.addEventListener("input",i=>{const o=i.target.dataset.param,s=parseFloat(i.target.value),a=i.target.dataset.sliderIndex,r=document.querySelector(`.universal-value[data-slider-index="${a}"]`);r&&(r.textContent=this.formatValue(o,s)),this.choreographer.setParameter(o,s)})}),console.log("🎚️ Universal Sliders initialized")}setupUpdateLoop(){setInterval(()=>{["geometry","gridDensity","morphFactor","chaos","speed","hue","intensity","saturation","rot4dXW","rot4dYW","rot4dZW"].forEach(e=>{const i=document.getElementById(`param-${e}`),o=document.getElementById(`param-${e}-val`),s=this.choreographer.baseParams[e];i&&o&&i.value!=s&&(i.value=s,e==="hue"?o.textContent=`${s}°`:e==="geometry"||e==="gridDensity"?o.textContent=s:o.textContent=s.toFixed(2))}),document.querySelectorAll(".universal-slider").forEach(e=>{const i=e.dataset.param,o=e.dataset.sliderIndex,s=this.choreographer.baseParams[i],a=document.querySelector(`.universal-value[data-slider-index="${o}"]`);s!==void 0&&e.value!=s&&(e.value=s,a&&(a.textContent=this.formatValue(i,s)))})},100)}}class yt{constructor(t){this.choreographer=t,this.lastTapTime=0,this.doubleTapDelay=300,this.isDragging=!1,this.xParam="speed",this.yParam="gridDensity",this.paramConfigs={geometry:{min:1,max:24,step:1,label:"Geometry"},gridDensity:{min:1,max:100,step:1,label:"Grid Density"},morphFactor:{min:0,max:5,step:.01,label:"Morph Factor"},chaos:{min:0,max:3,step:.01,label:"Chaos"},speed:{min:.1,max:10,step:.1,label:"Speed"},hue:{min:0,max:360,step:1,label:"Hue"},intensity:{min:0,max:1,step:.01,label:"Intensity"},saturation:{min:0,max:1,step:.01,label:"Saturation"},rot4dXW:{min:-3.14159,max:3.14159,step:.01,label:"4D XW"},rot4dYW:{min:-3.14159,max:3.14159,step:.01,label:"4D YW"},rot4dZW:{min:-3.14159,max:3.14159,step:.01,label:"4D ZW"}},this.init()}init(){this.createTouchpad(),this.attachListeners()}createTouchpad(){const t=document.getElementById("control-panel");if(!t)return;const e=Object.keys(this.paramConfigs).map(a=>`<option value="${a}" ${a==="speed"?"selected":""}>${this.paramConfigs[a].label}</option>`).join(""),i=Object.keys(this.paramConfigs).map(a=>`<option value="${a}" ${a==="gridDensity"?"selected":""}>${this.paramConfigs[a].label}</option>`).join(""),o=`
            <div id="xy-touchpad" class="xy-touchpad">
                <div class="touchpad-controls">
                    <div class="touchpad-dropdown-wrapper">
                        <label>X:</label>
                        <select id="xy-param-x" class="touchpad-dropdown">
                            ${e}
                        </select>
                    </div>
                    <div class="touchpad-dropdown-wrapper">
                        <label>Y:</label>
                        <select id="xy-param-y" class="touchpad-dropdown">
                            ${i}
                        </select>
                    </div>
                </div>
                <div class="touchpad-cursor"></div>
                <div class="touchpad-hint">Double-tap to cycle geometry</div>
            </div>
        `,s=t.querySelector("h2");s&&s.insertAdjacentHTML("afterend",o)}attachListeners(){const t=document.getElementById("xy-touchpad"),e=t==null?void 0:t.querySelector(".touchpad-cursor"),i=document.getElementById("xy-param-x"),o=document.getElementById("xy-param-y");!t||!e||(i&&i.addEventListener("change",s=>{this.xParam=s.target.value,console.log(`XY Pad X-axis → ${this.paramConfigs[this.xParam].label}`)}),o&&o.addEventListener("change",s=>{this.yParam=s.target.value,console.log(`XY Pad Y-axis → ${this.paramConfigs[this.yParam].label}`)}),t.addEventListener("mousedown",s=>{s.target.tagName==="SELECT"||s.target.tagName==="OPTION"||this.handleStart(s)}),document.addEventListener("mousemove",s=>this.handleMove(s)),document.addEventListener("mouseup",()=>this.handleEnd()),t.addEventListener("touchstart",s=>{s.target.tagName!=="SELECT"&&(s.preventDefault(),this.handleStart(s.touches[0]))}),t.addEventListener("touchmove",s=>{s.preventDefault(),this.handleMove(s.touches[0])}),t.addEventListener("touchend",s=>{s.preventDefault(),this.handleEnd()}),t.addEventListener("click",s=>{s.target.tagName==="SELECT"||s.target.tagName==="OPTION"||this.handleTap(s)}))}handleStart(t){this.isDragging=!0,this.updateFromPosition(t)}handleMove(t){this.isDragging&&this.updateFromPosition(t)}handleEnd(){this.isDragging=!1}handleTap(t){const e=performance.now();e-this.lastTapTime<this.doubleTapDelay&&this.cycleGeometry(),this.lastTapTime=e}updateFromPosition(t){const e=document.getElementById("xy-touchpad"),i=e==null?void 0:e.querySelector(".touchpad-cursor");if(!e||!i)return;const o=e.getBoundingClientRect(),s=t.clientX-o.left,a=t.clientY-o.top,r=Math.max(0,Math.min(1,s/o.width)),n=Math.max(0,Math.min(1,1-a/o.height)),c=this.paramConfigs[this.xParam],h=this.paramConfigs[this.yParam],d=c.min+r*(c.max-c.min),u=h.min+n*(h.max-h.min),m=c.step>=1?Math.round(d):d,p=h.step>=1?Math.round(u):u;this.choreographer.setParameter(this.xParam,m),this.choreographer.setParameter(this.yParam,p),i.style.left=`${r*100}%`,i.style.top=`${(1-n)*100}%`,e.style.background=`
            radial-gradient(
                circle at ${r*100}% ${(1-n)*100}%,
                rgba(0, 255, 255, 0.3),
                rgba(0, 255, 255, 0.05)
            )
        `}cycleGeometry(){const t=this.choreographer.baseParams.geometry,e=t%24+1;this.choreographer.setParameter("geometry",e);const i=document.getElementById("xy-touchpad");i&&(i.classList.add("geometry-cycle-flash"),setTimeout(()=>{i.classList.remove("geometry-cycle-flash")},200)),console.log(`🔄 Geometry cycled: ${t} → ${e}`)}updateCursorFromParams(){const t=document.getElementById("xy-touchpad"),e=t==null?void 0:t.querySelector(".touchpad-cursor");if(!t||!e)return;const i=this.choreographer.baseParams.speed,o=this.choreographer.baseParams.gridDensity,s=(i-.1)/9.9,a=(o-1)/99;e.style.left=`${s*100}%`,e.style.top=`${(1-a)*100}%`}}class vt{constructor(t){this.choreographer=t,this.isDragging=!1,this.init()}init(){this.attachToCanvas()}attachToCanvas(){const t=document.getElementById("stage-container");if(!t){console.warn("⚠️ stage-container not found for VisualizerXYPad");return}t.addEventListener("mousedown",e=>this.handleStart(e)),document.addEventListener("mousemove",e=>this.handleMove(e)),document.addEventListener("mouseup",()=>this.handleEnd()),t.addEventListener("touchstart",e=>{this.handleStart(e.touches[0])}),t.addEventListener("touchmove",e=>{this.isDragging&&this.handleMove(e.touches[0])}),t.addEventListener("touchend",()=>{this.handleEnd()}),console.log("✅ VisualizerXYPad attached to canvas")}handleStart(t){t.target.id!=="stage-container"&&!t.target.closest("#stage-container canvas")||(this.isDragging=!0,this.updateFromPosition(t))}handleMove(t){this.isDragging&&this.updateFromPosition(t)}handleEnd(){this.isDragging=!1}updateFromPosition(t){const e=document.getElementById("stage-container");if(!e)return;const i=e.getBoundingClientRect(),o=t.clientX-i.left,s=t.clientY-i.top,a=Math.max(0,Math.min(1,o/i.width)),r=Math.max(0,Math.min(1,1-s/i.height)),n=.1+a*9.9,c=1+r*99;this.choreographer.setParameter("speed",n),this.choreographer.setParameter("gridDensity",Math.round(c))}}class bt{constructor(t){this.choreographer=t,this.sections=[],this.init()}init(){console.log("🎨 Initializing Visuals Menu..."),this.createVisualsPanel(),this.setupVisualControls(),this.setupUpdateLoop(),console.log("✅ Visuals Menu initialized")}createVisualsPanel(){const t=document.getElementById("visuals-panel");if(!t)return;this.sections=[new D("geometry-controls","🔷 GEOMETRY",this.renderGeometryControls(),!1),new D("4d-projection","🔄 4D PROJECTION",this.render4DProjection(),!1),new D("visual-morphing","✨ VISUAL MORPHING",this.renderVisualMorphing(),!1),new D("color-controls","🎨 COLOR CONTROLS",this.renderColorControls(),!1),new D("system-selection","🌐 SYSTEM SELECTION",this.renderSystemSelection(),!1)],t.innerHTML=`
            <div class="panel-collapse-btn" title="Collapse Panel">−</div>
            <div class="panel-tab-label">🎨 VISUALS</div>
            <div class="panel-content">
                <h2>🎨 VISUALS</h2>
                ${this.sections.map(a=>a.render()).join("")}
            </div>
        `,this.sections.forEach(a=>a.attachListeners(t));const e=t.querySelector(".panel-collapse-btn"),i=a=>{a&&a.stopPropagation(),t.classList.contains("collapsed")?(t.classList.remove("collapsed"),e.textContent="−",localStorage.setItem("visualsPanelCollapsed","false")):(t.classList.add("collapsed"),e.textContent="+",localStorage.setItem("visualsPanelCollapsed","true"))};e.addEventListener("click",i),t.addEventListener("click",a=>{t.classList.contains("collapsed")&&i(a)});const o=localStorage.getItem("visualsPanelCollapsed"),s=window.innerWidth<=480&&window.matchMedia("(orientation: portrait)").matches;(o==="true"||o===null&&s)&&(t.classList.add("collapsed"),e.textContent="+")}renderGeometryControls(){const t=this.choreographer.baseParams;return`
            <div class="control-group">
                <label>Geometry Type (1-24)</label>
                <div class="slider-row">
                    <input type="range" id="visual-geometry" min="1" max="24" step="1" value="${t.geometry}">
                    <span id="visual-geometry-val">${t.geometry}</span>
                </div>
            </div>
            <div style="font-size: 9px; opacity: 0.7; margin-top: 5px;">
                💠 Tesseract, 24-cell, 120-cell, 600-cell, etc.
            </div>
        `}render4DProjection(){const t=this.choreographer.baseParams;return`
            <div style="font-size: 9px; opacity: 0.7; margin-bottom: 10px;">
                4D hyperspace rotation angles
            </div>
            <div class="control-group">
                <label>XW Plane Rotation</label>
                <div class="slider-row">
                    <input type="range" id="visual-rot4dXW" min="-3.14159" max="3.14159" step="0.01" value="${t.rot4dXW}">
                    <span id="visual-rot4dXW-val">${t.rot4dXW.toFixed(2)}</span>
                </div>
            </div>
            <div class="control-group">
                <label>YW Plane Rotation</label>
                <div class="slider-row">
                    <input type="range" id="visual-rot4dYW" min="-3.14159" max="3.14159" step="0.01" value="${t.rot4dYW}">
                    <span id="visual-rot4dYW-val">${t.rot4dYW.toFixed(2)}</span>
                </div>
            </div>
            <div class="control-group">
                <label>ZW Plane Rotation</label>
                <div class="slider-row">
                    <input type="range" id="visual-rot4dZW" min="-3.14159" max="3.14159" step="0.01" value="${t.rot4dZW}">
                    <span id="visual-rot4dZW-val">${t.rot4dZW.toFixed(2)}</span>
                </div>
            </div>
        `}renderVisualMorphing(){const t=this.choreographer.baseParams;return`
            <div class="control-group">
                <label>Grid Density (1-100)</label>
                <div class="slider-row">
                    <input type="range" id="visual-gridDensity" min="1" max="100" step="1" value="${t.gridDensity}">
                    <span id="visual-gridDensity-val">${t.gridDensity}</span>
                </div>
            </div>
            <div class="control-group">
                <label>Morph Factor (0-5)</label>
                <div class="slider-row">
                    <input type="range" id="visual-morphFactor" min="0" max="5" step="0.01" value="${t.morphFactor}">
                    <span id="visual-morphFactor-val">${t.morphFactor.toFixed(2)}</span>
                </div>
            </div>
            <div class="control-group">
                <label>Chaos (0-3)</label>
                <div class="slider-row">
                    <input type="range" id="visual-chaos" min="0" max="3" step="0.01" value="${t.chaos}">
                    <span id="visual-chaos-val">${t.chaos.toFixed(2)}</span>
                </div>
            </div>
            <div class="control-group">
                <label>Speed (0.1-10)</label>
                <div class="slider-row">
                    <input type="range" id="visual-speed" min="0.1" max="10" step="0.1" value="${t.speed}">
                    <span id="visual-speed-val">${t.speed.toFixed(1)}</span>
                </div>
            </div>
            <div style="font-size: 9px; opacity: 0.7; margin-top: 10px;">
                ✨ Shape transformation and animation
            </div>
        `}renderColorControls(){const t=this.choreographer.baseParams;return`
            <div class="control-group">
                <label>Hue</label>
                <div class="slider-row">
                    <input type="range" id="visual-hue" min="0" max="360" step="1" value="${t.hue}">
                    <span id="visual-hue-val">${t.hue}°</span>
                </div>
            </div>
            <div class="control-group">
                <label>Intensity</label>
                <div class="slider-row">
                    <input type="range" id="visual-intensity" min="0" max="1" step="0.01" value="${t.intensity}">
                    <span id="visual-intensity-val">${t.intensity.toFixed(2)}</span>
                </div>
            </div>
            <div class="control-group">
                <label>Saturation</label>
                <div class="slider-row">
                    <input type="range" id="visual-saturation" min="0" max="1" step="0.01" value="${t.saturation}">
                    <span id="visual-saturation-val">${t.saturation.toFixed(2)}</span>
                </div>
            </div>
            <div class="control-group">
                <label>Moiré Scale</label>
                <div class="slider-row">
                    <input type="range" id="visual-moire" min="0.95" max="1.05" step="0.001" value="${t.moireScale}">
                    <span id="visual-moire-val">${t.moireScale.toFixed(3)}</span>
                </div>
            </div>
            <div class="control-group">
                <label>Glitch Intensity</label>
                <div class="slider-row">
                    <input type="range" id="visual-glitch" min="0" max="0.2" step="0.01" value="${t.glitchIntensity}">
                    <span id="visual-glitch-val">${t.glitchIntensity.toFixed(2)}</span>
                </div>
            </div>
            <div class="control-group">
                <label>Line Thickness</label>
                <div class="slider-row">
                    <input type="range" id="visual-line" min="0.01" max="0.1" step="0.005" value="${t.lineThickness}">
                    <span id="visual-line-val">${t.lineThickness.toFixed(3)}</span>
                </div>
            </div>
            <div style="font-size: 9px; opacity: 0.7; margin-top: 10px;">
                💡 Color, moiré, glitch, and line rendering
            </div>
        `}renderSystemSelection(){return`
            <div class="system-pills" style="display: flex; gap: 5px; margin-bottom: 10px;">
                <div class="system-pill-vis active" data-system="faceted" style="flex: 1; padding: 8px; text-align: center; background: rgba(0, 255, 255, 0.1); border: 1px solid #0ff; font-size: 9px; cursor: pointer;">FACETED</div>
                <div class="system-pill-vis" data-system="quantum" style="flex: 1; padding: 8px; text-align: center; background: rgba(0, 255, 255, 0.1); border: 1px solid #0ff; font-size: 9px; cursor: pointer;">QUANTUM</div>
                <div class="system-pill-vis" data-system="holographic" style="flex: 1; padding: 8px; text-align: center; background: rgba(0, 255, 255, 0.1); border: 1px solid #0ff; font-size: 9px; cursor: pointer;">HOLO</div>
            </div>
            <div style="font-size: 9px; opacity: 0.7;">
                Choose visualization engine
            </div>
        `}setupVisualControls(){[{id:"geometry",param:"geometry",decimals:0},{id:"rot4dXW",param:"rot4dXW",decimals:2},{id:"rot4dYW",param:"rot4dYW",decimals:2},{id:"rot4dZW",param:"rot4dZW",decimals:2},{id:"gridDensity",param:"gridDensity",decimals:0},{id:"morphFactor",param:"morphFactor",decimals:2},{id:"chaos",param:"chaos",decimals:2},{id:"speed",param:"speed",decimals:1},{id:"hue",param:"hue",decimals:0,suffix:"°"},{id:"intensity",param:"intensity",decimals:2},{id:"saturation",param:"saturation",decimals:2},{id:"moire",param:"moireScale",decimals:3},{id:"glitch",param:"glitchIntensity",decimals:2},{id:"line",param:"lineThickness",decimals:3}].forEach(({id:e,param:i,decimals:o,suffix:s})=>{const a=document.getElementById(`visual-${e}`),r=document.getElementById(`visual-${e}-val`);!a||!r||a.addEventListener("input",n=>{const c=parseFloat(n.target.value);o===0?r.textContent=`${c}${s||""}`:r.textContent=c.toFixed(o)+(s||""),this.choreographer.setParameter(i,c)})}),document.querySelectorAll(".system-pill-vis").forEach(e=>{e.addEventListener("click",async()=>{const i=e.dataset.system;await this.choreographer.switchSystem(i),document.querySelectorAll(".system-pill-vis").forEach(o=>{o.classList.toggle("active",o.dataset.system===i)}),document.querySelectorAll(".viz-tab").forEach(o=>{o.classList.toggle("active",o.dataset.system===i)}),document.querySelectorAll(".system-pill").forEach(o=>{o.classList.toggle("active",o.dataset.system===i)})})})}setupUpdateLoop(){setInterval(()=>{const t=this.choreographer.baseParams,e=document.getElementById("visual-geometry-val"),i=document.getElementById("visual-geometry");e&&i&&(e.textContent=t.geometry,i.value=t.geometry);const o=document.getElementById("visual-rot4dXW-val"),s=document.getElementById("visual-rot4dXW");o&&s&&(o.textContent=t.rot4dXW.toFixed(2),s.value=t.rot4dXW);const a=document.getElementById("visual-rot4dYW-val"),r=document.getElementById("visual-rot4dYW");a&&r&&(a.textContent=t.rot4dYW.toFixed(2),r.value=t.rot4dYW);const n=document.getElementById("visual-rot4dZW-val"),c=document.getElementById("visual-rot4dZW");n&&c&&(n.textContent=t.rot4dZW.toFixed(2),c.value=t.rot4dZW);const h=document.getElementById("visual-gridDensity-val"),d=document.getElementById("visual-gridDensity");h&&d&&(h.textContent=t.gridDensity,d.value=t.gridDensity);const u=document.getElementById("visual-morphFactor-val"),m=document.getElementById("visual-morphFactor");u&&m&&(u.textContent=t.morphFactor.toFixed(2),m.value=t.morphFactor);const p=document.getElementById("visual-chaos-val"),f=document.getElementById("visual-chaos");p&&f&&(p.textContent=t.chaos.toFixed(2),f.value=t.chaos);const g=document.getElementById("visual-speed-val"),y=document.getElementById("visual-speed");g&&y&&(g.textContent=t.speed.toFixed(1),y.value=t.speed);const v=document.getElementById("visual-hue-val"),x=document.getElementById("visual-hue");v&&x&&(v.textContent=`${t.hue}°`,x.value=t.hue);const M=document.getElementById("visual-intensity-val"),I=document.getElementById("visual-intensity");M&&I&&(M.textContent=t.intensity.toFixed(2),I.value=t.intensity);const L=document.getElementById("visual-saturation-val"),C=document.getElementById("visual-saturation");L&&C&&(L.textContent=t.saturation.toFixed(2),C.value=t.saturation);const A=document.getElementById("visual-moire-val"),E=document.getElementById("visual-moire");A&&E&&(A.textContent=t.moireScale.toFixed(3),E.value=t.moireScale);const R=document.getElementById("visual-glitch-val"),$=document.getElementById("visual-glitch");R&&$&&(R.textContent=t.glitchIntensity.toFixed(2),$.value=t.glitchIntensity);const F=document.getElementById("visual-line-val"),P=document.getElementById("visual-line");F&&P&&(F.textContent=t.lineThickness.toFixed(3),P.value=t.lineThickness)},100)}}let S=null,B=null,k=null,V=null;const T=document.getElementById("status-display");function w(l,t="info"){const e=document.createElement("div");for(e.className=`status-line ${t}`,e.textContent=`${new Date().toLocaleTimeString()}: ${l}`,T.insertBefore(e,T.firstChild);T.children.length>20;)T.removeChild(T.lastChild)}async function wt(){try{w("Creating Choreographer instance...","info"),S=new pt,w("Initializing systems...","info"),await S.init(),w("Choreographer ready!","success"),document.getElementById("current-mode").textContent="READY",document.getElementById("current-system").textContent=S.currentSystem,document.getElementById("loading-indicator").classList.add("hidden"),window.choreographer=S,window.integratedControls=new ft(S),V=new bt(S),window.visualsMenu=V,B=new yt(S),window.xyTouchpad=B,k=new vt(S),window.visualizerXYPad=k,xt()}catch(l){w(`Initialization error: ${l.message}`,"error"),console.error("Choreographer init failed:",l)}}function xt(){const l=document.getElementById("smart-audio-btn"),t=document.getElementById("audio-file-input-top");l.addEventListener("click",()=>{const e=l.dataset.state;e==="load"?t.click():e==="play"?S.play().then(()=>{l.dataset.state="playing",l.textContent="⏸ PAUSE",w("Playback started","success"),document.getElementById("current-mode").textContent=S.choreographyMode.toUpperCase()}).catch(i=>{w(`Play error: ${i.message}`,"error")}):e==="playing"?(S.pause(),l.dataset.state="pause",l.textContent="▶ PLAY",w("Playback paused","info")):e==="pause"&&S.play().then(()=>{l.dataset.state="playing",l.textContent="⏸ PAUSE",w("Playback resumed","success")}).catch(i=>{w(`Play error: ${i.message}`,"error")})}),t.addEventListener("change",async e=>{const i=e.target.files[0];if(i){w(`Loading audio: ${i.name}`,"info");try{await S.loadAudioFile(i),w("Audio loaded successfully","success"),document.getElementById("audio-status").textContent=i.name,document.getElementById("audio-status-top").textContent=i.name,l.dataset.state="play",l.textContent="▶ PLAY",document.getElementById("analyze-btn").disabled=!1,document.getElementById("export-video-btn").disabled=!1,document.getElementById("manual-record-btn").disabled=!1}catch(o){w(`Audio load error: ${o.message}`,"error")}}}),document.querySelectorAll(".viz-tab").forEach(e=>{e.addEventListener("click",async()=>{const i=e.dataset.system;w(`Switching to ${i} system...`,"info");try{await S.switchSystem(i),document.getElementById("current-system").textContent=i,document.getElementById("audio-status-top").textContent=`${i.toUpperCase()}`,document.querySelectorAll(".viz-tab").forEach(o=>{o.classList.toggle("active",o.dataset.system===i)}),document.querySelectorAll(".system-pill").forEach(o=>{o.classList.toggle("active",o.dataset.system===i)}),w(`Switched to ${i}`,"success")}catch(o){w(`System switch error: ${o.message}`,"error")}})}),document.querySelectorAll(".system-pill").forEach(e=>{e.addEventListener("click",async()=>{const i=e.dataset.system;w(`Switching to ${i} system...`,"info");try{await S.switchSystem(i),document.getElementById("current-system").textContent=i,document.getElementById("audio-status-top").textContent=`${i.toUpperCase()}`,document.querySelectorAll(".system-pill").forEach(o=>{o.classList.toggle("active",o.dataset.system===i)}),document.querySelectorAll(".viz-tab").forEach(o=>{o.classList.toggle("active",o.dataset.system===i)}),w(`Switched to ${i}`,"success")}catch(o){w(`System switch error: ${o.message}`,"error")}})}),document.getElementById("analyze-btn").addEventListener("click",async()=>{const e=document.getElementById("gemini-api-key").value.trim();if(!e){w("Please enter Gemini API key","error");return}w("Starting AI analysis...","info");try{const i=await S.analyzeSongWithAI(e);S.applyAIChoreography(i);const o=i.sections?i.sections.length:0;document.getElementById("sequence-count").textContent=o,w(`AI analysis complete: ${o} sections`,"success")}catch(i){w(`AI analysis error: ${i.message}`,"error")}}),document.getElementById("export-video-btn").addEventListener("click",()=>{w("Video export not yet implemented","info"),w("RecordingEngine integration pending","info")}),document.getElementById("manual-record-btn").addEventListener("click",()=>{w("Manual recording not yet implemented","info")})}window.addEventListener("DOMContentLoaded",()=>{w("DOM ready, initializing...","info"),wt()});
