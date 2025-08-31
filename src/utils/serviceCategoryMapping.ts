// Service category suggestions mapping based on business categories
export const serviceCategoryMapping: Record<string, string[]> = {
  "Beauty Salon": ["Facial Treatment", "Makeup Application", "Skin Care Consultation", "Chemical Peel", "Eyebrow Shaping"],
  "Pet grooming": ["Dog Grooming", "Cat Grooming", "Nail Clipping", "Bath & Brush", "Fur Styling"],
  "Medspa": ["Botox", "Dermal Fillers", "Laser Hair Removal", "Microneedling", "Skin Rejuvenation"],
  "Fitness & recovery": ["Personal Training", "Group Fitness Class", "Strength Training", "Stretching Session", "Recovery Coaching"],
  "Tattooing & piercing": ["Custom Tattoo", "Flash Tattoo", "Piercing", "Tattoo Cover-Up", "Tattoo Removal Consultation"],
  "Spa & sauna": ["Body Scrub", "Hot Stone Therapy", "Sauna Session", "Aromatherapy", "Hydrotherapy"],
  "Massage": ["Swedish Massage", "Deep Tissue Massage", "Sports Massage", "Thai Massage", "Couples Massage"],
  "Tanning studio": ["Spray Tan", "UV Tanning Bed", "Airbrush Tan", "Bronzing Session"],
  "Eyebrows & lashes": ["Eyelash Extensions", "Lash Lift", "Brow Tinting", "Brow Lamination", "Threading"],
  "Physical therapy": ["Injury Rehabilitation", "Post-Surgery Recovery", "Mobility Training", "Manual Therapy", "Strength Conditioning"],
  "Hair Salon": ["Haircut", "Hair Coloring", "Highlights", "Blow Dry", "Extensions"],
  "Other": ["Custom Service", "Special Request", "Consultation"],
  "Barber": ["Men's Haircut", "Beard Trim", "Shave", "Fade Cut", "Line Up"],
  "Nails": ["Manicure", "Pedicure", "Nail Art", "Gel Nails", "Acrylic Nails"],
  "Waxing salon": ["Full Body Wax", "Bikini Wax", "Eyebrow Wax", "Leg Wax", "Arm Wax"],
  "Health practice": ["General Consultation", "Nutrition Counseling", "Wellness Checkup", "Preventive Care", "Chronic Condition Management"]
};

/**
 * Get service category suggestions based on business categories
 * @param businessCategories Array of business category names
 * @returns Array of unique service category suggestions
 */
export const getServiceCategorySuggestions = (businessCategories: string[]): string[] => {
  const suggestions = new Set<string>();
  
  businessCategories.forEach(categoryName => {
    const categorySuggestions = serviceCategoryMapping[categoryName];
    if (categorySuggestions) {
      categorySuggestions.forEach(suggestion => suggestions.add(suggestion));
    }
  });
  
  // Always include "Other" category options
  serviceCategoryMapping["Other"].forEach(suggestion => suggestions.add(suggestion));
  
  return Array.from(suggestions).sort();
};

/**
 * Get service category suggestions grouped by business category
 * @param businessCategories Array of business category names
 * @returns Object with business category names as keys and their service categories as values
 */
export const getGroupedServiceCategorySuggestions = (businessCategories: string[]): Record<string, string[]> => {
  const grouped: Record<string, string[]> = {};
  
  businessCategories.forEach(categoryName => {
    const categorySuggestions = serviceCategoryMapping[categoryName];
    if (categorySuggestions && categorySuggestions.length > 0) {
      grouped[categoryName] = [...categorySuggestions];
    }
  });
  
  return grouped;
};

/**
 * Get all unique service categories across all business types
 */
export const getAllServiceCategories = (): string[] => {
  const allCategories = new Set<string>();
  
  Object.values(serviceCategoryMapping).forEach(categories => {
    categories.forEach(category => allCategories.add(category));
  });
  
  return Array.from(allCategories).sort();
};