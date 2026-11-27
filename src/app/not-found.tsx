import SiteLayout from "./(site)/layout";
import NotFoundBody from "./(site)/not-found";

// Branded 404 for any unmatched URL (served with HTTP 404), in the same site chrome.
export default function NotFound() {
  return <SiteLayout params={Promise.resolve({})}><NotFoundBody /></SiteLayout>;
}
