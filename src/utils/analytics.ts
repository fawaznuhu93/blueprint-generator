// Google Analytics setup - Add your Measurement ID after deployment
export const initGA = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Add your GA script here after deployment
    console.log('GA would initialize in production');
  }
};

export const trackEvent = (category: string, action: string, label?: string) => {
  console.log(`[Analytics] ${category} - ${action} - ${label}`);
  
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label
    });
  }
};

export const trackBlueprintGenerated = (buildingType: string, country: string) => {
  trackEvent('blueprint', 'generate', `${buildingType}-${country}`);
};

export const trackExport = (format: string) => {
  trackEvent('export', 'download', format);
};