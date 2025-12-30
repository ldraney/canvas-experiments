/**
 * BeatDetector - Real-time beat detection using energy comparison
 * Compares current bass energy to a rolling average to detect beats
 */
export class BeatDetector {
    constructor(options = {}) {
        // Configuration
        this.sensitivity = options.sensitivity || 1.4;  // Threshold multiplier
        this.decayRate = options.decayRate || 0.93;     // Beat intensity decay
        this.cooldownMs = options.cooldownMs || 180;    // Min ms between beats
        this.historyLength = options.historyLength || 30; // ~0.5s at 60fps

        // State
        this.energyHistory = [];
        this.lastBeatTime = 0;
        this.beatIntensity = 0;
        this._isBeat = false;
        this.beatCount = 0;

        // For tempo estimation
        this.beatTimes = [];
        this.estimatedBPM = 0;
    }

    /**
     * Update beat detection with current bass energy
     * @param {number} bassEnergy - Current bass frequency energy (0-1)
     * @param {number} currentTime - Current timestamp (performance.now())
     */
    update(bassEnergy, currentTime) {
        // Add to energy history
        this.energyHistory.push(bassEnergy);
        if (this.energyHistory.length > this.historyLength) {
            this.energyHistory.shift();
        }

        // Need enough history for comparison
        if (this.energyHistory.length < 10) {
            this._isBeat = false;
            return;
        }

        // Calculate local average energy
        const avgEnergy = this.energyHistory.reduce((a, b) => a + b, 0) / this.energyHistory.length;

        // Calculate variance for adaptive threshold
        const variance = this.energyHistory.reduce((sq, n) => sq + Math.pow(n - avgEnergy, 2), 0) / this.energyHistory.length;
        const stdDev = Math.sqrt(variance);

        // Dynamic threshold based on local statistics
        const threshold = avgEnergy + this.sensitivity * stdDev;

        // Check for beat
        const timeSinceLastBeat = currentTime - this.lastBeatTime;
        this._isBeat = false;

        if (bassEnergy > threshold &&
            bassEnergy > avgEnergy * this.sensitivity &&
            timeSinceLastBeat > this.cooldownMs) {

            this._isBeat = true;
            this.lastBeatTime = currentTime;
            this.beatCount++;

            // Calculate beat intensity based on how much it exceeds threshold
            this.beatIntensity = Math.min(1, (bassEnergy - avgEnergy) / (avgEnergy + 0.01));

            // Store for tempo estimation
            this.beatTimes.push(currentTime);
            if (this.beatTimes.length > 16) {
                this.beatTimes.shift();
            }

            // Update BPM estimate
            this.updateTempoEstimate();
        }

        // Decay beat intensity for smooth visual response
        this.beatIntensity *= this.decayRate;
    }

    /**
     * Estimate tempo from beat history
     */
    updateTempoEstimate() {
        if (this.beatTimes.length < 4) {
            return;
        }

        // Calculate intervals between beats
        const intervals = [];
        for (let i = 1; i < this.beatTimes.length; i++) {
            const interval = this.beatTimes[i] - this.beatTimes[i - 1];
            // Only count reasonable intervals (30-300 BPM range)
            if (interval > 200 && interval < 2000) {
                intervals.push(interval);
            }
        }

        if (intervals.length < 3) return;

        // Use median interval for robustness
        intervals.sort((a, b) => a - b);
        const medianInterval = intervals[Math.floor(intervals.length / 2)];

        // Convert to BPM
        this.estimatedBPM = Math.round(60000 / medianInterval);
    }

    /**
     * Check if a beat occurred this frame
     */
    isBeat() {
        return this._isBeat;
    }

    /**
     * Get decaying beat intensity (0-1)
     * Use this for smooth visual responses
     */
    getBeatIntensity() {
        return this.beatIntensity;
    }

    /**
     * Get estimated BPM
     */
    getBPM() {
        return this.estimatedBPM;
    }

    /**
     * Get total beat count
     */
    getBeatCount() {
        return this.beatCount;
    }

    /**
     * Reset detector state
     */
    reset() {
        this.energyHistory = [];
        this.beatTimes = [];
        this.lastBeatTime = 0;
        this.beatIntensity = 0;
        this._isBeat = false;
        this.beatCount = 0;
        this.estimatedBPM = 0;
    }
}
