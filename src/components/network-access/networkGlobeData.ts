import { LAND_DOTS_BASE64 } from "./globeLandDots";

export type LatLng = { lat: number; lng: number };

export type LoadPressure = "Low" | "Medium" | "High";

export type ProxyHub = LatLng & {
  id: "us" | "eu" | "sg";
  code: string;
  city: string;
  awsRegion: string;
  pressure: LoadPressure;
};

export const PROXY_HUBS: ProxyHub[] = [
  {
    id: "us",
    code: "US EAST",
    city: "Ashburn",
    lat: 39.04,
    lng: -77.49,
    awsRegion: "us-east-1",
    pressure: "Low",
  },
  {
    id: "eu",
    code: "EU CENTRAL",
    city: "Frankfurt",
    lat: 50.11,
    lng: 8.68,
    awsRegion: "eu-central-1",
    pressure: "High",
  },
  {
    id: "sg",
    code: "ASIA PACIFIC",
    city: "Singapore",
    lat: 1.35,
    lng: 103.82,
    awsRegion: "ap-southeast-1",
    pressure: "Medium",
  },
];

/** Regional anchors — wide spreads so nodes fill continents, not city blocks. */
const SEEDS: (LatLng & { spread: number; count: number })[] = [
  // North America
  { lat: 40.7, lng: -74, spread: 8, count: 22 },
  { lat: 34, lng: -118.2, spread: 7.5, count: 20 },
  { lat: 37.8, lng: -122.4, spread: 6, count: 14 },
  { lat: 41.9, lng: -87.6, spread: 7, count: 16 },
  { lat: 43.7, lng: -79.4, spread: 5, count: 10 },
  { lat: 47.6, lng: -122.3, spread: 5.5, count: 10 },
  { lat: 29.8, lng: -95.4, spread: 7, count: 14 },
  { lat: 33.4, lng: -112.1, spread: 6, count: 12 },
  { lat: 25.8, lng: -80.2, spread: 5, count: 10 },
  { lat: 42.4, lng: -71.1, spread: 5, count: 10 },
  { lat: 39.1, lng: -94.6, spread: 6.5, count: 10 },
  { lat: 32.8, lng: -96.8, spread: 6, count: 12 },
  { lat: 45.5, lng: -73.6, spread: 5, count: 8 },
  { lat: 49.3, lng: -123.1, spread: 5, count: 8 },
  { lat: 19.4, lng: -99.1, spread: 6, count: 12 },
  { lat: 20.7, lng: -103.3, spread: 5, count: 8 },
  { lat: 33.7, lng: -84.4, spread: 6, count: 10 },
  { lat: 39.95, lng: -75.2, spread: 4.5, count: 8 },
  { lat: 38.9, lng: -77, spread: 5, count: 8 },
  { lat: 36.2, lng: -115.1, spread: 5, count: 8 },
  { lat: 32.7, lng: -117.2, spread: 4.5, count: 8 },
  { lat: 45.5, lng: -122.7, spread: 4.5, count: 6 },
  { lat: 44.98, lng: -93.3, spread: 5.5, count: 8 },
  { lat: 39.7, lng: -104.99, spread: 5.5, count: 8 },
  { lat: 30.3, lng: -97.7, spread: 5.5, count: 8 },
  { lat: 35.1, lng: -90, spread: 5, count: 6 },
  { lat: 41.3, lng: -96, spread: 5, count: 6 },
  { lat: 35.5, lng: -97.5, spread: 5, count: 6 },
  { lat: 43.1, lng: -89.4, spread: 4.5, count: 5 },
  { lat: 36.2, lng: -86.8, spread: 4.5, count: 5 },
  // Canada — fill east–west + prairies
  { lat: 45.4, lng: -75.7, spread: 6, count: 10 },
  { lat: 46.8, lng: -71.2, spread: 5.5, count: 8 },
  { lat: 44.6, lng: -63.6, spread: 5, count: 6 },
  { lat: 53.5, lng: -113.5, spread: 8, count: 12 },
  { lat: 51.0, lng: -114.1, spread: 7, count: 10 },
  { lat: 49.9, lng: -97.1, spread: 8, count: 10 },
  { lat: 52.1, lng: -106.7, spread: 7, count: 8 },
  { lat: 50.4, lng: -104.6, spread: 6.5, count: 6 },
  { lat: 48.4, lng: -89.2, spread: 6, count: 6 },
  { lat: 62.5, lng: -114.4, spread: 7, count: 6 },
  { lat: 60.7, lng: -135.1, spread: 6, count: 5 },
  { lat: 53.9, lng: -122.8, spread: 6.5, count: 6 },
  { lat: 46.5, lng: -84.3, spread: 5, count: 5 },
  // Greenland
  { lat: 64.2, lng: -51.7, spread: 5, count: 5 },
  { lat: 76.5, lng: -68.7, spread: 4, count: 3 },
  // South America — coasts + interior
  { lat: -23.5, lng: -46.6, spread: 9, count: 18 },
  { lat: -34.6, lng: -58.4, spread: 8, count: 14 },
  { lat: -12, lng: -77, spread: 5.5, count: 8 },
  { lat: -33.4, lng: -70.7, spread: 6, count: 10 },
  { lat: 4.7, lng: -74.1, spread: 7, count: 12 },
  { lat: -22.9, lng: -43.2, spread: 7, count: 12 },
  { lat: -15.8, lng: -47.9, spread: 8, count: 10 },
  { lat: -25.4, lng: -49.3, spread: 6, count: 8 },
  { lat: 10.5, lng: -66.9, spread: 5.5, count: 6 },
  { lat: -3.7, lng: -38.5, spread: 6, count: 8 },
  { lat: -8.1, lng: -34.9, spread: 5.5, count: 6 },
  { lat: -3.1, lng: -60.0, spread: 8, count: 10 },
  { lat: -1.5, lng: -48.5, spread: 6, count: 6 },
  { lat: -19.9, lng: -43.9, spread: 6.5, count: 8 },
  { lat: -30.0, lng: -51.2, spread: 6, count: 7 },
  { lat: -12.97, lng: -38.5, spread: 5.5, count: 6 },
  { lat: -16.5, lng: -68.1, spread: 6, count: 7 },
  { lat: -25.3, lng: -57.6, spread: 5.5, count: 6 },
  { lat: -34.9, lng: -56.2, spread: 5, count: 5 },
  { lat: -0.2, lng: -78.5, spread: 5.5, count: 6 },
  { lat: -2.2, lng: -79.9, spread: 5, count: 5 },
  { lat: -31.4, lng: -64.2, spread: 6.5, count: 7 },
  { lat: -38.7, lng: -62.3, spread: 6, count: 5 },
  { lat: 8.0, lng: -79.5, spread: 4.5, count: 4 },
  // Europe
  { lat: 51.5, lng: -0.1, spread: 5.5, count: 16 },
  { lat: 48.9, lng: 2.3, spread: 5, count: 14 },
  { lat: 52.5, lng: 13.4, spread: 5.5, count: 14 },
  { lat: 41.4, lng: 2.2, spread: 4.5, count: 8 },
  { lat: 59.3, lng: 18.1, spread: 5, count: 8 },
  { lat: 52.4, lng: 4.9, spread: 4, count: 8 },
  { lat: 45.5, lng: 9.2, spread: 4.5, count: 8 },
  { lat: 48.2, lng: 16.4, spread: 4.5, count: 7 },
  { lat: 38.7, lng: -9.1, spread: 4, count: 7 },
  { lat: 40.4, lng: -3.7, spread: 5, count: 10 },
  { lat: 53.3, lng: -6.3, spread: 4, count: 6 },
  { lat: 55.7, lng: 12.6, spread: 4, count: 6 },
  { lat: 60.2, lng: 24.9, spread: 4.5, count: 5 },
  { lat: 50.1, lng: 14.4, spread: 4, count: 6 },
  { lat: 47.5, lng: 19, spread: 4, count: 6 },
  { lat: 44.4, lng: 26.1, spread: 4, count: 5 },
  { lat: 37.98, lng: 23.7, spread: 4, count: 6 },
  { lat: 41, lng: 28.9, spread: 5, count: 8 },
  { lat: 50.45, lng: 30.5, spread: 5, count: 6 },
  { lat: 50.1, lng: 8.7, spread: 4, count: 8 },
  { lat: 53.55, lng: 9.99, spread: 4, count: 6 },
  { lat: 48.1, lng: 11.6, spread: 4, count: 6 },
  { lat: 45.8, lng: 4.8, spread: 3.5, count: 5 },
  { lat: 43.3, lng: 5.4, spread: 3.5, count: 5 },
  { lat: 41.9, lng: 12.5, spread: 4.5, count: 8 },
  { lat: 45.07, lng: 7.7, spread: 3.5, count: 4 },
  { lat: 50.8, lng: 4.4, spread: 3.5, count: 5 },
  { lat: 47.4, lng: 8.5, spread: 3.5, count: 4 },
  { lat: 59.9, lng: 10.8, spread: 4, count: 5 },
  { lat: 54.7, lng: 25.3, spread: 3.5, count: 4 },
  { lat: 56.9, lng: 24.1, spread: 3.5, count: 4 },
  { lat: 42.7, lng: 23.3, spread: 3.5, count: 4 },
  { lat: 45.8, lng: 15.98, spread: 3.5, count: 4 },
  { lat: 53.4, lng: -2.2, spread: 4.5, count: 8 },
  { lat: 55.9, lng: -3.2, spread: 4, count: 5 },
  { lat: 51.5, lng: -2.6, spread: 3.5, count: 4 },
  // Russia — light continental ribbon + Siberia
  { lat: 55.8, lng: 37.6, spread: 7, count: 10 },
  { lat: 59.9, lng: 30.3, spread: 5.5, count: 6 },
  { lat: 56.8, lng: 60.6, spread: 8, count: 8 },
  { lat: 55.0, lng: 82.9, spread: 8, count: 7 },
  { lat: 56.0, lng: 92.9, spread: 7, count: 6 },
  { lat: 52.3, lng: 104.3, spread: 7, count: 6 },
  { lat: 43.1, lng: 131.9, spread: 5.5, count: 5 },
  { lat: 54.7, lng: 20.5, spread: 4.5, count: 4 },
  { lat: 47.2, lng: 39.7, spread: 5, count: 4 },
  { lat: 62.0, lng: 129.7, spread: 7, count: 6 },
  { lat: 61.7, lng: 90.1, spread: 7, count: 5 },
  { lat: 69.3, lng: 88.2, spread: 5.5, count: 4 },
  { lat: 59.6, lng: 150.8, spread: 5.5, count: 4 },
  { lat: 53.0, lng: 158.6, spread: 5, count: 4 },
  { lat: 64.7, lng: 177.5, spread: 4.5, count: 3 },
  // Kazakhstan
  { lat: 43.2, lng: 76.9, spread: 7, count: 10 },
  { lat: 51.2, lng: 71.4, spread: 8, count: 10 },
  { lat: 42.3, lng: 69.6, spread: 6, count: 6 },
  { lat: 49.8, lng: 73.1, spread: 7, count: 6 },
  { lat: 50.3, lng: 57.2, spread: 6.5, count: 5 },
  // Middle East
  { lat: 25.2, lng: 55.3, spread: 5, count: 10 },
  { lat: 24.7, lng: 46.7, spread: 5.5, count: 8 },
  { lat: 32.1, lng: 34.8, spread: 3.5, count: 6 },
  { lat: 33.9, lng: 35.5, spread: 3.5, count: 4 },
  { lat: 29.4, lng: 48, spread: 4, count: 5 },
  { lat: 25.3, lng: 51.5, spread: 3.5, count: 4 },
  { lat: 31.95, lng: 35.9, spread: 3.5, count: 4 },
  { lat: 33.3, lng: 44.4, spread: 5, count: 5 },
  { lat: 23.6, lng: 58.5, spread: 4, count: 4 },
  { lat: 26.2, lng: 50.6, spread: 3, count: 3 },
  { lat: 35.7, lng: 51.4, spread: 5.5, count: 6 },
  { lat: 39.9, lng: 32.9, spread: 5, count: 5 },
  { lat: 38.4, lng: 27.1, spread: 4, count: 4 },
  // North Africa
  { lat: 30, lng: 31.2, spread: 5, count: 8 },
  { lat: 31.2, lng: 29.9, spread: 4, count: 5 },
  { lat: 36.8, lng: 10.2, spread: 4, count: 5 },
  { lat: 33.6, lng: -7.6, spread: 4.5, count: 6 },
  { lat: 36.75, lng: 3.06, spread: 5, count: 6 },
  { lat: 34.0, lng: -6.8, spread: 4, count: 4 },
  { lat: 32.9, lng: 13.2, spread: 4.5, count: 4 },
  { lat: 15.5, lng: 32.5, spread: 5, count: 5 },
  // West Africa
  { lat: 6.5, lng: 3.4, spread: 5.5, count: 10 },
  { lat: 9.1, lng: 7.5, spread: 5, count: 6 },
  { lat: 5.6, lng: -0.2, spread: 4.5, count: 5 },
  { lat: 14.7, lng: -17.4, spread: 5, count: 6 },
  { lat: 5.3, lng: -4.0, spread: 5, count: 6 },
  { lat: 12.6, lng: -8.0, spread: 5, count: 5 },
  { lat: 12.4, lng: -1.5, spread: 4.5, count: 4 },
  { lat: 4.05, lng: 9.7, spread: 4.5, count: 5 },
  { lat: 6.1, lng: 1.2, spread: 4, count: 3 },
  { lat: 6.5, lng: 2.4, spread: 4, count: 3 },
  { lat: 9.5, lng: -13.7, spread: 4, count: 3 },
  { lat: 12.0, lng: 8.5, spread: 4.5, count: 4 },
  // East Africa
  { lat: -1.3, lng: 36.8, spread: 5.5, count: 8 },
  { lat: -6.2, lng: 35.7, spread: 5, count: 5 },
  { lat: 9.0, lng: 38.7, spread: 5.5, count: 7 },
  { lat: 0.3, lng: 32.6, spread: 4.5, count: 5 },
  { lat: -1.9, lng: 30.1, spread: 4, count: 4 },
  { lat: -3.4, lng: 29.9, spread: 3.5, count: 3 },
  { lat: -15.8, lng: 35.0, spread: 4.5, count: 4 },
  { lat: 11.6, lng: 43.1, spread: 3.5, count: 3 },
  // Central Africa
  { lat: -4.3, lng: 15.3, spread: 5.5, count: 6 },
  { lat: -11.7, lng: 27.5, spread: 5, count: 4 },
  { lat: 3.9, lng: 11.5, spread: 4.5, count: 4 },
  { lat: 0.4, lng: 9.5, spread: 4, count: 3 },
  // Southern Africa
  { lat: -26.2, lng: 28, spread: 6.5, count: 12 },
  { lat: -33.9, lng: 18.4, spread: 5, count: 6 },
  { lat: -29.9, lng: 31.0, spread: 4.5, count: 5 },
  { lat: -15.4, lng: 28.3, spread: 4.5, count: 5 },
  { lat: -17.8, lng: 31.0, spread: 5, count: 5 },
  { lat: -25.9, lng: 32.6, spread: 4.5, count: 4 },
  { lat: -22.6, lng: 17.1, spread: 5, count: 4 },
  { lat: -8.8, lng: 13.2, spread: 5, count: 5 },
  { lat: -24.7, lng: 25.9, spread: 4.5, count: 4 },
  { lat: -18.9, lng: 47.5, spread: 5, count: 5 },
  { lat: -20.2, lng: 57.5, spread: 3, count: 3 },
  // Central America & Caribbean
  { lat: 14.6, lng: -90.5, spread: 4.5, count: 5 },
  { lat: 9.9, lng: -84.1, spread: 4, count: 5 },
  { lat: 14.1, lng: -87.2, spread: 4, count: 4 },
  { lat: 13.7, lng: -89.2, spread: 3.5, count: 3 },
  { lat: 12.1, lng: -86.3, spread: 3.5, count: 3 },
  { lat: 9.0, lng: -79.5, spread: 3.5, count: 4 },
  { lat: 18.5, lng: -69.9, spread: 4, count: 5 },
  { lat: 23.1, lng: -82.4, spread: 4.5, count: 5 },
  { lat: 18.4, lng: -66.1, spread: 3, count: 3 },
  { lat: 18.0, lng: -76.8, spread: 3.5, count: 4 },
  { lat: 10.7, lng: -61.5, spread: 3, count: 3 },
  { lat: 25.0, lng: -77.3, spread: 3, count: 3 },
  // Central Asia & Caucasus
  { lat: 41.3, lng: 69.2, spread: 5.5, count: 6 },
  { lat: 42.9, lng: 74.6, spread: 4.5, count: 4 },
  { lat: 38.0, lng: 58.4, spread: 4.5, count: 3 },
  { lat: 40.4, lng: 49.9, spread: 4.5, count: 5 },
  { lat: 41.7, lng: 44.8, spread: 4, count: 4 },
  { lat: 40.2, lng: 44.5, spread: 3.5, count: 3 },
  { lat: 47.9, lng: 106.9, spread: 6, count: 5 },
  // Eastern / SE Europe extras
  { lat: 52.2, lng: 21.0, spread: 5, count: 6 },
  { lat: 44.8, lng: 20.5, spread: 4.5, count: 5 },
  { lat: 42.0, lng: 21.4, spread: 3.5, count: 3 },
  { lat: 41.3, lng: 19.8, spread: 3.5, count: 3 },
  { lat: 43.9, lng: 18.4, spread: 3.5, count: 3 },
  { lat: 48.1, lng: 17.1, spread: 3.5, count: 3 },
  { lat: 47.0, lng: 28.9, spread: 3.5, count: 3 },
  { lat: 64.1, lng: -21.9, spread: 4, count: 4 },
  // Oceania extras
  { lat: -34.9, lng: 138.6, spread: 5, count: 5 },
  { lat: -12.5, lng: 130.8, spread: 4.5, count: 3 },
  { lat: -9.4, lng: 147.2, spread: 4.5, count: 4 },
  { lat: -18.1, lng: 178.4, spread: 3.5, count: 3 },
  // Asia-Pacific
  { lat: 28.6, lng: 77.2, spread: 7, count: 14 },
  { lat: 19.1, lng: 72.9, spread: 6, count: 12 },
  { lat: 13, lng: 77.6, spread: 5.5, count: 10 },
  { lat: 13.1, lng: 80.3, spread: 5, count: 8 },
  { lat: 22.6, lng: 88.4, spread: 5, count: 8 },
  { lat: 17.4, lng: 78.5, spread: 5, count: 6 },
  { lat: 11.6, lng: 104.9, spread: 4.5, count: 4 },
  { lat: 17.97, lng: 102.6, spread: 4, count: 3 },
  // China — coast + inland + north/west
  { lat: 22.3, lng: 114.2, spread: 5, count: 10 },
  { lat: 31.2, lng: 121.5, spread: 7, count: 14 },
  { lat: 39.9, lng: 116.4, spread: 8, count: 14 },
  { lat: 23.1, lng: 113.3, spread: 5.5, count: 10 },
  { lat: 30.6, lng: 104.1, spread: 7, count: 12 },
  { lat: 25, lng: 121.5, spread: 4, count: 8 },
  { lat: 30.6, lng: 114.3, spread: 7, count: 10 },
  { lat: 34.3, lng: 108.9, spread: 7, count: 10 },
  { lat: 29.6, lng: 106.5, spread: 6.5, count: 9 },
  { lat: 36.1, lng: 120.4, spread: 6, count: 8 },
  { lat: 32.1, lng: 118.8, spread: 5.5, count: 7 },
  { lat: 38.9, lng: 121.6, spread: 5.5, count: 6 },
  { lat: 45.8, lng: 126.5, spread: 7, count: 8 },
  { lat: 43.8, lng: 125.3, spread: 6, count: 6 },
  { lat: 25.0, lng: 102.7, spread: 6.5, count: 7 },
  { lat: 26.1, lng: 119.3, spread: 5, count: 5 },
  { lat: 28.2, lng: 112.9, spread: 5.5, count: 6 },
  { lat: 22.8, lng: 108.3, spread: 5.5, count: 6 },
  { lat: 43.8, lng: 87.6, spread: 8, count: 8 },
  { lat: 36.6, lng: 101.8, spread: 6, count: 5 },
  { lat: 38.5, lng: 106.2, spread: 5.5, count: 5 },
  { lat: 41.8, lng: 123.4, spread: 5.5, count: 5 },
  { lat: 35.7, lng: 139.7, spread: 5.5, count: 14 },
  { lat: 34.7, lng: 135.5, spread: 4.5, count: 8 },
  { lat: 35.2, lng: 136.9, spread: 4, count: 5 },
  { lat: 43.1, lng: 141.4, spread: 4.5, count: 5 },
  { lat: 37.6, lng: 126.9, spread: 5, count: 10 },
  { lat: 35.2, lng: 129.1, spread: 4, count: 6 },
  { lat: 1.3, lng: 103.8, spread: 4, count: 8 },
  { lat: 3.1, lng: 101.7, spread: 5, count: 8 },
  { lat: 13.8, lng: 100.5, spread: 5.5, count: 10 },
  { lat: -6.2, lng: 106.8, spread: 6, count: 12 },
  { lat: 14.6, lng: 121, spread: 5, count: 10 },
  { lat: -33.9, lng: 151.2, spread: 6, count: 10 },
  { lat: -37.8, lng: 144.9, spread: 5.5, count: 8 },
  { lat: -27.5, lng: 153, spread: 5, count: 6 },
  { lat: -31.95, lng: 115.9, spread: 5, count: 5 },
  { lat: -36.8, lng: 174.8, spread: 4.5, count: 5 },
  { lat: -41.3, lng: 174.8, spread: 4, count: 4 },
  { lat: 21, lng: 105.8, spread: 5, count: 8 },
  { lat: 10.8, lng: 106.7, spread: 5, count: 8 },
  { lat: 16.8, lng: 96.2, spread: 4.5, count: 5 },
  { lat: 27.7, lng: 85.3, spread: 4, count: 5 },
  { lat: 23.8, lng: 90.4, spread: 4.5, count: 6 },
  { lat: 6.9, lng: 79.9, spread: 4, count: 5 },
  { lat: 24.9, lng: 67, spread: 5, count: 6 },
  { lat: 31.5, lng: 74.3, spread: 4.5, count: 5 },
  { lat: 12.9, lng: 100.9, spread: 4, count: 4 },
  { lat: -7.8, lng: 110.4, spread: 5, count: 6 },
  { lat: 21.3, lng: -157.8, spread: 3, count: 4 },
];

function hash(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const LAND_CELL = 2;
/** Max degrees from a land sample — beyond this the candidate is ocean. */
const LAND_SNAP_DEG = 1.15;

function decodeLandDots(): LatLng[] {
  const binary = atob(LAND_DOTS_BASE64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  const packed = new Int16Array(bytes.buffer);
  const dots: LatLng[] = [];
  for (let i = 0; i < packed.length; i += 2) {
    dots.push({ lat: packed[i] / 100, lng: packed[i + 1] / 100 });
  }
  return dots;
}

function buildLandGrid(dots: LatLng[]) {
  const grid = new Map<string, LatLng[]>();
  for (const dot of dots) {
    const key = `${Math.floor(dot.lat / LAND_CELL)},${Math.floor(dot.lng / LAND_CELL)}`;
    const bucket = grid.get(key);
    if (bucket) bucket.push(dot);
    else grid.set(key, [dot]);
  }
  return grid;
}

function snapToLand(
  lat: number,
  lng: number,
  grid: Map<string, LatLng[]>,
): LatLng | null {
  const maxDistSq = LAND_SNAP_DEG * LAND_SNAP_DEG;
  let best: LatLng | null = null;
  let bestDist = maxDistSq;
  const i0 = Math.floor(lat / LAND_CELL);
  const j0 = Math.floor(lng / LAND_CELL);
  for (let di = -1; di <= 1; di++) {
    for (let dj = -1; dj <= 1; dj++) {
      const bucket = grid.get(`${i0 + di},${j0 + dj}`);
      if (!bucket) continue;
      for (const dot of bucket) {
        const dLat = dot.lat - lat;
        const dLng = dot.lng - lng;
        const dist = dLat * dLat + dLng * dLng;
        if (dist < bestDist) {
          bestDist = dist;
          best = dot;
        }
      }
    }
  }
  return best;
}

function expandNodes() {
  const landGrid = buildLandGrid(decodeLandDots());
  const nodes: LatLng[] = [];
  const used = new Set<string>();
  let salt = 1;

  const take = (point: LatLng) => {
    const key = `${point.lat.toFixed(2)},${point.lng.toFixed(2)}`;
    if (used.has(key)) return false;
    used.add(key);
    nodes.push(point);
    return true;
  };

  for (const seed of SEEDS) {
    const seedLand = snapToLand(seed.lat, seed.lng, landGrid) ?? seed;
    take(seedLand);

    let placed = 0;
    let attempts = 0;
    const maxAttempts = seed.count * 32;
    while (placed < seed.count && attempts < maxAttempts) {
      attempts++;
      const a = hash(salt++) * Math.PI * 2;
      // sqrt → even disk fill instead of clustering at the seed
      const r = Math.sqrt(hash(salt++)) * seed.spread;
      const latScale = Math.cos((seed.lat * Math.PI) / 180);
      const lat = Math.max(-60, Math.min(78, seed.lat + Math.sin(a) * r));
      const lng = seed.lng + (Math.cos(a) * r) / Math.max(0.35, latScale);
      const land = snapToLand(lat, lng, landGrid);
      if (land && take(land)) placed++;
    }
  }
  return nodes;
}

export const NODE_LOCATIONS: LatLng[] = expandNodes();

/** Subset of nodes that draw arcs to hubs (keeps scene light). */
export const ROUTE_NODES: LatLng[] = NODE_LOCATIONS.filter(
  (_, index) => index % 8 === 0,
);
