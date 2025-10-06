/**
 * RecordingEngine - Video export system with choreography integration
 * CRITICAL: Forces visualizers to render each frame during recording
 */

export class RecordingEngine {
    constructor(choreographer) {
        this.choreographer = choreographer;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.isRecording = false;
        this.recordingStartTime = 0;
        this.recordingTimer = null;
        this.recordingCanvas = null;
        this.recordingAudioDest = null;
    }

    /**
     * Start video recording with choreography integration
     */
    async startRecording() {
        try {
            console.log('🎥 Starting stable recording system...');

            // Get stage container dimensions
            const stageContainer = document.getElementById('stage-container');
            const width = window.innerWidth;
            const height = window.innerHeight;

            // Create a dedicated recording canvas (persistent, not destroyed by system switches)
            this.recordingCanvas = document.createElement('canvas');
            this.recordingCanvas.width = width;
            this.recordingCanvas.height = height;
            this.recordingCanvas.id = 'recording-canvas';
            this.recordingCanvas.style.display = 'none'; // Hidden from user
            document.body.appendChild(this.recordingCanvas);

            const ctx = this.recordingCanvas.getContext('2d', { alpha: false });

            console.log(`📐 Recording canvas: ${width}x${height}`);

            // Start capturing frames at 30 FPS
            const stream = this.recordingCanvas.captureStream(30);

            // Add audio if available
            if (this.choreographer.audioElement && this.choreographer.audioSource) {
                // Create destination for recording audio stream
                this.recordingAudioDest = this.choreographer.audioContext.createMediaStreamDestination();

                // Connect existing audio source to recording destination
                this.choreographer.audioSource.connect(this.recordingAudioDest);

                // Get audio track and add to recording stream
                const audioTrack = this.recordingAudioDest.stream.getAudioTracks()[0];
                if (audioTrack) {
                    stream.addTrack(audioTrack);
                    console.log('🔊 Audio track added to recording');
                }
            }

            // Create MediaRecorder with high quality settings
            const options = {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 8000000 // 8 Mbps
            };

            // Fallback if VP9 not supported
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'video/webm;codecs=vp8';
                options.videoBitsPerSecond = 6000000;
            }

            this.mediaRecorder = new MediaRecorder(stream, options);
            this.recordedChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.saveRecording();
            };

            // Store last valid frame to use during system switches
            let lastValidFrame = null;
            let frameCount = 0;
            let lastCanvasCount = 0;

            // CRITICAL: Dynamic capture loop that re-queries canvases each frame
            // This survives system switches because it looks up canvases live
            const renderFrame = () => {
                if (!this.isRecording) return;
                frameCount++;

                // CRITICAL FIX: Update choreography at current audio time
                // This ensures sequences are applied even during automated export
                if (this.choreographer.audioElement && this.choreographer.sequences && this.choreographer.sequences.length > 0) {
                    const currentTime = this.choreographer.audioElement.currentTime;
                    this.choreographer.updateChoreographyAtTime(currentTime);
                }

                // CRITICAL FIX 2: Force visualizers to render
                // Visualizers have their own render loops that may pause during recording
                // We need to explicitly trigger a render for the current system
                const currentSys = this.choreographer.systems[this.choreographer.currentSystem];
                if (currentSys && currentSys.engine) {
                    try {
                        // Update time for animation
                        if (this.choreographer.audioElement) {
                            currentSys.engine.time = this.choreographer.audioElement.currentTime;
                        }

                        // Force visualizers to update and render
                        if (currentSys.engine.updateVisualizers) {
                            // Faceted/Quantum engines: updateVisualizers() updates params AND renders
                            currentSys.engine.updateVisualizers();
                        } else if (currentSys.engine.visualizers) {
                            // Holographic system: manually update each visualizer
                            const params = this.choreographer.getCurrentParameters();
                            params.time = currentSys.engine.time || 0;
                            currentSys.engine.visualizers.forEach(viz => {
                                if (viz && viz.updateParameters && viz.render) {
                                    viz.updateParameters(params);
                                    viz.render();
                                }
                            });
                        }
                    } catch (e) {
                        // Render failed - will use last frame
                        console.warn('📹 Visualizer render failed:', e.message);
                    }
                }

                // Clear with black background
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, this.recordingCanvas.width, this.recordingCanvas.height);

                // DYNAMIC: Get current canvases (survives system switches)
                const currentCanvases = Array.from(stageContainer.querySelectorAll('canvas'));

                // Log canvas count changes (helps debug system switches)
                if (currentCanvases.length !== lastCanvasCount) {
                    console.log(`📹 Recording frame ${frameCount}: ${currentCanvases.length} canvases (was ${lastCanvasCount})`);
                    lastCanvasCount = currentCanvases.length;
                }

                // Check if we have valid canvases
                let capturedFrame = false;

                // Draw all currently active canvases
                currentCanvases.forEach(canvas => {
                    if (canvas && canvas.width > 0 && canvas.height > 0) {
                        try {
                            // Draw canvas scaled to recording canvas size
                            ctx.drawImage(canvas, 0, 0, this.recordingCanvas.width, this.recordingCanvas.height);
                            capturedFrame = true;
                        } catch (e) {
                            console.warn(`📹 Frame ${frameCount}: Failed to capture canvas`, e.message);
                        }
                    }
                });

                // If we captured a frame, save it as last valid frame
                if (capturedFrame) {
                    try {
                        // Store current frame data for transition periods
                        lastValidFrame = ctx.getImageData(0, 0, this.recordingCanvas.width, this.recordingCanvas.height);
                    } catch (e) {
                        // Failed to save frame data
                    }
                } else if (lastValidFrame) {
                    // During system switch (no valid canvases), use last valid frame
                    // This prevents black frames during transitions
                    console.log(`📹 Frame ${frameCount}: Using buffered frame (${currentCanvases.length} canvases available)`);
                    try {
                        ctx.putImageData(lastValidFrame, 0, 0);
                    } catch (e) {
                        // Failed to restore frame data
                    }
                } else {
                    console.log(`📹 Frame ${frameCount}: No frame to capture (${currentCanvases.length} canvases, no buffer)`);
                }

                requestAnimationFrame(renderFrame);
            };

            // Start recording
            this.mediaRecorder.start(100); // Collect data every 100ms
            this.isRecording = true;
            requestAnimationFrame(renderFrame);

            // Update UI
            const startBtn = document.getElementById('start-recording-btn');
            const stopBtn = document.getElementById('stop-recording-btn');
            if (startBtn) startBtn.style.display = 'none';
            if (stopBtn) stopBtn.style.display = 'block';

            // Start timer
            this.recordingStartTime = Date.now();
            this.recordingTimer = setInterval(() => {
                const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                const timerEl = document.getElementById('recording-timer');
                if (timerEl) {
                    timerEl.textContent = `⏺ REC ${minutes}:${seconds.toString().padStart(2, '0')}`;
                    timerEl.style.display = 'block';
                }
            }, 1000);

            console.log('✅ Recording started - stable system-switch-proof capture');

        } catch (error) {
            console.error('❌ Recording error:', error);
            alert(`Failed to start recording: ${error.message}`);
            this.isRecording = false;
        }
    }

    /**
     * Stop video recording
     */
    stopRecording() {
        if (!this.mediaRecorder || !this.isRecording) return;

        this.isRecording = false;
        this.mediaRecorder.stop();

        // Remove recording canvas from DOM
        if (this.recordingCanvas && this.recordingCanvas.parentNode) {
            this.recordingCanvas.parentNode.removeChild(this.recordingCanvas);
            this.recordingCanvas = null;
        }

        // Disconnect recording audio destination if it exists
        if (this.recordingAudioDest) {
            try {
                this.recordingAudioDest.disconnect();
                this.recordingAudioDest = null;
            } catch (e) {
                console.warn('Error disconnecting recording audio:', e);
            }
        }

        // Stop timer
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }

        // Update UI
        const startBtn = document.getElementById('start-recording-btn');
        const stopBtn = document.getElementById('stop-recording-btn');
        const timerEl = document.getElementById('recording-timer');

        if (startBtn) startBtn.style.display = 'block';
        if (stopBtn) stopBtn.style.display = 'none';
        if (timerEl) {
            timerEl.textContent = '💾 Saving video...';
        }

        console.log('🎥 Recording stopped - processing video...');
    }

    /**
     * Save recorded video to file
     */
    saveRecording() {
        const blob = new Blob(this.recordedChunks, {
            type: 'video/webm'
        });

        const sizeMB = (blob.size / (1024 * 1024)).toFixed(2);
        console.log(`💾 Saving video: ${sizeMB} MB`);

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `vib34d-choreography-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);

        // Update UI
        const timerEl = document.getElementById('recording-timer');
        if (timerEl) {
            timerEl.textContent = `✅ Video saved! (${sizeMB} MB)`;
            setTimeout(() => {
                timerEl.style.display = 'none';
                timerEl.textContent = '';
            }, 5000);
        }

        console.log(`✅ Recording saved: ${sizeMB} MB`);
    }
}
