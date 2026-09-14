// Only these operations cross the website-to-private-service boundary.
export function allowedAccreditationRoute(route) {
  return /^(status|auth\/(session|login|accept|logout)|accreditation\/(config|apply|status|correct|upload)|admin\/(config|audit|scan|workflow|assignments|documents\/[a-f0-9]{24}|designs(?:\/[a-f0-9]{24}(?:\/(?:front|back))?)?|print(?:\/[a-f0-9]{24})?|accreditations(?:\/[a-f0-9]{24})?|media(?:\/[a-f0-9]{24})?|staff(?:\/(?:[a-f0-9]{24}|invite|reset))?))$/.test(route);
}
