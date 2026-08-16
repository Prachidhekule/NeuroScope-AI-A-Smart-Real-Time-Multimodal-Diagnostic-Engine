// ========== ANALYSIS FUNCTIONS WITH BACKEND INTEGRATION ==========

// API Configuration
const API_BASE_URL = "http://127.0.0.1:8000";

// Global state for analysis results
let latestFacial = { result: null, confidence: null, details: null };
let latestVoice = { result: null, confidence: null };
let latestMotion = { result: null, confidence: null, allResults: {} };

// ========== FACIAL ANALYSIS (Frontend-based) ==========

let faceMesh = null;
let camera = null;
let facialAnalysisActive = false;
let blinkCount = 0;
let smileScores = [];
let headMovements = [];
let eyesClosed = false;
let currentStage = "idle";
let baselineEAR = 0;

function distance(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function calculateEAR(lm) {
    const v1 = distance(lm[159], lm[145]);
    const v2 = distance(lm[158], lm[153]);
    const h = distance(lm[33], lm[133]);
    return (v1 + v2) / (2 * h);
}

function calculateSmile(lm) {
    return distance(lm[61], lm[291]);
}

function updateFacialUI(title, subtitle, color = "text-cyan-300") {
    const output = document.getElementById('output');
    const instruction = document.getElementById('instruction');
    if (output) {
        output.innerHTML = `
            <div class="space-y-2">
                <div class="font-black ${color}">${title}</div>
                <div class="text-gray-300">${subtitle}</div>
            </div>
        `;
    }
    if (instruction) {
        instruction.innerText = subtitle;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function initializeFaceMesh() {
    if (faceMesh) return;
    
    faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });
    
    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });
    
    faceMesh.onResults(onFacialResults);
}

function onFacialResults(results) {
    const videoElement = document.getElementById('video');
    const canvasElement = document.getElementById('canvas');
    const canvasCtx = canvasElement?.getContext('2d');
    
    if (!canvasElement || !canvasCtx) return;
    
    canvasElement.width = videoElement?.videoWidth || 640;
    canvasElement.height = videoElement?.videoHeight || 480;
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        return;
    }
    
    const lm = results.multiFaceLandmarks[0];
    
    // Draw face mesh
    if (window.drawConnectors && window.FACEMESH_TESSELATION) {
        drawConnectors(canvasCtx, lm, FACEMESH_TESSELATION, { color: "#00FFFF", lineWidth: 0.5 });
    }
    
    const ear = calculateEAR(lm);
    const smile = calculateSmile(lm);
    
    // Calibration phase
    if (currentStage === "calibration") {
        baselineEAR += ear;
        return;
    }
    
    // Blink detection
    if (currentStage === "blink") {
        const threshold = baselineEAR * 0.75;
        if (ear < threshold && !eyesClosed) {
            eyesClosed = true;
        }
        if (ear >= threshold && eyesClosed) {
            blinkCount++;
            eyesClosed = false;
        }
    }
    
    // Smile detection
    if (currentStage === "smile") {
        smileScores.push(smile);
    }
    
    // Head movement detection
    if (currentStage === "head") {
        headMovements.push(lm[1].x);
    }
}

async function startFacialAnalysis() {
    if (!currentUser) {
        showToast("Please login first");
        return;
    }
    
    if (facialAnalysisActive) return;
    facialAnalysisActive = true;
    
    const videoElement = document.getElementById('video');
    const canvasElement = document.getElementById('canvas');
    const videoContainer = document.getElementById('videoContainer');
    
    blinkCount = 0;
    smileScores = [];
    headMovements = [];
    baselineEAR = 0;
    eyesClosed = false;
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
        videoElement.style.display = 'block';
        canvasElement.style.display = 'block';
        videoContainer?.classList.add('video-active');
        await videoElement.play();
        
        await initializeFaceMesh();
        
        if (camera) camera.stop();
        
        camera = new Camera(videoElement, {
            onFrame: async () => {
                await faceMesh.send({ image: videoElement });
            },
            width: 640,
            height: 480
        });
        
        await camera.start();
        
        const progressBar = document.getElementById('progress');
        
        // Calibration
        currentStage = "calibration";
        updateFacialUI("📐 Calibration", "Keep face neutral for 5 seconds");
        updateProgressBar(progressBar, 10, 1000);
        await sleep(5000);
        baselineEAR = baselineEAR / 150;
        
        // Blink Test
        currentStage = "blink";
        updateFacialUI("👁 Blink Test", "Blink naturally for 10 seconds");
        updateProgressBar(progressBar, 30, 1000);
        await sleep(10000);
        
        // Smile Test
        currentStage = "smile";
        updateFacialUI("😊 Smile Test", "Smile continuously for 10 seconds");
        updateProgressBar(progressBar, 60, 1000);
        await sleep(10000);
        
        // Head Test
        currentStage = "head";
        updateFacialUI("🔄 Head Test", "Move head left and right for 10 seconds");
        updateProgressBar(progressBar, 80, 1000);
        await sleep(10000);
        
        currentStage = "done";
        updateProgressBar(progressBar, 100, 500);
        
        calculateFacialResult();
        
        // Stop camera
        if (camera) camera.stop();
        if (stream) stream.getTracks().forEach(track => track.stop());
        
    } catch (error) {
        console.error(error);
        const output = document.getElementById('output');
        if (output) {
            output.innerHTML = `<div class="text-red-400">❌ Camera error: ${error.message}</div>`;
        }
    }
    
    facialAnalysisActive = false;
}

function calculateFacialResult() {
    const blinkRate = blinkCount * 6;
    const avgSmile = smileScores.length ? smileScores.reduce((a, b) => a + b, 0) / smileScores.length : 0;
    const headRange = headMovements.length ? Math.max(...headMovements) - Math.min(...headMovements) : 0;
    
    let risk = 15;
    
    if (blinkRate < 10) risk += 25;
    if (avgSmile < 0.20) risk += 25;
    if (headRange < 0.12) risk += 25;
    
    let prediction = "✅ Normal Facial Activity";
    if (risk > 45) prediction = "⚠ Mild Facial Deviation";
    if (risk > 70) prediction = "🚨 High Parkinson Risk";
    
    const output = document.getElementById('output');
    if (output) {
        output.innerHTML = `
            <div class="space-y-3">
                <div class="font-black text-cyan-300 text-lg">${prediction}</div>
                <div class="text-sm">👁 Blink Rate: ${blinkRate.toFixed(1)}/min</div>
                <div class="text-sm">😊 Smile Score: ${avgSmile.toFixed(3)}</div>
                <div class="text-sm">🔄 Head Movement: ${headRange.toFixed(3)}</div>
                <div class="font-bold text-yellow-300 text-lg">Risk Score: ${risk}%</div>
            </div>
        `;
    }
    
    latestFacial = { 
        result: prediction, 
        confidence: risk,
        details: { blinkRate, avgSmile, headRange }
    };
    
    updateCombinedResult();
    addHistory("Facial Analysis", { primary: prediction, confidence: risk });
}

// ========== VOICE ANALYSIS (Backend API) ==========

async function performVoiceAnalysis() {
    if (!currentUser) {
        showToast("Please login first");
        return;
    }
    
    const audioFile = document.getElementById('audioFile').files[0];
    if (!audioFile) {
        showToast("Please select an audio file first");
        return;
    }
    
    const voiceResultDiv = document.getElementById('voiceResultText');
    const waveformAnim = document.getElementById('waveformAnim');
    
    voiceResultDiv.innerHTML = '<div class="text-cyan-300">🔬 Analyzing voice patterns...</div>';
    startWaveAnimation();
    
    const formData = new FormData();
    formData.append("file", audioFile);
    
    try {
        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: "POST",
            body: formData
        });
        
        const data = await response.json();
        stopWaveAnimation();
        
        if (data.error || !data.success) {
            voiceResultDiv.innerHTML = `<div class="text-red-400">❌ ${data.error || "Analysis failed"}</div>`;
            return;
        }
        
        const prediction = data.prediction || (data.prediction === "Parkinson Detected" ? "Parkinson's Indicators Detected" : "Normal Voice Pattern");
        const confidence = data.confidence || 75;
        
        voiceResultDiv.innerHTML = `
            <div class="space-y-2">
                <div class="font-bold text-purple-300 text-lg">🧠 ${prediction}</div>
                <div class="text-sm">Confidence: ${confidence}%</div>
            </div>
        `;
        
        document.getElementById('voiceConfidenceFill').style.width = `${confidence}%`;
        document.getElementById('voiceConfidencePercent').innerText = `${confidence}%`;
        
        latestVoice = { result: prediction, confidence: confidence };
        updateCombinedResult();
        addHistory("Voice Analysis", { primary: prediction, confidence: confidence });
        
    } catch (error) {
        stopWaveAnimation();
        voiceResultDiv.innerHTML = `<div class="text-red-400">❌ Backend connection failed. Make sure server is running on ${API_BASE_URL}</div>`;
        console.error(error);
    }
}

// ========== MOTION ANALYSIS (Backend API) ==========

let motionResults = {
    standing: null,
    sitting: null,
    walking: null
};

async function callMotionAPI(accelFile, gyroFile, activityMode) {
    const formData = new FormData();
    formData.append("accel_file", accelFile);
    formData.append("gyro_file", gyroFile);
    formData.append("activity_mode", activityMode);
    
    try {
        const response = await fetch(`${API_BASE_URL}/movement_predict`, {
            method: "POST",
            body: formData
        });
        
        const data = await response.json();
        
        if (data.error || !data.success) {
            return { success: false, error: data.error || "Analysis failed" };
        }
        
        return {
            success: true,
            prediction: data.prediction,
            risk_score: data.risk_score,
            activity: data.activity
        };
        
    } catch (error) {
        return { success: false, error: "Backend connection failed" };
    }
}

async function analyzeSingleMotion(activity, accelId, gyroId) {
    const accelFile = document.getElementById(accelId).files[0];
    const gyroFile = document.getElementById(gyroId).files[0];
    
    if (!accelFile || !gyroFile) {
        showToast(`Please upload both CSV files for ${activity}`);
        return null;
    }
    
    const result = await callMotionAPI(accelFile, gyroFile, activity);
    
    if (result.success) {
        motionResults[activity] = result;
        showToast(`${activity} analysis completed`);
        
        // Update motion metrics display
        const metricsDiv = document.getElementById('motionMetrics');
        if (metricsDiv) {
            let html = '';
            if (motionResults.standing) html += `<div class="glass-panel p-2">🧍 Standing: ${motionResults.standing.risk_score}%</div>`;
            if (motionResults.sitting) html += `<div class="glass-panel p-2">🪑 Sitting: ${motionResults.sitting.risk_score}%</div>`;
            if (motionResults.walking) html += `<div class="glass-panel p-2">🚶 Walking: ${motionResults.walking.risk_score}%</div>`;
            metricsDiv.innerHTML = html;
        }
        
        return result;
    } else {
        showToast(`${activity} failed: ${result.error}`);
        return null;
    }
}

async function performMotionAnalysis() {
    if (!currentUser) {
        showToast("Please login first");
        return;
    }
    
    const motionResultDiv = document.getElementById('motionResultText');
    motionResultDiv.innerHTML = '<div class="text-cyan-300 text-center">🔄 Analyzing all motion data...</div>';
    
    // Analyze all three activities
    const standingResult = await analyzeSingleMotion('standing', 'standingAccCSV', 'standingGyroCSV');
    const sittingResult = await analyzeSingleMotion('sitting', 'sittingAccCSV', 'sittingGyroCSV');
    const walkingResult = await analyzeSingleMotion('walking', 'walkingAccCSV', 'walkingGyroCSV');
    
    // Calculate combined result
    const scores = [];
    if (standingResult) scores.push(standingResult.risk_score);
    if (sittingResult) scores.push(sittingResult.risk_score);
    if (walkingResult) scores.push(walkingResult.risk_score);
    
    if (scores.length > 0) {
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        let finalPrediction = "Healthy Movement Pattern";
        
        if (avgScore >= 60) {
            finalPrediction = "🚨 High Parkinsonian Risk";
        } else if (avgScore >= 40) {
            finalPrediction = "⚠ Moderate Parkinsonian Risk";
        }
        
        const motionHtml = `
            <div class="space-y-3">
                ${standingResult ? `<div class="glass-panel p-3"><span class="text-cyan-300 font-bold">🧍 Standing:</span> ${standingResult.prediction} (${standingResult.risk_score}%)</div>` : ''}
                ${sittingResult ? `<div class="glass-panel p-3"><span class="text-purple-300 font-bold">🪑 Sitting:</span> ${sittingResult.prediction} (${sittingResult.risk_score}%)</div>` : ''}
                ${walkingResult ? `<div class="glass-panel p-3"><span class="text-emerald-300 font-bold">🚶 Walking:</span> ${walkingResult.prediction} (${walkingResult.risk_score}%)</div>` : ''}
                <div class="glass-panel p-4 text-center mt-3">
                    <div class="font-bold text-yellow-300">Combined Risk Score: ${avgScore.toFixed(2)}%</div>
                    <div class="font-black text-lg mt-2">${finalPrediction}</div>
                </div>
            </div>
        `;
        
        motionResultDiv.innerHTML = motionHtml;
        
        latestMotion = { 
            result: finalPrediction, 
            confidence: Math.round(avgScore),
            allResults: motionResults
        };
        
        updateCombinedResult();
        addHistory("Motion Analysis", { primary: finalPrediction, confidence: Math.round(avgScore) });
    } else {
        motionResultDiv.innerHTML = '<div class="text-red-400 text-center">❌ No valid motion data analyzed. Please upload CSV files.</div>';
    }
}

// Update combined result display
function updateCombinedResult() {
    const hasFacial = latestFacial.result !== null;
    const hasVoice = latestVoice.result !== null;
    const hasMotion = latestMotion.result !== null;
    
    // Update individual result displays
    if (hasFacial) {
        document.getElementById('facialResultText').innerHTML = `<div class="text-base font-bold text-cyan-300">${latestFacial.result}</div>`;
        const facialScoreEl = document.getElementById('facialScore');
        if (facialScoreEl) facialScoreEl.innerText = `${latestFacial.confidence}%`;
    }
    
    if (hasVoice) {
        document.getElementById('voiceResultText').innerHTML = `<div class="text-base font-bold text-purple-300">🧠 ${latestVoice.result}</div>`;
        document.getElementById('voiceScore').innerText = `${latestVoice.confidence}%`;
    }
    
    if (hasMotion) {
        document.getElementById('motionResultText').innerHTML = `<div class="text-base font-bold text-emerald-300">${latestMotion.result}</div>`;
        document.getElementById('motionScore').innerText = `${latestMotion.confidence}%`;
    }
    
    // Calculate overall risk
    if (hasFacial && hasVoice && hasMotion) {
        const avgConfidence = Math.round((latestFacial.confidence + latestVoice.confidence + latestMotion.confidence) / 3);
        let riskLevel = '', riskClass = '';
        
        if (avgConfidence >= 70) {
            riskLevel = '🔴 High Risk - Further Evaluation Recommended';
            riskClass = 'risk-high';
        } else if (avgConfidence >= 45) {
            riskLevel = '⚠️ Moderate Risk - Monitor Symptoms';
            riskClass = 'risk-moderate';
        } else {
            riskLevel = '✅ Low Risk - Normal Pattern';
            riskClass = 'risk-low';
        }
        
        document.getElementById('overallRisk').innerHTML = `<span class="result-badge ${riskClass}">${riskLevel}</span>`;
        document.getElementById('riskBar').style.width = `${avgConfidence}%`;
        document.getElementById('recommendation').innerHTML = `Overall Parkinson's Risk Confidence: ${avgConfidence}% based on multi-modal analysis`;
    } else {
        const completed = [hasFacial, hasVoice, hasMotion].filter(Boolean).length;
        document.getElementById('overallRisk').innerHTML = '—';
        document.getElementById('riskBar').style.width = '0%';
        document.getElementById('recommendation').innerHTML = `Complete ${3 - completed} more analysis to see combined risk assessment`;
    }
    
    // Re-render icons
    if (window.lucide) lucide.createIcons();
}

// Add analysis to history
function addHistory(type, resultData) {
    if (!currentUser) {
        showToast("Please login to save results");
        return false;
    }
    
    const entry = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        type: type,
        result: resultData.primary,
        confidence: resultData.confidence || 78
    };
    
    analysisHistory.unshift(entry);
    if (analysisHistory.length > 50) analysisHistory.pop();
    localStorage.setItem('neuroscope_history', JSON.stringify(analysisHistory));
    renderHistoryModalList();
    updateAuthUI();
    showToast(`${type} saved`);
    return true;
}

// Save combined result to history
function saveCombinedResult() {
    if (!currentUser) {
        showToast("Please login first");
        return;
    }
    
    if (!latestFacial.result && !latestVoice.result && !latestMotion.result) {
        showToast("No analysis results to save. Please perform at least one analysis first.");
        return;
    }
    
    const confidences = [latestFacial.confidence, latestVoice.confidence, latestMotion.confidence].filter(c => c !== null);
    const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length || 0;
    let riskText = avgConfidence >= 70 ? "High Risk" : (avgConfidence >= 45 ? "Moderate Risk" : "Low Risk");
    
    addHistory("Combined Analysis", { primary: `Overall Risk: ${riskText}`, confidence: Math.round(avgConfidence) });
}

// Initialize all analysis event listeners
function initAnalysis() {
    // Facial analysis
    document.getElementById('startFacialBtn')?.addEventListener('click', startFacialAnalysis);
    
    // Voice analysis
    document.getElementById('analyzeVoiceBtn')?.addEventListener('click', performVoiceAnalysis);
    document.getElementById('audioFile')?.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            const fileNameSpan = document.getElementById('audioFileName');
            if (fileNameSpan) fileNameSpan.innerText = e.target.files[0].name;
        }
    });
    
    // Motion analysis
    document.getElementById('analyzeMotionBtn')?.addEventListener('click', performMotionAnalysis);
    
    // File input handlers for motion
    const motions = [
        { prefix: 'standing', accId: 'standingAccCSV', gyroId: 'standingGyroCSV' },
        { prefix: 'sitting', accId: 'sittingAccCSV', gyroId: 'sittingGyroCSV' },
        { prefix: 'walking', accId: 'walkingAccCSV', gyroId: 'walkingGyroCSV' }
    ];
    
    motions.forEach(motion => {
        const accInput = document.getElementById(motion.accId);
        const gyroInput = document.getElementById(motion.gyroId);
        
        accInput?.addEventListener('change', (e) => {
            const nameSpan = document.getElementById(`${motion.prefix}AccName`);
            if (nameSpan && e.target.files[0]) nameSpan.innerText = e.target.files[0].name;
        });
        
        gyroInput?.addEventListener('change', (e) => {
            const nameSpan = document.getElementById(`${motion.prefix}GyroName`);
            if (nameSpan && e.target.files[0]) nameSpan.innerText = e.target.files[0].name;
        });
    });
    
    // Save combined result
    document.getElementById('saveCombinedResultBtn')?.addEventListener('click', saveCombinedResult);
    
    // Record voice button
    document.getElementById('recordAudioBtn')?.addEventListener('click', () => {
        showToast("Recording feature: Please upload a WAV file instead");
    });
}