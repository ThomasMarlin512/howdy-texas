# Route map: sources and method

Snapshot retrieved on 14 November 2026. The map compares the four existing route proposals; choosing a map option does not confirm a route, change the shared itinerary, or write group data.

## Road estimates

- Provider: OSRM car routing, operated by FOSSGIS: https://routing.openstreetmap.de/about.html
- API method: https://project-osrm.org/docs/v5.24.0/api/#route-service
- Underlying data and license: © OpenStreetMap contributors, ODbL: https://www.openstreetmap.org/copyright
- Each directed segment's full request URL, distance in meters, duration in seconds and simplified road geometry are stored in `dist/road-data.js`. Thirteen unique requests were made at less than one request per second. The website does not call the routing API.
- Coordinates are longitude, latitude in WGS84. The map uses Leaflet's standard Web Mercator basemap; coordinates are reversed only at the Leaflet LatLng boundary.
- Points are approximate city centers, not hotels or airports. Fredericksburg represents Hill Country. All source request points snapped to a drivable road within 500 m; tests verify route endpoints are within 1 km of their intended cities.
- Distances and durations are calculated road routes, not straight-line estimates. Geometry is OSRM's simplified overview; it is not a turn-by-turn navigation trace.
- Display rounds distance to 5 km and duration upward to 15 minutes. Totals are calculated from the raw values before display rounding. Direction matters: San Antonio–Austin uses its own segment.
- A long-drive warning means strictly more than four hours of modeled driving. Traffic, breaks, hotel access, optional excursions, airport transfers, weather and future road conditions are excluded. There is no live-traffic or April 2027 forecast claim.
- Nights and dates come directly from `routeSchedule`, preserving 8/10/12 nights and 10/12/14 inclusive travel days. The fixed example starts on 22 April 2027; the shared date vote does not silently change a proposal.
- For changed routes, update the cached data through ordinary low-volume requests with the documented User-Agent, validate coordinate order/endpoints and directed coverage, and replace this snapshot. Do not overwrite it with approximate distances while retaining source claims.

## Rendering and availability

Leaflet 1.9.4 stable, loaded on demand from unpkg with pinned version and SHA-256 integrity checks. Reference: https://leafletjs.com/reference-1.9.4.html . The library's BSD-2-Clause notice remains in the served package.

Tiles are loaded only for the viewed map from https://tile.openstreetmap.org/{z}/{x}/{y}.png using ordinary browser cache/referrer behavior. No tile archive or offline prefetch is created. Visible attribution and a map-error link remain available. Tile policy: https://operations.osmfoundation.org/policies/tiles/ .

No API keys or personal member, ticket, booking, or hotel data are sent to the routing service or tile provider. Normal map requests expose the visitor's ordinary network metadata to the tile/CDN services.

Route points and road lines scale with the map; numbered markers retain screen size. Mouse-wheel zoom is disabled to preserve page scrolling. On coarse-pointer devices, dragging starts disabled; explicit zoom controls, pinch zoom, a drag toggle and reset control are provided. Stop and leg lists offer keyboard-accessible alternatives to map clicks. Above-four-hour legs use a dashed line, text warning and color, not color alone.

If CDN or tiles are unavailable, the route selector, distances, overnight list and external per-leg directions links remain usable. Only two endpoints are sent to each Google Maps directions link, avoiding mobile waypoint truncation.

## Navigation

Five main sections: Start, Route, Buchungen, Unterlagen, Gruppe. The twelve existing pages are grouped in section links without changing their hashes or login requirements. Old aliases remain supported. Tests verify complete and unique page coverage.

## Validation

The existing test suite and new map/navigation checks cover all four routes, directed segments, city endpoint proximity, date/night continuity, raw totals, the four-hour threshold, coordinate order, directions URLs and legacy hash navigation. Live browser visual/gesture checks were unavailable in this environment; static and data tests do not substitute for a mobile interaction check.
