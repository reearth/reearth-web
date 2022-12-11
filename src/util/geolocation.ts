import { useState } from "react";

type CurrentLocation = {
  lat: number;
  lng: number;
  height: number;
};
const initialLocation: CurrentLocation = {
  lat: 5.70249,
  lng: 39.7622,
  height: 5000,
};
const goSuccess = (position: GeolocationPosition) => {
  return {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    heigh: position.coords.altitude ?? 5000,
  };
};

const goError = (err: GeolocationPositionError) => {
  console.error("Error Code = " + err.code + " - " + err.message);
  return initialLocation;
};

const getPosition = () =>
  new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(
      pos => resolve(goSuccess(pos)),
      err => reject(goError(err)),
    ),
  );
export const useGeolocation = (): CurrentLocation | undefined => {
  const [location, setLocation] = useState<CurrentLocation>();

  getPosition()
    .then((position: CurrentLocation | any) => {
      setLocation({ ...position });
    })
    .catch(error => console.error("error:", error.message));
  return location;
};
