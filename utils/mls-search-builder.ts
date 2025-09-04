/**
 * MLS Search Builder - Utility for creating complex MLS search queries
 */

export interface MLSSearchCriteria {
  // Property Type
  propertyType?: PropertyType | PropertyType[];
  propertySubType?: string[];
  
  // Price Range
  minPrice?: number;
  maxPrice?: number;
  
  // Location
  city?: string | string[];
  zipCode?: string | string[];
  county?: string;
  area?: string[];
  subdivision?: string;
  schoolDistrict?: string;
  
  // Property Features
  minBeds?: number;
  maxBeds?: number;
  minBaths?: number;
  maxBaths?: number;
  minSqft?: number;
  maxSqft?: number;
  minLotSize?: number;
  maxLotSize?: number;
  minYearBuilt?: number;
  maxYearBuilt?: number;
  
  // Listing Details
  listingStatus?: ListingStatus | ListingStatus[];
  daysOnMarket?: number;
  priceReduced?: boolean;
  openHouse?: boolean;
  virtualTour?: boolean;
  
  // Features & Amenities
  features?: PropertyFeature[];
  parkingSpaces?: number;
  garageSpaces?: number;
  hasPool?: boolean;
  hasView?: boolean;
  waterfront?: boolean;
  gatedCommunity?: boolean;
  
  // HOA
  maxHOAFee?: number;
  noHOA?: boolean;
  
  // Advanced
  keywords?: string[];
  excludeKeywords?: string[];
  mlsNumbers?: string[];
  agentId?: string;
  officeName?: string;
}

export enum PropertyType {
  Residential = 'Residential',
  Condo = 'Condominium',
  Townhouse = 'Townhouse',
  MultiFamily = 'Multi-Family',
  Land = 'Vacant Land',
  Commercial = 'Commercial',
  Rental = 'Rental'
}

export enum ListingStatus {
  Active = 'Active',
  Pending = 'Pending',
  Sold = 'Sold',
  Expired = 'Expired',
  Withdrawn = 'Withdrawn',
  ComingSoon = 'Coming Soon'
}

export enum PropertyFeature {
  AirConditioning = 'Central Air',
  Fireplace = 'Fireplace',
  Hardwood = 'Hardwood Floors',
  GraniteCounters = 'Granite Counters',
  StainlessAppliances = 'Stainless Steel Appliances',
  UpdatedKitchen = 'Updated Kitchen',
  UpdatedBathrooms = 'Updated Bathrooms',
  SmartHome = 'Smart Home',
  SolarPanels = 'Solar Panels',
  SecuritySystem = 'Security System'
}

export class MLSSearchBuilder {
  private criteria: MLSSearchCriteria = {};
  
  // Property Type Methods
  withPropertyType(type: PropertyType | PropertyType[]): MLSSearchBuilder {
    this.criteria.propertyType = type;
    return this;
  }
  
  // Price Methods
  withPriceRange(min?: number, max?: number): MLSSearchBuilder {
    if (min !== undefined) this.criteria.minPrice = min;
    if (max !== undefined) this.criteria.maxPrice = max;
    return this;
  }
  
  withMinPrice(price: number): MLSSearchBuilder {
    this.criteria.minPrice = price;
    return this;
  }
  
  withMaxPrice(price: number): MLSSearchBuilder {
    this.criteria.maxPrice = price;
    return this;
  }
  
  // Location Methods
  inCity(city: string | string[]): MLSSearchBuilder {
    this.criteria.city = city;
    return this;
  }
  
  inZipCode(zipCode: string | string[]): MLSSearchBuilder {
    this.criteria.zipCode = zipCode;
    return this;
  }
  
  inCounty(county: string): MLSSearchBuilder {
    this.criteria.county = county;
    return this;
  }
  
  // Property Size Methods
  withBedrooms(min?: number, max?: number): MLSSearchBuilder {
    if (min !== undefined) this.criteria.minBeds = min;
    if (max !== undefined) this.criteria.maxBeds = max;
    return this;
  }
  
  withBathrooms(min?: number, max?: number): MLSSearchBuilder {
    if (min !== undefined) this.criteria.minBaths = min;
    if (max !== undefined) this.criteria.maxBaths = max;
    return this;
  }
  
  withSquareFeet(min?: number, max?: number): MLSSearchBuilder {
    if (min !== undefined) this.criteria.minSqft = min;
    if (max !== undefined) this.criteria.maxSqft = max;
    return this;
  }
  
  // Feature Methods
  withFeatures(...features: PropertyFeature[]): MLSSearchBuilder {
    this.criteria.features = features;
    return this;
  }
  
  withPool(): MLSSearchBuilder {
    this.criteria.hasPool = true;
    return this;
  }
  
  withView(): MLSSearchBuilder {
    this.criteria.hasView = true;
    return this;
  }
  
  isWaterfront(): MLSSearchBuilder {
    this.criteria.waterfront = true;
    return this;
  }
  
  inGatedCommunity(): MLSSearchBuilder {
    this.criteria.gatedCommunity = true;
    return this;
  }
  
  // Listing Status Methods
  withStatus(status: ListingStatus | ListingStatus[]): MLSSearchBuilder {
    this.criteria.listingStatus = status;
    return this;
  }
  
  activeOnly(): MLSSearchBuilder {
    this.criteria.listingStatus = ListingStatus.Active;
    return this;
  }
  
  includePending(): MLSSearchBuilder {
    this.criteria.listingStatus = [ListingStatus.Active, ListingStatus.Pending];
    return this;
  }
  
  // Advanced Methods
  withKeywords(...keywords: string[]): MLSSearchBuilder {
    this.criteria.keywords = keywords;
    return this;
  }
  
  excludingKeywords(...keywords: string[]): MLSSearchBuilder {
    this.criteria.excludeKeywords = keywords;
    return this;
  }
  
  withMaxHOA(maxFee: number): MLSSearchBuilder {
    this.criteria.maxHOAFee = maxFee;
    return this;
  }
  
  withNoHOA(): MLSSearchBuilder {
    this.criteria.noHOA = true;
    return this;
  }
  
  // Build method
  build(): MLSSearchCriteria {
    return { ...this.criteria };
  }
  
  // Helper method to convert to URL parameters
  toUrlParams(): URLSearchParams {
    const params = new URLSearchParams();
    
    // Convert criteria to URL parameters
    Object.entries(this.criteria).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else if (typeof value === 'boolean') {
          params.append(key, value ? '1' : '0');
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    return params;
  }
  
  // Helper method to create a human-readable description
  toDescription(): string {
    const parts: string[] = [];
    
    if (this.criteria.propertyType) {
      const types = Array.isArray(this.criteria.propertyType) 
        ? this.criteria.propertyType.join(' or ') 
        : this.criteria.propertyType;
      parts.push(types);
    }
    
    if (this.criteria.minPrice || this.criteria.maxPrice) {
      const min = this.criteria.minPrice ? `$${this.criteria.minPrice.toLocaleString()}` : '';
      const max = this.criteria.maxPrice ? `$${this.criteria.maxPrice.toLocaleString()}` : '';
      if (min && max) {
        parts.push(`${min} - ${max}`);
      } else if (min) {
        parts.push(`${min}+`);
      } else if (max) {
        parts.push(`Under ${max}`);
      }
    }
    
    if (this.criteria.city) {
      const cities = Array.isArray(this.criteria.city) 
        ? this.criteria.city.join(', ') 
        : this.criteria.city;
      parts.push(`in ${cities}`);
    }
    
    if (this.criteria.minBeds) {
      parts.push(`${this.criteria.minBeds}+ beds`);
    }
    
    if (this.criteria.minBaths) {
      parts.push(`${this.criteria.minBaths}+ baths`);
    }
    
    return parts.join(' ') || 'All Properties';
  }
}

// Preset search templates
export const SearchTemplates = {
  starterHome: () => new MLSSearchBuilder()
    .withPropertyType([PropertyType.Residential, PropertyType.Condo, PropertyType.Townhouse])
    .withPriceRange(150000, 350000)
    .withBedrooms(2, 3)
    .withBathrooms(1)
    .activeOnly(),
  
  familyHome: () => new MLSSearchBuilder()
    .withPropertyType(PropertyType.Residential)
    .withPriceRange(300000, 600000)
    .withBedrooms(3)
    .withBathrooms(2)
    .withSquareFeet(1800)
    .activeOnly(),
  
  luxuryHome: () => new MLSSearchBuilder()
    .withPropertyType(PropertyType.Residential)
    .withMinPrice(800000)
    .withBedrooms(4)
    .withBathrooms(3)
    .withSquareFeet(3000)
    .withFeatures(
      PropertyFeature.GraniteCounters,
      PropertyFeature.StainlessAppliances,
      PropertyFeature.UpdatedKitchen
    )
    .withPool()
    .activeOnly(),
  
  investment: () => new MLSSearchBuilder()
    .withPropertyType([PropertyType.MultiFamily, PropertyType.Condo])
    .withPriceRange(200000, 500000)
    .activeOnly(),
  
  land: () => new MLSSearchBuilder()
    .withPropertyType(PropertyType.Land)
    .withMinPrice(50000)
    .activeOnly(),
  
  recentlyReduced: () => new MLSSearchBuilder()
    .withPropertyType(PropertyType.Residential)
    .activeOnly()
    .build() // Note: priceReduced flag would need to be set separately
};

// Export convenience function
export function createMLSSearch(): MLSSearchBuilder {
  return new MLSSearchBuilder();
}
