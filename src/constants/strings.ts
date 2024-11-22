export const SESSION_DESCRIPTIONS = {
    ANXIETY_CRUSHER: "Transform anxiety into reality-bending power",
    EMERGENCY_RESET: "Quick anxiety pattern interrupt",
    DEEP_REALITY: "Premium overnight transformation",
} as const;

export type SessionDescription = typeof SESSION_DESCRIPTIONS[keyof typeof SESSION_DESCRIPTIONS];
