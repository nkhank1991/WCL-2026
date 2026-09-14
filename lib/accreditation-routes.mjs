// Only these operations cross the website-to-private-service boundary.
export function allowedAccreditationRoute(route) {
  return /^(status|auth\/(session|login|accept|logout)|accreditation\/(config|apply|status)|admin\/(config|audit|scan|accreditations(?:\/[a-f0-9]{24})?|media(?:\/[a-f0-9]{24})?|staff(?:\/(?:[a-f0-9]{24}|invite|reset))?))$/.test(route);
}
