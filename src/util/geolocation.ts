import { useState } from "react";

type CurrentLocation = {
  lat: number;
  lng: number;
  height: number;
};

export const useGeolocation = (): CurrentLocation | undefined => {
  const [location, setLocation] = useState<CurrentLocation>();

  const handleSuccess = (position: any) => {
    const { lat, lng, height } = position.coords;
    setLocation({
      lat,
      lng,
      height,
    });
  };

  navigator.geolocation.getCurrentPosition(handleSuccess);

  return location;
};
