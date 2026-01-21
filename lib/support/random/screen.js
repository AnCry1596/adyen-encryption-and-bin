// Enhanced screen resolutions with realistic distribution
const SCREEN_RESOLUTIONS = [
    // Mobile (30%)
    { height: 812, width: 375, type: 'mobile', weight: 15 }, // iPhone
    { height: 896, width: 414, type: 'mobile', weight: 12 }, // iPhone Plus
    { height: 800, width: 360, type: 'mobile', weight: 8 },  // Android
    { height: 732, width: 412, type: 'mobile', weight: 5 },  // Android
    
    // Tablet (15%)
    { height: 1024, width: 768, type: 'tablet', weight: 8 },  // iPad
    { height: 1366, width: 1024, type: 'tablet', weight: 4 }, // iPad Pro
    { height: 800, width: 1280, type: 'tablet', weight: 3 },  // Android tablet
    
    // Desktop (55%)
    { height: 1080, width: 1920, type: 'desktop', weight: 25 }, // Full HD
    { height: 900, width: 1440, type: 'desktop', weight: 12 },  // MacBook
    { height: 768, width: 1366, type: 'desktop', weight: 8 },   // Laptop
    { height: 1440, width: 2560, type: 'desktop', weight: 5 },  // 2K
    { height: 2160, width: 3840, type: 'desktop', weight: 3 },  // 4K
    { height: 1200, width: 1920, type: 'desktop', weight: 2 }   // Full HD+
];

module.exports = SCREEN_RESOLUTIONS;