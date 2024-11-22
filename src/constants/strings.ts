export const SESSION_DESCRIPTIONS = {
    ANXIETY_CRUSHER: "Transform anxiety into reality-bending power",
    EMERGENCY_RESET: "Quick anxiety pattern interrupt",
    DEEP_REALITY: "Premium overnight transformation",
} as const;

export const SESSION_SUBTITLES = {
    ANXIETY_CRUSHER: "Reality Wave frequency for deep transformation",
    EMERGENCY_RESET: "Instant clarity when you need it most",
    DEEP_REALITY: "Overnight reality reprogramming",
} as const;

export type SessionDescription = typeof SESSION_DESCRIPTIONS[keyof typeof SESSION_DESCRIPTIONS];
export type SessionSubtitle = typeof SESSION_SUBTITLES[keyof typeof SESSION_SUBTITLES];
