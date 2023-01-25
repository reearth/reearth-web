export interface GTFS {
  header?: Header | null;
  entities?: Entity[];
}

export interface Header {
  gtfs_realtime_version?: string;
  incrementality?: HeaderIncrementality;
  timestamp?: number;
}

export enum HeaderIncrementality {
  FULL_DATASET,
  DIFFERENTIAL,
}

export interface Entity {
  id?: string;
  is_deleted?: boolean;
  trip_update?: TripUpdate | null;
  vehicle?: VehiclePosition | null;
  alert?: Alert | null;
}

export interface TripUpdate {
  trip?: TripDescriptor | null;
  vehicle?: VehicleDescriptor | null;
  stop_time_update?: StopTimeUpdate[];
  timestamp?: number;
  delay?: number;
}

export interface StopTimeEvent {
  delay?: number;
  time?: number;
  uncertainty?: number;
}

export interface StopTimeUpdate {
  stop_sequence?: number;
  stop_id?: string;
  arrival?: StopTimeEvent | null;
  departure?: StopTimeEvent | null;
  schedule_relationship?: StopTimeUpdateScheduleRelationship;
}

export enum StopTimeUpdateScheduleRelationship {
  SCHEDULED,
  SKIPPED,
  NO_DATA,
}

export interface VehiclePosition {
  trip?: TripDescriptor | null;
  vehicle?: VehicleDescriptor | null;
  position?: Position | null;
  current_stop_sequence?: number;
  stop_id?: string;
  current_status?: VehicleStopStatus;
  timestamp?: number;
  congestion_level?: CongestionLevel;
  occupancy_status?: OccupancyStatus;
}

export enum VehicleStopStatus {
  INCOMING_AT,
  STOPPED_AT,
  IN_TRANSIT_TO,
}

export enum CongestionLevel {
  UNKNOWN_CONGESTION_LEVEL,
  RUNNING_SMOOTHLY,
  STOP_AND_GO,
  CONGESTION,
  SEVERE_CONGESTION,
}

export enum OccupancyStatus {
  EMPTY,
  MANY_SEATS_AVAILABLE,
  FEW_SEATS_AVAILABLE,
  STANDING_ROOM_ONLY,
  CRUSHED_STANDING_ROOM_ONLY,
  FULL,
  NOT_ACCEPTING_PASSENGERS,
}

export interface Alert {
  active_period?: TimeRange[];
  informed_entity?: EntitySelector[];
  cause?: AlertCause;
  effect?: AlertEffect;
  url?: TranslatedString | null;
  header_text?: TranslatedString | null;
  description_text?: TranslatedString | null;
}

export enum AlertCause {
  UNKNOWN_CAUSE = 1,
  OTHER_CAUSE,
  TECHNICAL_PROBLEM,
  STRIKE,
  DEMONSTRATION,
  ACCIDENT,
  HOLIDAY,
  WEATHER,
  MAINTENANCE,
  CONSTRUCTION,
  POLICE_ACTIVITY,
  MEDICAL_EMERGENCY,
}

export enum AlertEffect {
  NO_SERVICE = 1,
  REDUCED_SERVICE,
  SIGNIFICANT_DELAYS,
  ADDITIONAL_SERVICE,
  MODIFIED_SERVICE,
  OTHER_EFFECT,
  UNKNOWN_EFFECT,
  STOP_MOVED,
}

export interface TimeRange {
  start?: number;
  end?: number;
}

export interface Position {
  latitude?: number;
  longitude?: number;
  bearing?: number;
  odometer?: number;
  speed?: number;
}

export interface TripDescriptor {
  trip_id?: string;
  route_id?: string;
  direction_id?: number;
  start_time?: string;
  start_date?: string;
  schedule_relationship?: TripDescriptorScheduleRelationship;
}

export enum TripDescriptorScheduleRelationship {
  SCHEDULED,
  ADDED,
  UNSCHEDULED,
  CANCELED,
}

export interface VehicleDescriptor {
  id?: string;
  label?: string;
  license_plate?: string;
}

export interface EntitySelector {
  agency_id?: string;
  route_id?: string;
  route_type?: number;
  trip?: TripDescriptor | null;
  stop_id?: string;
}

export interface TranslatedString {
  translation?: Translation[];
}

export interface Translation {
  text?: string;
  language?: string;
}

export interface Trips {
  timestamp?: number;
  trips: Trip[];
}

export interface Trip {
  id: string;
  properties: VehiclePosition;
  path: [number, number][];
  timestamps: number[];
}
