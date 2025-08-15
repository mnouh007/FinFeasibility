
// Box-Muller transform for generating normally distributed random numbers
let spare_normal: number | null = null;
export function normal(mean: number, stdDev: number): number {
    let u, v, s;
    if (spare_normal !== null) {
        const temp = spare_normal;
        spare_normal = null;
        return mean + stdDev * temp;
    }
    do {
        u = Math.random() * 2 - 1;
        v = Math.random() * 2 - 1;
        s = u * u + v * v;
    } while (s >= 1 || s === 0);
    s = Math.sqrt(-2.0 * Math.log(s) / s);
    spare_normal = v * s;
    return mean + stdDev * (u * s);
}

// Uniform distribution
export function uniform(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

// Triangular distribution
export function triangular(min: number, mode: number, max: number): number {
    const F = (mode - min) / (max - min);
    const rand = Math.random();
    if (rand < F) {
        return min + Math.sqrt(rand * (max - min) * (mode - min));
    } else {
        return max - Math.sqrt((1 - rand) * (max - min) * (max - mode));
    }
}

// Beta distribution using Johnk's algorithm
export function beta(alpha: number, betaParam: number): number {
    if (alpha <= 0 || betaParam <= 0) {
        return NaN; // Invalid parameters
    }
    while (true) {
        const u1 = Math.random();
        const u2 = Math.random();
        const v1 = Math.pow(u1, 1 / alpha);
        const v2 = Math.pow(u2, 1 / betaParam);
        if (v1 + v2 <= 1) {
            if (v1 + v2 > 0) {
                return v1 / (v1 + v2);
            }
        }
    }
}

// PERT distribution, which is a specific form of the Beta distribution
export function pert(min: number, mode: number, max: number, gamma: number = 4): number {
    if (min > max || mode < min || mode > max) {
        return mode; // Return mode if params are invalid
    }
    if (min === max) {
        return min;
    }

    const alpha = 1 + gamma * (mode - min) / (max - min);
    const betaParam = 1 + gamma * (max - mode) / (max - min);

    const betaSample = beta(alpha, betaParam);
    
    return min + betaSample * (max - min);
}

// Lognormal distribution
export function lognormal(logMean: number, logStdDev: number): number {
    const normalSample = normal(logMean, logStdDev);
    return Math.exp(normalSample);
}
