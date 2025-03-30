import React, { createContext, useContext, useState, useEffect } from "react";
import { Coordinates, LocationData, getCurrentLocation, reverseGeocode } from "@/lib/location";

interface LocationContextType {
  locationData: LocationData;
  setLocationData: React.Dispatch<React.SetStateAction<LocationData>>;
  getLocationPermission: () => Promise<void>;
  setManualLocation: (address: string, coordinates?: Coordinates) => void;
  isLoadingLocation: boolean;
}

const defaultLocationData: LocationData = {
  coordinates: null,
  address: "",
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locationData, setLocationData] = useState<LocationData>(defaultLocationData);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Initialize from localStorage if available
  useEffect(() => {
    const savedLocation = localStorage.getItem("locationData");
    if (savedLocation) {
      setLocationData(JSON.parse(savedLocation));
    }
  }, []);

  // Save to localStorage when location changes
  useEffect(() => {
    if (locationData.coordinates || locationData.address) {
      localStorage.setItem("locationData", JSON.stringify(locationData));
      
      // Mark that location has been set at least once
      localStorage.setItem("locationSet", "true");
    }
  }, [locationData]);

  const getLocationPermission = async () => {
    setIsLoadingLocation(true);
    try {
      const coords = await getCurrentLocation();
      const address = await reverseGeocode(coords);
      setLocationData({
        coordinates: coords,
        address,
      });
    } catch (error) {
      console.error("Error getting location:", error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const setManualLocation = (address: string, coordinates?: Coordinates) => {
    setLocationData({
      coordinates: coordinates || null,
      address,
    });
  };

  return (
    <LocationContext.Provider
      value={{
        locationData,
        setLocationData,
        getLocationPermission,
        setManualLocation,
        isLoadingLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
